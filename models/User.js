const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, requires: true}
});

const User = mongoose.model('User', userSchema);

module.exports = User;