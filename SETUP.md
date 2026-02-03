# 🚀 Complete Setup Guide

This guide will help you set up the Digistore24 Automation Suite from scratch.

## 📋 Overview

This application automatically tracks Digistore24 sales, sends notifications, and provides a real-time dashboard.

## ✅ Prerequisites

Before starting, make sure you have:

- ✅ A [Vercel account](https://vercel.com/signup)
- ✅ A [Supabase account](https://supabase.com)
- ✅ A [Digistore24 account](https://www.digistore24.com) with API access
- ✅ (Optional) A Discord server for notifications

---

## 🔧 Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Enter project details:
   - **Name**: `digistore24-automation`
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your users

### 1.2 Create Database Tables

1. In your Supabase project, go to **SQL Editor**
2. Run this SQL query:

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

### 1.3 Get Supabase Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

---

## 🔑 Step 2: Get Digistore24 API Key

### 2.1 Create API Key

1. Login to [Digistore24](https://www.digistore24.com)
2. Go to **Vendor View** → **Settings** → **Account Access**
3. Click **"Api key"** tab
4. Click **"New API key"**
5. Configure:
   - **Name**: `automation-readonly`
   - **Permission**: `readonly` (recommended for security)
6. Click **Save** and copy the API key

### 2.2 Get Your Digistore24 ID

1. In Digistore24, go to your account settings
2. Find your **Vendor ID** or **User ID**
3. Copy this number

---

## 🚀 Step 3: Deploy to Vercel

### 3.1 Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **"Import Project"**
3. Connect to GitHub and select: `bullpowerhubgit/digistore24-automation`
4. Click **"Import"**

### 3.2 Configure Environment Variables

In Vercel, before deploying, add these environment variables:

#### Required Variables:

| Variable | Value | Where to Get It |
|----------|-------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJxxx...` | Supabase → Settings → API (anon public) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJxxx...` | Supabase → Settings → API (service_role) |
| `DIGISTORE24_API_KEY` | `123-xxx...` | Digistore24 → API Key |
| `DIGISTORE24_ID` | `12345` | Your Digistore24 Vendor/User ID |
| `API_SECRET_KEY` | `random-secret-123` | Generate a random string |
| `CRON_SECRET` | `cron-secret-456` | Generate a random string |

#### Optional Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DISCORD_WEBHOOK_URL` | `https://discord.com/api/webhooks/...` | For Discord notifications |
| `SENDGRID_API_KEY` | `SG.xxx...` | For email notifications |
| `NOTIFICATION_EMAIL` | `your@email.com` | Email for notifications |

**💡 Tip**: Generate random secrets using:
```bash
openssl rand -base64 32
```

### 3.3 Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

---

## 🔗 Step 4: Configure Digistore24 Webhook

### 4.1 Set Up Webhook

1. Login to [Digistore24](https://www.digistore24.com)
2. Go to **Settings** → **Integrations (IPN)**
3. Click **"Add new connection"** → **"Webhook"**
4. Configure webhook:
   - **URL**: `https://your-project.vercel.app/api/digistore/webhook`
   - **Events**: Check these boxes:
     - ✅ `on_payment`
     - ✅ `on_refund`
     - ✅ `on_affiliate_approved`
5. Click **"Save"**

### 4.2 Test Webhook

Send a test event from Digistore24 or use curl:

```bash
curl -X POST https://your-project.vercel.app/api/digistore/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "on_payment",
    "data": {
      "order_id": "TEST-001",
      "product_name": "Test Product",
      "amount": 99.99,
      "buyer_email": "test@example.com",
      "buyer_name": "Test User",
      "status": "completed",
      "created_at": "2024-01-01T12:00:00Z"
    }
  }'
```

---

## 📊 Step 5: Verify Everything Works

### 5.1 Check Dashboard

Visit: `https://your-project.vercel.app`

You should see:
- ✅ Sales statistics (Today, Week, Month, Total)
- ✅ Recent sales list
- ✅ Clean, responsive UI

### 5.2 Check API Endpoints

Test the APIs:

```bash
# Get sales statistics
curl https://your-project.vercel.app/api/digistore/stats

# Get sales list
curl https://your-project.vercel.app/api/digistore/sales
```

### 5.3 Check Cron Job

1. Go to Vercel Dashboard → Your Project → **Settings** → **Cron Jobs**
2. Verify cron job is listed:
   - **Path**: `/api/cron`
   - **Schedule**: `0 */6 * * *` (every 6 hours)

---

## 🎨 Step 6: Optional - Discord Notifications

### 6.1 Create Discord Webhook

1. Open your Discord server
2. Go to **Server Settings** → **Integrations** → **Webhooks**
3. Click **"New Webhook"**
4. Configure:
   - **Name**: `Digistore24 Sales`
   - **Channel**: Select channel for notifications
5. Click **"Copy Webhook URL"**

### 6.2 Add to Vercel

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Key**: `DISCORD_WEBHOOK_URL`
   - **Value**: (paste webhook URL)
3. Click **"Save"**
4. Redeploy: Vercel → **Deployments** → **Redeploy**

---

## 🐛 Troubleshooting

### Dashboard Shows "No Data"

- ✅ Check Supabase tables were created correctly
- ✅ Verify environment variables in Vercel
- ✅ Check Vercel deployment logs for errors

### Webhook Not Working

- ✅ Verify webhook URL in Digistore24 is correct
- ✅ Check webhook events are selected
- ✅ Test with curl command above
- ✅ Check Vercel function logs

### Database Errors

- ✅ Verify Supabase credentials are correct
- ✅ Check RLS policies allow service role access
- ✅ Ensure tables exist in Supabase

---

## 📝 Next Steps

After setup is complete:

1. ✅ Monitor your dashboard for real-time sales
2. ✅ Check Discord for sale notifications (if configured)
3. ✅ Review Vercel logs regularly
4. ✅ Set up custom domain (optional)
5. ✅ Configure email notifications (optional)

---

## 🆘 Need Help?

- 📖 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide
- 📖 Read [QUICKSTART.md](./QUICKSTART.md) for quick reference
- 🐛 Check [GitHub Issues](https://github.com/bullpowerhubgit/digistore24-automation/issues)
- 📧 Contact support

---

## ✅ Setup Complete!

Your Digistore24 Automation Suite is now fully configured and running! 🎉

**Your Dashboard**: https://your-project.vercel.app