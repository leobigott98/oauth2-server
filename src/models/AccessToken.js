const mongoose = require("mongoose");
const { v4: uuidv4} = require('uuid');

const Schema = mongoose.Schema;

const accessTokenSchema = new Schema({
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

const AccessToken = mongoose.model('AccessToken', accessTokenSchema);

module.exports = AccessToken;