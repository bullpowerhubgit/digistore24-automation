# Deployment Verification Guide

## Overview
This guide helps verify that the correct webhook code is deployed and functioning properly.

## Quick Verification

### Step 1: Test the Webhook Endpoint

Test the deployed webhook with a simple request:

```bash
curl -X POST https://your-domain.vercel.app/api/digistore/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "on_payment",
    "order_id": "VERIFY-001",
    "product_name": "Test Product",
    "amount": "1.00",
    "currency": "EUR",
    "buyer_email": "test@example.com",
    "buyer_name": "Test User",
    "status": "completed"
  }'
```

**Expected Response:**
```
OK
```

**Expected Status Code:** `200`

**Expected Content-Type:** `text/plain`

### Step 2: Verify Response Format

**✅ CORRECT Response:**
- Status: 200
- Content-Type: text/plain
- Body: `OK` (exactly 2 characters)

**❌ INCORRECT Response (Old Code):**
- Status: Any
- Content-Type: application/json
- Body: `{"success":false,"error":"Failed to process webhook"}`

If you see the incorrect response, **the wrong code is deployed**.

## Detailed Verification

### Check 1: GET Request

```bash
curl https://your-domain.vercel.app/api/digistore/webhook
```

**Expected Response (JSON):**
```json
{
  "message": "Digistore24 webhook endpoint is active",
  "timestamp": "2026-02-07T01:00:00.000Z",
  "note": "Use POST to send webhook events"
}
```

### Check 2: Verify Logs

1. Go to Vercel Dashboard → Your Project → Logs
2. Send a test webhook (use Step 1 command)
3. Look for these log messages:

```
=== Digistore24 Webhook Received ===
Timestamp: 2026-02-07T...
Content-Type: application/json
Received JSON data: { "event": "on_payment", ... }
Event type: on_payment
Transformed event: { ... }
```

### Check 3: Environment Variables

Verify these environment variables are set in Vercel:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (secret)

**Optional:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For client-side operations
- `DISCORD_WEBHOOK_URL` - For Discord notifications
- `SENDGRID_API_KEY` - For email notifications
- `NOTIFICATION_EMAIL` - Email recipient for notifications

If environment variables are missing, logs will show:
```
CRITICAL: Missing Supabase environment variables
NEXT_PUBLIC_SUPABASE_URL: MISSING
SUPABASE_SERVICE_ROLE_KEY: present
```

## Deployment Checklist

### Before Deployment

- [ ] Code review completed
- [ ] All tests passing locally
- [ ] Build succeeds: `npm run build`
- [ ] Lint check passes: `npm run lint`
- [ ] Environment variables prepared
- [ ] Supabase tables created (see SUPABASE_INTEGRATION.md)

### Deploy to Vercel

1. **Push to main branch** (or merge PR)
   ```bash
   git checkout main
   git merge your-branch
   git push origin main
   ```

2. **Verify automatic deployment**
   - Go to Vercel Dashboard
   - Check Deployments tab
   - Wait for "Ready" status

3. **Set environment variables** (if not set)
   - Go to Settings → Environment Variables
   - Add all required variables
   - Click "Redeploy" if needed

### After Deployment

- [ ] Test webhook endpoint (Step 1)
- [ ] Verify response format is "OK"
- [ ] Check logs for errors (Step 2)
- [ ] Send a real test webhook from Digistore24
- [ ] Verify data appears in Supabase
- [ ] Check notifications (if configured)

## Troubleshooting

### Issue: Response is JSON instead of "OK"

**Cause:** Wrong code deployed or cached

**Solution:**
1. Check the deployment commit hash in Vercel
2. Verify it matches the latest commit on main
3. Force redeploy if needed:
   - Vercel Dashboard → Deployments → ⋯ → Redeploy

### Issue: 500 Internal Server Error

**Cause:** Runtime error in the code

**Solution:**
1. Check Vercel logs for error details
2. Common causes:
   - Missing environment variables
   - Supabase connection error
   - Code syntax error

### Issue: Always returns "OK" but data not saved

**Cause:** Async processing error

**Solution:**
1. Check logs for processing errors:
   ```
   === Error processing webhook event (async) ===
   ```
2. Verify Supabase connection
3. Check table schema matches expectations

### Issue: Environment variables not working

**Cause:** Variables not saved or deployment not refreshed

**Solution:**
1. Verify variables in Vercel Settings
2. Check variable names are exact (case-sensitive)
3. Redeploy after adding variables
4. For `NEXT_PUBLIC_*` variables, rebuild is required

## Version Verification

### Check Deployed Code Version

1. **View source in browser:**
   - Open DevTools → Network
   - Send a request to the webhook
   - Check response headers for build info

2. **Check deployment commit:**
   - Vercel Dashboard → Deployments
   - Click on the active deployment
   - See "Commit" field → matches your expected commit

3. **Compare code:**
   ```bash
   # Get the deployed code commit
   git show [commit-hash]:app/api/digistore/webhook/route.ts | grep "return new Response"
   ```
   
   Should show:
   ```typescript
   return new Response('OK', {
   ```

## Test Scenarios

### Test Case 1: Valid Payment Event

```bash
curl -X POST https://your-domain.vercel.app/api/digistore/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "on_payment",
    "order_id": "TEST-2026-001",
    "product_name": "Premium Course",
    "amount": "199.00",
    "currency": "EUR",
    "buyer_email": "customer@example.com",
    "buyer_name": "John Doe",
    "affiliate_id": "AFF123",
    "status": "completed"
  }'
```

**Expected:** `OK` (status 200)

### Test Case 2: Form Data

```bash
curl -X POST https://your-domain.vercel.app/api/digistore/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "event=on_payment&order_id=TEST-002&product_name=Test&amount=10.00&buyer_email=test@test.com&buyer_name=Test&status=completed"
```

**Expected:** `OK` (status 200)

### Test Case 3: Invalid Event Type

```bash
curl -X POST https://your-domain.vercel.app/api/digistore/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "unknown_event",
    "order_id": "TEST-003"
  }'
```

**Expected:** `OK` (status 200) - webhook always returns OK

### Test Case 4: Missing Fields

```bash
curl -X POST https://your-domain.vercel.app/api/digistore/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "on_payment"
  }'
```

**Expected:** `OK` (status 200) - webhook always returns OK, processing fails gracefully

## Integration with Digistore24

### Configure Webhook in Digistore24

1. Log in to Digistore24 dashboard
2. Go to Settings → API & Webhooks
3. Add webhook URL: `https://your-domain.vercel.app/api/digistore/webhook`
4. Select events:
   - ✓ Payment received (`on_payment`)
   - ✓ Refund processed (`on_refund`)
   - ✓ Subscription rebilled (`on_rebill`)
   - ✓ Affiliate approved (`on_affiliate_approved`)
5. Content-Type: `application/json` (recommended) or `application/x-www-form-urlencoded`
6. Save and test

### Test from Digistore24

1. Use Digistore24's "Test Webhook" feature
2. Check Vercel logs for the request
3. Verify data appears in Supabase

## Monitoring

### Set Up Monitoring

1. **Vercel Logs:**
   - Enable log retention
   - Set up log drains (optional)

2. **Error Tracking:**
   - Consider integrating Sentry or similar
   - Monitor error rates

3. **Database Monitoring:**
   - Check Supabase dashboard regularly
   - Set up alerts for failed inserts

### Health Checks

Create a cron job or external monitor to check:
- Webhook endpoint is responding (GET request)
- Response time is acceptable
- No 500 errors

## Support

If issues persist after following this guide:

1. **Check Documentation:**
   - WEBHOOK_DEBUGGING.md - Detailed debugging guide
   - SUPABASE_INTEGRATION.md - Database setup
   - README.md - General setup

2. **Review Logs:**
   - Vercel function logs
   - Supabase logs
   - Browser console (for client errors)

3. **Verify Code:**
   - Compare deployed code with repository
   - Check for merge conflicts
   - Ensure latest commit is deployed

4. **Contact Support:**
   - Provide deployment URL
   - Include error logs
   - Include test webhook payload
   - Include environment details
