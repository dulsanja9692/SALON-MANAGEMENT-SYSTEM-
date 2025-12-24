import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, select: false },
  role: { 
    type: String, 
    enum: ['SuperAdmin', 'SalonOwner', 'Manager', 'Stylist'], 
    default: 'SalonOwner' 
  },
  salonId: { type: Schema.Types.ObjectId, ref: 'Salon' }, // Multi-tenancy
  isActive: { type: Boolean, default: true }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);