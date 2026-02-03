# 📚 Complete Setup Guide - Digistore24 Automation

This guide provides step-by-step instructions for setting up the Digistore24 Automation Dashboard from scratch.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Local Development Setup](#local-development-setup)
4. [Vercel Deployment](#vercel-deployment)
5. [Digistore24 Integration](#digistore24-integration)
6. [Optional Integrations](#optional-integrations)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Prerequisites

Before you begin, make sure you have:

- **Node.js 18.0+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Supabase Account** - [Sign up here](https://supabase.com) (Free tier available)
- **Vercel Account** - [Sign up here](https://vercel.com) (Free tier available)
- **Digistore24 Account** - [Sign up here](https://www.digistore24.com)

---

## 🗄️ Supabase Setup

### Step 1: Create a New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Project Name**: `digistore24-automation` (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely!)
   - **Region**: Select the closest region to your users
   - **Pricing Plan**: Free tier is sufficient for testing
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be provisioned

### Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on the **⚙️ Settings** icon (bottom left)
2. Navigate to **API** section
3. You'll find these credentials (keep them safe):
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Anon (public) key**: A long JWT token starting with `eyJ...`
   - **Service Role key**: Another JWT token (keep this SECRET!)

### Step 3: Create Database Schema

1. In your Supabase dashboard, click on **🗄️ SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy and paste the following schema:

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

-- Create policies for service role access
CREATE POLICY "Service role full access - sales" ON sales
  FOR ALL USING (true);

CREATE POLICY "Service role full access - affiliates" ON affiliates
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sales_affiliate_id ON sales(affiliate_id);
CREATE INDEX idx_sales_order_id ON sales(order_id);
CREATE INDEX idx_affiliates_affiliate_id ON affiliates(affiliate_id);
```

4. Click **"Run"** to execute the schema
5. You should see a success message

### Step 4: Import Demo Data (Optional)

1. Still in the SQL Editor, click **"New Query"**
2. Copy the contents of `supabase/seed.sql` from this repository
3. Click **"Run"** to insert 20 demo sales records
4. Verify by running: `SELECT COUNT(*) FROM sales;` (should return 20)

---

## 💻 Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/bullpowerhubgit/digistore24-automation.git
cd digistore24-automation
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Open `.env.local` in your text editor

3. **Update Supabase credentials** (REQUIRED):
```env
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

4. **Update Digistore24 credentials** (optional for now):
```env
DIGISTORE24_API_KEY=your_api_key_here
DIGISTORE24_ID=your_digistore_id
```

5. Save the file

### Step 4: Start Development Server

```bash
npm run dev
```

Your application should now be running at `http://localhost:3000`

### Step 5: Verify Setup

1. Open `http://localhost:3000` in your browser
2. Click on **"Dashboard"** in the navigation
3. You should see your sales data (or demo data if you imported it)
4. If you see sales statistics and charts, congratulations! 🎉

---

## 🚀 Vercel Deployment

### Step 1: Prepare for Deployment

1. Commit your changes (if any):
```bash
git add .
git commit -m "Configure environment for deployment"
```

2. Push to GitHub:
```bash
git push origin main
```

### Step 2: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository:
   - Search for `digistore24-automation`
   - Click **"Import"**

### Step 3: Configure Environment Variables

1. In the project setup screen, scroll to **"Environment Variables"**
2. Add the following variables:

**Required Variables:**
```
NEXT_PUBLIC_SUPABASE_URL = https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key]
```

**Optional Variables:**
```
DIGISTORE24_API_KEY = [your-api-key]
DIGISTORE24_ID = [your-digistore-id]
DISCORD_WEBHOOK_URL = [your-discord-webhook]
SENDGRID_API_KEY = [your-sendgrid-key]
NOTIFICATION_EMAIL = [your@email.com]
AFFILIATE_COMMISSION_RATE = 0.2
```

3. Make sure to select **"Production", "Preview", and "Development"** for each variable

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. Once deployed, click **"Visit"** to see your live dashboard
4. Your deployment URL will be: `https://[your-project-name].vercel.app`

### Step 5: Set Up Environment Secrets (For Sensitive Keys)

For the Service Role Key (recommended for production):

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link your project:
```bash
vercel link
```

4. Add secrets:
```bash
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste your service role key when prompted
# Select Production, Preview, and Development
```

---

## 🔗 Digistore24 Integration

### Step 1: Get Your API Key

1. Login to [Digistore24](https://www.digistore24.com)
2. Navigate to **Settings** → **Account Access** → **API Keys**
3. Click **"New API Key"**
4. Configure:
   - **Name**: "Automation Dashboard"
   - **Access Level**: Select **"Full Access"**
5. Click **"Create"**
6. **Copy the API key** (you won't see it again!)

### Step 2: Configure Webhook URL

1. In Digistore24, go to **Settings** → **Integrations (IPN)**
2. Click **"Add new connection"**
3. Select **"Webhook"**
4. Configure the webhook:
   - **URL**: `https://[your-vercel-app].vercel.app/api/digistore/webhook`
   - **Events to send**:
     - ✅ `on_payment` (New sale)
     - ✅ `on_refund` (Refund processed)
     - ✅ `on_affiliate_approved` (New affiliate)
5. Click **"Save"**

### Step 3: Test the Webhook

1. In Digistore24, find the webhook you just created
2. Click **"Test"** to send a test event
3. Check your Vercel logs or Supabase database to verify the event was received
4. You should see a new entry in your `sales` table

### Step 4: Update Environment Variables

1. Add your Digistore24 credentials to Vercel:
```bash
vercel env add DIGISTORE24_API_KEY
# Paste your API key

vercel env add DIGISTORE24_ID
# Enter your Digistore ID
```

2. Redeploy to apply changes:
```bash
vercel --prod
```

---

## 🎨 Optional Integrations

### Discord Notifications

Get notified in Discord for every sale:

1. Create a Discord webhook:
   - Go to your Discord server settings
   - Navigate to **Integrations** → **Webhooks**
   - Click **"New Webhook"**
   - Name it "Digistore24 Sales"
   - Copy the webhook URL

2. Add to environment variables:
```bash
vercel env add DISCORD_WEBHOOK_URL
# Paste your webhook URL
```

3. Redeploy

### Email Reports (SendGrid)

Send daily sales reports via email:

1. Create a SendGrid account at [sendgrid.com](https://sendgrid.com)
2. Create an API key:
   - Go to **Settings** → **API Keys**
   - Click **"Create API Key"**
   - Select **"Full Access"**
   - Copy the key

3. Add to environment variables:
```bash
vercel env add SENDGRID_API_KEY
# Paste your API key

vercel env add NOTIFICATION_EMAIL
# Enter your email address
```

4. Redeploy

---

## 🔧 Troubleshooting

### Issue: "Missing Supabase environment variables" Error

**Cause**: Environment variables are not properly configured.

**Solution**:
1. Verify `.env.local` exists and has correct values
2. Restart the development server: `npm run dev`
3. For production, check Vercel environment variables dashboard

### Issue: Dashboard Shows No Data

**Possible causes**:

1. **No sales in database**
   - Solution: Import demo data using `supabase/seed.sql`

2. **Database connection error**
   - Solution: Verify Supabase credentials
   - Check Supabase project is active (not paused)

3. **Row Level Security blocking access**
   - Solution: Verify RLS policies are created correctly
   - Ensure service role key is being used for server operations

### Issue: Webhook Not Receiving Events

**Possible causes**:

1. **URL not accessible**
   - Solution: Make sure your Vercel deployment is live
   - Test: `curl https://your-app.vercel.app/api/digistore/webhook`

2. **Wrong webhook URL**
   - Solution: Verify URL in Digistore24 settings
   - Format: `https://[app-name].vercel.app/api/digistore/webhook`

3. **Events not selected**
   - Solution: Check webhook settings in Digistore24
   - Ensure `on_payment`, `on_refund` are checked

### Issue: Build Fails on Vercel

**Common solutions**:

1. **TypeScript errors**
   ```bash
   # Run locally first
   npm run build
   # Fix any TypeScript errors shown
   ```

2. **Missing dependencies**
   ```bash
   # Ensure package.json is up to date
   npm install
   git add package-lock.json
   git commit -m "Update dependencies"
   git push
   ```

3. **Environment variables**
   - Ensure all required env vars are added in Vercel
   - Check for typos in variable names

### Issue: Database Connection Timeout

**Solution**:
1. Check Supabase project status (might be paused on free tier)
2. Verify network connectivity
3. Check if Supabase service is having issues: [status.supabase.com](https://status.supabase.com)

### Issue: Cron Jobs Not Running

**Solution**:
1. Cron jobs only work on Vercel Pro plan or higher
2. Alternative: Use external services like:
   - [cron-job.org](https://cron-job.org)
   - [EasyCron](https://www.easycron.com)
   - Set up to hit your API endpoints

### Getting Help

If you're still experiencing issues:

1. **Check the logs**:
   - Local: Check terminal output
   - Vercel: Check deployment logs in Vercel dashboard
   - Supabase: Check logs in Supabase dashboard

2. **Common log locations**:
   - Vercel: `https://vercel.com/[your-org]/[project]/logs`
   - Supabase: `https://app.supabase.com/project/[project-id]/logs`

3. **Documentation**:
   - [Next.js Docs](https://nextjs.org/docs)
   - [Supabase Docs](https://supabase.com/docs)
   - [Vercel Docs](https://vercel.com/docs)
   - [Digistore24 API Docs](https://dev.digistore24.com)

4. **Open an Issue**:
   - Visit: [GitHub Issues](https://github.com/bullpowerhubgit/digistore24-automation/issues)
   - Provide error messages, logs, and steps to reproduce

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] ✅ Supabase project is created and active
- [ ] ✅ Database schema is created successfully
- [ ] ✅ Environment variables are set correctly
- [ ] ✅ Local development server runs without errors
- [ ] ✅ Dashboard displays data correctly
- [ ] ✅ Application is deployed to Vercel
- [ ] ✅ Vercel deployment is accessible online
- [ ] ✅ Digistore24 webhook is configured
- [ ] ✅ Test webhook event is received successfully
- [ ] ✅ Sales data appears in dashboard after webhook event

---

## 🎉 Success!

If you've completed all steps, your Digistore24 Automation Dashboard is now fully set up and ready to use!

**Next Steps**:
- Monitor your sales in real-time on the dashboard
- Set up optional integrations (Discord, Email)
- Customize the dashboard to your needs
- Share feedback or contribute to the project

---

**Need Help?** Open an issue on [GitHub](https://github.com/bullpowerhubgit/digistore24-automation/issues) or check the main [README.md](README.md) for more information.
