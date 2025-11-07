export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import TokenCountdown from '@/components/TokenCountdown';

export default async function ProfilePage() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/api/auth/login');
  }

  const user = (session as any).user;
  const tokenSet = session.tokenSet;
  const idTokenClaims = (session as any).idTokenClaims;

  // Calculate token expiration
  const expiresAt = tokenSet?.expiresAt;
  const expiresIn = expiresAt ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000)) : null;
  const isExpired = expiresIn !== null && expiresIn === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">👤 User Profile</h1>
          <p className="text-slate-300 mt-2">Your OIDC authentication details</p>
        </div>
        <a className="btn btn-ghost" href="/api/auth/logout">Logout</a>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="font-semibold text-slate-100">User Information</h2>
            {user ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-400">User ID (sub):</span>
                  <p className="text-slate-200 font-mono break-all">{user.sub || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="text-slate-200">{user.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Roles:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user.roles?.length > 0 ? (
                      user.roles.map((role: string) => (
                        <span key={role} className="px-2 py-1 bg-brand-500/20 text-brand-300 rounded text-xs">
                          {role}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400">No roles assigned</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">User information not available</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-4">
            <h2 className="font-semibold text-slate-100">Token Status</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status:</span>
                <span className={isExpired ? 'text-red-400' : 'text-green-400 font-medium'}>
                  {isExpired ? 'Expired' : 'Valid'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Expires in:</span>
                {expiresAt && (
                  <TokenCountdown 
                    expiresAt={expiresAt}
                  />
                )}
                {!expiresAt && (
                  <span className="text-slate-200">N/A</span>
                )}
              </div>
              <div>
                <span className="text-slate-400">Scope:</span>
                <p className="text-slate-200 break-all">{tokenSet?.scope || 'N/A'}</p>
              </div>
              <div>
                <span className="text-slate-400">Token Storage:</span>
                <p className="text-slate-200">Server-side (BFF pattern)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h2 className="font-semibold mb-3 text-slate-100">🔍 Debug: Role Information</h2>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-slate-400">Total Roles:</span>
              <span className="text-slate-200 ml-2">{user?.roles?.length || 0}</span>
            </div>
            <div>
              <span className="text-slate-400">Has admin role (admin or realm-admin):</span>
              <span className={(user?.roles?.includes('admin') || user?.roles?.includes('realm-admin')) ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>
                {(user?.roles?.includes('admin') || user?.roles?.includes('realm-admin')) ? 'Yes' : 'No'}
              </span>
            </div>
            {user?.roles?.includes('realm-admin') && (
              <div className="text-xs text-slate-400">
                ✓ You have 'realm-admin' role (grants admin access)
              </div>
            )}
            <div>
              <span className="text-slate-400">All Roles:</span>
              <div className="mt-1">
                {user?.roles?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.roles.map((role: string) => (
                      <span key={role} className="px-2 py-1 bg-brand-500/20 text-brand-300 rounded text-xs">
                        {role}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400">No roles found</span>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700">
              <a href="/api/debug/roles" target="_blank" className="text-brand-400 hover:underline text-xs">
                View raw role data (JSON)
              </a>
            </div>
          </div>
        </div>
      </div>

      {idTokenClaims && (
        <div className="card">
          <div className="card-body">
            <h2 className="font-semibold mb-3 text-slate-100">ID Token Claims (JWT)</h2>
            <pre className="text-xs text-slate-300 overflow-auto bg-slate-950 p-4 rounded border border-slate-700">
              {JSON.stringify(idTokenClaims, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="card border-green-500/30 bg-green-500/5">
        <div className="card-body">
          <p className="text-green-300 text-sm">
            <strong>🔒 Security Note:</strong> Your access tokens are stored server-side in an encrypted session cookie. 
            The browser never receives the actual tokens, following the BFF (Backend-for-Frontend) security pattern.
          </p>
        </div>
      </div>
    </div>
  );
}

