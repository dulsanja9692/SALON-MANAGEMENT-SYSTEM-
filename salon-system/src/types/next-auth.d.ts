// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  // 1. Extend the Session type (what you get in the frontend)
  interface Session {
    user: {
      id: string;
      role: string;
      permissions: string[];
      salonId?: string;
      status: string;
    } & DefaultSession["user"];
  }

  // 2. Extend the User type (what you return from authorize)
  interface User {
    id: string;
    role: string;
    permissions: string[];
    salonId?: string;
    status: string;
  }
}

declare module "next-auth/jwt" {
  // 3. Extend the JWT type (what gets saved in the token)
  interface JWT {
    id: string;
    role: string;
    permissions: string[];
    salonId?: string;
    status: string;
  }
}