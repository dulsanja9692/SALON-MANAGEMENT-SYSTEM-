import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch" },
  customerName: { type: String, required: true },
  customerMobile: { type: String, required: true },
  service: { type: String, required: true },
  stylist: { type: String }, // Name of the staff member
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:MM
  status: { 
    type: String, 
    enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"], 
    default: "PENDING" 
  },
  createdAt: { type: Date, default: Date.now },
});

// Fix: Prevent model overwrite error in development
if (mongoose.models.Appointment) {
  delete mongoose.models.Appointment;
}

export default mongoose.model("Appointment", AppointmentSchema);