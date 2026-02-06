# Webhook Debugging Guide

## Overview
This guide helps debug issues with the Digistore24 webhook endpoint at `/api/digistore/webhook`.

## How the Webhook Works

### Flow
1. **Receive Request**: POST request to `/api/digistore/webhook`
2. **Parse Payload**: Support JSON, form data, and raw text
3. **Transform Data**: Convert Digistore24 format to internal format
4. **Async Processing**: Process event without blocking response
5. **Return "OK"**: Always return 200 status with plain text "OK"

### Key Points
- **Always returns 200 OK**: Even on errors, to prevent Digistore24 retries
- **Async processing**: Event processing happens after response is sent
- **Detailed logging**: Comprehensive logs for debugging

## Enhanced Error Logging

### What Was Added
The following logging improvements were made to help identify issues:

#### 1. Webhook Route (`app/api/digistore/webhook/route.ts`)
- **Early environment variable validation**: Logs missing Supabase credentials
- **Content-Type logging**: Shows how the request is being parsed
- **Detailed error information**: Logs error name, message, and stack trace
- **Timestamp logging**: Shows when webhook was received

#### 2. Webhook Handler (`lib/webhook-handler.ts`)
- **Event processing logs**: Shows which event type is being processed
- **Step-by-step logging**: Logs each processing step (save, notify, etc.)
- **Isolated error handling**: Errors in notifications don't fail the whole process
- **Detailed error context**: Includes event type and ID in error logs

#### 3. Supabase Operations (`lib/supabase.ts`)
- **Client creation logging**: Logs when Supabase client is created
- **Missing variable details**: Shows exactly which environment variables are missing
- **Database error details**: Logs Supabase error code, message, hint, and details
- **Operation confirmation**: Logs successful database operations

## Debugging Steps

### Step 1: Check Environment Variables
The webhook logs will show if environment variables are missing:
```
CRITICAL: Missing Supabase environment variables
NEXT_PUBLIC_SUPABASE_URL: MISSING
SUPABASE_SERVICE_ROLE_KEY: present
```

**Fix**: Ensure these environment variables are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Step 2: Check Request Format
Look for Content-Type and payload logs:
```
Content-Type: application/json
Received JSON data: { "event": "on_payment", ... }
```

**Issue**: If Content-Type is wrong or payload is malformed
**Fix**: Ensure Digistore24 is sending correct format

### Step 3: Check Event Transformation
Look for the transformed event log:
```
Transformed event: {
  "event_type": "on_payment",
  "data": { "order_id": "TEST-123", ... }
}
```

**Issue**: Missing or incorrect fields
**Fix**: Update transformation logic in webhook route

### Step 4: Check Database Operations
Look for Supabase operation logs:
```
=== saveSale function called ===
Order ID: TEST-123
Supabase client created successfully
Sale saved successfully to database
```

**Issue**: Errors here indicate Supabase connection or table issues
**Fix**: Verify Supabase credentials and table schema

### Step 5: Check Async Processing
Look for async processing logs:
```
=== Processing webhook event ===
Event type: on_payment
=== Processing payment event ===
Order ID: TEST-123
```

**Issue**: Errors here indicate processing logic issues
**Fix**: Check the specific error message and stack trace

## Common Issues

### Issue 1: Missing Environment Variables
**Symptom**: 
```
CRITICAL ERROR: Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

**Solution**: 
1. Go to Vercel Dashboard → Project → Settings → Environment Variables
2. Add missing variables
3. Redeploy the application

### Issue 2: Supabase Connection Error
**Symptom**:
```
Error saving sale: Failed to connect to Supabase
```

**Solution**:
1. Verify Supabase URL is correct
2. Verify service role key is correct
3. Check Supabase project is active
4. Verify network connectivity

### Issue 3: Table Schema Mismatch
**Symptom**:
```
Supabase error saving sale: column "field_name" does not exist
```

**Solution**:
1. Check Supabase table schema matches expected structure
2. Verify table name is `sales`
3. Required columns: `order_id`, `product_name`, `amount`, `buyer_email`, `buyer_name`, `affiliate_id`, `status`

### Issue 4: Invalid Event Type
**Symptom**:
```
Validation warning: unknown event type "invalid_event"
```

**Solution**:
1. Check Digistore24 is sending correct event type
2. Supported types: `on_payment`, `on_refund`, `on_affiliate_approved`, `on_rebill`
3. Update webhook configuration in Digistore24 dashboard

## Viewing Logs

### Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Click "Logs" tab
4. Filter by function: `/api/digistore/webhook`
5. Look for the detailed log messages

### Real-time Monitoring
```bash
# Using Vercel CLI
vercel logs --follow

# Filter for webhook
vercel logs --follow | grep webhook
```

## Testing Locally

### Setup
1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials
3. Start dev server: `npm run dev`

### Send Test Webhook
```bash
curl -X POST http://localhost:3000/api/digistore/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "on_payment",
    "order_id": "TEST-001",
    "product_name": "Test Product",
    "amount": "99.00",
    "currency": "EUR",
    "buyer_email": "test@example.com",
    "buyer_name": "Test User",
    "status": "completed"
  }'
```

### Expected Response
```
OK
```
(Status: 200, Content-Type: text/plain)

### Expected Logs
```
=== Digistore24 Webhook Received ===
Timestamp: 2026-02-06T23:00:00.000Z
Content-Type: application/json
Received JSON data: { "event": "on_payment", ... }
Event type: on_payment
Transformed event: { ... }
=== Processing webhook event ===
Event type: on_payment
Event ID: <uuid>
=== Processing payment event ===
Order ID: TEST-001
Attempting to save sale to database...
=== saveSale function called ===
Order ID: TEST-001
Supabase client created successfully
Sale saved successfully to database
Affiliate stats updated: AFF123
Sending notifications...
Notifications sent for order: TEST-001
Webhook event processed successfully: <uuid>
```

## Response Format

### Success Response
The webhook **ALWAYS** returns:
- **Status**: 200
- **Content-Type**: text/plain
- **Body**: OK

This is required by Digistore24 to prevent unnecessary retries.

### Error Handling
Even when errors occur:
- Webhook still returns 200 OK
- Errors are logged but don't affect response
- This prevents Digistore24 from retrying on temporary issues

## Next Steps

If the webhook is still not working after checking logs:

1. **Check Digistore24 Configuration**
   - Verify webhook URL is correct
   - Verify event types are enabled
   - Check webhook is active

2. **Verify Supabase Setup**
   - Check table exists
   - Check RLS policies allow inserts
   - Check service role key has proper permissions

3. **Monitor Logs**
   - Watch logs during a test webhook
   - Look for the specific error message
   - Follow the error stack trace

4. **Contact Support**
   - Provide the full error logs
   - Include the webhook payload
   - Include environment details (Vercel, Supabase)
