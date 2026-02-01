import { NextRequest, NextResponse } from 'next/server';
import { getSalesByDateRange } from '@/lib/supabase';
import { sendDailySalesReport } from '@/lib/notifications';
import { formatDate } from '@/lib/utils';
import { subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get yesterday's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = subDays(today, 1);

    console.log('Generating daily report for:', formatDate(yesterday, 'PPP'));

    // Fetch yesterday's sales
    const sales = await getSalesByDateRange(yesterday, today);

    // Calculate totals
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);

    console.log('Daily report stats:', { totalSales, totalRevenue });

    // Send report email
    await sendDailySalesReport({
      date: formatDate(yesterday, 'PPP'),
      totalSales,
      totalRevenue,
      sales,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Daily report sent successfully',
        stats: {
          date: formatDate(yesterday, 'PPP'),
          totalSales,
          totalRevenue,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating daily report:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate daily report',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
