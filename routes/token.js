const express = require('express');
const passport = require('../oauth2/strategies');
const oauth2orizeServer = require('../oauth2/oauth2');

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