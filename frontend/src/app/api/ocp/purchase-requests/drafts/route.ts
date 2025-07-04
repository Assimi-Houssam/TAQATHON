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

    // Mock draft purchase requests data
    const mockDraftPurchaseRequests = [
      {
        id: 'draft-1',
        title: 'Marketing Campaign Materials',
        description: 'Request for promotional materials and advertising services',
        department: 'Marketing',
        requestedBy: 'Admin',
        estimatedAmount: 15000,
        status: 'draft',
        priority: 'medium',
        lastModified: '2024-12-20T10:30:00Z',
        createdAt: '2024-12-18T09:15:00Z',
        completionPercentage: 65
      },
      {
        id: 'draft-2',
        title: 'Security System Upgrade',
        description: 'Upgrade of building security systems and surveillance',
        department: 'Security',
        requestedBy: 'Admin',
        estimatedAmount: 35000,
        status: 'draft',
        priority: 'high',
        lastModified: '2024-12-22T16:45:00Z',
        createdAt: '2024-12-20T14:20:00Z',
        completionPercentage: 80
      },
      {
        id: 'draft-3',
        title: 'Employee Training Program',
        description: 'Professional development and training services',
        department: 'HR',
        requestedBy: 'Admin',
        estimatedAmount: 20000,
        status: 'draft',
        priority: 'low',
        lastModified: '2024-12-23T11:20:00Z',
        createdAt: '2024-12-21T08:30:00Z',
        completionPercentage: 45
      }
    ];

    return NextResponse.json(mockDraftPurchaseRequests);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 