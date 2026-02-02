import { NextRequest, NextResponse } from 'next/server';
import { digistoreClient } from '@/lib/digistore24';
import { insertSale } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Running scheduled sync job...');

    // Fetch recent purchases from Digistore24
    const purchases = await digistoreClient.listPurchases({ limit: 100, page: 1 });

    if (!purchases || !purchases.data) {
      return NextResponse.json({
        success: false,
        error: 'No data received from Digistore24',
      });
    }

    // Sync to database
    let syncedCount = 0;
    for (const purchase of purchases.data) {
      try {
        await insertSale({
          order_id: purchase.order_id,
          product_name: purchase.product_name,
          amount: purchase.amount,
          buyer_email: purchase.buyer_email,
          buyer_name: purchase.buyer_name,
          affiliate_id: purchase.affiliate_id,
          status: purchase.status || 'completed',
          created_at: purchase.created_at || new Date().toISOString(),
        });
        syncedCount++;
      } catch (error) {
        // Skip duplicates
        console.log('Skipping duplicate order:', purchase.order_id);
      }
    }

    console.log(`Sync completed: ${syncedCount} new sales`);

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} sales`,
      total: purchases.data.length,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run sync job' },
      { status: 500 }
    );
  }
}
