
export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN', // The Platform Owner (You)
  SALON_OWNER: 'SALON_OWNER', // The Business Owner
  USER: 'USER',               // The Client/Customer
};

// 2. PERMISSIONS (The Building Blocks)
// Owners will mix & match these to create custom roles (e.g., "Manager" = APPOINTMENT_MANAGE + STAFF_MANAGE)
export const PERMISSIONS = {
  // Appointments
  APPOINTMENT_VIEW: 'appointment:view',
  APPOINTMENT_CREATE: 'appointment:create',
  APPOINTMENT_MANAGE: 'appointment:manage', // Edit/Delete others' appointments

  // POS & Finance
  POS_ACCESS: 'pos:access',       // For Cashiers
  FINANCE_VIEW: 'finance:view',   // For Managers
  FINANCE_EXPORT: 'finance:export',

  // Staff & HR
  STAFF_VIEW: 'staff:view',
  STAFF_MANAGE: 'staff:manage',   // Create/Delete employees
  STAFF_PAYROLL: 'staff:payroll',

  // System
  PROFILE_UPDATE: 'profile:update', // Everyone gets this automatically
};

// 3. ACCOUNT STATUS
export const ACCOUNT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// 4. RULES
// 14 Days in milliseconds (For the auto-delete logic)
export const REGISTRATION_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000;

// Pages allowed for PENDING users (so they can fix their profile)
export const PENDING_ALLOWED_ENDPOINTS = [
  '/onboarding/profile-setup',
  '/api/owner/profile',
  '/api/auth/signout',
];