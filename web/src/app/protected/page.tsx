export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function ProtectedPage() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/api/auth/login');
  }

  const user = (session as any).user;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">🔒 Protected Area</h1>
          <p className="text-slate-300 mt-2">You have successfully authenticated via OIDC + Keycloak</p>
        </div>
        <a className="btn btn-ghost" href="/api/auth/logout">Logout</a>
      </div>

      <div className="card border-brand-500/30 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="card-body space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-green-400">Access Granted</h2>
              <p className="text-slate-300 text-sm">Only OIDC-approved clients can reach this area</p>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <p className="text-slate-200 font-medium mb-2">🎯 Secret Message:</p>
            <p className="text-brand-300 text-lg italic">
              "Welcome to the secure zone! Your identity has been verified through Keycloak's OIDC protocol. 
              This content is only accessible to authenticated users with valid tokens."
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body space-y-3">
            <h2 className="font-semibold text-slate-100">🔐 Security Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Authentication:</span>
                <span className="text-green-400 font-medium">✓ Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">OIDC Flow:</span>
                <span className="text-green-400 font-medium">✓ Complete</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Session:</span>
                <span className="text-green-400 font-medium">✓ Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Token Storage:</span>
                <span className="text-green-400 font-medium">✓ Server-side</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-3">
            <h2 className="font-semibold text-slate-100">👤 User Information</h2>
            {user ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">User ID:</span>
                  <p className="text-slate-200 font-mono">{user.sub || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="text-slate-200">{user.email || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm">User information not available</p>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-slate-900/50">
        <div className="card-body">
          <h2 className="font-semibold mb-3 text-slate-100">📋 Session Details</h2>
          <pre className="text-xs text-slate-300 overflow-auto bg-slate-950 p-4 rounded border border-slate-700">
            {JSON.stringify({ isLoggedIn: session.isLoggedIn, user: user ?? null }, null, 2)}
          </pre>
        </div>
      </div>

      <div className="card border-yellow-500/30 bg-yellow-500/5">
        <div className="card-body">
          <p className="text-yellow-300 text-sm">
            <strong>💡 Note:</strong> This is a protected route that requires valid OIDC authentication. 
            Unauthenticated users are automatically redirected to the login page. Your tokens are securely stored 
            server-side and never exposed to the browser.
          </p>
        </div>
      </div>
    </div>
  );
}


