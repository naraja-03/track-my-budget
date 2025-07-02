import { SEOHead } from "@/components/SEOHead";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <>
      <SEOHead
        title="Terms of Service"
        description="Terms of Service for Track My Budget expense management application"
        canonical="/terms"
        noindex={true}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms of Service</h1>
              <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="prose prose-blue max-w-none">
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 mb-4">
                  By accessing and using Track My Budget (&#39;the Service&#39;), you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
                <p className="text-gray-700 mb-4">
                  Track My Budget is a personal finance management application that allows users to track expenses, set budgets, and manage their financial goals.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>You must provide accurate and complete information when creating an account</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>Access to the application is restricted to approved users only</li>
                  <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Privacy and Data Protection</h2>
                <p className="text-gray-700 mb-4">
                  Your privacy is important to us. All financial data you enter is securely stored and is only accessible to you. We do not share your personal financial information with third parties.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
                <p className="text-gray-700 mb-4">
                  Track My Budget is provided &#39;as is&#39; without any warranties. We are not liable for any financial decisions made based on information provided by the application.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Contact Information</h2>
                <p className="text-gray-700">
                  If you have any questions about these Terms of Service, please contact us at{' '}
                  <a href="mailto:suriyauidev@gmail.com" className="text-blue-600 hover:underline">
                    suriyauidev@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
