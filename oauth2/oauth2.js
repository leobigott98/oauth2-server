const oauth2orize = require('oauth2orize');
const jwt = require('jsonwebtoken');
const { saveToken } = require('../auth/model');

// Create OAuth2 server
const server = oauth2orize.createServer();

// Register serialization function (for client)
server.serializeClient((client, done) => done(null, client.id));

// Register deserialization function
server.deserializeClient((id, done) => {
    const client = getClient(id);
    if (client) {
        return done(null, client);
    }
    return done(new Error('Client not found'));
});

// JWT Secret
const jwtSecret = 'your_secret_key';

// Authorization code grant
server.grant(oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
    const code = jwt.sign({ clientId: client.id, userId: user.id }, jwtSecret, { expiresIn: '10m' });
    saveToken(code, user, client);
    done(null, code);
}));

// Exchange authorization code for an access token
server.exchange(oauth2orize.exchange.code((client, code, redirectUri, done) => {
    console.log('Client received in exchange:', client);
    console.log('Code received:', code);
    console.log('Redirect URI:', redirectUri);

    if (!client) {
        console.error('Client is undefined');
        return done(null, false);
    }


    try {
        console.log('Exchanging code for token...');
        // Verify the authorization code
        const payload = jwt.verify(code, jwtSecret);
        if (payload.clientId !== client.id || client.redirectUri !== redirectUri) {
            console.error('Invalid client or redirect URI');
            return done(null, false);
        }

        // Generate access token
        const accessToken = jwt.sign(
            { userId: payload.userId, clientId: client.id },
            jwtSecret,
            { expiresIn: '1h' }
        );

        console.log('Access token generated:', accessToken);
        saveToken(accessToken, payload.userId, client);
        done(null, accessToken);
    } catch (err) {
        console.error('Error exchanging code:', err.message);
        return done(err);
    }
}));

module.exports = server;