const express = require('express');
const passport = require('passport');
const oauth2orizeServer = require('../auth/server');

const router = express.Router();

// Authorization endpoint
router.get('/authorize', (req, res, next) => {
    // Simulated logged-in user
    req.user = { id: '1', username: 'test' };
    next();
}, oauth2orizeServer.authorize((clientId, redirectUri, done) => {
    const client = getClient(clientId);
    if (client && client.redirectUri === redirectUri) {
        return done(null, client, redirectUri);
    }
    return done(null, false);
}));

// Token endpoint
router.post('/token', passport.authenticate(['basic'], { session: false }), oauth2orizeServer.token());

module.exports = router;
