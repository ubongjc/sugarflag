# SugarFlag Web

Camera-powered added-sugar and alternative-sweetener detection with personalized lower-sugar alternatives.

## Features

- **Product Scanning**: Analyze products via UPC or nutrition label photos
- **Sugar Scoring**: Get instant scores (0-100) with plain-English explanations
- **Sweetener Ontology**: Detailed detection of HFCS, dextrose, sucralose, stevia, and more
- **Weekly Cart Suggestions**: Personalized lower-sugar alternatives based on taste and budget
- **Privacy-First**: Optional client-side encryption for scan photos
- **WebAuthn/Passkeys**: Modern, secure authentication

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL 16 + Prisma 5
- **Vector Search**: pgvector for ingredient embeddings
- **Auth**: Clerk (WebAuthn/Passkeys support)
- **Payments**: Stripe
- **Storage**: Cloudflare R2
- **Observability**: Sentry + OpenTelemetry

## Getting Started

### Prerequisites

- Node.js 18.17+
- PostgreSQL 16 with pgvector extension
- npm or yarn

### Installation

1. Clone the repository and navigate to the web folder:

```bash
cd sugarflag_web
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`: Clerk auth credentials
- `STRIPE_SECRET_KEY`: Stripe API key
- `R2_*`: Cloudflare R2 credentials
- `OPENAI_API_KEY`: For OCR and embeddings

4. Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## API Endpoints

### Health Check
```
GET /api/health
```

### Product Scanning
```
POST /api/scan
Body: {
  upc?: string,
  photo?: string (base64),
  locale?: string
}
```

### Product Lookup
```
GET /api/product/[upc]
```

### Cart Suggestions
```
GET /api/cart/suggest
```

## Database Schema

Key models:
- **Product**: UPC, brand, nutrients, ingredients
- **Sweetener**: Name, type, health score, aliases
- **Scan**: User scans with scores and rationale
- **CartSuggestion**: Weekly lower-sugar alternatives
- **Preference**: User taste profiles and dietary restrictions

## Development

### Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run db:generate`: Generate Prisma client
- `npm run db:push`: Push schema changes
- `npm run db:migrate`: Run migrations
- `npm run db:studio`: Open Prisma Studio

### Project Structure

```
sugarflag_web/
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components
│   └── ui/             # shadcn/ui components
├── lib/                 # Utilities
│   ├── prisma.ts       # Prisma client
│   ├── types.ts        # Type definitions
│   ├── scoring.ts      # Sugar scoring logic
│   └── utils.ts        # Helper functions
├── prisma/
│   └── schema.prisma   # Database schema
└── public/             # Static assets
```

## Security

- All API endpoints support authentication via Clerk
- Sensitive data encrypted at rest
- Rate limiting on scan endpoints
- Input validation with Zod
- CSRF protection enabled

## Privacy

- Optional client-side photo encryption
- PII minimization in database
- DSR (Data Subject Rights) support for export/delete
- No health diagnosis or medical claims

## License

Proprietary - All rights reserved

## Support

For issues or questions, contact support@sugarflag.app
