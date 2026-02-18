import mongoose, { Document, Schema } from "mongoose";
import { getScopeIds } from "../services/scopeService";

// Define the IUser interface extending Document for Mongoose
export interface IUser extends Document {
  user_id: string; // El UUID que hablamos para el POS
  email: string;
  password?: string;
  name: string;
  lastname: string;
  active: boolean;
  verifiedEmail: boolean;
  role: "user" | "admin";
  createdAt: Date;
  scopes: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  user_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    // Note: The user_id will be generated as a UUID in the service layer before saving the user
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  lastname: { type: String, required: true },
  active: { type: Boolean, required: true, default: true },
  verifiedEmail: { type: Boolean, required: true, default: false },
  role: {
    type: String,
    required: true,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: { type: Date, default: Date.now, required: true },
  scopes: [{ type: Schema.Types.ObjectId, ref: "Scope", required: true }],
});

const defaultScopes: Record<string, string[]> = {
    user: [
        "account:read:self", "account:write:self", "cards:read:self", "cards:write:self",
        "transactions:read:self", "transactions:write:self", "transactions:delete:self",
        "users:read:self", "users:write:self", "wallet:write:self", "wallet:read:self",
    ],
    admin: [
        "admin:full_access", "users:read:all", "users:write:all",
        "transactions:read:all", "transactions:write:all",
        "wallet:read:all", "wallet:write:all"
    ]
};

// Before saving the user, assign default scopes based on role
userSchema.pre("save", async function (next) {
  if (!this.scopes || this.scopes.length === 0) {
    this.scopes = await getScopeIds(defaultScopes[this.role]);
  }
  next();
});

// Export
const User = mongoose.model<IUser>("User", userSchema);
export default User;
