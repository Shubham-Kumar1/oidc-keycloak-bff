export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { refreshTokens } from '@/lib/token-refresh';

export async function POST() {
  try {
    const result = await refreshTokens();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

