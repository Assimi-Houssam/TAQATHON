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

    // Mock user sessions data
    const mockSessions = [
      {
        id: '1',
        device: 'Chrome on Windows',
        location: 'Casablanca, Morocco',
        ip_address: '192.168.1.100',
        last_activity: '2024-12-25T10:30:00.000Z',
        created_at: '2024-12-25T08:00:00.000Z',
        is_current: true
      },
      {
        id: '2',
        device: 'Safari on iPhone',
        location: 'Rabat, Morocco',
        ip_address: '192.168.1.200',
        last_activity: '2024-12-24T18:45:00.000Z',
        created_at: '2024-12-24T18:30:00.000Z',
        is_current: false
      },
      {
        id: '3',
        device: 'Firefox on Linux',
        location: 'Marrakech, Morocco',
        ip_address: '192.168.1.150',
        last_activity: '2024-12-23T14:20:00.000Z',
        created_at: '2024-12-23T10:15:00.000Z',
        is_current: false
      }
    ];

    return NextResponse.json({
      sessions: mockSessions,
      total: mockSessions.length
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 