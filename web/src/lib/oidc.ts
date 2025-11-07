import * as OpenID from 'openid-client';

let cachedClient: any | null = null;

export async function getClient(): Promise<any> {
  if (cachedClient) return cachedClient;

  const issuerUrl = process.env.OIDC_ISSUER_URL;
  const clientId = process.env.OIDC_CLIENT_ID;
  const clientSecret = process.env.OIDC_CLIENT_SECRET;
  const redirectUri = process.env.OIDC_REDIRECT_URI;

  if (!issuerUrl || !clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing OIDC environment variables');
  }

  const PossibleIssuer: any = (OpenID as any).Issuer || (OpenID as any)?.default?.Issuer;
  if (!PossibleIssuer || typeof PossibleIssuer.discover !== 'function') {
    const availableKeys = Object.keys(OpenID as any);
    throw new Error(
      `openid-client module loaded without Issuer. Keys: ${availableKeys.join(', ')}`
    );
  }
  const issuer = await PossibleIssuer.discover(issuerUrl);
  const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uris: [redirectUri],
    response_types: ['code']
  });

  cachedClient = client;
  return client;
}

export const pkce = {
  codeVerifier: async () => {
    return OpenID.generators.codeVerifier();
  },
  codeChallenge: async (verifier: string) => {
    return OpenID.generators.codeChallenge(verifier);
  }
};


