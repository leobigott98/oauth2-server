const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true
    },
    scopes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Scope',
        required: true
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;