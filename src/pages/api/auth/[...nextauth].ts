import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import { MongoDBAdapter } from "@auth/mongodb-adapter"; // Temporarily disabled
import clientPromise from "@/lib/mongodb";

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
      if (account?.provider === 'google' && user.email) {
        try {
          const client = await clientPromise;
          const db = client.db('track-my-budget');
          
          // Check if user already exists
          const existingUser = await db.collection('users').findOne({ email: user.email });
          
          if (!existingUser) {
            // Create new user with appropriate role and status
            const isAdmin = ADMIN_EMAILS.includes(user.email);
            const newUser = {
              email: user.email,
              name: user.name,
              image: user.image,
              role: isAdmin ? 'admin' : 'user',
              status: isAdmin ? 'active' : 'pending',
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            await db.collection('users').insertOne(newUser);
          }
          
          return true;
        } catch (error) {
          console.error('Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, token, user }) {
      // Use token instead of user for better compatibility
      if (session.user?.email) {
        try {
          const client = await clientPromise;
          const db = client.db('track-my-budget');
          
          const userData = await db.collection('users').findOne({ email: session.user.email });
          
          if (userData) {
            session.user.id = user?.id || token?.sub || userData._id?.toString() || '';
            session.user.role = userData.role;
            session.user.status = userData.status;
          } else {
            // Fallback for users not in our custom users collection
            session.user.id = user?.id || token?.sub || '';
            session.user.role = ADMIN_EMAILS.includes(session.user.email) ? 'admin' : 'user';
            session.user.status = ADMIN_EMAILS.includes(session.user.email) ? 'active' : 'pending';
          }
        } catch (error) {
          console.error('Error in session callback:', error);
          // Fallback to basic session data
          session.user.id = user?.id || token?.sub || '';
          session.user.role = ADMIN_EMAILS.includes(session.user.email || '') ? 'admin' : 'user';
          session.user.status = ADMIN_EMAILS.includes(session.user.email || '') ? 'active' : 'pending';
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
