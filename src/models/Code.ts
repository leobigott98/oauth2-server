import mongoose, { Schema, Document } from "mongoose";

export interface ICode extends Document {
  code: string;
  user_id: mongoose.Types.ObjectId;
  client_id: mongoose.Types.ObjectId;
  redirectUri: string;
  scopes: mongoose.Types.ObjectId[];
  expiresAt: Date;
  used: boolean;
}

const CodeSchema = new Schema<ICode>({
  code: { type: String, required: true, unique: true },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  redirectUri: { type: String, required: true },
  scopes: { type: [mongoose.Schema.Types.ObjectId], ref: "Scope", required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false }, // To prevent reuse
});

// Export
const Code = mongoose.model<ICode>("Code", CodeSchema);
export default Code;
