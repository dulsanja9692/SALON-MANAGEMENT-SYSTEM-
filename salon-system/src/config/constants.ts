// src/config/constants.ts

export const ROLES = {
  // System Admin
  SUPER_ADMIN: 'SUPER_ADMIN',

  // Salon Management
  SALON_OWNER: 'SALON_OWNER',
  
  // Staff Roles (Divided by Service)
  CASHIER: 'CASHIER',
  STYLIST: 'STYLIST',      // e.g., Hair, Beard specialists
  THERAPIST: 'THERAPIST',  // e.g., Massage, Facial specialists
  
  // Customers
  USER: 'USER',
};

export const ACCOUNT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

// 14-Day Cleanup Rule
export const REGISTRATION_EXPIRY_MS = 14 * 24 * 60 * 60 * 1000;

// Public/Setup pages allowed for anyone who is logged in but PENDING
export const PENDING_ALLOWED_ENDPOINTS = [
  '/onboarding/profile-setup',
  '/api/owner/profile',
  '/api/auth/signout',
];