import mongoose, { Schema } from "mongoose";

const SalonSchema = new Schema({
  name: { type: String, required: true },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' }, 
  status: { 
    type: String, 
    enum: ['Pending', 'Active', 'Rejected', 'Suspended'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now },
  address: { type: String },
  contactNumber: { type: String },
});

// Check if model exists before creating to prevent overwrite errors
export default mongoose.models.Salon || mongoose.model("Salon", SalonSchema);