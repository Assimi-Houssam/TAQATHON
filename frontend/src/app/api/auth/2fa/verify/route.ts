import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Mock 2FA verification - accept any 6-digit token
    if (token && token.length === 6 && /^\d+$/.test(token)) {
      return NextResponse.json({
        message: '2FA verification successful'
      });
    }

    return NextResponse.json(
      { message: 'Invalid 2FA token' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 