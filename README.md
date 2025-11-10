# SugarFlag

Camera → instant added-sugar/alternative-sweetener score with plain-English labels; weekly lower-sugar cart personalized to taste and budget.

## Overview

SugarFlag helps users make healthier choices by instantly analyzing food products for added sugars and artificial sweeteners. Point your camera at any nutrition label or barcode to get:

- **Instant Sugar Score** (0-100) with plain-English explanation
- **Sweetener Breakdown** - HFCS, sucralose, stevia, and more
- **Weekly Cart Suggestions** - Lower-sugar alternatives tailored to your taste and budget
- **Privacy-First** - Optional on-device encryption

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

## Roadmap

- [x] MVP scaffold (Web + iOS)
- [x] Product scanning via UPC
- [ ] Photo OCR implementation
- [ ] Sweetener ontology seeding
- [ ] User preferences UI
- [ ] Grocery API integrations
- [ ] Stripe subscription flow
- [ ] App Store submission
- [ ] Analytics dashboard

## Contributing

This is a private repository. Contact the maintainers for access.

## License

Proprietary - All rights reserved

## Support

- Email: support@sugarflag.app
- Documentation: [docs.sugarflag.app](https://docs.sugarflag.app)

---

Built with ❤️ for healthier choices