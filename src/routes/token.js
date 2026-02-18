const express = require('express');
const passport = require('../services/strategies');
const oauth2orizeServer = require('../services/oauth2Service');

const router = express.Router();

// Token endpoint

router.post(
    '/',
    (req, res, next) => {
        console.log('Token endpoint hit');
        next();
    },
    passport.authenticate(['basic'], { session: false }),
    oauth2orizeServer.token(),
    oauth2orizeServer.errorHandler()
);

module.exports = router; 