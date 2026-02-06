# 🔐 Supabase Integration Guide

Complete guide for setting up and using Supabase with the Digistore24 Automation Suite.

## 📋 Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Authentication](#authentication)
- [Database Queries](#database-queries)
- [Real-time Subscriptions](#real-time-subscriptions)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This project uses [Supabase](https://supabase.com) as its backend database and authentication provider. Supabase provides:

- **PostgreSQL Database** - Reliable, scalable database
- **Authentication** - Built-in user authentication
- **Real-time Subscriptions** - Live data updates
- **Row Level Security** - Database-level security policies
- **RESTful API** - Auto-generated API from your schema

---

## 📦 Installation

### 1. Install Dependencies

The Supabase JavaScript client is already included in the project dependencies:

```bash
npm install
```

This will install `@supabase/supabase-js` along with other dependencies.

### 2. Verify Installation

Check that the Supabase package is installed:

```bash
npm list @supabase/supabase-js
```

You should see:
```
@supabase/supabase-js@2.39.0
```

---

## ⚙️ Configuration

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in project details:
   - **Name**: `digistore24-automation` (or your preferred name)
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Select closest to your users
4. Click **"Create new project"**
5. Wait for project to be provisioned (2-3 minutes)

### 2. Get Supabase Credentials

Once your project is ready:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy the following values:

| Field | Environment Variable | Description |
|-------|---------------------|-------------|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` | Your unique Supabase project URL |
| **anon public** | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public API key for client-side operations |
| **service_role** | `SUPABASE_SERVICE_ROLE_KEY` | Secret key for server-side operations (keep secure!) |

### 3. Configure Environment Variables

#### For Local Development:

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### For Production (Vercel):

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all three variables above
4. Make sure to add them for all environments: **Production**, **Preview**, and **Development**
5. Click **"Save"**
6. Redeploy your application to apply changes

---

## 🗄️ Database Setup

### 1. Create Database Tables

In your Supabase project, go to **SQL Editor** and run this SQL:

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

-- Create indexes for better query performance
CREATE INDEX idx_sales_order_id ON sales(order_id);
CREATE INDEX idx_sales_created_at ON sales(created_at DESC);
CREATE INDEX idx_sales_affiliate_id ON sales(affiliate_id);
CREATE INDEX idx_affiliates_affiliate_id ON affiliates(affiliate_id);

-- Enable Row Level Security
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Create policies (allow service role full access)
CREATE POLICY "Allow service role full access" ON sales
  FOR ALL USING (true);

CREATE POLICY "Allow service role full access" ON affiliates
  FOR ALL USING (true);
```

### 2. Verify Tables

1. Go to **Table Editor** in Supabase dashboard
2. You should see two tables: `sales` and `affiliates`
3. Click on each table to verify the schema

### 3. Optional: Add Sample Data

You can add test data for development:

```sql
-- Insert sample sales
INSERT INTO sales (order_id, product_name, amount, buyer_email, buyer_name, status) VALUES
  ('ORDER-001', 'Premium Course', 99.99, 'john@example.com', 'John Doe', 'completed'),
  ('ORDER-002', 'Basic Course', 49.99, 'jane@example.com', 'Jane Smith', 'completed'),
  ('ORDER-003', 'Pro Bundle', 199.99, 'bob@example.com', 'Bob Johnson', 'completed');

-- Insert sample affiliates
INSERT INTO affiliates (affiliate_id, name, email, total_sales, total_commission) VALUES
  ('AFF-001', 'Alice Partner', 'alice@example.com', 5, 250.00),
  ('AFF-002', 'Bob Marketer', 'bob@example.com', 3, 150.00);
```

---

## 🔐 Authentication

The project includes complete authentication examples in `/examples/supabase-auth.ts`.

### Client Setup

For client-side operations (browser):

```typescript
import { createClientSupabaseClient } from '@/lib/supabase';

const supabase = createClientSupabaseClient();
```

### Server Setup

For server-side operations (API routes, server components):

```typescript
import { createServerSupabaseClient } from '@/lib/supabase';

const supabase = createServerSupabaseClient();
```

### Sign Up

```typescript
import { signUpWithEmail } from '@/examples/supabase-auth';

// Create new user account
const { user, session } = await signUpWithEmail(
  'user@example.com',
  'secure-password-123'
);

console.log('User created:', user.email);
```

### Sign In

```typescript
import { signInWithEmail } from '@/examples/supabase-auth';

// Sign in existing user
const { user, session } = await signInWithEmail(
  'user@example.com',
  'secure-password-123'
);

console.log('Logged in:', user.email);
console.log('Session token:', session.access_token);
```

### Sign Out

```typescript
import { signOut } from '@/examples/supabase-auth';

// Sign out current user
await signOut();
console.log('User signed out');
```

### Get Current User

```typescript
import { getCurrentUser, getSession } from '@/examples/supabase-auth';

// Get current user
const user = await getCurrentUser();
if (user) {
  console.log('Current user:', user.email);
} else {
  console.log('No user logged in');
}

// Get current session
const session = await getSession();
if (session) {
  console.log('Session expires at:', session.expires_at);
}
```

### Password Reset

```typescript
import { sendPasswordResetEmail, updatePassword } from '@/examples/supabase-auth';

// Send password reset email
await sendPasswordResetEmail('user@example.com');

// Update password (after user is authenticated)
await updatePassword('new-secure-password');
```

### Auth State Listener

```typescript
import { onAuthStateChange } from '@/examples/supabase-auth';

// Listen to auth changes
const unsubscribe = onAuthStateChange((event, session) => {
  console.log('Auth event:', event); // 'SIGNED_IN', 'SIGNED_OUT', etc.
  console.log('Session:', session);
  
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user.email);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});

// Later: cleanup
unsubscribe();
```

---

## 📊 Database Queries

The project includes comprehensive query examples in `/examples/supabase-queries.ts`.

### Save a Sale

```typescript
import { saveSale } from '@/lib/supabase';

const sale = await saveSale({
  order_id: 'ORDER-12345',
  product_name: 'Premium Course',
  amount: 99.99,
  buyer_email: 'customer@example.com',
  buyer_name: 'John Doe',
  affiliate_id: 'AFF-001',
  status: 'completed',
});

console.log('Sale saved:', sale);
```

### Get Sales (with Pagination)

```typescript
import { getSales } from '@/lib/supabase';

const { data, count } = await getSales({
  limit: 20,
  page: 1,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
});

console.log(`Found ${count} total sales`);
console.log('Sales:', data);
```

### Get Sales Statistics

```typescript
import { getSalesStats } from '@/lib/supabase';

const stats = await getSalesStats();

console.log('Today:', stats.today);      // { revenue: 500, count: 5 }
console.log('Week:', stats.week);        // { revenue: 2500, count: 25 }
console.log('Month:', stats.month);      // { revenue: 10000, count: 100 }
console.log('Total:', stats.total);      // { revenue: 50000, count: 500 }
```

### Advanced Queries

#### Filtering

```typescript
const supabase = createServerSupabaseClient();

// Get completed sales over $50
const { data, error } = await supabase
  .from('sales')
  .select('*')
  .eq('status', 'completed')
  .gte('amount', 50)
  .order('created_at', { ascending: false });
```

#### Search

```typescript
// Search in multiple fields
const { data, error } = await supabase
  .from('sales')
  .select('*')
  .or('product_name.ilike.%premium%,buyer_name.ilike.%premium%');
```

#### Aggregation

```typescript
// Count and sum
const { data } = await supabase
  .from('sales')
  .select('amount');

const totalRevenue = data?.reduce((sum, sale) => sum + Number(sale.amount), 0);
console.log('Total revenue:', totalRevenue);
```

#### Bulk Insert

```typescript
const salesData = [
  { order_id: 'ORDER-001', amount: 29.99, status: 'completed' },
  { order_id: 'ORDER-002', amount: 49.99, status: 'completed' },
];

const { data, error } = await supabase
  .from('sales')
  .insert(salesData)
  .select();
```

#### Update

```typescript
// Update a sale
const { data, error } = await supabase
  .from('sales')
  .update({ status: 'refunded' })
  .eq('order_id', 'ORDER-12345')
  .select()
  .single();
```

#### Delete

```typescript
// Delete a sale
const { error } = await supabase
  .from('sales')
  .delete()
  .eq('order_id', 'ORDER-12345');
```

---

## ⚡ Real-time Subscriptions

Subscribe to database changes in real-time.

### Subscribe to New Sales

```typescript
import { createClientSupabaseClient } from '@/lib/supabase';

const supabase = createClientSupabaseClient();

// Subscribe to INSERT events
const subscription = supabase
  .channel('sales-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'sales',
    },
    (payload) => {
      console.log('New sale:', payload.new);
      // Update UI, send notification, etc.
    }
  )
  .subscribe();

// Later: unsubscribe
subscription.unsubscribe();
```

### Subscribe with Filters

```typescript
// Only listen to high-value sales
const subscription = supabase
  .channel('high-value-sales')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'sales',
      filter: 'amount=gte.100',
    },
    (payload) => {
      console.log('High-value sale:', payload.new);
    }
  )
  .subscribe();
```

### Subscribe to All Changes

```typescript
// Listen to INSERT, UPDATE, and DELETE
const subscription = supabase
  .channel('all-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'sales',
    },
    (payload) => {
      console.log('Change type:', payload.eventType);
      console.log('Data:', payload.new || payload.old);
    }
  )
  .subscribe();
```

---

## ✅ Best Practices

### 1. Use Server Client for Sensitive Operations

```typescript
// ❌ Don't use client for admin operations
const supabase = createClientSupabaseClient();
await supabase.from('sales').delete().eq('id', saleId);

// ✅ Use server client for admin operations
const supabase = createServerSupabaseClient();
await supabase.from('sales').delete().eq('id', saleId);
```

### 2. Handle Errors Properly

```typescript
// ❌ Don't ignore errors
const { data } = await supabase.from('sales').select('*');

// ✅ Always check for errors
const { data, error } = await supabase.from('sales').select('*');
if (error) {
  console.error('Database error:', error.message);
  throw new Error('Failed to fetch sales');
}
```

### 3. Use TypeScript Types

```typescript
import { Sale, Affiliate } from '@/lib/types';

// ✅ Type-safe operations
const sale: Sale = await saveSale({
  order_id: 'ORDER-001',
  amount: 99.99,
  // TypeScript will catch missing required fields
});
```

### 4. Optimize Queries

```typescript
// ❌ Fetching too much data
const { data } = await supabase.from('sales').select('*');

// ✅ Select only needed columns
const { data } = await supabase
  .from('sales')
  .select('order_id, amount, created_at')
  .limit(10);
```

### 5. Use Pagination

```typescript
// ✅ Always use pagination for large datasets
const { data, count } = await getSales({
  limit: 50,
  page: 1,
});
```

### 6. Secure Environment Variables

```env
# ❌ Don't commit these to git
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=secret-key

# ✅ Keep .env.local in .gitignore
# ✅ Use .env.example with placeholders
```

---

## 🐛 Troubleshooting

### Connection Issues

**Problem**: "Missing Supabase environment variables"

**Solution**: 
- Verify `.env.local` exists and has all required variables
- Check variable names match exactly: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Restart development server after changing env vars

### Authentication Errors

**Problem**: "Invalid login credentials"

**Solution**:
- Verify email and password are correct
- Check if email confirmation is required (Supabase → Authentication → Settings)
- Ensure user exists in Supabase dashboard

### Row Level Security Errors

**Problem**: "Row level security policy violation"

**Solution**:
- Verify RLS policies are set up correctly
- Use service role key for server-side operations
- Check policies in Supabase → Authentication → Policies

### Query Performance Issues

**Problem**: Slow database queries

**Solution**:
- Add indexes on frequently queried columns
- Use pagination to limit results
- Select only needed columns
- Check query execution plan in Supabase dashboard

### Real-time Not Working

**Problem**: Subscriptions not receiving updates

**Solution**:
- Verify database tables have replication enabled
- Check Supabase → Database → Replication
- Ensure subscription is active before data changes
- Use client-side Supabase client for subscriptions

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

---

## 🎯 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Set up Supabase project
3. ✅ Configure environment variables
4. ✅ Create database tables
5. ✅ Test authentication
6. ✅ Try example queries
7. ✅ Set up real-time subscriptions
8. 🚀 Build your application!

---

**Need help?** Check the [main README](../README.md) or [SETUP guide](../SETUP.md) for more information.
