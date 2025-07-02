import { useRouter } from 'next/router';
import Link from 'next/link';

const AuthError = () => {
  const router = useRouter();
  const { error } = router.query;

  const getErrorMessage = (error: string | string[] | undefined) => {
    switch (error) {
      case 'AccessDenied':
        return 'Your account is pending approval. Please contact an administrator.';
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'Verification':
        return 'The token has expired or has already been used.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        {/* Error Icon */}
        <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication Error
        </h1>

        <p className="text-gray-600 mb-6">
          {getErrorMessage(error)}
        </p>

        <div className="space-y-3">
          <Link
            href="/auth/signin"
            className="w-full inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
          
          <p className="text-sm text-gray-500">
            Need help? Contact support at{' '}
            <a href="mailto:suriyauidev@gmail.com" className="text-blue-600 hover:underline">
              suriyauidev@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthError;
