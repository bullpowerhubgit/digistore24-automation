import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      );
    }

    // Demo sales data - works without Supabase
    const demoSales = [
      {
        id: '1',
        order_id: 'DS24-2024-001',
        product_name: 'Premium Marketing Course',
        amount: 297.00,
        buyer_email: 'kunde@example.com',
        buyer_name: 'Max Mustermann',
        affiliate_id: 'AFF123',
        status: 'completed',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: '2',
        order_id: 'DS24-2024-002',
        product_name: 'SEO Masterclass',
        amount: 197.00,
        buyer_email: 'user@example.com',
        buyer_name: 'Anna Schmidt',
        affiliate_id: 'AFF456',
        status: 'completed',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        id: '3',
        order_id: 'DS24-2024-003',
        product_name: 'Social Media Bundle',
        amount: 147.00,
        buyer_email: 'test@example.com',
        buyer_name: 'Peter Müller',
        affiliate_id: null,
        status: 'completed',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
      },
      {
        id: '4',
        order_id: 'DS24-2024-004',
        product_name: 'Email Marketing Pro',
        amount: 97.00,
        buyer_email: 'demo@example.com',
        buyer_name: 'Lisa Weber',
        affiliate_id: 'AFF789',
        status: 'completed',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
      {
        id: '5',
        order_id: 'DS24-2024-005',
        product_name: 'Content Creation Kit',
        amount: 127.00,
        buyer_email: 'info@example.com',
        buyer_name: 'Tom Fischer',
        affiliate_id: 'AFF123',
        status: 'completed',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];

    const totalPages = Math.ceil(demoSales.length / limit);

    return NextResponse.json(
      {
        data: demoSales.slice((page - 1) * limit, page * limit),
        meta: {
          page,
          limit,
          total: demoSales.length,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching sales:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch sales',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}