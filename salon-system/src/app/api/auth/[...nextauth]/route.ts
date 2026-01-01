import NextAuth, { AuthOptions, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { handlers } from "@/auth";

// 🛑 THIS LINE FIXES THE CRASH
// It forces the Auth system to use Node.js, which allows bcrypt & mongoose to work.
export const runtime = "nodejs"; 

export const { GET, POST } = handlers;

// Force Node.js runtime to avoid edge-related crashes

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: Record<string, string> | undefined) {
        await connectDB();
        
        if (!credentials?.email || !credentials?.password) {
            return null;
        }

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
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.salonId = token.salonId as string;
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: { id: string; role: string; salonId: string } }) {
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