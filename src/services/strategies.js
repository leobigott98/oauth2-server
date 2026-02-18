const passport = require('passport');
const getClient = require('../services/clientService');
const bcrypt = require('bcrypt');
const BasicStrategy = require('passport-http').BasicStrategy;

passport.use(
    new BasicStrategy(async(clientId, clientSecret, done) => {
        console.log('Authenticating client:', clientId);
        const client = await getClient(clientId);
        if(!client) {
            console.error('Invalid client credentials');
            return done(null, false);
        }
        const isPassword = await bcrypt.compare(clientSecret, client.client_secret)
        if (!isPassword) {
            console.error('Invalid client credentials');
            return done(null, false);
        }
        console.log('Client authenticated:', client);
        return done(null, client);
    })
);

module.exports = passport;