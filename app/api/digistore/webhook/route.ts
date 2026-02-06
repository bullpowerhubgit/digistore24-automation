import { NextRequest, NextResponse } from 'next/server';
import { processWebhookEvent } from '@/lib/webhook-handler';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Digistore24 Webhook Received ===');
    console.log('Timestamp:', new Date().toISOString());
    
    // Check environment variables early
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('CRITICAL: Missing Supabase environment variables');
      console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'present' : 'MISSING');
      console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'present' : 'MISSING');
    }
    
    let data: any = {};
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    // Parse request body - support both JSON and form data
    if (contentType.includes('application/json')) {
      data = await request.json();
      console.log('Received JSON data:', JSON.stringify(data, null, 2));
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      data = Object.fromEntries(formData.entries());
      console.log('Received form data:', JSON.stringify(data, null, 2));
    } else {
      // Try to parse as text and then JSON
      const text = await request.text();
      console.log('Received raw text:', text);
      try {
        data = JSON.parse(text);
      } catch {
        // If not JSON, treat as form data
        const params = new URLSearchParams(text);
        data = Object.fromEntries(params.entries());
      }
    }

    // Digistore24 sends event type in 'event' field
    const eventType = data.event || data.event_type;
    console.log('Event type:', eventType);

    // Transform Digistore24 IPN format to our internal format
    const event = {
      event_type: eventType,
      event_id: data.id || data.event_id || crypto.randomUUID(),
      timestamp: data.timestamp || new Date().toISOString(),
      data: {
        order_id: data.order_id || data.transaction_id || 'unknown',
        product_id: data.product_id || '',
        product_name: data.product_name || data.product || 'Unknown Product',
        amount: parseFloat(data.amount || data.pay_amount || '0'),
        currency: data.currency || 'EUR',
        buyer_email: data.buyer_email || data.email || '',
        buyer_name: data.buyer_name || data.custom_name || data.billing_name || '',
        affiliate_id: data.affiliate_id || data.affiliate || null,
        status: data.status || 'completed',
        payment_date: data.payment_date || new Date().toISOString(),
      },
    };

    console.log('Transformed event:', JSON.stringify(event, null, 2));

    // Process the webhook event (don't await to respond quickly)
    processWebhookEvent(event).catch(error => {
      console.error('=== Error processing webhook event (async) ===');
      console.error('Error name:', (error as any)?.name);
      console.error('Error message:', (error as any)?.message);
      console.error('Error stack:', (error as any)?.stack);
      console.error('Full error:', error);
      // Don't throw - we already responded to Digistore24
    });

    // ALWAYS return 200 OK with "OK" text - Digistore24 requirement
    return new Response('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error('=== Error in webhook handler (main try/catch) ===');
    console.error('Error name:', (error as any)?.name);
    console.error('Error message:', (error as any)?.message);
    console.error('Error stack:', (error as any)?.stack);
    console.error('Full error:', error);
    
    // Even on error, return 200 OK so Digistore24 doesn't retry
    // Log the error but don't fail the webhook
    return new Response('OK', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json(
    {
      message: 'Digistore24 webhook endpoint is active',
      timestamp: new Date().toISOString(),
      note: 'Use POST to send webhook events',
    },
    { status: 200 }
  );
}
