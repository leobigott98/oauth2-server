const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
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

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;