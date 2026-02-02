import { NextRequest, NextResponse } from 'next/server';
import { getDigistoreClient } from '@/lib/digistore';
import { saveSale } from '@/lib/supabase';

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

    console.log('Starting data synchronization from Digistore24...');

    const client = getDigistoreClient();

    let page = 1;
    let hasMore = true;
    let totalSynced = 0;
    const limit = 50;
    // Maximum number of pages to sync per run (configurable via env)
    const maxPages = parseInt(process.env.SYNC_MAX_PAGES || '5', 10);

    // Fetch and sync purchases with pagination
    while (hasMore) {
      console.log(`Fetching page ${page}...`);

      const response = await client.listPurchases({
        limit,
        page,
      });

      const purchases = response.data || [];

      if (purchases.length === 0) {
        hasMore = false;
        break;
      }

      // Save each purchase to database
      for (const purchase of purchases) {
        try {
          await saveSale({
            order_id: purchase.order_id,
            product_name: purchase.product_name,
            amount: purchase.amount,
            buyer_email: purchase.buyer_email,
            buyer_name: purchase.buyer_name,
            affiliate_id: purchase.affiliate_id,
            status: purchase.status,
          });

          totalSynced++;
        } catch (error) {
          console.error(`Error saving purchase ${purchase.order_id}:`, error);
          // Continue with next purchase
        }
      }

      // Check if there are more pages
      if (purchases.length < limit) {
        hasMore = false;
      } else {
        page++;
      }

      // Limit pages per sync to avoid timeout
      if (page > maxPages) {
        console.log(`Reached page limit (${maxPages}), stopping sync`);
        break;
      }
    }

    console.log(`Data synchronization complete. Synced ${totalSynced} sales.`);

    return NextResponse.json(
      {
        success: true,
        message: 'Data synchronized successfully',
        synced: totalSynced,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error synchronizing data:', error);

    return NextResponse.json(
      {
        error: 'Failed to synchronize data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
