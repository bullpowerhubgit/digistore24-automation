# Supabase Examples

This directory contains comprehensive examples for using Supabase with the Digistore24 Automation Suite.

## 📁 Files

- **`supabase-auth.ts`** - Authentication examples (sign up, sign in, sign out, password reset)
- **`supabase-queries.ts`** - Database query examples (CRUD operations, filtering, real-time subscriptions)

## 🚀 Usage

These examples are meant to be imported and used in your Next.js application:

### Authentication Example

```typescript
import { signUpWithEmail, signInWithEmail, getCurrentUser } from '@/examples/supabase-auth';

// Sign up a new user
const { user } = await signUpWithEmail('user@example.com', 'secure-password');

// Sign in
await signInWithEmail('user@example.com', 'secure-password');

// Get current user
const currentUser = await getCurrentUser();
console.log('Current user:', currentUser);
```

### Database Query Example

```typescript
import { exampleSaveSale, exampleGetSalesStats } from '@/examples/supabase-queries';

// Save a sale
await exampleSaveSale();

// Get sales statistics
const stats = await exampleGetSalesStats();
console.log('Stats:', stats);
```

## 📚 Documentation

For a complete guide on Supabase integration, see [Supabase Integration Guide](../docs/SUPABASE_INTEGRATION.md).

## ⚙️ Prerequisites

Before using these examples:

1. Install dependencies: `npm install`
2. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Create database tables in Supabase (see [Supabase Integration Guide](../docs/SUPABASE_INTEGRATION.md#database-setup))

## 🔍 Testing

To test if the examples work:

1. Import the functions in your API routes or pages
2. Call them with appropriate parameters
3. Check the console output and database for results

Example in an API route:

```typescript
// app/api/test/route.ts
import { NextResponse } from 'next/server';
import { exampleGetSalesStats } from '@/examples/supabase-queries';

export async function GET() {
  try {
    const stats = await exampleGetSalesStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

## ⚠️ Important Notes

- These are **example functions** for learning and reference
- Adapt them to your specific use cases
- Always handle errors appropriately in production code
- Never commit sensitive data or credentials
- Use server-side Supabase client for admin operations
- Use client-side Supabase client for user-facing features

## 🎯 Learn More

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
