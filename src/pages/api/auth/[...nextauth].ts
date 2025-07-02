import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import { MongoDBAdapter } from "@auth/mongodb-adapter"; // Temporarily disabled
// import clientPromise from "@/lib/mongodb"; // Temporarily disabled

// Extend the Session and User types to include user details
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: 'admin' | 'user';
      status?: 'active' | 'pending' | 'rejected';
    };
  }
}

const ADMIN_EMAILS = ['suriyauidev@gmail.com', 'santhanarajadev3@gmail.com'];

export const authOptions: NextAuthOptions = {
  // adapter: MongoDBAdapter(clientPromise) as any, // Temporarily disabled for testing
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account }) {
      // For now, allow all Google sign-ins
      if (account?.provider === 'google' && user.email) {
        console.log('Google sign-in successful for:', user.email);
        return true;
      }
      return true;
    },
    async session({ session, token }) {
      // Use token data for JWT strategy
      if (session.user && token) {
        session.user.id = (token.sub as string) || (token.id as string) || 'unknown';
        session.user.email = (token.email as string) || session.user.email;
        session.user.name = (token.name as string) || session.user.name;
        session.user.image = (token.picture as string) || session.user.image;
        
        // Set role and status based on email
        if (session.user.email) {
          session.user.role = ADMIN_EMAILS.includes(session.user.email) ? 'admin' : 'user';
          session.user.status = ADMIN_EMAILS.includes(session.user.email) ? 'active' : 'active'; // Make all users active for now
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // Store user info in JWT token for session strategy
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt", // Changed from "database" to "jwt" for better compatibility
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
};

export default NextAuth(authOptions);
