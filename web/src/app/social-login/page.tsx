export const dynamic = 'force-dynamic';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';

export default async function SocialLoginPage() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    redirect('/api/auth/login');
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">🔗 Social Login</h1>
        <p className="text-slate-300 mt-2">Connect your account with social identity providers</p>
      </div>

      <div className="card">
        <div className="card-body space-y-6">
          <h2 className="font-semibold text-slate-100">Available Providers</h2>
          <p className="text-slate-300 text-sm">
            Social login allows users to authenticate using their existing accounts from popular providers. 
            Keycloak acts as an identity broker, handling the OAuth flow with each provider.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-slate-700 rounded p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔵</span>
                <h3 className="font-semibold text-slate-100">Google</h3>
              </div>
              <p className="text-slate-300 text-sm mb-3">
                Sign in with your Google account. One-click authentication using your existing Google credentials.
              </p>
              <button className="btn btn-ghost border border-slate-700 w-full">
                Connect Google
              </button>
              <p className="text-slate-400 text-xs mt-2">
                Status: Not configured
              </p>
            </div>

            <div className="border border-slate-700 rounded p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">⚫</span>
                <h3 className="font-semibold text-slate-100">GitHub</h3>
              </div>
              <p className="text-slate-300 text-sm mb-3">
                Authenticate using your GitHub account. Perfect for developer-focused applications.
              </p>
              <button className="btn btn-ghost border border-slate-700 w-full">
                Connect GitHub
              </button>
              <p className="text-slate-400 text-xs mt-2">
                Status: Not configured
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-blue-500/30 bg-blue-500/5">
        <div className="card-body space-y-4">
          <h2 className="font-semibold text-slate-100">How to Configure Social Login in Keycloak</h2>
          <div className="space-y-3 text-sm text-slate-300">
            <div>
              <strong className="text-blue-300">1. Google Setup:</strong>
              <ol className="list-decimal pl-5 mt-1 space-y-1">
                <li>Go to Google Cloud Console → Create OAuth 2.0 credentials</li>
                <li>Add authorized redirect URI: <code className="bg-slate-800 px-1 rounded">http://localhost:8080/realms/oidc-demo/broker/google/endpoint</code></li>
                <li>In Keycloak: Identity Providers → Add provider → Google</li>
                <li>Enter Client ID and Client Secret from Google</li>
                <li>Save and enable the provider</li>
              </ol>
            </div>
            <div>
              <strong className="text-blue-300">2. GitHub Setup:</strong>
              <ol className="list-decimal pl-5 mt-1 space-y-1">
                <li>Go to GitHub → Settings → Developer settings → OAuth Apps</li>
                <li>Create new OAuth App</li>
                <li>Authorization callback URL: <code className="bg-slate-800 px-1 rounded">http://localhost:8080/realms/oidc-demo/broker/github/endpoint</code></li>
                <li>In Keycloak: Identity Providers → Add provider → GitHub</li>
                <li>Enter Client ID and Client Secret from GitHub</li>
                <li>Save and enable the provider</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <h2 className="font-semibold text-slate-100">Identity Brokering Features</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">Account Linking</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Link multiple identity providers</li>
                <li>Unified user profile</li>
                <li>Flexible authentication options</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-200 mb-2">First Broker Login</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Automatic account creation</li>
                <li>Email verification flow</li>
                <li>Profile import from provider</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

