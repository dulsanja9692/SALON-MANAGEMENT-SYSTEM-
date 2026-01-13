import mongoose, { Schema, model, models } from "mongoose";

const BranchSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'Main Branch', 'Outlet'
    address: { type: String, required: true },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true }, // Added Email
    salonId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
  },
  { timestamps: true }
);

const Branch = models.Branch || model("Branch", BranchSchema);
export default Branch;