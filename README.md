# Digital Hiring App

A secure, mobile-friendly digital marketplace connecting daily-wage workers with employers across Pakistan.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** SQLite (via Prisma ORM)
- **i18n:** next-intl (English + Urdu)
- **Icons:** Lucide React
- **Auth:** (Phase 2 - NextAuth.js)

## Getting Started

### Prerequisites

- Node.js 20+

### Installation

```bash
npm install
```

### Environment Setup

Copy the example environment file and adjust as needed:

```bash
cp .env.example .env.local
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app supports two locales:
- English: [http://localhost:3000/en](http://localhost:3000/en)
- Urdu (RTL): [http://localhost:3000/ur](http://localhost:3000/ur)

### Database Setup (Phase 2)

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

## Project Structure

```
src/
  app/                  # Next.js App Router pages
    [locale]/           # Localized routes (en, ur)
  components/           # React components
    ui/                 # Base UI components (shadcn)
    layout/             # Navbar, language switch
    forms/              # Form controls (pickers, selectors)
    cards/              # Job, worker, offer cards
    shared/             # Shared components
  lib/                  # Utilities and services
    db.ts               # Prisma client
    utils.ts            # cn() helper
    ai/                 # AI matching (future)
    payment/            # Escrow logic (future)
    validation/         # Zod schemas (future)
  i18n/                 # Internationalization
    routing.ts          # Locale routing config
    request.ts          # Message loading
    navigation.ts       # i18n-aware navigation
    messages/           # EN and UR translations
  types/                # Shared TypeScript types
prisma/                 # Database schema and migrations
public/                 # Static assets
```

## Status

Phase 1 (Project Foundation) - Complete. Application features will be added in subsequent phases.
