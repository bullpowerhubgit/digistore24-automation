import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Demo data - works without Supabase
    const stats = {
      today: {
        revenue: 1247.50,
        sales: 8,
      },
      week: {
        revenue: 5890.25,
        sales: 42,
      },
      month: {
        revenue: 23456.80,
        sales: 167,
      },
      total: {
        revenue: 89234.90,
        sales: 634,
      },
      conversionRate: 3.2,
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching statistics:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}