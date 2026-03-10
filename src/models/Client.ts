import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4} from 'uuid';

export interface IClient extends Document {
    name: string;
    client_id: string;
    client_secret: string;
    redirectUri: string[];
    grant_types: string[];
    scopes: mongoose.Types.ObjectId[];
}

const clientSchema = new Schema<IClient>({
    name: {
        type: String, 
        required: true, 
        unique: true
    },
    client_id: { 
        type: String,
        default: ()=> uuidv4(), 
        required: true, 
        unique: true 
    },
    client_secret: { 
        type: String, 
        required: true 
    },
    redirectUri:[{
        type: String
    }],
    grant_types: [{ 
        type: String, 
        enum: ['authorization_code', 'password', 'client_credentials', 'refresh_token', 'device_code', 'pkce'],
        required: true 
    }],
    scopes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scope",
        required: true
    }]
    
});

// Export
const Client = mongoose.model<IClient>("Client", clientSchema);
export default Client;
