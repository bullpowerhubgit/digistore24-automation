# Security Considerations

## Important Security Notes

### Current Security Status

**✅ Major vulnerabilities addressed:**
- Next.js upgraded to 14.2.35 (latest in 14.x branch)
- Patches DoS vulnerabilities with Server Components
- Patches Authorization Bypass in Middleware
- Patches Cache Poisoning vulnerabilities
- Patches Server-Side Request Forgery in Server Actions
- @sendgrid/mail upgraded to 8.1.6 (patches axios CSRF vulnerabilities)

**⚠️ Known limitation:**
- One remaining advisory (GHSA-h25m-26qc-wcjf) requires Next.js 15.5.10+
- Upgrading to Next.js 15.x would require testing for breaking changes
- This is a DoS vulnerability related to Image Optimizer remotePatterns
- **Mitigation**: Avoid using remotePatterns in next.config.js or upgrade to Next.js 15.5.10+

### 1. Webhook Signature Verification

**⚠️ CRITICAL: The webhook signature verification in `lib/digistore.ts` is currently a placeholder.**

Before deploying to production, you MUST implement proper webhook signature verification according to Digistore24's documentation. The current implementation accepts any signature, which is a security risk.

To implement:
1. Review Digistore24's webhook signature algorithm
2. Implement HMAC-SHA256 verification (or their specified algorithm)
3. Test thoroughly with real webhook events

Example implementation (adjust based on Digistore24's actual algorithm):
```typescript
import crypto from 'crypto';

verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return signature === expectedSignature;
}
```

### 2. Environment Variables

**Never commit sensitive environment variables to version control.**

Required environment variables:
- `DIGISTORE24_API_KEY` - Keep this secret
- `SUPABASE_SERVICE_ROLE_KEY` - Keep this secret  
- `CRON_SECRET` - Use a strong random string
- `SENDGRID_API_KEY` - Keep this secret if using email

Use `.env.local` for local development and configure these in your deployment platform's environment settings.

### 3. API Route Protection

All API routes use proper authentication:
- Webhook endpoints validate event structure
- Cron job endpoints check `CRON_SECRET` header
- Database operations use service role key

### 4. Database Security

Supabase Row Level Security (RLS) policies are included in the README. Make sure to:
1. Enable RLS on all tables
2. Create appropriate policies
3. Use service role key only for server-side operations

### 5. CORS and Rate Limiting

Consider implementing:
- CORS headers for API routes
- Rate limiting on webhook endpoints
- Request size limits

### 6. Data Validation

All incoming data should be validated:
- Use Zod schemas for API request validation
- Sanitize user inputs
- Validate webhook event structure

## Best Practices

1. **Use HTTPS only** in production
2. **Rotate API keys** regularly
3. **Monitor webhook endpoints** for suspicious activity
4. **Implement logging** for security events
5. **Keep dependencies updated** to patch security vulnerabilities
6. **Use strong secrets** for CRON_SECRET (minimum 32 characters)
7. **Implement IP whitelisting** for webhook endpoints if possible

## Deployment Checklist

Before deploying to production:

- [ ] Implement proper webhook signature verification
- [ ] Set all environment variables in production
- [ ] Enable Supabase RLS policies
- [ ] Test all API endpoints
- [ ] Verify cron job authentication
- [ ] Enable HTTPS
- [ ] Configure proper error monitoring
- [ ] Review and audit all security settings
- [ ] Test webhook events with real data
- [ ] Implement rate limiting if needed
