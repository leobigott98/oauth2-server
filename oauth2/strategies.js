const passport = require('passport');
const { getClient } = require('../auth/model');
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(
    new BasicStrategy((clientId, clientSecret, done) => {
        console.log('Authenticating client:', clientId);
        const client = getClient(clientId);
        if (!client || client.secret !== clientSecret) {
            console.error('Invalid client credentials');
            return done(null, false);
        }
        console.log('Client authenticated:', client);
        return done(null, client);
    })
);

module.exports = passport;