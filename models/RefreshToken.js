const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const refreshTokeSchema = new Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String, 
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800,
        required: true
    }
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokeSchema);

module.exports = RefreshToken;