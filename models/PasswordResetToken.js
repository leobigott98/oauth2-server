const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
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

const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);

module.exports = PasswordResetToken;