const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    token: { 
        type: String, 
        required: true, 
        unique: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    client_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Client"  
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        expires: 3600 // Token expires in 1 hour
    } 
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;