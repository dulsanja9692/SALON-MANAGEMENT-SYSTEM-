import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true }, // e.g., "30 mins", "1 hour"
  status: { type: String, default: "ACTIVE" }, // ACTIVE or INACTIVE
  createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite error in dev
if (mongoose.models.Service) {
  delete mongoose.models.Service;
}

export default mongoose.model("Service", ServiceSchema);