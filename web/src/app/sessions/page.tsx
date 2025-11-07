export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function SessionsPage() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/api/auth/login');
  }

  const user = (session as any).user;
  const tokenSet = session.tokenSet;
  const expiresAt = tokenSet?.expiresAt;
  const expiresIn = expiresAt ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000)) : null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">🔐 Session Management</h1>
          <p className="text-slate-300 mt-2">Manage your active sessions and tokens</p>
        </div>
        <a className="btn btn-ghost" href="/api/auth/logout">Logout All</a>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="font-semibold text-slate-100">Current Session</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-green-400 font-medium">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">User:</span>
                <span className="text-slate-200">{user?.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Session ID:</span>
                <span className="text-slate-200 font-mono text-xs">{user?.sub?.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Token Expires:</span>
                <span className="text-slate-200">
                  {expiresIn !== null ? `${Math.floor(expiresIn / 60)} minutes` : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="font-semibold text-slate-100">Token Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-400">Scope:</span>
                <p className="text-slate-200 break-all mt-1">{tokenSet?.scope || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400">Storage:</span>
                <p className="text-slate-200">Server-side (BFF pattern)</p>
              </div>
              <div>
                <span className="text-slate-400">Refresh Token:</span>
                <p className="text-slate-200">✓ Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-100">Active Sessions</h2>
            <a
              href="/sessions"
              className="btn btn-ghost text-sm"
            >
              Refresh
            </a>
          </div>
          <div className="space-y-3">
            <div className="border border-slate-700 rounded p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-200 font-medium">Current Browser Session</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Started: {new Date().toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-slate-300 text-sm">Active</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-4">
            💡 In a production system, you would see all active sessions across devices and browsers.
            Keycloak can track these via session management endpoints.
          </p>
        </div>
      </div>

      <div className="card border-blue-500/30 bg-blue-500/5">
        <div className="card-body">
          <p className="text-blue-300 text-sm">
            <strong>🔒 Security:</strong> All sessions are managed server-side. Logging out will invalidate 
            your refresh token and end all active sessions. Your tokens are never exposed to the browser.
          </p>
        </div>
      </div>
    </div>
  );
}

