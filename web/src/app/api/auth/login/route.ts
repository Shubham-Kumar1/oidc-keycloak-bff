export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getClient, pkce } from '@/lib/oidc';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const client = await getClient();
    const session = await getSession();

    const state = Math.random().toString(36).slice(2);
    const verifier = await pkce.codeVerifier();
    const challenge = await pkce.codeChallenge(verifier);

    session.state = state;
    session.pkceVerifier = verifier;
    await session.save();

    const authorizationUrl = client.authorizationUrl({
      scope: 'openid profile email roles',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    });

    return NextResponse.redirect(authorizationUrl);
  } catch (err: any) {
    const message = err?.message || 'Login initiation failed';
    const details = {
      hint: 'Ensure Keycloak is running at OIDC_ISSUER_URL and env vars are set',
      issuer: process.env.OIDC_ISSUER_URL,
      clientId: process.env.OIDC_CLIENT_ID
    };
    return NextResponse.json({ error: message, ...details }, { status: 500 });
  }
}


