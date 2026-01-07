import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    id: string;
    status: string; // 👈 Added
  }

  interface Session {
    user: {
      role: string;
      id: string;
      status: string; // 👈 Added
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    id: string;
    status: string; // 👈 Added
  }
}