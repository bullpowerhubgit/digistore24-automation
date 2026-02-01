import { WebhookEvent, WebhookEventData } from './types';
import { saveSale, saveAffiliate, updateAffiliateStats } from './supabase';
import { notifyNewSale, notifyRefund } from './notifications';

/**
 * Process incoming webhook event from Digistore24
 */
export async function processWebhookEvent(event: WebhookEvent): Promise<void> {
  console.log('Processing webhook event:', event.event_type, event.event_id);

  try {
    switch (event.event_type) {
      case 'on_payment':
        await handlePaymentEvent(event.data);
        break;

      case 'on_refund':
        await handleRefundEvent(event.data);
        break;

      case 'on_affiliate_approved':
        await handleAffiliateApprovedEvent(event.data);
        break;

      case 'on_rebill':
        await handlePaymentEvent(event.data); // Treat rebills like regular payments
        break;

      default:
        console.warn('Unknown event type:', event.event_type);
    }

    console.log('Webhook event processed successfully:', event.event_id);
  } catch (error) {
    console.error('Error processing webhook event:', error);
    throw error;
  }
}

/**
 * Handle payment event
 */
async function handlePaymentEvent(data: WebhookEventData): Promise<void> {
  console.log('Processing payment event for order:', data.order_id);

  // Save sale to database
  const sale = await saveSale({
    order_id: data.order_id,
    product_name: data.product_name,
    amount: data.amount,
    buyer_email: data.buyer_email,
    buyer_name: data.buyer_name,
    affiliate_id: data.affiliate_id,
    status: 'completed',
  });

  console.log('Sale saved:', sale.id);

  // Update affiliate stats if applicable
  if (data.affiliate_id) {
    try {
      await updateAffiliateStats(data.affiliate_id);
      console.log('Affiliate stats updated:', data.affiliate_id);
    } catch (error) {
      console.error('Error updating affiliate stats:', error);
      // Don't fail the whole operation if affiliate update fails
    }
  }

  // Send notifications
  await notifyNewSale({
    order_id: data.order_id,
    product_name: data.product_name,
    amount: data.amount,
    buyer_name: data.buyer_name,
    buyer_email: data.buyer_email,
  });

  console.log('Notifications sent for order:', data.order_id);
}

/**
 * Handle refund event
 */
async function handleRefundEvent(data: WebhookEventData): Promise<void> {
  console.log('Processing refund event for order:', data.order_id);

  // Update sale status in database
  const sale = await saveSale({
    order_id: data.order_id,
    product_name: data.product_name,
    amount: data.amount,
    buyer_email: data.buyer_email,
    buyer_name: data.buyer_name,
    affiliate_id: data.affiliate_id,
    status: 'refunded',
  });

  console.log('Sale updated to refunded:', sale.id);

  // Update affiliate stats if applicable
  if (data.affiliate_id) {
    try {
      await updateAffiliateStats(data.affiliate_id);
      console.log('Affiliate stats updated after refund:', data.affiliate_id);
    } catch (error) {
      console.error('Error updating affiliate stats:', error);
    }
  }

  // Send refund notification
  await notifyRefund({
    order_id: data.order_id,
    product_name: data.product_name,
    amount: data.amount,
  });

  console.log('Refund notifications sent for order:', data.order_id);
}

/**
 * Handle affiliate approved event
 */
async function handleAffiliateApprovedEvent(data: WebhookEventData): Promise<void> {
  console.log('Processing affiliate approval:', data.affiliate_id);

  if (!data.affiliate_id) {
    console.warn('Affiliate ID missing in affiliate_approved event');
    return;
  }

  // Save or update affiliate
  await saveAffiliate({
    affiliate_id: data.affiliate_id,
    name: data.buyer_name || 'Unknown',
    email: data.buyer_email || '',
    total_sales: 0,
    total_commission: 0,
  });

  console.log('Affiliate saved:', data.affiliate_id);
}

/**
 * Validate webhook event structure
 */
export function validateWebhookEvent(event: any): event is WebhookEvent {
  if (!event || typeof event !== 'object') {
    return false;
  }

  // Check required fields
  if (!event.event_type || !event.data) {
    return false;
  }

  // Check event type is valid
  const validEventTypes = ['on_payment', 'on_refund', 'on_affiliate_approved', 'on_rebill'];
  if (!validEventTypes.includes(event.event_type)) {
    return false;
  }

  // Check data has required fields
  const data = event.data;
  if (!data.order_id || !data.product_name || data.amount === undefined) {
    return false;
  }

  return true;
}
