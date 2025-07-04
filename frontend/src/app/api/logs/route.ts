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

    // Mock system logs data
    const mockLogs = [
      {
        id: '1',
        timestamp: '2024-12-25T10:30:00Z',
        level: 'info',
        message: 'User Admin logged in successfully',
        source: 'authentication',
        userId: '1',
        sessionId: 'session_12345',
        ipAddress: '192.168.1.100'
      },
      {
        id: '2',
        timestamp: '2024-12-25T10:25:00Z',
        level: 'info',
        message: 'Purchase request PR-001 created by Admin',
        source: 'purchase_requests',
        userId: '1',
        entityId: '1',
        entityType: 'purchase_request'
      },
      {
        id: '3',
        timestamp: '2024-12-25T10:20:00Z',
        level: 'warning',
        message: 'Failed login attempt for user: invalid_user',
        source: 'authentication',
        ipAddress: '192.168.1.50',
        attempts: 3
      },
      {
        id: '4',
        timestamp: '2024-12-25T10:15:00Z',
        level: 'info',
        message: 'Bid BID-001 submitted by TechCorp Solutions',
        source: 'bids',
        supplierId: '1',
        entityId: '1',
        entityType: 'bid'
      },
      {
        id: '5',
        timestamp: '2024-12-25T10:10:00Z',
        level: 'error',
        message: 'Email delivery failed for notification ID: 123',
        source: 'notifications',
        errorCode: 'SMTP_ERROR',
        details: 'Connection timeout to SMTP server'
      }
    ];

    return NextResponse.json({
      logs: mockLogs,
      total: mockLogs.length
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 