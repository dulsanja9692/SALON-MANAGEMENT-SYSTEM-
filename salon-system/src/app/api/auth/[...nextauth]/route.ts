import NextAuth, { AuthOptions } from "next-auth"; // Removed "type" keyword
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

// ✅ EXPORT THIS VARIABLE so other files can use it
export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        await connectDB();
        
        // Safety Check: Ensure credentials exist
        if (!credentials?.email || !credentials?.password) {
            return null;
        }

        const user = await User.findOne({ email: credentials.email }).select("+password");
        if (!user) throw new Error("Invalid User");

        // Fixed: Added "credentials.password as string" to satisfy TypeScript
        const isValid = await bcrypt.compare(
            credentials.password as string, 
            user.password
        );
        
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };