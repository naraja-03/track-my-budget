import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    // Additional middleware logic can be added here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If accessing auth pages and already logged in, redirect to dashboard
        if (req.nextUrl.pathname.startsWith("/auth/") && token) {
          return false;
        }
        
        // Protect all routes except auth, api/auth, and public assets
        if (
          req.nextUrl.pathname.startsWith("/auth/") ||
          req.nextUrl.pathname.startsWith("/api/auth/") ||
          req.nextUrl.pathname.startsWith("/_next/") ||
          req.nextUrl.pathname.startsWith("/favicon.ico")
        ) {
          return true;
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
