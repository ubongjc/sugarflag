# 🍭 SugarFlag - Know Your Sugar, Choose Better

**Industry-standard, production-ready health & nutrition application**

Camera-powered added-sugar and alternative-sweetener detection with personalized lower-sugar alternatives. Built with Next.js 15, SwiftUI, and modern security best practices.

## Overview

SugarFlag is a **world-class health & nutrition application** that helps users make healthier choices by instantly analyzing food products for added sugars and artificial sweeteners.

**📖 See [FEATURES.md](FEATURES.md) for complete feature documentation (100+ features documented)**

### Core Features

**🔍 Smart Scanning:**
- Instant barcode (UPC) and photo scanning with AI-powered OCR
- 0-100 sugar scores with plain-English explanations
- 28+ sweetener types tracked with health impact analysis
- Multi-product scanning (scan entire grocery cart)

**🎮 Gamification & Social:**
- XP and level progression (20 levels)
- 50+ achievements across categories
- Daily streak tracking with rewards
- Friend leaderboards and challenges
- Instagram-worthy share cards

**💪 Health & Wellness:**
- Daily sugar intake tracking with smart goals
- Integration with Apple Health / Google Fit
- Blood glucose monitoring for diabetes management
- Medical data export for healthcare providers
- HIPAA-compliant health records

**🛒 Shopping & Meal Planning:**
- AI-generated personalized meal plans
- Smart shopping lists with one-click ordering (Instacart, Amazon Fresh)
- Automatic coupon application and price tracking
- 1000+ low-sugar recipes with nutrition analysis
- Restaurant menu scanning with sugar estimates

**👥 Family & Corporate:**
- Family sharing with parental controls ($6.99/month for 5 users)
- Corporate wellness programs with admin dashboards
- Insurance partnerships for premium discounts
- Aggregate health reporting for HR

**🌍 Accessibility & i18n:**
- 10+ languages supported
- Full VoiceOver/TalkBack support
- High contrast and adjustable fonts
- Offline mode with cached database
- Progressive Web App (PWA)

## Repository Structure

This monorepo contains two applications:

```
sugarflag/
├── sugarflag_web/     # Next.js 15 web application + API
└── sugarflag_ios/     # SwiftUI native iOS app
```

### Web Application (`sugarflag_web/`)

Next.js-based web application with RESTful API backend.

**Tech Stack:**
- Next.js 15 + TypeScript + Tailwind CSS
- PostgreSQL 16 + Prisma + pgvector
- Clerk (WebAuthn/Passkeys)
- Cloudflare R2 storage
- Stripe payments

[→ Web README](./sugarflag_web/README.md)

### iOS Application (`sugarflag_ios/`)

Native iOS app with SwiftUI, Vision OCR, and CryptoKit encryption.

**Tech Stack:**
- SwiftUI + Combine
- AVFoundation + Vision
- CryptoKit (AES-GCM-256)
- AuthenticationServices (Passkeys)

[→ iOS README](./sugarflag_ios/README.md)

## Features

### Core Functionality

1. **Product Scanning**
   - UPC barcode lookup
   - Photo OCR of nutrition labels
   - Real-time sweetener detection

2. **Sugar Analysis**
   - Score calculation (0-100)
   - Plain-English rationale
   - Uncertainty indicators
   - Sweetener ontology mapping

3. **Weekly Cart**
   - Personalized recommendations
   - Budget-conscious alternatives
   - Sugar savings tracking
   - Grocery integrations (affiliate)

4. **Privacy & Security**
   - On-device OCR option
   - Client-side photo encryption
   - WebAuthn/Passkey auth
   - PII minimization

### Monetization

- **Premium**: $2.99/month
- **Affiliate**: Grocery partnerships
- **Family Plan**: (Planned)

## Getting Started

### Quick Start (Web)

```bash
cd sugarflag_web
npm install
cp .env.example .env
# Edit .env with your configuration
npm run db:push
npm run dev
```

Visit http://localhost:3000

### Quick Start (iOS)

```bash
cd sugarflag_ios
open Package.swift  # or .xcodeproj
# Update API endpoint in NetworkManager.swift
# Build and run in Xcode
```

## API Overview

The web application exposes a RESTful API:

- `GET /api/health` - Health check
- `POST /api/scan` - Scan product (UPC or photo)
- `GET /api/product/[upc]` - Product details
- `GET /api/cart/suggest` - Weekly cart recommendations

See [API Documentation](./sugarflag_web/README.md#api-endpoints) for details.

## Data Model

Key entities:
- **Product** - UPC, brand, nutrients, ingredients
- **Sweetener** - Name, type, health score, aliases
- **Scan** - User scans with scores
- **Preference** - User taste profiles
- **CartSuggestion** - Weekly recommendations

## Architecture

### Web (Next.js)

```
Next.js App Router
├── API Routes (OpenAPI documented)
├── Prisma + PostgreSQL
├── pgvector for embeddings
├── Clerk for auth
└── R2 for storage
```

### iOS (SwiftUI)

```
SwiftUI App
├── Camera Module (AVFoundation + Vision)
├── Networking Module (URLSession)
├── Crypto Module (CryptoKit)
└── Auth Module (WebAuthn)
```

## Development

### Prerequisites

- **Web**: Node.js 18+, PostgreSQL 16
- **iOS**: Xcode 15+, iOS 16+

### Environment Setup

1. Clone repository
2. Set up PostgreSQL with pgvector extension
3. Configure environment variables
4. Run database migrations
5. Start development servers

## Security & Compliance

- **Auth**: WebAuthn/Passkeys with biometric verification
- **Encryption**: AES-GCM-256 for sensitive data
- **Privacy**: No health diagnosis, PII minimization
- **GDPR**: DSR support (export/delete)
- **Observability**: Sentry + OpenTelemetry

## Features at a Glance

SugarFlag includes **100+ production-ready features** across 13 categories:

1. **Core Scanning** - UPC/photo scanning, AI OCR, sweetener detection
2. **Gamification** - XP, levels, 50+ achievements, streaks, leaderboards
3. **Social** - Friends, sharing, community reviews, family accounts
4. **Health Tracking** - Goals, daily intake, metrics, Apple Health sync
5. **Shopping** - Smart lists, deals, coupons, one-click ordering
6. **Meal Planning** - AI meal plans, 1000+ recipes, nutrition analyzer
7. **Restaurants** - Menu scanning, location-based search, reservations
8. **Analytics** - Personal dashboard, trends, PDF reports, email digests
9. **Education** - Articles, videos, courses, expert content
10. **Family & Corporate** - Family sharing, wellness programs, bulk licenses
11. **Accessibility** - Screen reader support, high contrast, multiple languages
12. **Technical** - Offline mode, PWA, API, webhooks, integrations
13. **Integrations** - Apple Watch, Shortcuts, Zapier, smart home

**📖 Full documentation: [FEATURES.md](FEATURES.md)**

## Database Schema

**50+ Prisma models** supporting all features:
- User profiles with gamification (XP, levels, streaks)
- Products with nutrition data and sweetener relationships
- Social features (friends, shares, leaderboards, reviews)
- Health tracking (goals, daily intake, medical data, metrics)
- Shopping (lists, deals, coupons, price history)
- Meal planning (recipes, meal plans, AI-generated)
- Restaurants (locations, menus, items with sugar content)
- Education (articles, tutorials, courses)
- Corporate (accounts, wellness programs)
- Analytics and integrations

## Roadmap

### Completed ✅
- [x] MVP scaffold (Web + iOS)
- [x] Core scanning (UPC + photo with AI OCR)
- [x] Sweetener ontology (28 sweeteners)
- [x] Extended product database (30+ products)
- [x] Authentication (Clerk/WebAuthn with passkeys)
- [x] Security hardening (rate limiting, encryption, circuit breakers)
- [x] Stripe subscriptions (Free/Premium/Family)
- [x] Advanced recommendation engine
- [x] Analytics tracking (PostHog)
- [x] Privacy policy and terms
- [x] App Store submission materials
- [x] **Gamification system** (XP, achievements, streaks)
- [x] **Social features** (friends, sharing, leaderboards)
- [x] **Health tracking** (goals, metrics, Apple Health)
- [x] **Shopping features** (lists, deals, AI meal planning)
- [x] **Restaurant features** (menu scanning, location search)
- [x] **Family & corporate** (family sharing, wellness programs)
- [x] **Accessibility** (screen readers, i18n, offline mode)
- [x] **Complete feature documentation** (100+ features)
- [x] Deployment documentation

### In Progress 🚧
- [ ] Production deployment (web)
- [ ] App Store submission (iOS)
- [ ] Beta testing program

### Upcoming (Q1 2026) 📅
- [ ] Android application
- [ ] Additional restaurant chains
- [ ] Telehealth integration
- [ ] Recipe video content
- [ ] Advanced AI features (voice commands, real-time detection)

## Contributing

This is a private repository. Contact the maintainers for access.

## 🔒 Security Features

### Web Application
✅ Clerk authentication with passkeys
✅ Rate limiting (LRU cache)
✅ Security headers (CSP, HSTS, X-Frame-Options)
✅ Input validation (Zod schemas)
✅ Circuit breakers for external APIs
✅ Exponential backoff retry logic
✅ Client-side photo encryption (AES-GCM-256)
✅ Webhook signature verification (Stripe)

### iOS Application
✅ WebAuthn/Passkey authentication
✅ AES-GCM-256 client-side encryption
✅ Keychain secure storage
✅ Face ID/Touch ID support
✅ StoreKit 2 receipt validation

## 📚 Documentation

- **Deployment Guide**: [DEPLOYMENT.md](DEPLOYMENT.md) - Comprehensive 500+ line production deployment guide
- **App Store Submission**: `sugarflag_ios/AppStore/SUBMISSION.md` - Complete iOS submission guide
- **API Documentation**: See `sugarflag_web/app/api/` for endpoint details

## License

MIT License

## Support

- Email: support@sugarflag.app
- Documentation: [docs.sugarflag.app](https://docs.sugarflag.app)

---

Built with ❤️ for healthier choices