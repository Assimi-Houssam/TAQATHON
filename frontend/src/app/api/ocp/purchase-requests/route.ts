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

    // Mock purchase requests data
    const mockPurchaseRequestsData = {
      total: 189,
      pending: 23,
      approved: 156,
      rejected: 10,
      closed: 134,
      won: 98,
      purchaseRequests: [
        {
          id: '1',
          title: 'Office Equipment Purchase',
          description: 'Request for new laptops and office furniture',
          department: 'IT',
          requestedBy: 'John Doe',
          amount: 25000,
          status: 'approved',
          priority: 'high',
          deadline: '2025-01-15T00:00:00Z',
          createdAt: '2024-12-01T09:30:00Z',
          bidsCount: 5
        },
        {
          id: '2',
          title: 'Cleaning Services Contract',
          description: 'Annual cleaning services for all office buildings',
          department: 'Facilities',
          requestedBy: 'Jane Smith',
          amount: 45000,
          status: 'pending',
          priority: 'medium',
          deadline: '2025-02-01T00:00:00Z',
          createdAt: '2024-12-10T14:15:00Z',
          bidsCount: 3
        },
        {
          id: '3',
          title: 'Software Licensing Renewal',
          description: 'Renewal of enterprise software licenses',
          department: 'IT',
          requestedBy: 'Mike Johnson',
          amount: 75000,
          status: 'closed',
          priority: 'high',
          deadline: '2024-12-20T00:00:00Z',
          createdAt: '2024-11-15T11:45:00Z',
          bidsCount: 8,
          winningBid: {
            supplierId: '1',
            supplierName: 'TechCorp Solutions',
            amount: 68000
          }
        }
      ]
    };

    return NextResponse.json(mockPurchaseRequestsData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 