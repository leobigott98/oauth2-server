const generateToken = require('../utils/jwt');
const AccessToken = require('../models/AccessToken');
const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto');
const { v4: uuidv4} = require('uuid');

async function generateAccessToken(user_id, client_id, scopes, refreshToken) {
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 900 * 1000); // 15 minute expiry

    const payload = {
        sub: user_id,
        client_id,
        scopes,
        iat: Math.floor(createdAt.getTime() / 1000),
        exp: Math.floor(expiresAt.getTime() / 1000),
    };

    const token = generateToken(payload); // This signs the JWT

    const refreshTokenId = await refreshTokeId(refreshToken);

    await saveAccessToken(token.token, user_id, client_id, scopes, createdAt, expiresAt, refreshTokenId, token.jwtid);
    
    return token.token;
}

async function refreshTokeId(refreshToken){
    try {
        return await RefreshToken.findOne({token: refreshToken})   
    } catch (err) {
        console.error('Error fetching refreshToke id:', err)
        return null
    }
}

async function generateRefreshToken(user_id, client_id, scopes) {
    const refreshToken = crypto.randomBytes(64).toString('hex'); // Generate secure token
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

    const jti = uuidv4();

    await saveRefreshToken(refreshToken, user_id, client_id, scopes, createdAt, expiresAt, jti);

    return refreshToken;
}

async function saveAccessToken(token, user_id, client_id, scopes, createdAt, expiresAt, refreshToken, jti) {
    try {
        console.log('Storing access token:', token);
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

async function saveRefreshToken(token, user_id, client_id, scopes, createdAt, expiresAt, jti) {
    try {
        console.log('Storing refresh token:', token);
        const newToken = await RefreshToken.create({
            token,
            user_id,
            client_id,
            scopes,
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

async function newAccessToken(refreshToken) {
    try {
        const storedRefreshToken = await RefreshToken.findOne({ token: refreshToken }).exec();

        if (!storedRefreshToken) {
            throw new Error('Invalid refresh token');
        }

        if (storedRefreshToken.revoked) {
            throw new Error('Refresh token has been revoked');
        }

        if (storedRefreshToken.expiresAt < new Date()) {
            throw new Error('Refresh token has expired');
        }

        // Generate new access token
        return generateAccessToken(storedRefreshToken.user_id, storedRefreshToken.client_id, storedRefreshToken.scopes);
    } catch (err) {
        console.error("Error generating new access token:", err);
        throw err;
    }
}

module.exports = { generateAccessToken, generateRefreshToken, newAccessToken };
