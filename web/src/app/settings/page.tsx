'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRefreshToken = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/auth/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Tokens refreshed successfully!' });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Token refresh failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Token refresh failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">⚙️ Settings</h1>
        <p className="text-slate-300 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="font-semibold text-slate-100">Token Management</h2>
            <p className="text-slate-300 text-sm">
              Manually refresh your access tokens. Tokens are automatically refreshed when needed.
            </p>
            <button
              onClick={handleRefreshToken}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Refreshing...' : 'Refresh Tokens'}
            </button>
            {message && (
              <div className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="font-semibold text-slate-100">Account Security</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Two-Factor Auth:</span>
                <span className="text-slate-300">Not configured</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Password:</span>
                <span className="text-slate-300">Manage in Keycloak</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Session Security:</span>
                <span className="text-green-400">✓ BFF Pattern</span>
              </div>
            </div>
            <a
              href="http://localhost:8080/realms/oidc-demo/account"
              target="_blank"
              className="btn btn-ghost text-sm w-full mt-4"
            >
              Open Keycloak Account Console →
            </a>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <h2 className="font-semibold text-slate-100">Social Login</h2>
          <p className="text-slate-300 text-sm">
            Connect your account with social identity providers. Configure these in Keycloak Admin Console.
          </p>
          <a href="/social-login" className="btn btn-primary w-full">
            View Social Login Setup →
          </a>
        </div>
      </div>

      <div className="card border-yellow-500/30 bg-yellow-500/5">
        <div className="card-body">
          <p className="text-yellow-300 text-sm">
            <strong>💡 Note:</strong> Most account management features (password change, profile update, MFA setup) 
            are handled through Keycloak's Account Console. Click the link above to access it.
          </p>
        </div>
      </div>
    </div>
  );
}

