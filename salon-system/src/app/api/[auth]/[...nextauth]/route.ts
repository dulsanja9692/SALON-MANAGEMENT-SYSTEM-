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
      credentials: { email: {}, password: {} },
      async authorize(credentials: any) {
        await connectDB();
        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user) throw new Error("Invalid User");

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid Password");

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
      if (token) {
        session.user.role = token.role;
        session.user.salonId = token.salonId;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.salonId = user.salonId;
      }
      return token;
    }
  },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };