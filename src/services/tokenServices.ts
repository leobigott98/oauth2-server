import generateToken from '../utils/jwt';
import AccessToken, { IAccessToken} from '../models/AccessToken';
import RefreshToken, {IRefreshToken} from '../models/RefreshToken';
import Client from '../models/Client';
import User from '../models/User';
import { getScopeIds, getScopeNames } from './scopeService';
import crypto from 'crypto';
import { v4 as uuidv4} from 'uuid';
import mongoose from 'mongoose';

interface GenerateAccessTokenParams {
    user: any;
    client: any;
    scopes: mongoose.Types.ObjectId[];
    refreshToken: string;
}

interface GenerateRefreshTokenParams {
    user: any;
    client: any;
    scopes: mongoose.Types.ObjectId[];
}

export const getRefreshToken = async (refreshToken: string): Promise<IRefreshToken | null> => {
    try {
        return await RefreshToken.findOne({token: refreshToken})   
    } catch (err) {
        console.error('Error fetching refreshToken id:', err)
        return null
    }
}

export const generateAccessToken = async ({ user, client, scopes, refreshToken }: GenerateAccessTokenParams): Promise<IAccessToken | null> => {
    const refreshTokenId: IRefreshToken | null = await getRefreshToken(refreshToken);

    // Validate refresh token
    if(!refreshTokenId) {
        throw new Error('Invalid refresh token provided');
    } else if (refreshTokenId.revoked) {
        throw new Error('Refresh token has been revoked');
    } else if (refreshTokenId.expiresAt < new Date()) {
        throw new Error('Refresh token has expired');
    }

    const createdAt: Date = new Date();
    const expiresAt: Date = new Date(createdAt.getTime() + 900 * 1000); // 15 minute expiry

    // Get scope names for JWT payload
    const scopeNames: string[] | null = await getScopeNames(scopes);
    
    // Validate scopes
    if (!scopeNames) {
        throw new Error('Invalid scopes provided');
    }

    // Create JWT payload
    const payload = {
        sub: user._id,
        client_id: client.client_id,
        client_name: client.name,
        email: user.email,
        name: user.name,
        lastname: user.lastname,
        verifiedEmail: user.verifiedEmail,
        scopes: scopeNames,
        iat: Math.floor(createdAt.getTime() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000),
    };

    // Generate JWT and save access token
    const token = generateToken(payload); // This signs the JWT

    // Save access token to DB
    const finalToken = await saveAccessToken({token: token.token as string, user_id: user._id as mongoose.Types.ObjectId, client_id: client.client_id as mongoose.Types.ObjectId, scopes: scopes as mongoose.Types.ObjectId[], createdAt: createdAt as Date, expiresAt: expiresAt as Date, refreshToken: refreshTokenId._id as mongoose.Types.ObjectId, jti: token.jwtid as string} as IAccessToken);

    // Return the signed JWT string
    return finalToken;
}

export const generateRefreshToken = async ({user, client}: GenerateRefreshTokenParams): Promise<string> => {
    const refreshToken: string = crypto.randomBytes(64).toString('hex'); // Generate secure token
    const createdAt: Date = new Date();
    const expiresAt: Date = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

    const jti: string = uuidv4();

    await saveRefreshToken({token: refreshToken, user_id: user as mongoose.Types.ObjectId, client_id: client as mongoose.Types.ObjectId, createdAt: createdAt as Date, expiresAt: expiresAt as Date, jti: jti as string, revoked: false, lastUsedAt: null} as IRefreshToken);

    return refreshToken;
}

export const revokeRefreshToken = async (refreshToken: string): Promise<void> => {
    try {
        const token = await RefreshToken.findOne({ token: refreshToken }).exec();

        if (!token) {
            throw new Error('Refresh token not found');
        }   
        token.revoked = true;
        await token.save();
    } catch (err) {
        console.error("Error revoking refresh token:", err);
        throw err;
    }
}

export const updateLastUsedAt = async (refreshToken: string): Promise<void> => {
    try {
        const token = await RefreshToken.findOne({ token: refreshToken }).exec();
        
        if(!token) {
            throw new Error('Refresh token not found');
        }
        token.lastUsedAt = new Date();
        await token.save();
    } catch (err) {
        console.error("Error updating lastUsedAt for refresh token:", err);
        throw err;
    }
}

export const saveAccessToken = async ({token, user_id, client_id, scopes, createdAt, expiresAt, refreshToken, jti}: IAccessToken): Promise<IAccessToken | null> => {
    try {
        const newToken = await AccessToken.create({
            token,
            user_id,
            client_id,
            scopes,
            createdAt,
            expiresAt,
            refreshToken,
            jti
        });

        return newToken;
    } catch (err) {
        console.error("Error saving access token:", err);
        throw err;
    }
}

const saveRefreshToken = async ({token, user_id, client_id, createdAt, expiresAt, jti}: IRefreshToken): Promise<IRefreshToken | null> => {
    try {
        const newToken = await RefreshToken.create({
            token,
            user_id,
            client_id,
            createdAt,
            expiresAt, 
            jti
        });

        return newToken;
    } catch (err) {
        console.error("Error saving refresh token:", err);
        throw err;
    }
}

export const newAccessToken = async (refreshToken: string) => {
    try {
        const storedRefreshToken: IRefreshToken | null = await RefreshToken.findOne({ token: refreshToken }).exec();

        if (!storedRefreshToken) {
            throw new Error('Invalid refresh token');
        }

        if (storedRefreshToken.revoked) {
            throw new Error('Refresh token has been revoked');
        }

        if (storedRefreshToken.expiresAt < new Date()) {
            throw new Error('Refresh token has expired');
        }

        // Update lastUsedAt for refresh token
        await updateLastUsedAt(refreshToken);

        // Look for user and client associated with the refresh token
        const user = await User.findById(storedRefreshToken.user_id).exec();
        const client = await Client.findById(storedRefreshToken.client_id).exec();

        if (!user) {
            throw new Error('User associated with refresh token not found');
        }

        if (!client) {
            throw new Error('Client associated with refresh token not found');
        }

        // Get scopes from the refresh token
        const scopes = user.scopes;

        // Generate new access token
        return generateAccessToken({user: user._id, client: client._id, scopes: scopes, refreshToken: storedRefreshToken.token});
    } catch (err) {
        console.error("Error generating new access token:", err);
        throw err;
    }
}

module.exports = { generateAccessToken, generateRefreshToken, newAccessToken };
