// src/lib/auth.ts
import { NextAuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import mongoose from "mongoose";
import User from "@/models/User";
import Role from "@/models/Role";
import bcrypt from "bcryptjs";
import { SYSTEM_ROLES, PERMISSIONS } from "@/config/permissions";

// ... rest of your code

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 Days
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Connect DB
        if (mongoose.connection.readyState !== 1) await mongoose.connect(process.env.MONGODB_URI!);

        // 2. Find User
        const user = await User.findOne({ email: credentials?.email });
        if (!user) throw new Error("No user found");

        // 3. Check Password
        const isValid = await bcrypt.compare(credentials!.password as string, user.passwordHash as string);
        if (!isValid) throw new Error("Invalid password");

        // 4. LOAD PERMISSIONS DYNAMICALLY
        let finalPermissions: string[] = [];

        if (user.role === SYSTEM_ROLES.SALON_OWNER || user.role === SYSTEM_ROLES.SUPER_ADMIN) {
          finalPermissions = Object.values(PERMISSIONS);
        } else if (user.role === SYSTEM_ROLES.USER) {
          finalPermissions = [];
        } else {
          // Staff: Look up their Custom Role in the DB
          const roleData = await Role.findOne({ name: user.role, salonId: user.salonId });
          finalPermissions = roleData ? roleData.permissions : [];
          finalPermissions.push(PERMISSIONS.PROFILE_UPDATE);
        }

        // 5. Return the extended User object
        // (Now that we added step 1, the red lines below will disappear)
        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          permissions: finalPermissions,
          status: user.status,
          salonId: user.salonId?.toString(),
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { id: string; role: string; permissions: string[]; status: string; salonId?: string } }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.status = user.status;
        token.salonId = user.salonId;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.permissions = token.permissions as string[];
        session.user.status = token.status as string;
        session.user.salonId = token.salonId as string;
      }
      return session;
    }
  }
};