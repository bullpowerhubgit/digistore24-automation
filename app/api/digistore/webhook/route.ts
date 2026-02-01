import { NextRequest, NextResponse } from 'next/server';
import { processWebhookEvent, validateWebhookEvent } from '@/lib/webhook-handler';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const event = await request.json();

    console.log('Received webhook event:', event.event_type);

    // Validate event structure
    if (!validateWebhookEvent(event)) {
      console.error('Invalid webhook event structure:', event);
      return NextResponse.json(
        { error: 'Invalid event structure' },
        { status: 400 }
      );
    }

    // Process the webhook event
    await processWebhookEvent(event);

    return NextResponse.json(
      { success: true, message: 'Event processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);

    return NextResponse.json(
      {
        error: 'Failed to process webhook event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json(
    {
      message: 'Digistore24 webhook endpoint is active',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
