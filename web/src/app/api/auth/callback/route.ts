export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/oidc';
import { getSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const session = await getSession();
  if (!code || !state || state !== session.state || !session.pkceVerifier) {
    return new NextResponse('Invalid OIDC callback parameters', { status: 400 });
  }

  const client = await getClient();

  const params = client.callbackParams(req.url);
  const tokenSet = await client.callback(process.env.OIDC_REDIRECT_URI as string, params, {
    state,
    code_verifier: session.pkceVerifier
  });

  // Keep session small: store only refresh token and tiny user data
  const userInfo = await client.userinfo(tokenSet).catch(() => null as any);
  
  // Extract roles from both ID token and access token
  let roles: string[] = [];
  let idTokenClaims: any = null;
  
  // Try to extract from access token first (usually has more complete role info)
  try {
    if (tokenSet.access_token) {
      const accessPayload = JSON.parse(Buffer.from(tokenSet.access_token.split('.')[1], 'base64').toString());
      // Extract realm roles
      const realmRoles = accessPayload.realm_access?.roles || [];
      // Extract client roles
      const clientRoles: string[] = [];
      if (accessPayload.resource_access) {
        Object.values(accessPayload.resource_access).forEach((client: any) => {
          if (client.roles && Array.isArray(client.roles)) {
            clientRoles.push(...client.roles);
          }
        });
      }
      roles = [...realmRoles, ...clientRoles];
    }
  } catch (e) {
    console.error('Error extracting roles from access token:', e);
  }
  
  // Also check ID token as fallback
  try {
    const idToken = tokenSet.id_token;
    if (idToken) {
      const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
      // If we didn't get roles from access token, try ID token
      if (roles.length === 0) {
        const idRealmRoles = payload.realm_access?.roles || [];
        const idClientRoles: string[] = [];
        if (payload.resource_access) {
          Object.values(payload.resource_access).forEach((client: any) => {
            if (client.roles && Array.isArray(client.roles)) {
              idClientRoles.push(...client.roles);
            }
          });
        }
        roles = [...idRealmRoles, ...idClientRoles];
      }
      // Store only essential claims, not the full token
      idTokenClaims = {
        iss: payload.iss,
        sub: payload.sub,
        aud: payload.aud,
        exp: payload.exp,
        iat: payload.iat,
        auth_time: payload.auth_time
      };
    }
  } catch (e) {
    console.error('Error extracting roles from ID token:', e);
  }
  
  // Remove duplicates
  roles = Array.from(new Set(roles));

  session.isLoggedIn = true;
  session.refreshToken = tokenSet.refresh_token;
  // Don't store accessToken or idToken - they're too large for cookies
  // We can refresh tokens when needed using refreshToken
  session.tokenSet = {
    expiresAt: tokenSet.expires_at,
    scope: tokenSet.scope
  };
  (session as any).user = userInfo ? { 
    sub: (userInfo as any).sub, 
    email: (userInfo as any).email,
    roles 
  } : undefined;
  // Store minimal ID token claims for profile page
  (session as any).idTokenClaims = idTokenClaims;
  session.pkceVerifier = undefined;
  session.state = undefined;
  await session.save();

  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${baseUrl}/protected`);
}


