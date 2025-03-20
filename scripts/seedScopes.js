require('dotenv').config(); // Load environment variables
const mongoose = require("mongoose");
const Scope = require("../models/Scope");
const { connectDB, closeDBConnection} = require('../utils/db');

const scopes = [
    
    // Regular User (End-users accessing their own data)
    { name: "account:read:self", description: "Read own account details" },
    { name: "account:write:self", description: "Modify own account details (e.g., update info)" },
    { name: "cards:read:self", description: "View own linked cards" },
    { name: "cards:write:self", description: "Add/remove own cards" },
    { name: "transactions:delete:self", description: "Cancel own transactions (if applicable)" },
    { name: "transactions:read:self", description: "View own transactions" },
    { name: "transactions:write:self", description: "Initiate transactions" },
    { name: "users:write:self", description: "Modify own user profile (update email, phone, etc.)" },
    { name: "users:read:self", description: "Read own user details" },
    { name: "wallet:read:self", description: "View own wallet details" },
    { name: "wallet:write:self", description: "Modify wallet settings (e.g., enable/disable features)" },
    { name: "wallet:transfer:self", description: "Transfer funds between own wallets" },
    { name: "wallet:close:self", description: "Close/deactivate own wallet" },    

    // Admin User 
    { name: "admin:full_access", description: "Full system access" },
    { name: "users:read:all", description: "Read all user details" },
    { name: "users:write:all", description: "Modify all user details" },
    { name: "transactions:read:all", description: "View all transactions" },
    { name: "transactions:write:all", description: "Create transactions on behalf of any user" },
    { name: "wallet:read:all", description: "View all wallets" },
    { name: "wallet:write:all", description: "Modify any  wallets" },
    { name: "system:logs:read", description: "Read system logs" },
    { name: "system:logs:write", description: "Modify system logs" },

    // Clients (third-party applications, external integrations)
    { name: "transactions:read", description: "Read transactions (for auditing, analytics)" },
    { name: "transactions:write", description: "Create transactions on behalf of users" },
    { name: "transactions:refund", description: "Issue refunds (if applicable)" },
    { name: "account:read", description: "Read general account details (non-user specific)" },
    { name: "account:write", description: "Modify account settings (if allowed)" },
    { name: "users:read", description: "Read user info (for KYC, support, etc.)" },
    { name: "users:write", description: "Modify user info (if the client has admin access)" },
    { name: "wallet:read", description: "View wallet details" },
    { name: "wallet:write", description: "Modify wallets (e.g., add balance, restrict access)" },

];

async function seedScopes() {
    try {
        // Connect to MongoDB Server
        await connectDB() ;

        for (const scope of scopes) {
            await Scope.updateOne({ name: scope.name }, scope, { upsert: true });
        }

        console.log("✅ Scopes seeded successfully!");
        await closeDBConnection();
    } catch (error) {
        console.error("❌ Error seeding scopes:", error);
        process.exit(1);
    }
}

if (require.main === module) {
    seedScopes();
}

module.exports = seedScopes;
