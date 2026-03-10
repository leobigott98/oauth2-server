import mongoose, { Document, Schema } from "mongoose";
const { v4: uuidv4} = require('uuid');

export interface IRefreshToken extends Document {
    jti: string;
    token: string;
    user_id: mongoose.Types.ObjectId;
    client_id: mongoose.Types.ObjectId;
    createdAt: Date;
    expiresAt: Date;
    revoked: boolean;
    lastUsedAt: Date | null;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
    jti: {
        type: String,
        required: true,
        default: ()=> uuidv4()
    },
    token: {
        type: String, 
        required: true,
        unique: true
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
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // expires after 7 days
        required: true
    },
    revoked: {
        type: Boolean,
        default: false,
        required: true
    },
    lastUsedAt: {
        type: Date,
        default: null
    }
});

// Hash token before storing it
/* refreshTokenSchema.pre("save", async function (next) {
    if(!this.isModified("token")) return next();
    this.token = await bcrypt.hash(this.token, 10);
    next();
}); */

// Create a user_id index 
refreshTokenSchema.index({user_id: 1, client_id: 1});

// Export
const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);
export default RefreshToken;