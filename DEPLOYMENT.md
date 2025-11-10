# SugarFlag - Complete Deployment Guide

**Version:** 1.0
**Last Updated:** November 10, 2025

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Web Application Deployment](#web-application-deployment)
5. [iOS Application Deployment](#ios-application-deployment)
6. [Security Checklist](#security-checklist)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts

- **GitHub** - Source code repository
- **Vercel** / **Railway** / **Heroku** - Web hosting
- **Supabase** / **Railway** / **Neon** - PostgreSQL database
- **Clerk** - Authentication (https://clerk.com)
- **OpenAI** - GPT-4 Vision API (https://platform.openai.com)
- **Stripe** - Payment processing (https://stripe.com)
- **PostHog** - Analytics (https://posthog.com)
- **Cloudflare** - R2 storage (https://cloudflare.com)
- **Apple Developer** - iOS App Store ($99/year)

### Development Tools

- **Node.js** ≥18.17.0
- **npm** or **yarn**
- **PostgreSQL** ≥16.0 (for local development)
- **Xcode** ≥15.0 (for iOS development)
- **Git**

---

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/sugarflag.git
cd sugarflag
```

### 2. Web Application Environment Variables

Create `sugarflag_web/.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/sugarflag?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/scan"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/scan"

# OpenAI
OPENAI_API_KEY="sk-proj-..."

# Stripe
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PREMIUM_PRICE_ID="price_..."
STRIPE_FAMILY_PRICE_ID="price_..."

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY="phc_..."
NEXT_PUBLIC_POSTHOG_HOST="https://us.i.posthog.com"
POSTHOG_API_KEY="phx_..."

# Cloudflare R2
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret"
R2_BUCKET_NAME="sugarflag-photos"
R2_PUBLIC_URL="https://photos.sugarflag.com"

# App Configuration
NEXT_PUBLIC_APP_URL="https://sugarflag.com"
NODE_ENV="production"
```

### 3. iOS Application Configuration

Create `sugarflag_ios/Config.xcconfig`:

```xcconfig
API_BASE_URL = https:/$()/api.sugarflag.com
APP_ENV = production
ENABLE_ANALYTICS = YES
```

Update `sugarflag_ios/Sources/Networking/NetworkManager.swift`:

```swift
// Change from localhost to production URL
private let baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "https://api.sugarflag.com"
```

---

## Database Setup

### 1. Create PostgreSQL Database

**Option A: Supabase (Recommended)**

1. Go to https://supabase.com
2. Create new project
3. Copy database URL
4. Enable pgvector extension in SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

**Option B: Railway**

1. Go to https://railway.app
2. New Project → Add PostgreSQL
3. Copy connection string
4. Connect via GUI and enable pgvector

**Option C: Neon**

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Enable pgvector in console

### 2. Run Migrations

```bash
cd sugarflag_web

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (for production)
npm run db:migrate
```

### 3. Seed Database

```bash
# Seed sweeteners (required)
npm run db:seed

# Seed products (optional but recommended)
npm run db:seed:extended

# Or seed everything
npm run db:seed:all
```

### 4. Verify Database

```bash
npm run db:studio
```

Open http://localhost:5555 and verify:
- `Sweetener` table has 28 entries
- `Product` table has 30+ entries

---

## Web Application Deployment

### Option 1: Vercel (Recommended)

1. **Connect Repository**
   ```bash
   npm i -g vercel
   cd sugarflag_web
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from `.env.local`

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Deploy**
   ```bash
   vercel --prod
   ```

5. **Configure Domain**
   - Add custom domain in Vercel Dashboard
   - Update DNS records
   - Wait for SSL certificate

### Option 2: Railway

1. **Create Project**
   ```bash
   railway login
   railway init
   railway up
   ```

2. **Set Environment Variables**
   ```bash
   railway variables set DATABASE_URL=postgresql://...
   railway variables set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   # ... add all other variables
   ```

3. **Deploy**
   - Push to GitHub
   - Railway auto-deploys on push

### Option 3: Self-Hosted (VPS)

```bash
# On your server
git clone https://github.com/yourusername/sugarflag.git
cd sugarflag/sugarflag_web

# Install dependencies
npm install

# Build
npm run build

# Run with PM2
npm install -g pm2
pm2 start npm --name "sugarflag" -- start
pm2 save
pm2 startup
```

Configure Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name sugarflag.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## iOS Application Deployment

### 1. Xcode Project Setup

1. **Open Project**
   ```bash
   cd sugarflag_ios
   open SugarFlag.xcodeproj
   ```

2. **Configure Signing**
   - Select SugarFlag target
   - Signing & Capabilities
   - Team: Select your Apple Developer account
   - Bundle Identifier: `com.sugarflag.ios`

3. **Update Info.plist**
   - Ensure Info.plist exists at `sugarflag_ios/Info.plist`
   - Verify all usage descriptions are present

4. **Add Capabilities**
   - In-App Purchase
   - Associated Domains: `webcredentials:sugarflag.com`
   - Keychain Sharing: `com.sugarflag.ios`

### 2. Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. My Apps → + → New App
3. Fill in details:
   - Platform: iOS
   - Name: SugarFlag
   - Primary Language: English (U.S.)
   - Bundle ID: `com.sugarflag.ios`
   - SKU: `sugarflag-ios-001`
   - User Access: Full Access

### 3. Configure In-App Purchases

1. In App Store Connect → Your App → In-App Purchases
2. Create two subscriptions:

**Premium Monthly:**
- Reference Name: Premium Monthly
- Product ID: `com.sugarflag.premium.monthly`
- Duration: 1 Month
- Price: $2.99
- Free Trial: 7 days

**Family Monthly:**
- Reference Name: Family Monthly
- Product ID: `com.sugarflag.family.monthly`
- Duration: 1 Month
- Price: $6.99
- Free Trial: 7 days

3. Create Subscription Group: "SugarFlag Subscriptions"
4. Rank: Premium = 1, Family = 2

### 4. Create App Icons

Use `sugarflag_ios/AppStore/SUBMISSION.md` for required sizes.

**Tools:**
- https://appicon.co - Generate all sizes from 1024x1024
- https://www.canva.com - Design icon

**Add to Xcode:**
1. Assets.xcassets → AppIcon
2. Drag and drop each size

### 5. Create Screenshots

Required sizes (see SUBMISSION.md):
- iPhone 6.7": 1290 x 2796 px (7 screenshots)
- iPhone 6.5": 1242 x 2688 px (7 screenshots)

**Tools:**
- https://screenshot.design - Frame screenshots
- https://www.figma.com - Design mockups

### 6. Build and Archive

1. In Xcode:
   - Select "Any iOS Device" as destination
   - Product → Archive
   - Wait for build to complete

2. In Organizer:
   - Select your archive
   - Distribute App
   - App Store Connect
   - Upload
   - Automatic signing
   - Upload

### 7. Submit for Review

1. In App Store Connect:
   - Select your app
   - + Version or Platform → iOS
   - Version: 1.0

2. Fill in metadata (use `AppStore/METADATA.json`):
   - Screenshots
   - Description
   - Keywords
   - Support URL: https://sugarflag.com/support
   - Privacy Policy URL: https://sugarflag.com/privacy

3. App Review Information:
   - Add demo account instructions
   - Add notes from SUBMISSION.md

4. Submit for Review

---

## Security Checklist

### Web Application

- [ ] All environment variables set in production
- [ ] Database uses SSL connections
- [ ] CORS configured correctly
- [ ] Rate limiting enabled on all endpoints
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] Clerk authentication working
- [ ] Stripe webhook signature verification working
- [ ] No API keys in client-side code
- [ ] Error messages don't expose sensitive info
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (React handles this, but verify)

### iOS Application

- [ ] API endpoints use HTTPS only
- [ ] Certificate pinning implemented (optional but recommended)
- [ ] Keychain access configured correctly
- [ ] Face ID/Touch ID working
- [ ] WebAuthn/passkeys working
- [ ] In-App Purchase receipt validation
- [ ] No hardcoded secrets in code
- [ ] Proper error handling (no crashes)
- [ ] Network requests use authentication tokens
- [ ] Photo encryption working before upload

### Infrastructure

- [ ] Database backups configured
- [ ] SSL certificates valid and auto-renewing
- [ ] DDoS protection enabled (Cloudflare)
- [ ] Monitoring and alerting configured
- [ ] Logs don't contain sensitive data
- [ ] Access logs enabled
- [ ] Admin access secured (2FA enabled)

---

## Stripe Webhook Setup

1. **Get Webhook Endpoint URL**
   ```
   https://sugarflag.com/api/webhooks/stripe
   ```

2. **Configure in Stripe Dashboard**
   - Go to https://dashboard.stripe.com/webhooks
   - Add endpoint
   - URL: `https://sugarflag.com/api/webhooks/stripe`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

3. **Copy Webhook Secret**
   - Copy signing secret (starts with `whsec_`)
   - Add to environment variables as `STRIPE_WEBHOOK_SECRET`

4. **Test Webhook**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

---

## Monitoring & Maintenance

### PostHog Analytics

1. Dashboard: https://app.posthog.com
2. Key metrics to monitor:
   - Daily Active Users (DAU)
   - Scan completion rate
   - Subscription conversion rate
   - Error rate
   - API response times

### Database Maintenance

```bash
# Weekly backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Vacuum (cleanup)
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size('sugarflag'));"
```

### Logs

**Vercel:**
```bash
vercel logs
```

**Railway:**
```bash
railway logs
```

**Self-hosted:**
```bash
pm2 logs sugarflag
```

### Alerts

Set up alerts for:
- Error rate > 1%
- API response time > 2s
- Database CPU > 80%
- Disk usage > 85%
- SSL certificate expiring < 30 days

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL -c "SELECT NOW();"

# Check for connection limit
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"

# Fix: Increase connection pool size in Prisma
# In prisma/schema.prisma:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

### OpenAI API Errors

- **429 (Rate Limit)**: Upgrade plan or implement exponential backoff (already implemented)
- **401 (Unauthorized)**: Check API key
- **500 (Server Error)**: Circuit breaker will handle (already implemented)

### Stripe Webhook Not Working

```bash
# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

### iOS Build Errors

- **Signing errors**: Check Developer account, certificates, and provisioning profiles
- **Missing frameworks**: Clean build folder (⇧⌘K), rebuild
- **Archiving fails**: Check deployment target (iOS 16.0+)

### Rate Limit Issues

Increase limits in `lib/rate-limit.ts`:

```typescript
export const rateLimiters = {
  api: new RateLimiter({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 1000, // Increase from 500
  }),
}
```

---

## Performance Optimization

### Database Indexes

Already created in schema, but verify:

```sql
CREATE INDEX idx_product_upc ON "Product"(upc);
CREATE INDEX idx_scan_user ON "Scan"("userId");
CREATE INDEX idx_scan_created ON "Scan"("createdAt" DESC);
```

### Image Optimization

Web automatically uses Next.js Image component.

For iOS, ensure images are compressed:

```swift
let data = image.jpegData(compressionQuality: 0.8)
```

### Caching

**Web (Vercel):**
- Static assets cached automatically
- API routes: Add Cache-Control headers

```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  },
})
```

**iOS:**
- Use URLCache for network requests (already configured)
- Implement CoreData for offline caching (future enhancement)

---

## Cost Estimates

### Monthly Costs (estimated for 1000 users)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Database (Supabase) | Pro | $25 |
| Clerk | Pro | $25 |
| OpenAI API | Pay-as-go | $50-200 |
| Stripe | Transaction fees | 2.9% + $0.30 |
| PostHog | Startup | $0-50 |
| Cloudflare R2 | Pay-as-go | $5-15 |
| **Total** | | **$125-335/month** |

### Revenue (1000 users, 20% conversion)

- 200 Premium @ $2.99/mo = $598/month
- **Net profit**: $263-473/month

---

## Support & Documentation

- **Web App**: https://sugarflag.com
- **Support Email**: support@sugarflag.com
- **Privacy Policy**: https://sugarflag.com/privacy
- **Terms of Service**: https://sugarflag.com/terms
- **API Documentation**: https://docs.sugarflag.com (create with Swagger/OpenAPI)
- **Status Page**: https://status.sugarflag.com (use https://statuspage.io)

---

## Post-Launch Checklist

- [ ] Announce on social media (Twitter, LinkedIn, Product Hunt)
- [ ] Submit to Product Hunt
- [ ] Email beta users
- [ ] Create demo video
- [ ] Write blog post
- [ ] Update README with live links
- [ ] Set up Google Analytics (optional, in addition to PostHog)
- [ ] Create help documentation/FAQ
- [ ] Set up customer support (Intercom/Zendesk)
- [ ] Monitor for first 48 hours continuously
- [ ] Collect user feedback
- [ ] Plan v1.1 features

---

**Last Updated:** November 10, 2025
**Maintained By:** SugarFlag Development Team
**Questions?** support@sugarflag.com
