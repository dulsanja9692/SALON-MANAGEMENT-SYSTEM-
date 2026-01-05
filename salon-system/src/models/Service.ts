import mongoose, { Schema } from "mongoose";

const ServiceSchema = new Schema(
  {
    name: { type: String, required: true }, // e.g. "Men's Haircut"
    description: { type: String },
    price: { type: Number, required: true }, // e.g. 25.00
    duration: { type: Number, required: true }, // in minutes, e.g. 30
    salonId: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model("Service", ServiceSchema);