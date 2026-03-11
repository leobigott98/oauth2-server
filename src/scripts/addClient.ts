import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Client from '../models/Client';
import { connectDB, closeDBConnection } from '../utils/db';
import { getScopeIds } from '../services/scopeService';
import { v4 as uuidv4 } from 'uuid';
import generateCode from '../utils/code';

dotenv.config();

async function generateHashedSecret() {
    const secret = generateCode(); // Generate the secret
    const hash = await bcrypt.hash(secret, 10); // Hash it
    return { secret, hash };
}

async function addClient(name: string, redirectUris: string[], grantTypes: string[], scopeNames: string[]) {
    try {
        // Connect to MongoDB Server
        await connectDB() ;

        // Generate a secure client_secret
        const { secret, hash } = await generateHashedSecret();

        // Convert scope names to ObjectIds
        const scopeIds = await getScopeIds(scopeNames);
        if (!scopeIds || scopeIds.length === 0) throw new Error("Invalid scopes provided.");

        const clientData = {
            name,
            client_id: uuidv4(), // Generate client_id
            client_secret: hash, // Store hashed secret
            redirectUri: redirectUris, 
            grant_types: grantTypes, 
            scopes: scopeIds
        };

        await Client.updateOne({name}, { $set: clientData }, {upsert: true});
        
        console.log(`✅ Client '${name}' added successfully!`);
        console.log(`🔑 Client ID: ${clientData.client_id}`);
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

if (require.main === module || process.argv[1].includes('addClient')) {
    if (!clientName || redirectUris.length === 0 || grantTypes.length === 0 || scopes.length === 0) {
        console.log('⚠️ Usage: ts-node addClient.ts <clientName> <redirectUri1,redirectUri2> <grant_type1> <scope1,scope2>');
        process.exit(1);
    }
    addClient(clientName, redirectUris, grantTypes, scopes);
}