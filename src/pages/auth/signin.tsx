import { GetServerSideProps } from "next";
import { getProviders, signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { SEOHead } from "@/components/SEOHead";
import Link from "next/link";

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

interface Props {
  providers: Record<string, Provider>;
}

export default function SignIn({ providers }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true);
    try {
      await signIn(providerId, { 
        callbackUrl: "/dashboard",
        redirect: true 
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Sign In"
        description="Sign in to Track My Budget to manage your expenses and achieve your financial goals"
        noindex={true}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ₹
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Track My Budget
            </h1>
            <p className="text-gray-600">
              Sign in to manage your expenses
            </p>
          </div>

          {/* Sign In Options */}
          <div className="space-y-4">
            {Object.keys(providers).length === 0 ? (
              <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl">
                <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Configuration Error</h3>
                <p className="text-red-700 text-sm mb-4">
                  Authentication providers are not properly configured. Please check your environment variables.
                </p>
                <div className="text-xs text-red-600 bg-red-100 rounded-lg p-2">
                  <p className="font-medium mb-1">Required variables:</p>
                  <ul className="text-left space-y-1">
                    <li>• GOOGLE_CLIENT_ID</li>
                    <li>• GOOGLE_CLIENT_SECRET</li>
                    <li>• NEXTAUTH_SECRET</li>
                    <li>• NEXTAUTH_URL</li>
                  </ul>
                </div>
              </div>
            ) : (
              Object.values(providers).map((provider) => (
                <button
                  key={provider.name}
                  onClick={() => handleSignIn(provider.id)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {provider.name === "Google" && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span className="font-medium">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        Signing in...
                      </div>
                    ) : (
                      `Continue with ${provider.name}`
                    )}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <Link href="/terms" className="text-blue-600 hover:underline">terms of service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">privacy policy</Link>
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Access is restricted to approved users only
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // If user is already signed in, redirect to dashboard
  if (session) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  const providers = await getProviders();

  return {
    props: {
      providers: providers ?? {},
    },
  };
};
