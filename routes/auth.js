const express = require('express');
const oauth2orizeServer = require('../oauth2/oauth2');
const {getClient} = require('../auth/model');

const router = express.Router();

// Authorization endpoint
router.get('/', 
    (req, res, next) => {
        // Simulated logged-in user
        req.user = { id: '1', username: 'test' };
        console.log('User authenticated:', req.user);
        next();
    }, 
    oauth2orizeServer.authorize((clientId, redirectUri, done) => {
        console.log('Authorization middleware triggered');
        const client = getClient(clientId);
        if (client && client.redirectUri === redirectUri) {
            console.log('Client and redirect URI validated');
            return done(null, client, redirectUri);
        }
        console.error('Client validation failed');
        return done(null, false);
    }),
    (req, res, next) => {
        // Simulate user granting consent
        console.log('Consent auto-approved for testing');
        req.body = { decision: 'allow' }; // Simulate user decision
        next();
    },
    oauth2orizeServer.decision()
);

module.exports = router; 