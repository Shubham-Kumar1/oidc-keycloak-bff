export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  const user = (session as any)?.user;
  
  return NextResponse.json({
    isLoggedIn: session.isLoggedIn,
    user: user,
    roles: user?.roles || [],
    roleCount: user?.roles?.length || 0,
    hasAdminRole: user?.roles?.includes('admin') || false,
    hasRealmAdmin: user?.roles?.includes('realm-admin') || false,
    hasRealmManagement: user?.roles?.includes('realm-management') || false,
    allRoles: user?.roles || []
  });
}

