import mongoose from "mongoose";

const SalonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Salon name is required"],
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      default: "",
    },
    contactNumber: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Salon || mongoose.model("Salon", SalonSchema);