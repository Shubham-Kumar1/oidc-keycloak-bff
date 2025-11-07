export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getClient } from '@/lib/oidc';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  const client = await getClient();

  let endSessionUrl: string | null = null;
  try {
    endSessionUrl = client.endSessionUrl({
      id_token_hint: session.idToken,
      post_logout_redirect_uri: (process.env.BASE_URL || 'http://localhost:3000') + '/'
    });
  } catch {
    // ignore if end session not supported
  }

  // Clear server session and cookie
  session.destroy();

  const target = endSessionUrl || (process.env.BASE_URL || 'http://localhost:3000') + '/';
  const res = NextResponse.redirect(target);
  // Hard-clear cookie on client
  res.cookies.set('bff_session', '', { expires: new Date(0), path: '/' });
  return res;
}


