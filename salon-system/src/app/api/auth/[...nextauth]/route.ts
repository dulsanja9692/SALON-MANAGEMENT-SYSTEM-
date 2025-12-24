import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Partial<Record<"email" | "password", unknown>>, request: Request) {
        await connectDB();
        
        // Safety Check: Ensure credentials exist
        if (!credentials || !credentials.email || !credentials.password) return null;

        // 1. Find user
        const user = await User.findOne({ email: credentials.email as string }).select("+password");
        if (!user) throw new Error("Invalid User");

        // 2. Check Password
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (!isValid) throw new Error("Invalid Password");

        // 3. Return User Info
        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role, 
          salonId: user.salonId 
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.role = token.role;
        session.user.salonId = token.salonId;
        session.user.id = token.id;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.salonId = user.salonId;
        token.id = user.id;
      }
      return token;
    }
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };