import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
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
  adapter: MongoDBAdapter(clientPromise) as any,
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
    async session({ session, user }) {
      if (session.user?.email) {
        try {
          const client = await clientPromise;
          const db = client.db('track-my-budget');
          
          const userData = await db.collection('users').findOne({ email: session.user.email });
          
          if (userData) {
            session.user.id = user.id;
            session.user.role = userData.role;
            session.user.status = userData.status;
            
            // Block access for non-active users (except admins)
            if (userData.status !== 'active' && userData.role !== 'admin') {
              // Return session but with restricted access
              session.user.status = 'pending';
            }
          }
        } catch (error) {
          console.error('Error in session callback:', error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
};

export default NextAuth(authOptions);
