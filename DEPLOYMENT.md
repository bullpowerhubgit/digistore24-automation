# 🚀 Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Digistore24 Automation Suite to Vercel.

## Prerequisites

- A [Vercel account](https://vercel.com/signup)
- A [GitHub account](https://github.com) (repository already connected)
- All required API keys and credentials ready

## 📋 Quick Deployment Steps

### 1. Connect to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Import from GitHub: `bullpowerhubgit/digistore24-automation`
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (from project directory)
vercel

# Follow the prompts to link your project
```

### 2. Configure Environment Variables

In the Vercel Dashboard, go to **Settings** → **Environment Variables** and add the following:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DIGISTORE24_API_KEY` | Your Digistore24 API key | `ds24_xxxxxxxxxxxxx` |
| `DIGISTORE24_ID` | Your Digistore24 ID | `12345` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJxxx...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJxxx...` |
| `API_SECRET_KEY` | Secret key for API authentication | `your_random_secret_key` |
| `CRON_SECRET` | Secret for Vercel cron authentication | `your_cron_secret` |

#### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DISCORD_WEBHOOK_URL` | Discord webhook for notifications | `https://discord.com/api/webhooks/...` |
| `SENDGRID_API_KEY` | SendGrid API key for emails | `SG.xxxxx` |
| `NOTIFICATION_EMAIL` | Email for notifications | `your@email.com` |

**Important:** Make sure to add these variables for all environments (Production, Preview, and Development).

### 3. Deploy to Production

#### Via Dashboard
1. Click **Deploy** in Vercel Dashboard
2. Wait for the build to complete
3. Your site will be available at `https://your-project.vercel.app`

#### Via CLI
```bash
# Deploy to production
vercel --prod
```

### 4. Configure Vercel Cron Jobs

The cron job is automatically configured via `vercel.json`. After deployment:

1. Go to **Settings** → **Cron Jobs** in Vercel Dashboard
2. Verify the cron job is active:
   - **Path**: `/api/cron`
   - **Schedule**: Every 6 hours (`0 */6 * * *`)

**Note**: Vercel automatically sets the `Authorization` header with `Bearer CRON_SECRET` for cron requests.

### 5. Set Up Digistore24 Webhook

1. Login to your [Digistore24 account](https://www.digistore24.com)
2. Go to **Settings** → **Integrations (IPN)**
3. Click **Add new connection** → **Webhook**
4. Configure webhook:
   - **URL**: `https://your-project.vercel.app/api/digistore/webhook`
   - **Events**: Select:
     - ✅ `on_payment`
     - ✅ `on_refund`
     - ✅ `on_affiliate_approved`
5. Save the webhook configuration

### 6. Set Up Supabase Database

1. Create tables in your Supabase project:

```sql
-- Sales table
CREATE TABLE sales (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  product_name TEXT,
  amount DECIMAL(10,2),
  buyer_email TEXT,
  buyer_name TEXT,
  affiliate_id TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Affiliates table
CREATE TABLE affiliates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  affiliate_id TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  total_sales INTEGER DEFAULT 0,
  total_commission DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Create policies (allow service role full access)
CREATE POLICY "Allow service role full access" ON sales
  FOR ALL USING (true);

CREATE POLICY "Allow service role full access" ON affiliates
  FOR ALL USING (true);
```

2. Copy your Supabase credentials to Vercel environment variables (if not done in step 2)

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to **Settings** → **Domains** in Vercel Dashboard
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Update Digistore24 webhook URL with your custom domain

### Enable Edge Functions (Optional)

For better performance, you can enable edge functions in specific regions:

```json
// In vercel.json
{
  "regions": ["iad1", "fra1", "sfo1"]
}
```

### Monitor Deployment

1. **Logs**: Check deployment logs in Vercel Dashboard → **Deployments**
2. **Analytics**: Enable Vercel Analytics for usage insights
3. **Performance**: Monitor with Vercel Speed Insights

## 🧪 Testing Your Deployment

### 1. Test Dashboard
Visit `https://your-project.vercel.app` to see the dashboard

### 2. Test Webhook
Send a test webhook from Digistore24 or use curl:

```bash
curl -X POST https://your-project.vercel.app/api/digistore/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "on_payment",
    "data": {
      "order_id": "TEST-123",
      "product_name": "Test Product",
      "amount": 99.99,
      "buyer_email": "test@example.com",
      "buyer_name": "Test User",
      "status": "completed",
      "created_at": "2024-01-01T12:00:00Z"
    }
  }'
```

### 3. Test Sales API
```bash
curl https://your-project.vercel.app/api/sales?stats=true
```

### 4. Test Cron Job
The cron job runs automatically every 6 hours. To test manually:

```bash
curl -X GET https://your-project.vercel.app/api/cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct dependencies

### Webhook Not Receiving Events
- Verify webhook URL in Digistore24 is correct
- Check webhook events are selected in Digistore24
- Review function logs in Vercel Dashboard

### Database Connection Errors
- Verify Supabase credentials are correct
- Check Supabase service is running
- Ensure RLS policies allow service role access

### Cron Job Not Running
- Verify `CRON_SECRET` environment variable is set
- Check cron job is active in Vercel Dashboard
- Review function logs for errors

## 📊 Monitoring

### View Logs
```bash
# Via CLI
vercel logs

# Or visit Vercel Dashboard → Functions → Select function → Logs
```

### Metrics to Monitor
- API response times
- Webhook delivery success rate
- Database query performance
- Cron job execution status

## 🔄 Updates and Redeployment

### Automatic Deployments
Every push to your GitHub repository triggers an automatic deployment:
- **main branch** → Production
- **other branches** → Preview deployments

### Manual Deployment
```bash
# Redeploy latest commit
vercel --prod

# Deploy specific commit
git checkout <commit-hash>
vercel --prod
```

## 🆘 Support

If you encounter issues:
1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
3. Check project logs in Vercel Dashboard
4. Open an issue on GitHub

## ✅ Deployment Checklist

- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] All environment variables configured
- [ ] Supabase database tables created
- [ ] Supabase RLS policies configured
- [ ] Digistore24 webhook URL configured
- [ ] Cron job verified in Vercel Dashboard
- [ ] Custom domain configured (optional)
- [ ] Discord webhook configured (optional)
- [ ] Test webhook received successfully
- [ ] Dashboard accessible and displaying data
- [ ] API endpoints responding correctly

---

**Deployment Complete! 🎉**

Your Digistore24 Automation Suite is now live on Vercel.
