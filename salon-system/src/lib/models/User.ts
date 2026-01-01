import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    role: { 
        type: String, 
        // 🛑 IMPORTANT: You must add "Cashier" here!
        enum: ["SuperAdmin", "SalonOwner", "Manager", "Staff", "Cashier", "Customer"], 
        default: "Customer" 
    },
    salonId: { type: Schema.Types.ObjectId, ref: "Salon" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// This ensures the model is re-compiled if you change it
export default mongoose.models.User || mongoose.model("User", UserSchema);