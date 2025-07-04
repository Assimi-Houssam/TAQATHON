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

    // Mock notifications data with proper date formatting
    const mockNotifications = [
      {
        id: '1',
        title: 'New Purchase Request Submitted',
        message: 'A new purchase request for office equipment has been submitted',
        type: 'info',
        isRead: false,
        created_at: '2024-12-25T10:30:00.000Z',
        updated_at: '2024-12-25T10:30:00.000Z',
        userId: '1'
      },
      {
        id: '2',
        title: 'Bid Deadline Approaching',
        message: 'Bid deadline for cleaning services contract is in 2 days',
        type: 'warning',
        isRead: false,
        created_at: '2024-12-24T14:15:00.000Z',
        updated_at: '2024-12-24T14:15:00.000Z',
        userId: '1'
      },
      {
        id: '3',
        title: 'Report Generated Successfully',
        message: 'Supplier performance report has been generated and is ready for review',
        type: 'success',
        isRead: true,
        created_at: '2024-12-23T09:45:00.000Z',
        updated_at: '2024-12-23T09:45:00.000Z',
        userId: '1'
      }
    ];

    return NextResponse.json({
      notifications: mockNotifications,
      total: mockNotifications.length,
      unreadCount: mockNotifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 