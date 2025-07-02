import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { SEOHead } from "@/components/SEOHead";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    
    if (session) {
      // User is authenticated, redirect to dashboard
      router.replace("/dashboard");
    } else {
      // User is not authenticated, redirect to login
      router.replace("/auth/signin");
    }
  }, [router, session, status]);

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <>
        <SEOHead />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
              ₹
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Track My Budget</h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your financial dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  return null;
}