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
        //console.log("🔍 Looking for scopes:", scopeNames);

        // Remove duplicates
        const uniqueScopeNames = [...new Set(scopeNames)];
        //console.log("✨ Unique scope names:", uniqueScopeNames);

        const scopes = await Scope.find({ name: { $in: uniqueScopeNames } });
        //console.log("✅ Found scopes:", scopes.map(s => s.name));

        if (scopes.length !== uniqueScopeNames.length) {
            const foundScopeNames = scopes.map(s => s.name);
            const missingScopes = uniqueScopeNames.filter(name => !foundScopeNames.includes(name));
            //console.log("❌ Missing Scopes:", missingScopes);
            throw new Error(`⛔ Missing Scopes: ${missingScopes.join(", ")}`);
        }

        return scopes.map(scope => scope._id);
    } catch (err) {
        console.error("❌ Error validating scopes:", err.message);
        return null;
    }
};

// Get Scope names from `_id`s
async function getScopeNames(scopeIds){
    try {
        const scopes = await Scope.find({ _id: { $in: scopeIds } });
        return scopes.map(scope => scope.name);
    } catch (err) {
        console.error("❌ Error fetching scope names:", err);
        return null;
    }
}

// Assign scopes to 

module.exports = { addScope, getScope, getScopeIds, getScopeNames };