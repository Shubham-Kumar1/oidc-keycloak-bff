import { getSession } from './session';

export async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireRole(role: string | string[]) {
  const session = await requireAuth();
  const user = (session as any)?.user;
  const userRoles = user?.roles || [];
  
  // Support checking for multiple role names (e.g., ['admin', 'realm-admin'])
  const requiredRoles = Array.isArray(role) ? role : [role];
  const hasRole = requiredRoles.some(r => userRoles.includes(r));
  
  if (!hasRole) {
    const roleList = requiredRoles.join(' or ');
    throw new Error(`Forbidden: Requires ${roleList} role`);
  }
  return session;
}

export async function hasRole(role: string): Promise<boolean> {
  try {
    await requireRole(role);
    return true;
  } catch {
    return false;
  }
}

