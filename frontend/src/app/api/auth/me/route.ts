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
      id: '1',
      username: 'Admin',
      email: 'admin@taqathon.com',
      firstName: 'System',
      lastName: 'Administrator',
      roles: ['admin', 'ocp_agent'],
      department: 'Administration',
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    return NextResponse.json(mockUser);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 