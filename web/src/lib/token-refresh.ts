import { getClient } from './oidc';
import { getSession } from './session';

export async function refreshTokens() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.refreshToken) {
    throw new Error('No refresh token available');
  }

  const client = await getClient();
  
  try {
    const tokenSet = await client.refresh(session.refreshToken);
    
    // Extract roles from new tokens
    let roles: string[] = [];
    let idTokenClaims: any = null;
    
    try {
      if (tokenSet.access_token) {
        const accessPayload = JSON.parse(Buffer.from(tokenSet.access_token.split('.')[1], 'base64').toString());
        const realmRoles = accessPayload.realm_access?.roles || [];
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
      
      if (tokenSet.id_token) {
        const payload = JSON.parse(Buffer.from(tokenSet.id_token.split('.')[1], 'base64').toString());
        idTokenClaims = {
          iss: payload.iss,
          sub: payload.sub,
          aud: payload.aud,
          exp: payload.exp,
          iat: payload.iat,
          auth_time: payload.auth_time
        };
      }
    } catch {}

    // Update session
    session.refreshToken = tokenSet.refresh_token;
    session.tokenSet = {
      expiresAt: tokenSet.expires_at,
      scope: tokenSet.scope
    };
    (session as any).idTokenClaims = idTokenClaims;
    await session.save();

    return {
      success: true,
      expiresAt: tokenSet.expires_at,
      expiresIn: tokenSet.expires_at ? tokenSet.expires_at - Math.floor(Date.now() / 1000) : null
    };
  } catch (error: any) {
    throw new Error(`Token refresh failed: ${error.message}`);
  }
}

export async function shouldRefreshToken(): Promise<boolean> {
  const session = await getSession();
  if (!session.tokenSet?.expiresAt) return false;
  
  const expiresAt = session.tokenSet.expiresAt;
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = expiresAt - now;
  
  // Refresh if less than 5 minutes remaining
  return timeUntilExpiry < 300;
}

