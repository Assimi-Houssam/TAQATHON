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

    // Mock suppliers data
    const mockSuppliersData = {
      total: 234,
      active: 198,
      pending: 28,
      suspended: 8,
      suppliers: [
        {
          id: '1',
          companyName: 'TechCorp Solutions',
          contactPerson: 'Michael Johnson',
          email: 'contact@techcorp.com',
          phone: '+1-555-0123',
          businessScopes: ['IT Services', 'Software Development'],
          status: 'active',
          rating: 4.8,
          completedContracts: 45,
          totalValue: 2500000,
          joinedDate: '2023-06-15T00:00:00Z'
        },
        {
          id: '2',
          companyName: 'Global Industries Ltd',
          contactPerson: 'Sarah Wilson',
          email: 'info@globalind.com',
          phone: '+1-555-0456',
          businessScopes: ['Manufacturing', 'Logistics'],
          status: 'active',
          rating: 4.6,
          completedContracts: 32,
          totalValue: 1800000,
          joinedDate: '2023-08-20T00:00:00Z'
        },
        {
          id: '3',
          companyName: 'Innovation Partners',
          contactPerson: 'David Chen',
          email: 'hello@innovation.com',
          phone: '+1-555-0789',
          businessScopes: ['Consulting', 'Research & Development'],
          status: 'pending',
          rating: 4.2,
          completedContracts: 12,
          totalValue: 950000,
          joinedDate: '2024-01-10T00:00:00Z'
        }
      ]
    };

    return NextResponse.json(mockSuppliersData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 