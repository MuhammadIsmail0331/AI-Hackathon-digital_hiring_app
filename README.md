# Digital Hiring (Rozgaar · روزگار)

> **Find workers. Find work.** An AI-matched, escrow-protected marketplace connecting skilled daily-wage workers with employers across Pakistan.

[![CI](https://github.com/MuhammadIsmail0331/AI-Hackathon-digital_hiring_app/actions/workflows/ci.yml/badge.svg)](https://github.com/MuhammadIsmail0331/AI-Hackathon-digital_hiring_app/actions)
![Next.js 15](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue) ![Prisma](https://img.shields.io/badge/Prisma-6-2D3748) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791) ![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4-38B2AC)

---

## The Problem

Pakistan has **millions of skilled daily-wage workers** — painters, plumbers, electricians, carpenters — who depend on finding work at daily rates. Employers need these workers but have no reliable way to find them. The existing process is word-of-mouth: slow, unreliable, and offers zero protection for either party.

## The Solution

**Digital Hiring (Rozgaar)** is a mobile-first marketplace that:

- 🤖 **Matches workers to jobs automatically** using an AI scoring engine (skills 50% + wage fit 20% + distance 15% + experience 10% + availability 5%)
- 🔒 **Protects wages with simulated escrow** — payment is secured when the offer is accepted, held during the job, and released only when both parties confirm completion
- ⭐ **Builds trust through mutual ratings** — both employer and worker rate each other after every job
- 🏆 **Awards a Fair Wage badge** to jobs paying above the configurable daily minimum
- 🌐 **Speaks the user's language** — full English and Urdu support with RTL layout, Nastaliq headings, and Naskh body text
- 📱 **Works on any phone** — mobile-first design with bottom navigation, large touch targets, and visual selectors (no typing required for structured data)

## Key Features

### For Employers
- **AI Job-Post Assistant** — describe the job in plain English/Urdu, AI fills the form
- **Find Professionals** — search workers by category, city, skills, and rating; send direct offers
- **Escrow payments** — secure wages before the job starts, release when satisfied
- **Cancel with refund** — cancel any active job and get your escrow back

### For Workers
- **Receive job offers automatically** — matching runs on every new job posting
- **Background search** — if no match is found immediately, the search continues
- **Multi-profession profiles** — register as painter + electrician + carpenter
- **Trust building** — mutual ratings after every completed job

### Platform
- **OTP phone verification** — every account verified
- **Escrow payment flow** — SECURED → HELD → RELEASED
- **Fair Wage badge** — jobs paying above minimum wage
- **Admin panel** — block/unblock users, delete jobs
- **PWA manifest** — installable on Android
- **Dark mode** — midnight emerald theme with full contrast

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 6 |
| Auth | NextAuth v5 (credentials + OTP) |
| Styling | Tailwind CSS 4 + design tokens |
| Typography | Sora (display) · Inter (body) · Noto Nastaliq Urdu (headings) · Noto Naskh Arabic (body) |
| Icons | Inline SVG (zero dependencies) |
| Testing | Playwright E2E |
| Deployment | Vercel |

## Getting Started

```bash
# Clone and install
git clone https://github.com/MuhammadIsmail0331/AI-Hackathon-digital_hiring_app.git
cd AI-Hackathon-digital_hiring_app
npm install

# Set up the database
npx prisma db push
npx prisma db seed

# Start the dev server
npm run dev
```

Or use the one-command bootstrap:

```bash
npm run setup
```

## Demo Accounts

All accounts use password: `password123`

| Role | Email | City | Profession |
|------|-------|------|------------|
| Employer | sara@example.com | Karachi | — |
| Employer | hamza@example.com | Lahore | — |
| Employer | adeel@example.com | Islamabad | — |
| Worker | ahmed@example.com | Karachi | Painter |
| Worker | bilal@example.com | Karachi | Plumber |
| Worker | usman@example.com | Lahore | Electrician |
| Worker | naveed@example.com | Lahore | Carpenter |
| Admin | admin@example.com | Karachi | Admin |

*...and 4 more workers with varied skills and cities.*

## Architecture

```
src/
├── app/
│   ├── api/                    # REST API routes (NextAuth, jobs, offers, payments)
│   │   ├── admin/              # Block/unblock users, stats
│   │   ├── ai/                 # Job-post assistant, wage suggestions
│   │   ├── auth/               # NextAuth, OTP send/verify
│   │   ├── cron/               # Background search, job expiry
│   │   ├── employer/           # Jobs CRUD, offers, payments, wallet, boost
│   │   ├── feedback/           # Mutual post-job ratings
│   │   ├── notifications/      # In-app notification feed
│   │   └── worker/             # Profile, offers, my-jobs
│   ├── [locale]/               # Localized pages (en, ur)
│   │   ├── employer/           # Dashboard, jobs, profile
│   │   ├── worker/             # Dashboard, jobs, offers, my-jobs, profile
│   │   └── ...                 # login, register, feedback, admin, terms
│   └── globals.css             # Design tokens + dark mode + animations
├── components/
│   ├── brand/                  # BrandReveal (handshake → D animation)
│   ├── illustrations/          # SkylineScene, WorkerCharacter, EmptyToolbox
│   ├── layout/                 # Navbar, SideGarland, ThemeToggle, SessionSplash
│   ├── motion/                 # Reveal, Stagger, CountUp, Marquee, TiltCard
│   └── ui/                     # Button, Card, Badge, Input, selectors, Feedback
├── lib/
│   ├── ai/                     # Job-post parsing (LLM + heuristic)
│   ├── auth.config.ts          # NextAuth config
│   ├── constants.ts            # Categories, cities, skills, tools, colors
│   ├── matching.ts             # AI matching engine
│   ├── otp.ts                  # OTP generation, verification, rate limiting
│   ├── session.ts              # Session resolution
│   ├── status.ts               # Status badges, formatting
│   └── celebrate.ts            # Confetti system
├── prisma/
│   ├── schema.prisma           # 9 models: User, WorkerProfile, Job, JobOffer, Payment, Feedback, Notification, OTPVerification, SystemConfig
│   └── seed.ts                 # 12 workers, 3 employers, 6 jobs in every state
└── tests/e2e/                  # Playwright golden path + regressions
```

## AI Matching Engine

The matching engine scores every available worker against every new job:

| Factor | Weight | Logic |
|--------|--------|-------|
| Skills | 40 pts | Overlap between required and worker skills |
| Wage fit | 20 pts | Job wage vs worker expectation (ratio-based) |
| Distance | (gate) | Within configurable radius (default 50 km) |
| Experience | 10 pts | Years of experience (capped) |
| Rating | 10 pts | Average star rating from past employers |
| Availability | 20 pts | Currently available and working days match |

Offers are **relevance-capped** at `max(10, 3 × positions)` and score-ranked. Workers see a human-readable explanation for every offer.

## Payment Flow

```
Job Posted → Offers Sent → Worker Accepts → Payment SECURED
→ Job IN PROGRESS → Job COMPLETED → Payment HELD
→ Worker Submits Feedback → Payment RELEASED (minus 5% platform fee)
```

If either party does not submit feedback within 24 hours, the payment stays HELD until both confirm. The admin can intervene.

## Design System

The **Heritage Craft** identity combines:

- **Palette**: Deep emerald `#0d7a5f` · warm amber `#d97706` · terracotta `#c2552b` on warm paper `#faf7f2` (light) or midnight emerald `#0c1512` (dark)
- **Truck-art motifs**: Chevron ribbons and geometric patterns as decorative accents
- **Typography**: Sora for headings, Inter for body, Noto Nastaliq Urdu for Urdu headings, Noto Naskh Arabic for Urdu body
- **Illustrations**: Chunky flat worker characters with category-specific tools and detailed uniforms

See `docs/DESIGN.md` for the full token reference.

## Documentation

- [Roadmap & execution log](docs/ROADMAP.md)
- [Design system](docs/DESIGN.md)
- [Implementation plan](implementation_plan.md)

## License

MIT
---
Developed and tested by **Nasir** and **Muhammad Ismail** for the Ali Baba AI Hackathon 2026.
