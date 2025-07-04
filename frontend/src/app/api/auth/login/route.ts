import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Mock authentication - accept Admin:Admin
    if (username === 'Admin' && password === 'Admin') {
      return NextResponse.json({
        access_token: 'mock-jwt-token-admin-user',
        requires_2fa: false
      });
    }

    // Return error for invalid credentials
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 