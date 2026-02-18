const mongoose = require("mongoose");
const { v4: uuidv4, v4} = require('uuid');

const Schema = mongoose.Schema;

const clientSchema = new Schema({
    name: {
        type: String, 
        required: true, 
        unique: true
    },
    client_id: { 
        type: String,
        default: ()=> uuidv4(), 
        required: true, 
        unique: true 
    },
    client_secret: { 
        type: String, 
        required: true 
    },
    redirectUri:[{
        type: String
    }],
    grant_types: [{ 
        type: String, 
        enum: ['authorization_code', 'password', 'client_credentials', 'refresh_token', 'device_code', 'pkce'],
        required: true 
    }],
    scopes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scope",
        required: true
    }]
    
});

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
