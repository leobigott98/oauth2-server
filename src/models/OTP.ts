import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
    email: string;
    otp: string;
    expiry: Date;
}

const otpSchema = new Schema<IOTP>({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        required: true,
        default: ()=> new Date(Date.now() + 10 * 60 * 1000), // OTP expires after 10 min
    }
});

// Export
const OTP = mongoose.model<IOTP>('OTP', otpSchema);
export default OTP;