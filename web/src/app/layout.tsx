import './globals.css';
import Image from 'next/image';
import Link from 'next/link';
import { getSession } from '@/lib/session';

export const metadata = {
  title: 'OIDC Keycloak BFF Demo',
  description: 'Next.js + Keycloak with BFF pattern'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-slate-700 bg-slate-900/50">
          <div className="container-max flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" width={28} height={28} alt="Logo" />
              <span className="font-semibold text-slate-100">OIDC + Keycloak</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link className="btn btn-ghost" href="/">Home</Link>
              <Link className="btn btn-ghost" href="/protected">Protected</Link>
              {session.isLoggedIn && (
                <>
                  <Link className="btn btn-ghost" href="/profile">Profile</Link>
                  <Link className="btn btn-ghost" href="/sessions">Sessions</Link>
                  <Link className="btn btn-ghost" href="/settings">Settings</Link>
                  <Link className="btn btn-ghost" href="/mfa">MFA</Link>
                  <Link className="btn btn-ghost" href="/social-login">Social</Link>
                  <Link className="btn btn-ghost" href="/api-test">API Test</Link>
                  <Link className="btn btn-ghost" href="/dev-tools">Dev Tools</Link>
                  <Link className="btn btn-ghost" href="/audit-log">Audit Log</Link>
                  <Link className="btn btn-ghost" href="/admin">Admin</Link>
                </>
              )}
              {session.isLoggedIn ? (
                <a className="btn btn-primary" href="/api/auth/logout">Logout</a>
              ) : (
                <a className="btn btn-primary" href="/api/auth/login">Login</a>
              )}
            </nav>
          </div>
        </header>
        <main className="container-max py-10">{children}</main>
        <footer className="border-t border-slate-700 py-8 text-center text-sm text-slate-500">Demo app showcasing Authorization Code + PKCE with Keycloak (BFF)</footer>
      </body>
    </html>
  );
}


