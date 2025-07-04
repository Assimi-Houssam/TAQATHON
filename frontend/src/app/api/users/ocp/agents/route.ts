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

    // Mock agents data
    const mockAgentsData = {
      total: 45,
      active: 42,
      inactive: 3,
      agents: [
        {
          id: '1',
          username: 'Admin',
          firstName: 'System',
          lastName: 'Administrator',
          email: 'admin@taqathon.com',
          role: 'admin',
          department: 'Administration',
          status: 'active',
          lastActive: '2024-12-25T10:30:00Z',
          tasksCompleted: 156,
          performanceScore: 98
        },
        {
          id: '2',
          username: 'john.doe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@taqathon.com',
          role: 'ocp_agent',
          department: 'Procurement',
          status: 'active',
          lastActive: '2024-12-24T16:45:00Z',
          tasksCompleted: 89,
          performanceScore: 92
        },
        {
          id: '3',
          username: 'jane.smith',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@taqathon.com',
          role: 'ocp_agent',
          department: 'Legal',
          status: 'active',
          lastActive: '2024-12-24T18:20:00Z',
          tasksCompleted: 112,
          performanceScore: 95
        }
      ]
    };

    return NextResponse.json(mockAgentsData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 