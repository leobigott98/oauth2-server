const Scope = require('../models/Scope');

// Add new scope (Upsert: Insert if not exists)
async function addScope(name, description){
    try {
        return await Scope.updateOne({ name }, { name, description }, { upsert: true });
    } catch (err) {
        console.error("❌ Error adding scope:", err);
        return null;
    }
};

// Get single scope by name
async function getScope(name){
    try {
        return await Scope.findOne({ name }).exec();
    } catch (err) {
        console.error("❌ Error fetching scope:", err);
        return null;
    }
};

// Get `_id`s of valid scopes and validate all exist
async function getScopeIds(scopeNames){
    try {
        const scopes = await Scope.find({ name: { $in: scopeNames } });

        if (scopes.length !== scopeNames.length) {
            const foundScopeNames = scopes.map(s => s.name);
            const missingScopes = scopeNames.filter(name => !foundScopeNames.includes(name));
            throw new Error(`⛔ Missing Scopes: ${missingScopes.join(", ")}`);
        }

        return scopes.map(scope => scope._id);
    } catch (err) {
        console.error("❌ Error validating scopes:", err);
        return null;
    }
};

// Assign scopes to 

module.exports = { addScope, getScope, getScopeIds }