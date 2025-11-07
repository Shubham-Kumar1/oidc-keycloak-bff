export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    isLoggedIn: session.isLoggedIn,
    tokenSet: session.tokenSet,
    profile: session.profile ? { sub: (session.profile as any).sub, email: (session.profile as any).email } : null
  });
}


