export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getClient } from '@/lib/oidc';
import { getSession } from '@/lib/session';
import { toExternalUrl } from '@/lib/url-utils';

export async function GET() {
  const session = await getSession();
  const client = await getClient();

  let endSessionUrl: string | null = null;
  try {
    // id_token_hint is optional - Keycloak can end session without it
    const endSessionParams: any = {
      post_logout_redirect_uri: (process.env.BASE_URL || 'http://localhost:3000') + '/'
    };
    
    // Only add id_token_hint if we have it (we don't store it to keep session small)
    // Keycloak will still work without it
    const internalEndSessionUrl = client.endSessionUrl(endSessionParams);
    // Convert internal service URL to external URL for browser access
    endSessionUrl = toExternalUrl(internalEndSessionUrl);
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


