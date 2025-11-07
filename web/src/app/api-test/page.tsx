'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';

export default function ApiTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testEndpoint = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setResult({ status: res.status, data });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">🧪 API Testing Console</h1>
        <p className="text-slate-300 mt-2">Test protected API endpoints with your OIDC tokens</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="font-semibold text-slate-100">Protected Endpoint</h2>
            <p className="text-slate-300 text-sm">Test the protected API (requires authentication)</p>
            <button
              onClick={() => testEndpoint('/api/protected')}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Testing...' : 'Test /api/protected'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="font-semibold text-slate-100">Admin Endpoint</h2>
            <p className="text-slate-300 text-sm">Test the admin-only API (requires admin role)</p>
            <button
              onClick={() => testEndpoint('/api/protected/admin')}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Testing...' : 'Test /api/protected/admin'}
            </button>
          </div>
        </div>
      </div>

      {(result || error) && (
        <div className="card">
          <div className="card-body">
            <h2 className="font-semibold mb-3 text-slate-100">Response</h2>
            {error ? (
              <div className="text-red-400">{error}</div>
            ) : (
              <pre className="text-xs text-slate-300 overflow-auto bg-slate-950 p-4 rounded border border-slate-700">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}

      <div className="card border-blue-500/30 bg-blue-500/5">
        <div className="card-body">
          <p className="text-blue-300 text-sm">
            <strong>💡 How it works:</strong> The BFF pattern stores tokens server-side. 
            When you click these buttons, the client makes a request to Next.js API routes, 
            which use your server-side session to authenticate. The tokens never leave the server.
          </p>
        </div>
      </div>
    </div>
  );
}

