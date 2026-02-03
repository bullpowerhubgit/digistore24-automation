import { NextRequest } from 'next/server';
import { POST as DigistoreWebhook } from '../digistore/webhook/route';

// Alias endpoint for /api/webhook that forwards to /api/digistore/webhook
export async function POST(request: NextRequest) {
  return DigistoreWebhook(request);
}

export async function GET() {
  return new Response('Digistore24 Webhook Endpoint (Alias) - Use POST', { 
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
}
