import jwt from 'jsonwebtoken';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Private Key Path
const privateKeyPath = path.join(__dirname, '../keys/private_key.pem');

// Load the private key
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');

const generateToken = (payload: any, exp = 900, aud = 'https://api.migo-wallet.com') => {
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

export default generateToken;