import oauth2orize from 'oauth2orize';
import { getClient } from './clientService';
import generateCode from '../utils/code';
import { getUserByEmail } from './userService';
import { saveAuthorizationCode, findAuthorizationCode, markCodeAsUsed } from './codeService';
import { generateAccessToken, generateRefreshToken } from './tokenServices';
import bcryptjs from 'bcryptjs';
import RefreshToken from '../models/RefreshToken';
import {ICode} from '../models/Code';
import User from '../models/User';
import mongoose from 'mongoose';

// Create OAuth2 server
const oauth2orizeServer = oauth2orize.createServer();

// Register serialization function (for client)
oauth2orizeServer.serializeClient(function(client, done) {
    return done(null, client.id)
});


// Register deserialization function
oauth2orizeServer.deserializeClient((id, done) => {
    const client = getClient(id);
    if (client) {
        return done(null, client);
    }
    return done(new Error('Client not found'));
});

// Authorization code grant
oauth2orizeServer.grant(oauth2orize.grant.code(async (client, redirectUri, user, ares, done: any) => {
    try {
        const code = generateCode(); // Generate a secure random code
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await saveAuthorizationCode({
            code,
            user_id: user.id,
            client_id: client.id,
            redirectUri,
            scopes: ares.scope,
            expiresAt,
            used: false
        } as ICode);
        
        return done(null, code);
    } catch (err) {
        console.error('Error generating authorization code:', err);
        return done(err);
    }
}));

// Password grant type
oauth2orizeServer.exchange(oauth2orize.exchange.password(async (client: mongoose.Types.ObjectId, username, password, done: any) => {
    try {
        // Fetch user
        const user = await getUserByEmail(username);
        if (!user) {
            console.error('❌ User not found');
            return done(null, false);
        }

        // Verify user is active
        if(!user.active){
            console.error('❌ Invalid user');
            return done(null, false);
        }

        // Verify password
        if (!user.password || typeof user.password !== 'string') {
            console.error('❌ User password is missing or invalid');
            return done(null, false);
        }
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            console.error('❌ Invalid password');
            return done(null, false);
        }

        // Generate access and refresh tokens using tokenService
        const refreshToken = await generateRefreshToken({user: user._id, client: client, scopes: user.scopes});
        const accessToken = await generateAccessToken({
            user: user._id || user.id,
            client: client.id || client._id,
            scopes: user.scopes,
            refreshToken: refreshToken
        });

        console.log('✅ Token issued successfully');
        return done(null, accessToken, refreshToken, {expires_in: 900});
    } catch (error) {
        return done(error);
    }
}));

// Exchange authorization code for an access token
oauth2orizeServer.exchange(oauth2orize.exchange.code(async (client, code, redirectUri, done: any) => {
    try {
        const storedCode: ICode | null = await findAuthorizationCode(code);

        if (!storedCode) {
            console.error('Authorization code not found');
            return done(null, false);
        }

        if (storedCode.client_id.toString() !== client.id || storedCode.redirectUri !== redirectUri) {
            console.error('Invalid client or redirect URI');
            return done(null, false);
        }

        if (storedCode.expiresAt < new Date()) {
            console.error('Authorization code expired');
            return done(null, false);
        }

        if (storedCode.used) {
            console.error('Authorization code already used');
            return done(null, false);
        }

        // Mark the code as used
        await markCodeAsUsed(code);

        // Generate access and refresh tokens using tokenService
        const refreshToken = await generateRefreshToken({user: storedCode.user_id, client: storedCode.client_id, scopes: storedCode.scopes});

        const accessToken = await generateAccessToken({
            user: storedCode.user_id,
            client: client.id,
            scopes: storedCode.scopes as mongoose.Types.ObjectId[],
            refreshToken: refreshToken
        });
        
        

        return done(null, accessToken, refreshToken, {expires_in: 900});
    } catch (err) {
        console.error('Error exchanging code:', err);
        return done(err);
    }
}));

// Refresh Token Grant
oauth2orizeServer.exchange(oauth2orize.exchange.refreshToken(async (client, refreshToken, done: any) =>{
    try {
        // Find the refresh token in the database
        const tokenRecord = await RefreshToken.findOne({token: refreshToken}).populate("user_id");

        if(!tokenRecord) {
            return done(null, false);
        }

        if(tokenRecord.revoked){
            return done(null, false)
        }

        if(tokenRecord.expiresAt < new Date()){
            return done(null, false)
        }

        // Find the user associated with the refresh token
        const user = await User.findById(tokenRecord.user_id);

        if (!user) {
            return done(null, false);
        }

        // Generate new access token
        const accessToken = await generateAccessToken({
            user: user._id,
            client: client.id || client._id,
            scopes: user.scopes,
            refreshToken: tokenRecord.token
        });

        return done(null, accessToken, {expires_in: 900});
    } catch (err) {
        return done(err);    
    }
}))

export default oauth2orizeServer;