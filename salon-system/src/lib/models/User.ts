import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    role: { 
        type: String, 
        enum: ["SuperAdmin", "SalonOwner", "Manager", "Staff", "Cashier", "Customer"], 
        default: "Customer" 
    },
    salonId: { type: Schema.Types.ObjectId, ref: "Salon" },
    
    // 👇 NEW: This connects the Employee to the Services they can perform
    specialties: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);