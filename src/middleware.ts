import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/sleep/:path*", "/activity/:path*", "/readiness/:path*", "/heart-rate/:path*", "/stress/:path*", "/workouts/:path*", "/settings/:path*", "/api/oura/:path*", "/api/ai-summary/:path*", "/api/settings/:path*"],
};
