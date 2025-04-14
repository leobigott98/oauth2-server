const mongoose = require("mongoose");
const { getScopeIds } = require("../services/scopeService");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    verifiedEmail: {
        type: Boolean,
        required: true,
        default: false
    },
    role: {
        type: String,
        required: true,
        enum: ["user", "admin"],
        default: "user"
    },
    createdAt: { 
        type: Date, 
        default: Date.now, 
        required: true
    }, 
    scopes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Scope",
            required: true,
        },
    ],
});

const defaultScopes = {
    user: [
        "account:read:self",
        "account:write:self",
        "cards:read:self",
        "cards:write:self",
        "transactions:read:self",
        "transactions:write:self",
        "transactions:delete:self",
        "users:read:self",
        "users:write:self",
        "wallet:write:self",
        "wallet:read:self",
    ],
    admin: [
        "admin:full_access",
        "users:read:all",
        "users:write:all",
        "transactions:read:all",
        "transactions:write:all",
        "wallet:read:all",
        "wallet:write:all"
    ]
};

// Before saving the user, assign default scopes based on role
userSchema.pre("save", async function (next) {
    if (!this.scopes || this.scopes.length === 0) {
        this.scopes = await getScopeIds(defaultScopes[this.role]);
    }
    next();
});


const User = mongoose.model("User", userSchema);

module.exports = User;
