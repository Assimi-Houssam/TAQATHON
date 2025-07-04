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

    // Mock bids data
    const mockBidsData = {
      total: 387,
      pending: 45,
      approved: 298,
      rejected: 44,
      closed: 298,
      won: 186,
      bids: [
        {
          id: '1',
          purchaseRequestId: '1',
          supplierId: '1',
          supplierName: 'TechCorp Solutions',
          amount: 23500,
          originalAmount: 25000,
          description: 'Competitive pricing for high-quality office equipment',
          status: 'approved',
          submittedAt: '2024-12-02T10:15:00Z',
          validUntil: '2025-01-02T23:59:59Z',
          attachments: ['quote.pdf', 'specifications.docx'],
          notes: 'Best value proposition with excellent warranty terms'
        },
        {
          id: '2',
          purchaseRequestId: '2',
          supplierId: '2',
          supplierName: 'Global Industries Ltd',
          amount: 42000,
          originalAmount: 45000,
          description: 'Comprehensive cleaning services package',
          status: 'pending',
          submittedAt: '2024-12-11T09:30:00Z',
          validUntil: '2025-01-11T23:59:59Z',
          attachments: ['service_plan.pdf'],
          notes: 'Includes eco-friendly cleaning products'
        },
        {
          id: '3',
          purchaseRequestId: '3',
          supplierId: '1',
          supplierName: 'TechCorp Solutions',
          amount: 68000,
          originalAmount: 75000,
          description: 'Enterprise software licensing with multi-year discount',
          status: 'won',
          submittedAt: '2024-11-16T14:20:00Z',
          validUntil: '2024-12-16T23:59:59Z',
          attachments: ['license_agreement.pdf', 'pricing_breakdown.xlsx'],
          notes: 'Winning bid with excellent support terms',
          awardedAt: '2024-12-01T16:00:00Z'
        }
      ]
    };

    return NextResponse.json(mockBidsData);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 