export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { getSession } from '@/lib/session';

export default async function HomePage() {
  const session = await getSession();
  return (
    <div className="space-y-12">
      <section className="grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100">Production‑grade OIDC + Keycloak Demo</h1>
          <p className="text-lg text-slate-300">Secure Backend‑for‑Frontend using Authorization Code Flow with PKCE. Tokens stay on the server, the browser only has an httpOnly session cookie.</p>
          <div className="flex gap-3">
            {session.isLoggedIn ? (
              <>
                <a className="btn btn-primary" href="/protected">View Protected Area</a>
                <a className="btn btn-ghost" href="/api/auth/logout">Logout</a>
              </>
            ) : (
              <>
                <a className="btn btn-primary" href="/api/auth/login">Sign in with Keycloak</a>
                <Link className="btn btn-ghost" href="/protected">Try Protected Route</Link>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${session.isLoggedIn ? 'bg-green-500' : 'bg-slate-500'}`}></span>
            <span className="text-slate-400">Status: {session.isLoggedIn ? 'Authenticated' : 'Not authenticated'}</span>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h2 className="font-semibold mb-3 text-slate-100">Key Features</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
              <li>BFF pattern: no tokens in the browser</li>
              <li>PKCE S256 and state protection</li>
              <li>Role-based access control (RBAC)</li>
              <li>Token refresh with countdown</li>
              <li>Session management dashboard</li>
              <li>MFA/TOTP setup</li>
              <li>Social login (Google/GitHub)</li>
              <li>Audit log & activity tracking</li>
              <li>Developer tools (JWT decoder)</li>
              <li>API gateway pattern</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-100">Understanding OIDC & Keycloak</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-body space-y-4">
              <h3 className="text-xl font-semibold text-slate-100">What is OIDC?</h3>
              <p className="text-slate-300">
                <strong className="text-brand-400">OpenID Connect (OIDC)</strong> is an authentication layer built on top of OAuth 2.0. 
                It enables clients to verify the identity of end-users based on authentication performed by an authorization server.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-200">Key Concepts:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">
                  <li><strong>ID Token:</strong> JWT containing user identity claims</li>
                  <li><strong>Access Token:</strong> Used to access protected resources</li>
                  <li><strong>Authorization Code Flow:</strong> Most secure flow for web apps</li>
                  <li><strong>PKCE:</strong> Proof Key for Code Exchange prevents code interception</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body space-y-4">
              <h3 className="text-xl font-semibold text-slate-100">What is Keycloak?</h3>
              <p className="text-slate-300">
                <strong className="text-brand-400">Keycloak</strong> is an open-source identity and access management solution. 
                It provides authentication, authorization, user federation, and social login capabilities.
              </p>
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-200">Key Features:</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-300 text-sm">
                  <li><strong>Single Sign-On (SSO):</strong> One login for multiple apps</li>
                  <li><strong>User Federation:</strong> Connect to LDAP, Active Directory</li>
                  <li><strong>Social Login:</strong> Google, GitHub, Facebook integration</li>
                  <li><strong>Multi-tenancy:</strong> Support for multiple realms</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-bold text-slate-100">How This Demo Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card">
            <div className="card-body space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white font-bold">1</span>
                <h3 className="font-semibold text-slate-100">Login Initiation</h3>
              </div>
              <p className="text-slate-300 text-sm">
                When you click "Sign in with Keycloak", the app generates a PKCE code verifier and challenge. 
                You're redirected to Keycloak's login page with these security parameters.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white font-bold">2</span>
                <h3 className="font-semibold text-slate-100">Token Exchange</h3>
              </div>
              <p className="text-slate-300 text-sm">
                After authentication, Keycloak redirects back with an authorization code. 
                The server exchanges this code (with PKCE verifier) for access, ID, and refresh tokens.
              </p>
            </div>
          </div>
          <div className="card">
            <div className="card-body space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-600 text-white font-bold">3</span>
                <h3 className="font-semibold text-slate-100">Session Management</h3>
              </div>
              <p className="text-slate-300 text-sm">
                Tokens are stored server-side in an encrypted session cookie. The browser never sees tokens directly. 
                Protected routes check the session to grant access.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-body space-y-4">
          <h2 className="text-2xl font-semibold text-slate-100">BFF Pattern Benefits</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-brand-400 mb-2">Security</h3>
              <p className="text-slate-300 text-sm">
                Access tokens never leave the server. Even if XSS occurs, attackers can't steal tokens from localStorage or cookies.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-400 mb-2">Token Refresh</h3>
              <p className="text-slate-300 text-sm">
                Server can automatically refresh tokens using the refresh token, providing seamless user experience.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-400 mb-2">API Calls</h3>
              <p className="text-slate-300 text-sm">
                Server makes API calls on behalf of the user, keeping tokens secure and enabling better control over API access.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-400 mb-2">Compliance</h3>
              <p className="text-slate-300 text-sm">
                Meets security best practices for handling sensitive tokens, especially important for enterprise applications.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


