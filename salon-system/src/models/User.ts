import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "SALON_OWNER", "STAFF", "CUSTOMER"],
      default: "CUSTOMER",
    },
    
    // 👇 The Workflow Status
    status: {
      type: String,
      enum: ["PENDING_DETAILS", "PENDING_APPROVAL", "ACTIVE", "REJECTED"],
      default: "PENDING_DETAILS", // Step 1: They just registered
    },

    // 👇 Verification Documents (URLs to images)
    verification: {
      nicFront: { type: String, default: "" },
      nicBack: { type: String, default: "" },
      businessReg: { type: String, default: "" },
    },

    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salon",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);