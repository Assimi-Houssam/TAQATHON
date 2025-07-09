import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Check for valid mock token
    if (!authHeader || !authHeader.includes('mock-jwt-token-admin-user')) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return mock admin user
    const mockUser = {
      id: 1,
      username: 'Admin',
      email: 'admin@taqathon.com',
      first_name: 'System',
      last_name: 'Administrator',
      roles: ['admin', 'taqa_agent'],
      entity_type: 'TAQA_AGENT',
      phone_number: '+1-555-0100',
      language: 'en',
      status: 'active',
      is_active: true,
      is_verified: true,
      two_factor_enabled: false,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    };

    return NextResponse.json(mockUser);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 