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

    // Extract query parameters for date filtering
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Mock departments data - this would normally be filtered by date range
    const mockDepartmentsData = [
      {
        name: 'IT Department',
        percentage: 28.5,
        requests: 54,
        budget: 450000,
        spent: 385000
      },
      {
        name: 'Facilities',
        percentage: 22.3,
        requests: 42,
        budget: 320000,
        spent: 285000
      },
      {
        name: 'Marketing',
        percentage: 18.7,
        requests: 35,
        budget: 280000,
        spent: 210000
      },
      {
        name: 'Legal',
        percentage: 12.1,
        requests: 23,
        budget: 180000,
        spent: 145000
      },
      {
        name: 'HR',
        percentage: 10.2,
        requests: 19,
        budget: 150000,
        spent: 125000
      },
      {
        name: 'Security',
        percentage: 8.2,
        requests: 16,
        budget: 200000,
        spent: 175000
      }
    ];

    return NextResponse.json(mockDepartmentsData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 