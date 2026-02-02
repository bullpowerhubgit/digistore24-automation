import { NextRequest, NextResponse } from 'next/server';
import { insertSale, updateSale, upsertAffiliate } from '@/lib/supabase';
import { sendDiscordNotification, sendRefundNotification, sendAffiliateNotification } from '@/lib/discord';
import type { DigistoreWebhookEvent, DigistorePaymentData, DigistoreRefundData, DigistoreAffiliateData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const event: DigistoreWebhookEvent = await request.json();

    console.log('Received webhook event:', event.event);

    switch (event.event) {
      case 'on_payment':
        await handlePayment(event.data as DigistorePaymentData);
        break;
      case 'on_refund':
        await handleRefund(event.data as DigistoreRefundData);
        break;
      case 'on_affiliate_approved':
        await handleAffiliateApproved(event.data as DigistoreAffiliateData);
        break;
      default:
        console.log('Unknown event type:', event.event);
    }

    return NextResponse.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handlePayment(data: DigistorePaymentData) {
  try {
    // Insert sale into database
    const sale = await insertSale({
      order_id: data.order_id,
      product_name: data.product_name,
      amount: data.amount,
      buyer_email: data.buyer_email,
      buyer_name: data.buyer_name,
      affiliate_id: data.affiliate_id,
      status: data.status || 'completed',
      created_at: data.created_at || new Date().toISOString(),
    });

    console.log('Sale inserted:', sale);

    // Send Discord notification
    await sendDiscordNotification('New sale received!', {
      order_id: data.order_id,
      amount: data.amount,
      product_name: data.product_name,
      buyer_name: data.buyer_name,
    });
  } catch (error) {
    console.error('Error handling payment:', error);
    throw error;
  }
}

async function handleRefund(data: DigistoreRefundData) {
  try {
    // Update sale status
    await updateSale(data.order_id, {
      status: 'refunded',
    });

    console.log('Refund processed:', data.order_id);

    // Send Discord notification
    await sendRefundNotification({
      order_id: data.order_id,
      refund_amount: data.refund_amount,
      reason: data.reason,
    });
  } catch (error) {
    console.error('Error handling refund:', error);
    throw error;
  }
}

async function handleAffiliateApproved(data: DigistoreAffiliateData) {
  try {
    // Insert/update affiliate
    await upsertAffiliate({
      affiliate_id: data.affiliate_id,
      name: data.name,
      email: data.email,
      total_sales: 0,
      total_commission: 0,
    });

    console.log('Affiliate approved:', data.affiliate_id);

    // Send Discord notification
    await sendAffiliateNotification({
      affiliate_id: data.affiliate_id,
      name: data.name,
      email: data.email,
    });
  } catch (error) {
    console.error('Error handling affiliate approval:', error);
    throw error;
  }
}
