const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    token: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, red: "User" },
    clientId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Token expires in 1 hour
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;