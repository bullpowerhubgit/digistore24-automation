# 🚀 Digistore24 Automation Suite

Complete automation suite for Digistore24 with Next.js 14, TypeScript, and real-time webhooks.

## ✨ Features

- 🔄 **Real-time Webhooks** - Instant notifications for sales, refunds, and affiliates
- 📊 **Sales Dashboard** - Visual analytics and reporting
- 💾 **Supabase Integration** - Automatic data storage and sync
- 🔔 **Discord Notifications** - Get notified on every sale
- 📧 **Automated Reports** - Daily/weekly email reports
- ⏰ **Cron Jobs** - Scheduled data synchronization
- 📈 **Google Sheets Export** - Automatic data export
- 🔐 **Secure API** - API key authentication

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Deployment:** Vercel
- **API:** Digistore24 REST API

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18.0+** installed ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))
- **Supabase account** ([Sign up free](https://supabase.com))
- **Vercel account** ([Sign up free](https://vercel.com))
- **Digistore24 account** ([Sign up](https://www.digistore24.com))

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/bullpowerhubgit/digistore24-automation.git
cd digistore24-automation

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local
```

### 2. Set Up Supabase Database

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database schema** in your Supabase SQL Editor:
   - Go to SQL Editor in your Supabase dashboard
   - Copy the schema from the section below or from the detailed setup guide
   - Execute the SQL to create tables
3. **[Optional] Import demo data**: Run `supabase/seed.sql` to get 20 sample sales

### 3. Configure Environment Variables

Open `.env.local` and update with your credentials:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_from_supabase
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase

# Digistore24 (Optional - for webhook integration)
DIGISTORE24_API_KEY=your_api_key_here
DIGISTORE24_ID=your_digistore_id

# Discord Notifications (Optional)
DISCORD_WEBHOOK_URL=your_discord_webhook

# Email Reports (Optional)
SENDGRID_API_KEY=your_sendgrid_key
NOTIFICATION_EMAIL=your@email.com

# Affiliate Commission Rate (Default: 20%)
AFFILIATE_COMMISSION_RATE=0.2
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard!

---

## 📘 Detailed Setup Guide

For complete step-by-step instructions including:
- Supabase database setup
- Vercel deployment
- Digistore24 webhook configuration
- Troubleshooting tips

**👉 See [SETUP.md](SETUP.md) for the full setup guide**

---

## 🗄️ Database Schema

Run this SQL in your Supabase SQL Editor to create the required tables:

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

### Import Demo Data

To test the dashboard with sample data, run the SQL from `supabase/seed.sql`. This will create:
- 20 sample sales with German product names
- 3 sample affiliate accounts
- Realistic sales data from the last 30 days

## 🔧 Setup Guide

### 1. Get Digistore24 API Key

1. Login to your [Digistore24 account](https://www.digistore24.com)
2. Go to **Settings** → **Account Access** → **API Keys**
3. Click **New API Key**
4. Name it "Automation" and select **Full Access**
5. Copy the API key and save it securely

### 2. Setup Webhooks

Configure Digistore24 to send events to your application:

1. In Digistore24, go to **Settings** → **Integrations (IPN)**
2. Click **Add new connection** → **Webhook**
3. Enter your webhook URL: `https://your-domain.vercel.app/api/digistore/webhook`
4. Select events:
   - ✅ `on_payment` (New sale)
   - ✅ `on_refund` (Refund processed)
   - ✅ `on_affiliate_approved` (New affiliate)
5. Save the webhook
6. Test using the "Test" button in Digistore24

### 3. Setup Supabase

Complete Supabase setup instructions:

1. Create a new project on [Supabase](https://supabase.com)
2. Copy your Project URL and API keys from Settings → API
3. Run the database schema (see [Database Schema](#-database-schema) section above)
4. [Optional] Import demo data from `supabase/seed.sql`
5. Copy your credentials to `.env.local`

**Need detailed instructions?** See [SETUP.md](SETUP.md)

### 4. Deploy to Vercel

#### Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
# Add other environment variables as needed

# Deploy to production
vercel --prod
```

#### Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables in the project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Other optional variables
4. Deploy!

**Note**: The `vercel.json` file is already configured with environment variable references and cron jobs.

### 5. Configure Digistore24 Webhook

After deploying to Vercel:

1. Copy your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Go back to Digistore24 webhook settings
3. Update the webhook URL to: `https://your-app.vercel.app/api/digistore/webhook`
4. Save and test the connection

## 📁 Project Structure

```
digistore24-automation/
├── app/
│   ├── api/
│   │   ├── digistore/
│   │   │   ├── webhook/route.ts
│   │   │   ├── sales/route.ts
│   │   │   └── stats/route.ts
│   │   └── cron/
│   │       ├── daily-report/route.ts
│   │       └── sync-data/route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   └── page.tsx
├── lib/
│   ├── digistore.ts
│   ├── supabase.ts
│   ├── notifications.ts
│   └── types.ts
├── components/
│   ├── SalesChart.tsx
│   ├── StatsCard.tsx
│   └── SalesTable.tsx
└── README.md
```

## 🔌 API Endpoints

### Webhook Handler
`POST /api/digistore/webhook`

Receives Digistore24 events and processes them automatically.

### Get Sales
`GET /api/digistore/sales?limit=50&page=1`

Fetch sales data with pagination.

### Get Statistics
`GET /api/digistore/stats`

Get sales statistics (today, week, month, total).

### Daily Report
`GET /api/cron/daily-report`

Generate and send daily sales report.

### Sync Data
`GET /api/cron/sync-data`

Sync data from Digistore24 to Supabase.

## 🎯 Usage Examples

### Fetching Sales Programmatically

```typescript
import { DigistoreClient } from '@/lib/digistore';

const client = new DigistoreClient(process.env.DIGISTORE24_API_KEY!);

// Get recent sales
const sales = await client.listPurchases({
  limit: 10,
  page: 1
});

console.log(sales);
```

### Custom Webhook Handler

```typescript
// app/api/digistore/webhook/route.ts
import { NextResponse } from 'next/server';
import { processWebhookEvent } from '@/lib/webhook-handler';

export async function POST(request: Request) {
  const event = await request.json();
  
  await processWebhookEvent(event);
  
  return NextResponse.json({ success: true });
}
```

## 📊 Dashboard

Access your dashboard at `/dashboard` to view:

- Real-time sales metrics
- Revenue charts
- Recent transactions
- Affiliate performance
- Conversion rates

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🐛 Troubleshooting

### Common Issues

#### "Missing Supabase environment variables"
- **Cause**: Environment variables not set correctly
- **Solution**: 
  1. Verify `.env.local` exists with correct values
  2. Restart dev server: `npm run dev`
  3. Check [SETUP.md](SETUP.md) for detailed instructions

#### Dashboard Shows No Data
- **Cause**: No sales in database
- **Solution**: Import demo data from `supabase/seed.sql`

#### Webhook Not Receiving Events
- **Causes & Solutions**:
  1. **URL not accessible**: Ensure Vercel deployment is live
  2. **Wrong URL**: Verify webhook URL in Digistore24 matches your Vercel deployment
  3. **Events not selected**: Check `on_payment` and `on_refund` are enabled

#### Database Connection Issues
- **Solutions**:
  1. Verify Supabase credentials in environment variables
  2. Check Row Level Security policies are created
  3. Ensure service role key is used (not anon key) for server operations
  4. Verify Supabase project is active (not paused)

#### Build Fails on Vercel
- **Solutions**:
  1. Run `npm run build` locally first to catch errors
  2. Ensure all environment variables are added to Vercel
  3. Check TypeScript errors and fix them
  4. Verify `package.json` and `package-lock.json` are up to date

### Get More Help

For detailed troubleshooting steps and solutions:
- 📖 **Read [SETUP.md](SETUP.md)** - Complete troubleshooting guide
- 🐛 **Open an issue** on [GitHub Issues](https://github.com/bullpowerhubgit/digistore24-automation/issues)
- 📚 **Check documentation**:
  - [Next.js Docs](https://nextjs.org/docs)
  - [Supabase Docs](https://supabase.com/docs)
  - [Digistore24 API](https://dev.digistore24.com)

## 📞 Support

Need help? Here's how to get support:

- 📖 **Documentation**: Start with [SETUP.md](SETUP.md) for detailed setup instructions
- 🐛 **Issues**: Open an issue on [GitHub](https://github.com/bullpowerhubgit/digistore24-automation/issues)
- 📚 **API Docs**: Check [Digistore24 API documentation](https://dev.digistore24.com)
- 💬 **Discussions**: Use GitHub Discussions for questions and community support

## 📁 Important Files

- **[SETUP.md](SETUP.md)** - Complete step-by-step setup guide with troubleshooting
- **[.env.local.example](.env.local.example)** - Environment variables template
- **[supabase/seed.sql](supabase/seed.sql)** - Demo data for testing (20 sample sales)
- **[vercel.json](vercel.json)** - Vercel deployment configuration
- **[SECURITY.md](SECURITY.md)** - Security considerations and best practices

## 🎉 Roadmap

- [ ] Add more notification channels (Telegram, Slack)
- [ ] Advanced analytics and forecasting
- [ ] Multi-currency support
- [ ] Affiliate dashboard
- [ ] Mobile app
- [ ] AI-powered insights

---

**Built with ❤️ for the Digistore24 community**
