const Code = require('../models/Code');

/**
 * Save an authorization code in the database.
 * @param {string} code - The generated authorization code.
 * @param {string} user_id - The user's ID.
 * @param {string} client_id - The client's ID.
 * @param {string} redirectUri - The redirect URI.
 * @param {string[]} scope - The scopes associated with the code.
 * @param {Date} expiresAt - Expiration date for the code.
 */
async function saveAuthorizationCode(code, user_id, client_id, redirectUri, scope, expiresAt) {
    try {
        const newCode = new Code({ code, user_id, client_id, redirectUri, scope, expiresAt });
        await newCode.save();
        return newCode;
    } catch (err) {
        console.error('Error saving authorization code:', err);
        throw err;
    }
}

/**
 * Find an authorization code in the database.
 * @param {string} code - The authorization code to find.
 * @returns {Promise<Object|null>} - The found code object or null.
 */
async function findAuthorizationCode(code) {
    return await Code.findOne({ code });
}

/**
 * Mark an authorization code as used.
 * @param {string} code - The authorization code to mark as used.
 */
async function markCodeAsUsed(code) {
    await Code.updateOne({ code }, { used: true });
}

module.exports = { saveAuthorizationCode, findAuthorizationCode, markCodeAsUsed };
