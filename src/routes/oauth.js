const getClient = require('../services/clientService');
const express = require('express');
const oauth2orizeServer = require('../services/oauth2Service');

const router = express.Router()

// **Authorization Code Grant - Step 1 (User Authorization Request)**
router.get('/authorize', 
    (req, res, next) => {
        // Simulated logged-in user (Replace this with actual session authentication)
        req.user = { id: '1', username: 'test' };
        console.log('User authenticated:', req.user);
        next();
    }, 

    oauth2orizeServer.authorize(async (clientId, redirectUri, done) => {
        console.log('Authorization middleware received');
        const client = await getClient(clientId);
        if (client && client.redirectUri.find(redirectUri)) {
            console.log('Client and redirect URI validated');
            return done(null, client, redirectUri);
        }
        console.error('Client validation failed');
        return done(null, false);
    }),

    (req, res, next) => {
        // Simulate user granting consent (Auto-approving for now)
        console.log('Consent auto-approved for testing');
        req.body = { decision: 'allow' }; // Simulate user decision
        next();
    },
    oauth2orizeServer.decision()
);

// **Token Exchange (Authorization Code → Access Token)**
router.post('/token', oauth2orizeServer.token(), oauth2orizeServer.errorHandler());

module.exports = router;