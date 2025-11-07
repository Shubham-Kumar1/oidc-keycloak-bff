export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';

export async function GET() {
  try {
    // Accept either 'admin' or 'realm-admin' role
    const session = await requireRole(['admin', 'realm-admin']);
    const user = (session as any)?.user;

    return NextResponse.json({
      success: true,
      message: 'This is an admin-only API endpoint',
      user: {
        sub: user?.sub,
        email: user?.email,
        roles: user?.roles || []
      },
      timestamp: new Date().toISOString(),
      adminData: {
        secret: 'Only admins can access this endpoint',
        systemStats: {
          totalUsers: 1250,
          activeSessions: 342,
          failedLogins: 12
        },
        actions: [
          'User Management',
          'Role Assignment',
          'System Configuration',
          'Audit Logs'
        ]
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: error.message.includes('Forbidden') ? 403 : 401 }
    );
  }
}

