import mongoose from 'mongoose';
import { ACCOUNT_STATUS, SYSTEM_ROLES } from '@/config/permissions';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  
  // Can be a System Role ("SALON_OWNER") or a Custom Role Name ("Senior Stylist")
  role: { type: String, default: SYSTEM_ROLES.SALON_OWNER }, 
  
  // PERFORMANCE CACHE: We save permissions here on login.
  // This allows the Middleware to check access without calling the DB every time.
  cachedPermissions: [{ type: String }], 

  status: { type: String, enum: Object.values(ACCOUNT_STATUS), default: ACCOUNT_STATUS.PENDING },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
  
  personalDetails: {
    fullName: String,
    phone: String,
    avatar: String,
  },
  
  // For the 14-Day Auto-Delete Rule
  registrationDate: { type: Date, default: Date.now },
  lastProfileUpdate: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);