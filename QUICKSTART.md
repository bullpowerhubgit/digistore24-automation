# 🚀 Quick Deployment Reference

## Instant Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bullpowerhubgit/digistore24-automation)

## CLI Deployment

```bash
# 1. Install Vercel CLI (one time)
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Set up environment variables (guided)
npm run vercel:setup

# 4. Deploy to production
npm run vercel:deploy
```

## Required Environment Variables

| Variable | Where to Get It |
|----------|-----------------|
| `DIGISTORE24_API_KEY` | Digistore24 → Settings → API Keys |
| `DIGISTORE24_ID` | Your Digistore24 account ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role (secret) |
| `API_SECRET_KEY` | Generate random string (e.g., `openssl rand -base64 32`) |
| `CRON_SECRET` | Generate random string (e.g., `openssl rand -base64 32`) |

### Optional
- `DISCORD_WEBHOOK_URL` - Discord Server → Integrations → Webhooks
- `SENDGRID_API_KEY` - SendGrid Dashboard → API Keys
- `NOTIFICATION_EMAIL` - Your notification email address

## Post-Deployment Setup

1. **Set Digistore24 Webhook**
   - URL: `https://your-project.vercel.app/api/digistore/webhook`
   - Events: `on_payment`, `on_refund`, `on_affiliate_approved`

2. **Create Supabase Tables**
   ```sql
   -- Run in Supabase SQL Editor
   -- See DEPLOYMENT.md for complete SQL
   ```

3. **Verify Deployment**
   - Dashboard: `https://your-project.vercel.app`
   - API: `https://your-project.vercel.app/api/sales?stats=true`

## Useful Commands

```bash
# View deployment logs
vercel logs

# List deployments
vercel ls

# Check environment variables
vercel env ls

# Redeploy latest
vercel --prod

# Open deployment in browser
vercel --prod --open
```

## Need Help?

- 📖 Full Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Issues: [GitHub Issues](https://github.com/bullpowerhubgit/digistore24-automation/issues)
- 📚 Vercel Docs: [vercel.com/docs](https://vercel.com/docs)

---

**Ready to deploy?** Click the "Deploy to Vercel" button above! 🚀
