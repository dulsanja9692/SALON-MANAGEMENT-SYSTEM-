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
    status: {
      type: String,
      enum: ["PENDING_DETAILS", "PENDING_APPROVAL", "ACTIVE", "REJECTED", "SUSPENDED"],
      default: "PENDING_DETAILS",
    },
    
    // 👇 NEW FIELDS ADDED HERE (Fixes "Update Failed")
    contactNumber: { type: String, default: "" },
    nicNumber: { type: String, default: "" },
    address: { type: String, default: "" },

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