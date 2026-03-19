import generateToken from '../utils/jwt';
import RefreshToken, { IRefreshToken } from '../models/RefreshToken';
import Client, { IClient } from '../models/Client';
import User, { IUser } from '../models/User';
import { getScopeNames } from './scopeService';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

// Tipos actualizados
interface GenerateAccessTokenParams {
    user: IUser | null; // Acepta null para bots (Client Credentials)
    client: IClient;
    scopes: mongoose.Types.ObjectId[];
    refreshToken: string | null; // Es mejor recibir el string y buscarlo adentro
    duration?: number; // Duración opcional en segundos (default: 900s = 15 mins)
    requestedAudience?: string;
}

interface GenerateRefreshTokenParams {
    user: mongoose.Types.ObjectId; // Aquí usamos solo el ID
    client: mongoose.Types.ObjectId; // Aquí usamos solo el ID
    scopes: mongoose.Types.ObjectId[];
}

export const getRefreshToken = async (refreshToken: string): Promise<IRefreshToken | null> => {
    try {
        return await RefreshToken.findOne({ token: refreshToken });
    } catch (err) {
        console.error('Error fetching refreshToken:', err);
        return null;
    }
};

export const generateAccessToken = async ({ user, client, scopes, refreshToken, duration, requestedAudience }: GenerateAccessTokenParams): Promise<string> => {
    let refreshTokenRecord: IRefreshToken | null = null;

    // 1. Validar Refresh Token (SOLO si fue proveído)
    if (refreshToken) {
        refreshTokenRecord = await getRefreshToken(refreshToken);
        if (!refreshTokenRecord) throw new Error('Invalid refresh token provided');
        if (refreshTokenRecord.revoked) throw new Error('Refresh token has been revoked');
        if (refreshTokenRecord.expiresAt < new Date()) throw new Error('Refresh token has expired');
    }

    const createdAt = new Date();
    const expiresAt = duration? new Date(createdAt.getTime() + duration * 1000): new Date(createdAt.getTime() + 900 * 1000); // 15 mins

    // 2. Obtener nombres de los scopes
    const scopeNames = await getScopeNames(scopes);
    if (!scopeNames) throw new Error('Invalid scopes provided');

    // Lógica de Audiencia (Híbrida)
    // Por defecto, le damos todas las audiencias que tiene permitidas en la BD
    let finalAudience: string | string[] = client.audiences; 

    // Si el cliente pide un recurso específico (RFC 8707)
    if (requestedAudience) {
        // Verificamos si tiene permiso para ir a ese recurso
        if (!client.audiences.includes(requestedAudience)) {
            throw new Error(`Client is not allowed to access resource: ${requestedAudience}`);
        }
        // Si tiene permiso, el token servirá ÚNICAMENTE para ese recurso
        finalAudience = requestedAudience; 
    }

    // 3. Crear Payload Inteligente (Soporta Humanos y Bots)
    const payload: any = {
        client_id: client.client_id,
        client_name: client.name,
        scopes: scopeNames,
        aud: finalAudience, // ⬅️ Inyección dinámica
        iss: process.env.JWT_ISSUER || 'https://auth.migo-wallet.com', // ⬅️ Inyección del emisor
        iat: Math.floor(createdAt.getTime() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000),
    };

    if (user) {
        // Si hay humano, inyectamos sus datos
        payload.sub = user._id;
        payload.email = user.email;
        payload.name = user.name;
        payload.lastname = user.lastname;
        payload.verifiedEmail = user.verifiedEmail;
    } else {
        // Si es un Bot, el "sub" (Subject) es el mismo ID de la aplicación
        payload.sub = client.client_id;
    }

    // 4. Firmar el JWT
    const tokenData = generateToken(payload);

    // Retornamos solo el string del JWT, que es lo que OAuth2orize espera
    return tokenData.token as string;
};

export const generateRefreshToken = async ({ user, client, scopes }: GenerateRefreshTokenParams): Promise<string> => {
    const refreshToken: string = crypto.randomBytes(64).toString('hex');
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const jti: string = uuidv4();

    await saveRefreshToken({
        token: refreshToken,
        user_id: user,
        client_id: client,
        createdAt,
        expiresAt,
        jti,
        revoked: false,
        lastUsedAt: null
    } as IRefreshToken);

    return refreshToken;
};

export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
    const token = await RefreshToken.findOne({ token: refreshToken }).exec();
    if (!token) throw new Error('Refresh token not found');
    
    token.revoked = true;
    await token.save();
};

export const updateLastUsedAt = async (refreshToken: string): Promise<void> => {
    const token = await RefreshToken.findOne({ token: refreshToken }).exec();
    if (!token) throw new Error('Refresh token not found');
    
    token.lastUsedAt = new Date();
    await token.save();
};

const saveRefreshToken = async (data: Partial<IRefreshToken>): Promise<IRefreshToken> => {
    return await RefreshToken.create(data);
};

export const newAccessToken = async (refreshToken: string): Promise<string> => {
    const storedRefreshToken = await RefreshToken.findOne({ token: refreshToken }).exec();

    if (!storedRefreshToken) throw new Error('Invalid refresh token');
    if (storedRefreshToken.revoked) throw new Error('Refresh token has been revoked');
    if (storedRefreshToken.expiresAt < new Date()) throw new Error('Refresh token has expired');

    await updateLastUsedAt(refreshToken);

    const user = await User.findById(storedRefreshToken.user_id).exec();
    const client = await Client.findById(storedRefreshToken.client_id).exec();

    if (!user) throw new Error('User associated with refresh token not found');
    if (!client) throw new Error('Client associated with refresh token not found');

    // Generamos un nuevo Access Token usando la función refactorizada
    return await generateAccessToken({
        user: user,
        client: client,
        scopes: user.scopes,
        refreshToken: storedRefreshToken.token
    });
};
