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

    // Extract query parameters
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    // Mock reports data
    const allReports = [
      {
        id: '1',
        title: 'Supplier Performance Report Q4 2024',
        description: 'Comprehensive analysis of supplier performance metrics',
        type: 'supplier_performance',
        status: 'RESOLVED',
        creator: {
          username: 'Admin'
        },
        createdAt: '2024-12-01T09:00:00Z',
        updatedAt: '2024-12-15T16:30:00Z',
        priority: 'high',
        tags: ['quarterly', 'performance', 'suppliers'],
        attachments: ['q4_supplier_report.pdf'],
        summary: 'Overall supplier performance improved by 12% compared to Q3'
      },
      {
        id: '2',
        title: 'Budget Utilization Analysis',
        description: 'Department-wise budget utilization and variance analysis',
        type: 'budget_analysis',
        status: 'IN_PROGRESS',
        creator: {
          username: 'John Doe'
        },
        createdAt: '2024-12-10T10:15:00Z',
        updatedAt: '2024-12-23T14:30:00Z',
        priority: 'medium',
        tags: ['budget', 'financial', 'departments'],
        attachments: [],
        summary: 'Analyzing current budget utilization across all departments'
      },
      {
        id: '3',
        title: 'Procurement Process Efficiency',
        description: 'Analysis of procurement process bottlenecks and improvements',
        type: 'process_efficiency',
        status: 'OPEN',
        creator: {
          username: 'Jane Smith'
        },
        createdAt: '2024-12-18T14:20:00Z',
        updatedAt: '2024-12-18T14:20:00Z',
        priority: 'low',
        tags: ['process', 'efficiency', 'procurement'],
        attachments: [],
        summary: 'Identifying areas for procurement process optimization'
      },
      {
        id: '4',
        title: 'Vendor Risk Assessment',
        description: 'Risk evaluation of current vendor portfolio',
        type: 'risk_assessment',
        status: 'CLOSED',
        creator: {
          username: 'Admin'
        },
        createdAt: '2024-11-25T11:45:00Z',
        updatedAt: '2024-12-08T13:20:00Z',
        priority: 'high',
        tags: ['risk', 'vendors', 'assessment'],
        attachments: ['vendor_risk_report.pdf', 'mitigation_strategies.docx'],
        summary: 'Identified 3 high-risk vendors requiring immediate attention'
      }
    ];

    // Filter reports based on search and status
    let filteredReports = allReports;
    
    if (search) {
      filteredReports = filteredReports.filter(report =>
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      filteredReports = filteredReports.filter(report => report.status === status);
    }

    // Paginate results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);

    return NextResponse.json({
      reports: paginatedReports,
      total: filteredReports.length,
      page,
      limit,
      totalPages: Math.ceil(filteredReports.length / limit)
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 