import { SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';

export type UserSession = {
  isLoggedIn: boolean;
  refreshToken?: string;
  tokenSet?: {
    expiresAt?: number;
    scope?: string;
  };
  profile?: Record<string, unknown>;
  pkceVerifier?: string;
  state?: string;
  user?: {
    sub?: string;
    email?: string;
    roles?: string[];
  };
  idTokenClaims?: {
    iss?: string;
    sub?: string;
    aud?: string;
    exp?: number;
    iat?: number;
    auth_time?: number;
  };
};

let cachedSessionOptions: SessionOptions | null = null;

function getSessionOptions(): SessionOptions {
  if (cachedSessionOptions) {
    return cachedSessionOptions;
  }

  const sessionPassword = process.env.SESSION_PASSWORD;
  if (!sessionPassword) {
    throw new Error('Missing SESSION_PASSWORD');
  }

  cachedSessionOptions = {
    password: sessionPassword,
    cookieName: 'bff_session',
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    }
  };

  return cachedSessionOptions;
}

export async function getSession() {
  const store = await getIronSession<UserSession>(cookies(), getSessionOptions());
  if (!store.isLoggedIn) {
    store.isLoggedIn = false;
  }
  return store;
}


