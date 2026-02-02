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
- **Database:** Supabase
- **Deployment:** Vercel
- **API:** Digistore24 REST API

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/bullpowerhubgit/digistore24-automation.git
cd digistore24-automation

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

## 🔑 Environment Variables

Create a `.env.local` file with the following:

```env
# Digistore24
DIGISTORE24_API_KEY=your_api_key_here
DIGISTORE24_ID=your_digistore_id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Discord (optional)
DISCORD_WEBHOOK_URL=your_discord_webhook

# Email (optional)
SENDGRID_API_KEY=your_sendgrid_key
NOTIFICATION_EMAIL=your@email.com

# API Security
API_SECRET_KEY=your_secret_key_for_api_authentication

# Vercel Cron Job Authentication
CRON_SECRET=your_cron_secret_for_vercel_authentication
```

## 🚀 Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bullpowerhubgit/digistore24-automation)

**Complete deployment guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed step-by-step instructions.

## 🔧 Setup Guide

### 1. Get Digistore24 API Key

1. Login to your [Digistore24 account](https://www.digistore24.com)
2. Go to **Settings** → **Account Access** → **API Keys**
3. Click **New API Key**
4. Name it "Automation" and select **Full Access**
5. Copy the API key

### 2. Setup Webhooks

1. In Digistore24, go to **Settings** → **Integrations (IPN)**
2. Click **Add new connection** → **Webhook**
3. Enter your webhook URL: `https://your-domain.vercel.app/api/digistore/webhook`
4. Select events: `on_payment`, `on_refund`, `on_affiliate_approved`
5. Save the webhook

### 3. Setup Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Run the database schema:

```sql
-- Sales table
create table sales (
  id uuid default uuid_generate_v4() primary key,
  order_id text unique not null,
  product_name text,
  amount decimal(10,2),
  buyer_email text,
  buyer_name text,
  affiliate_id text,
  status text,
  created_at timestamp with time zone default now()
);

-- Affiliates table
create table affiliates (
  id uuid default uuid_generate_v4() primary key,
  affiliate_id text unique not null,
  name text,
  email text,
  total_sales integer default 0,
  total_commission decimal(10,2) default 0,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table sales enable row level security;
alter table affiliates enable row level security;

-- Create policies
create policy "Allow service role full access" on sales
  for all using (true);
create policy "Allow service role full access" on affiliates
  for all using (true);
```

3. Copy your Supabase URL and keys to `.env.local`

### 4. Deploy to Vercel

**📖 Complete Deployment Guide:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive step-by-step instructions.

**Quick Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bullpowerhubgit/digistore24-automation)

Or via CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

**Note:** The project includes a pre-configured `vercel.json` with cron jobs and optimized settings. Environment variables must be configured in Vercel Dashboard.

### 5. Verify Deployment

After deploying to Vercel:

1. Visit your deployment URL: `https://your-project.vercel.app`
2. Check the dashboard displays correctly
3. Verify the webhook endpoint: `https://your-project.vercel.app/api/digistore/webhook`
4. Check cron job is active in Vercel Dashboard → Settings → Cron Jobs

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

### Webhook not receiving events
- Verify webhook URL is correct in Digistore24
- Check that URL is accessible (not localhost)
- Ensure events are selected in webhook settings

### API errors
- Verify API key is correct
- Check API permissions (should be Full Access)
- Check rate limits

### Database connection issues
- Verify Supabase credentials
- Check Row Level Security policies
- Ensure service role key is used for admin operations

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check [Digistore24 API docs](https://dev.digistore24.com)
- Contact: [your-email@example.com]

## 🎉 Roadmap

- [ ] Add more notification channels (Telegram, Slack)
- [ ] Advanced analytics and forecasting
- [ ] Multi-currency support
- [ ] Affiliate dashboard
- [ ] Mobile app
- [ ] AI-powered insights

---

**Built with ❤️ for the Digistore24 community**
