export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const session = await requireAuth();
    const user = (session as any)?.user;

    return NextResponse.json({
      success: true,
      message: 'This is a protected API endpoint',
      user: {
        sub: user?.sub,
        email: user?.email,
        roles: user?.roles || []
      },
      timestamp: new Date().toISOString(),
      data: {
        secret: 'Only authenticated users can see this data',
        items: [
          { id: 1, name: 'Protected Resource 1' },
          { id: 2, name: 'Protected Resource 2' },
          { id: 3, name: 'Protected Resource 3' }
        ]
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

