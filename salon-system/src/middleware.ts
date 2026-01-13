import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // Redirect here if not logged in
  },
});

// Protect all routes under /dashboard
export const config = { matcher: ["/dashboard/:path*"] };