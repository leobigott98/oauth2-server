const oauth2orize = require('oauth2orize');
const jwt = require('jsonwebtoken');
const { getClient, getUser, saveToken } = require('./model');

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

// Authorization code grant
server.grant(oauth2orize.grant.code((client, redirectUri, user, ares, done) => {
    const code = jwt.sign({ clientId: client.id, userId: user.id }, 'your_secret_key', { expiresIn: '10m' });
    saveToken(code, user, client);
    done(null, code);
}));

// Exchange authorization code for token
server.exchange(oauth2orize.exchange.code((client, code, redirectUri, done) => {
    try {
        const payload = jwt.verify(code, 'your_secret_key');
        if (payload.clientId !== client.id) return done(null, false);

        const accessToken = jwt.sign({ userId: payload.userId }, 'your_secret_key', { expiresIn: '1h' });
        saveToken(accessToken, payload.userId, client);
        done(null, accessToken);
    } catch (err) {
        return done(err);
    }
}));

module.exports = server;
