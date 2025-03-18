const mongoose = require('mongoose');

const CodeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    redirectUri: { type: String, required: true },
    scope: { type: [String], required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false } // To prevent reuse
});

module.exports = mongoose.model('Code', CodeSchema);