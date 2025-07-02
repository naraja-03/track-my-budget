import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here
    const { token } = req.nextauth;
    
    // Check if user is accessing admin pages without admin role
    if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "admin") {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If accessing auth pages and already logged in, redirect to dashboard
        if (req.nextUrl.pathname.startsWith("/auth/") && token) {
          return false;
        }
        
        // Allow access to public pages
        if (
          req.nextUrl.pathname.startsWith("/auth/") ||
          req.nextUrl.pathname.startsWith("/api/auth/") ||
          req.nextUrl.pathname.startsWith("/_next/") ||
          req.nextUrl.pathname.startsWith("/favicon.ico") ||
          req.nextUrl.pathname === "/terms" ||
          req.nextUrl.pathname === "/privacy"
        ) {
          return true;
        }
        
        // Check user status for protected routes
        if (token && token.status !== "active" && token.role !== "admin") {
          return false;
        }
        
        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
