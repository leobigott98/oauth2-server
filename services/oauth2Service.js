const oauth2orize = require('oauth2orize');
const getClient = require('../services/clientService');
const { generateCode } = require('../utils/code');
const { saveAuthorizationCode, findAuthorizationCode, markCodeAsUsed } = require('./codeService');
const { generateAccessToken, generateRefreshToken } = require('./tokenServices');

// Create OAuth2 server
const server = oauth2orize.createServer();

// Register serialization function (for client)
server.serializeClient(function(client, done) {
    return done(null, client.id)
});


// Register deserialization function
server.deserializeClient((id, done) => {
    const client = getClient(id);
    if (client) {
        return done(null, client);
    }
    return done(new Error('Client not found'));
});

// Authorization code grant
server.grant(oauth2orize.grant.code(async (client, redirectUri, user, ares, done) => {
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

// Exchange authorization code for an access token
server.exchange(oauth2orize.exchange.code(async (client, code, redirectUri, done) => {
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
        const accessToken = await generateAccessToken(storedCode.user_id, client.id, storedCode.scope);
        const refreshToken = await generateRefreshToken(storedCode.user_id, client.id, storedCode.scope); 
        

        return done(null, accessToken, refreshToken);
    } catch (err) {
        console.error('Error exchanging code:', err);
        return done(err);
    }
}));

module.exports = server;