const jwt = require('jsonwebtoken');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Private Key Path
const privateKeyPath = path.join(__dirname, '../keys/private_key.pem');

// Load the private key
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

/**
 * Generate a JWT access token.
 * @param {Object} payload - Token payload (must include `sub`, `client_id`, `scopes`).
 * @param {number} exp - Expiration time in seconds (default: 900 = 15 min).
 * @param {string} aud - Audience (default: Migo Wallet API).
 * @returns {string} - Signed JWT token.
 */
function generateToken(payload, exp = 900, aud = 'https://api.migo-wallet.com'){
    // Ensure payload contains essential fields
    if (!payload.sub || !payload.client_id || !payload.scopes) {
        throw new Error("Missing required payload fields: `sub`, `client_id`, `scopes`");
    }

    const jwtid = uuidv4();

    return {
        token: jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            //expiresIn: exp,
            issuer: 'https://auth.migo-wallet.com',
            audience: aud,
            jwtid
        }),
        jwtid
    };
};

module.exports = generateToken;