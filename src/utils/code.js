const crypto = require('crypto');

/**
 * Generate a secure authorization code.
 * @returns {string} - A random, URL-safe authorization code.
 */
function generateCode() {
    return crypto.randomBytes(32).toString('hex'); // 64-character secure random string
}

module.exports =  generateCode ;