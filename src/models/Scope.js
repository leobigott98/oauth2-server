const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const scopeSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

const Scope = mongoose.model("Scope", scopeSchema);

module.exports = Scope;