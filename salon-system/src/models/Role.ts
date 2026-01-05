import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Senior Stylist"
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  description: String,
  
  // The list of "Keys" (Permissions) this role has
  permissions: [{ type: String }], 
  
  // If true, this is a default role (like "Owner") that cannot be deleted
  isSystemRole: { type: Boolean, default: false }
});

// Ensure role names are unique inside a specific salon
RoleSchema.index({ name: 1, salonId: 1 }, { unique: true });

export default mongoose.models.Role || mongoose.model('Role', RoleSchema);