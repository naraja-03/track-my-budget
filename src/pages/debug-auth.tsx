import { useSession } from "next-auth/react";
import { useState } from "react";

export default function DebugAuth() {
  const { data: session, status } = useSession();
  const [apiResult, setApiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/custom_expenses');
      const data = await response.json();
      setApiResult({ status: response.status, data });
    } catch (error) {
      setApiResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Session Status: {status}</h2>
          <pre className="bg-white p-4 rounded text-sm overflow-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Test API Call</h2>
          <button 
            onClick={testAPI}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test /api/custom_expenses'}
          </button>
          
          {apiResult && (
            <pre className="bg-white p-4 rounded text-sm overflow-auto mt-4">
              {JSON.stringify(apiResult, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <div>NEXTAUTH_URL: {process.env.NEXTAUTH_URL || 'Not set'}</div>
            <div>GOOGLE_CLIENT_ID: {process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set'}</div>
            <div>GOOGLE_CLIENT_SECRET: {process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set'}</div>
            <div>NEXTAUTH_SECRET: {process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
