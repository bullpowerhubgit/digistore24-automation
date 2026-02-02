import { NextRequest, NextResponse } from 'next/server';
import { getSales, getSalesStats } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statsOnly = searchParams.get('stats') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);

    if (statsOnly) {
      const stats = await getSalesStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    const offset = (page - 1) * limit;
    const sales = await getSales(limit, offset);

    return NextResponse.json({
      success: true,
      data: sales,
      pagination: {
        page,
        limit,
        total: sales.length,
      },
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
}
