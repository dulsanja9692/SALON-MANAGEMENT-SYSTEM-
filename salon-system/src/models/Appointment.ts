import mongoose, { Schema } from "mongoose";

const AppointmentSchema = new Schema(
  {
    salonId: { type: Schema.Types.ObjectId, ref: "Salon", required: true },
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    staff: { type: Schema.Types.ObjectId, ref: "User", required: true }, // The specific employee chosen
    service: { type: Schema.Types.ObjectId, ref: "Service", required: true }, // The service being booked
    
    appointmentDate: { type: Date, required: true }, // e.g., 2026-01-05T10:30:00
    duration: { type: Number, required: true }, // Copied from Service (in minutes)
    
    status: { 
      type: String, 
      enum: ["pending", "confirmed", "completed", "cancelled"], 
      default: "confirmed" 
    },
    notes: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Appointment || mongoose.model("Appointment", AppointmentSchema);