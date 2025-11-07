'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';

export default function DevToolsPage() {
  const [jwtInput, setJwtInput] = useState('');
  const [decoded, setDecoded] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const decodeJWT = () => {
    setError(null);
    setDecoded(null);
    
    if (!jwtInput.trim()) {
      setError('Please enter a JWT token');
      return;
    }

    try {
      const parts = jwtInput.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
      }

      // Decode base64url (handles both base64 and base64url)
      const decodeBase64Url = (str: string) => {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) str += '=';
        return atob(str);
      };
      
      const header = JSON.parse(decodeBase64Url(parts[0]));
      const payload = JSON.parse(decodeBase64Url(parts[1]));
      
      // Calculate expiration
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp ? payload.exp < now : false;
      const expiresIn = payload.exp ? payload.exp - now : null;

      setDecoded({
        header,
        payload,
        isExpired,
        expiresIn,
        expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null
      });
    } catch (err: any) {
      setError(err.message || 'Failed to decode JWT');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">🛠️ Developer Tools</h1>
        <p className="text-slate-300 mt-2">JWT decoder, token introspection, and debugging utilities</p>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <h2 className="font-semibold text-slate-100">JWT Decoder</h2>
          <div className="space-y-3">
            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              placeholder="Paste your JWT token here..."
              className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-slate-200 text-sm font-mono min-h-[100px]"
            />
            <button onClick={decodeJWT} className="btn btn-primary">
              Decode JWT
            </button>
          </div>
          {error && (
            <div className="text-red-400 text-sm mt-2">{error}</div>
          )}
          {decoded && (
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-semibold text-slate-100 mb-2">Header</h3>
                <pre className="text-xs text-slate-300 overflow-auto bg-slate-950 p-4 rounded border border-slate-700">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 mb-2">Payload</h3>
                <pre className="text-xs text-slate-300 overflow-auto bg-slate-950 p-4 rounded border border-slate-700">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400">Status:</span>
                  <span className={decoded.isExpired ? 'text-red-400 ml-2' : 'text-green-400 ml-2'}>
                    {decoded.isExpired ? 'Expired' : 'Valid'}
                  </span>
                </div>
                {decoded.expiresIn !== null && (
                  <div>
                    <span className="text-slate-400">Expires in:</span>
                    <span className="text-slate-200 ml-2">
                      {decoded.isExpired ? 'Expired' : `${Math.floor(decoded.expiresIn / 60)} minutes`}
                    </span>
                  </div>
                )}
                {decoded.expiresAt && (
                  <div>
                    <span className="text-slate-400">Expires at:</span>
                    <span className="text-slate-200 ml-2 text-sm">
                      {new Date(decoded.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <h2 className="font-semibold text-slate-100">Token Introspection</h2>
          <p className="text-slate-300 text-sm">
            Use the <code className="bg-slate-800 px-2 py-1 rounded">/api/auth/session</code> endpoint 
            to introspect your current session tokens.
          </p>
          <a href="/api/auth/session" target="_blank" className="btn btn-ghost text-sm">
            View Session Data →
          </a>
        </div>
      </div>

      <div className="card border-yellow-500/30 bg-yellow-500/5">
        <div className="card-body">
          <p className="text-yellow-300 text-sm">
            <strong>⚠️ Security Note:</strong> Never share your JWT tokens publicly. These tools are for 
            development and debugging purposes only. In production, always validate tokens server-side.
          </p>
        </div>
      </div>
    </div>
  );
}

