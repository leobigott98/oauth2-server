const oauth2orize = require('oauth2orize');
const getClient = require('../services/clientService');
const { generateCode } = require('../utils/code');
const { getUserByEmail } = require('../services/userService');
const { saveAuthorizationCode, findAuthorizationCode, markCodeAsUsed } = require('./codeService');
const { generateAccessToken, generateRefreshToken } = require('./tokenServices');
const bcrypt = require('bcrypt');
const RefreshToken = require('../models/RefreshToken');

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
oauth2orizeServer.grant(oauth2orize.grant.code(async (client, redirectUri, user, ares, done) => {
    try {
        const code = generateCode(); // Generate a secure random code
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await saveAuthorizationCode(code, user.id, client.id, redirectUri, ares.scope, expiresAt);
        
        return done(null, code);
    } catch (err) {
        console.error('Error generating authorization code:', err);
        return done(err);
    }
}));

// Password grant type
oauth2orizeServer.exchange(oauth2orize.exchange.password(async (client, username, password, done) => {
    try {
        console.log(`🔐 Password Grant: Validating user ${username}`);

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
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.error('❌ Invalid password');
            return done(null, false);
        }

        // Generate access and refresh tokens using tokenService
        const refreshToken = await generateRefreshToken(user, client, user.scopes);
        const accessToken = await generateAccessToken(user, client, user.scopes, refreshToken);

        console.log('✅ Token issued successfully');
        return done(null, accessToken, refreshToken, {expires_in: 900});
    } catch (error) {
        return done(error);
    }
}));

// Exchange authorization code for an access token
oauth2orizeServer.exchange(oauth2orize.exchange.code(async (client, code, redirectUri, done) => {
    try {
        const storedCode = await findAuthorizationCode(code);

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
        const accessToken = await generateAccessToken(storedCode.user_id, client.id, storedCode.scopes);
        const refreshToken = await generateRefreshToken(storedCode.user_id, client.id, storedCode.scopes); 
        

        return done(null, accessToken, refreshToken, {expires_in: 900});
    } catch (err) {
        console.error('Error exchanging code:', err);
        return done(err);
    }
}));

// Refresh Token Grant
oauth2orizeServer.exchange(oauth2orize.exchange.refreshToken(async (client, refreshToken, done) =>{
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

        const user = tokenRecord.user_id;

        // Generate new access token
        const accessToken = await generateAccessToken(user._id, client, user.scopes, tokenRecord.token);

        return done(null, accessToken, {expires_in: 900});
    } catch (err) {
        return done(err);    
    }
}))

module.exports = oauth2orizeServer;