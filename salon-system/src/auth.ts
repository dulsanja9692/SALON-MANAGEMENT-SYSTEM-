import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      // 1. Define the login fields
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // 2. The logic to verify the user
      authorize: async (credentials) => {
        try {
          await connectDB();
          
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Find user and explicitly get the password (since it's usually hidden)
          const user = await User.findOne({ email: credentials.email }).select("+password");
          
          if (!user) {
            throw new Error("User not found");
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password as string, 
            user.password
          );

          if (!isValid) {
            throw new Error("Invalid password");
          }

          // ✅ FIX: Convert MongoDB ObjectId to a simple String
          // This prevents the "Objects are not valid as a React child" error
          return { 
            id: user._id.toString(), 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            salonId: user.salonId ? user.salonId.toString() : null 
          };

        } catch (error) {
          console.error("Auth Error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    // 3. Make sure the role and salonId are available in the token
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.salonId = user.salonId;
        token.id = user.id;
      }
      return token;
    },
    // 4. Pass that data to the frontend session
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.salonId = token.salonId;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET, // Ensure this exists in your .env file
});