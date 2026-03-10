import mongoose, {Schema, Document} from "mongoose";
import {v4 as uuidv4} from "uuid";

export interface IAccessToken extends Document {
    jti: string;
    token: string;
    refreshToken: mongoose.Types.ObjectId;
    user_id: mongoose.Types.ObjectId;
    client_id: mongoose.Types.ObjectId;
    scopes: mongoose.Types.ObjectId[];
    createdAt: Date;
    expiresAt: Date;
}

const accessTokenSchema = new Schema<IAccessToken>({
    jti:{
        type: String,
        required: true,
        default: ()=> uuidv4()
    },
    token: { 
        type: String, 
        required: true, 
        unique: true 
    },
    refreshToken:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "RefreshToken",
        required: true

    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required: true 
    },
    client_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Client",
        required: true  
    },
    scopes: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Scope",
        required: true
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        required: true
    }, 
    expiresAt: {
        type: Date,
        default: ()=> new Date(Date.now() + 15 * 60 * 1000), // token expires after 15 min
        required: true
    },
});

// Export
const AccessToken = mongoose.model<IAccessToken>('AccessToken', accessTokenSchema);
export default AccessToken;