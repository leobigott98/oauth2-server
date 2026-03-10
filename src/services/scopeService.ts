import Scope, {IScope} from '../models/Scope';
import mongoose from 'mongoose';

// Add new scope (Upsert: Insert if not exists)
export const addScope = async ({name, description}: IScope): Promise<IScope | null> => {
    try {
        return await Scope.findOneAndUpdate({ name }, { name, description }, { upsert: true, new: true }).exec();
    } catch (err) {
        console.error("❌ Error adding scope:", err);
        return null;
    }
};

// Get single scope by name
export const getScope = async (name: string): Promise<IScope | null> => {
    try {
        return await Scope.findOne({ name }).exec();
    } catch (err) {
        console.error("❌ Error fetching scope:", err);
        return null;
    }
};

// Get `_id`s of valid scopes and validate all exist
export const getScopeIds = async (scopeNames: string[]): Promise<mongoose.Types.ObjectId[] | null> => {
    try {
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

        return scopes.map(scope => scope._id as mongoose.Types.ObjectId);
    } catch (err) {
        console.error("❌ Error validating scopes:", err);
        return null;
    }
};

// Get Scope names from `_id`s
export const getScopeNames = async (scopeIds: mongoose.Types.ObjectId[]): Promise<string[] | null> => {
    try {
        const scopes = await Scope.find({ _id: { $in: scopeIds } });
        return scopes.map(scope => scope.name);
    } catch (err) {
        console.error("❌ Error fetching scope names:", err);
        return null;
    }
}