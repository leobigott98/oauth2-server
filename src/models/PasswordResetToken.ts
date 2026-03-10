import mongoose, { Schema, Document } from "mongoose";

export interface IPasswordResetToken extends Document {
    email: string;
    token: string;
    expiry: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
    email: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiry:{
        type: Date,
        required: true,
        default: ()=> new Date(Date.now() + 10 * 60 * 1000), // Token expires after 10 min
    }
}, {timestamps: true});

// Export
const PasswordResetToken = mongoose.model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;