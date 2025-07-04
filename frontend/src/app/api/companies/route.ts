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

    // Mock companies data
    const mockCompaniesData = {
      total: 156,
      active: 142,
      pending: 8,
      suspended: 6,
      companies: [
        {
          id: '1',
          name: 'TechCorp Solutions',
          status: 'active',
          type: 'supplier',
          employees: 250,
          revenue: 5000000,
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2', 
          name: 'Global Industries Ltd',
          status: 'active',
          type: 'supplier',
          employees: 150,
          revenue: 3200000,
          createdAt: '2024-02-20T14:15:00Z'
        },
        {
          id: '3',
          name: 'Innovation Partners',
          status: 'pending',
          type: 'supplier',
          employees: 75,
          revenue: 1800000,
          createdAt: '2024-03-10T09:45:00Z'
        }
      ]
    };

    return NextResponse.json(mockCompaniesData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 