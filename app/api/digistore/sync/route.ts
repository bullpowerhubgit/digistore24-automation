import { NextRequest, NextResponse } from 'next/server';
import { digistoreClient } from '@/lib/digistore24';
import { insertSale } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check for API key authentication
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      success: true,
      message: `Synced ${syncedCount} sales`,
      total: purchases.data.length,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}
