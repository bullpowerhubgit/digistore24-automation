import { NextResponse } from 'next/server';
import { getSalesStats } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getSalesStats();
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