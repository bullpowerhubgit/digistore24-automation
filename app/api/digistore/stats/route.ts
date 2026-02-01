import { NextResponse } from 'next/server';
import { getSalesStats } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch statistics from database
    const stats = await getSalesStats();

    // Calculate conversion rate (placeholder - would need visitor data)
    const conversionRate = 0;

    return NextResponse.json(
      {
        today: stats.today,
        week: stats.week,
        month: stats.month,
        total: stats.total,
        conversionRate,
      },
      { status: 200 }
    );
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
