require('dotenv').config(); // Load environment variables
const bcrypt = require('bcrypt');
const generateCode = require('../utils/code');
const Client = require('../models/Client');
const { connectDB, closeDBConnection} = require('../utils/db');
const { getScopeIds } = require('../services/scopeService');
const { v4: uuidv4} = require('uuid');

async function generateHashedSecret() {
    const secret = generateCode(); // Generate the secret
    const hash = await bcrypt.hash(secret, 10); // Hash it
    return { secret, hash };
}

async function addClient(name, redirectUris, grantTypes, scopeNames) {
    try {
        // Connect to MongoDB Server
        await connectDB() ;

        // Generate a secure client_secret
        const { secret, hash } = await generateHashedSecret();

        // Convert scope names to ObjectIds
        const scopeIds = await getScopeIds(scopeNames);
        if (!scopeIds) throw new Error("Invalid scopes provided.");

        const clientData = {
            name,
            client_id: uuidv4(), // Generate client_id
            client_secret: hash, // Store hashed secret
            redirectUri: Array.isArray(redirectUris) ? redirectUris : [redirectUris], // Ensure array
            grant_types: Array.isArray(grantTypes) ? grantTypes : [grantTypes], // Ensure array
            scopes: scopeIds
        };

        await Client.updateOne({name}, clientData, {upsert: true});
        
        console.log(`Client ${name} added successfully!`);
        console.log(`🔑 Client Secret (Store this securely!): ${secret}`);

        await closeDBConnection();
    } catch (error) {
        console.error("❌ Error adding client::", error);
        process.exit(1);
    }
};

// Parse command-line arguments
const clientName = process.argv[2];
const redirectUris = process.argv[3]?.split(',') || [];
const grantTypes = process.argv[4]?.split(',') || [];
const scopes = process.argv[5]?.split(',') || [];

if (!clientName || redirectUris.length === 0 || grantTypes.length === 0 || scopes.length === 0) {
    console.log('Usage: node addClient.js <clientName> <redirectUri1,redirectUri2> <grant_type1,grant_type2> <scope1,scope2> ...');
    process.exit(1);
}

addClient(clientName, redirectUris, grantTypes, scopes);