import mongoose, { Document, Schema } from "mongoose";

// Define the IScope interface extending Document for Mongoose
export interface IScope extends Document {
  name: string;
  description: string;
}

const scopeSchema = new Schema<IScope>({
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

// Export
const Scope = mongoose.model<IScope>("Scope", scopeSchema);
export default Scope;