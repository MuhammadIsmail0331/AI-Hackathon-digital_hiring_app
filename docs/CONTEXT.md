# Digital Hiring (Rozgaar) — Complete Project Context

> This document provides everything needed to: (A) manually test every feature, (B) hand off to an AI for optimization/security/accessibility review, or (C) prepare a hackathon presentation.

---

## 1. PROJECT OVERVIEW

**Name:** Digital Hiring App (display brand: Rozgaar · روزگار)
**Hackathon:** Ali Baba AI Hackathon 2026, Pakistan
**Live URL:** https://digital-hiring-app-five.vercel.app
**Repository:** https://github.com/MuhammadIsmail0331/AI-Hackathon-digital_hiring_app

**Problem:** Millions of skilled daily-wage workers in Pakistan (painters, plumbers, electricians, carpenters) have no reliable way to find work. Employers have no trusted way to find and verify them.

**Solution:** An AI-powered, mobile-first marketplace that matches workers to jobs automatically, protects wages through simulated escrow, and builds trust through mutual ratings — all in English and Urdu.

---

## 2. TECHNICAL ARCHITECTURE

### Stack
- **Frontend:** Next.js 15 (App Router), TypeScript (strict), Tailwind CSS 4
- **Backend:** Next.js API Routes (REST), Prisma 6 ORM
- **Database:** PostgreSQL on Neon (serverless)
- **Auth:** NextAuth v5 (credentials + phone OTP)
- **Fonts:** Sora (display), Inter (body), Noto Nastaliq Urdu (Urdu headings), Noto Naskh Arabic (Urdu body)
- **Deployment:** Vercel (auto-deploys on push to main)

### Database Schema (9 models)
```
User            — id, name, email(unique), phone(unique), passwordHash, role(WORKER|EMPLOYER),
                  language(en|ur), isBlocked, isAdmin, phoneVerified, walletBalance
WorkerProfile   — userId, workerType(painter|plumber|electrician|carpenter|mason|labourer|
                  cleaner|welder|gardener|driver|helper|other), skills(JSON array), experience,
                  locationName, expectedWage, isAvailable, availableDays(JSON), bio,
                  avgRating, totalJobs
                  UNIQUE(userId, workerType) — max 3 per user
Job             — employerId, title, description, workerType, requiredSkills(JSON),
                  numberOfWorkers, date, startTime/endTime (hour/min/period), wage,
                  toolsRequired(JSON), locationLat/Lng/Name, status
                  (DRAFT|OPEN|MATCHING|OFFERS_SENT|IN_PROGRESS|COMPLETED|CANCELLED|EXPIRED),
                  boosted, boostedAt, backgroundSearchUntil, backgroundSearchExtensions
JobOffer        — jobId, workerId, status(PENDING|ACCEPTED|DECLINED), matchScore, matchReason
                  UNIQUE(jobId, workerId)
Payment         — jobId(unique), totalAmount, status
                  (PENDING|SECURED|HELD|RELEASED|REFUNDED|CANCELLED), securedAt, releasedAt,
                  platformFee, workerPayout
Feedback        — jobId, authorId, subjectId, type(EMPLOYER_TO_WORKER|WORKER_TO_EMPLOYER),
                  overallRating(1-5), punctuality, attitude, workQuality, paymentOnTime,
                  fairTreatment, comment
                  UNIQUE(jobId, authorId)
Notification    — userId, type(JOB_OFFER|JOB_ACCEPTED|JOB_DECLINED|JOB_COMPLETED|
                  FEEDBACK_REQUEST|SYSTEM), title, message, data(JSON), read
OTPVerification — phone, code(hashed), purpose(REGISTRATION|PASSWORD_RESET), expiresAt,
                  verified, attempts, lockedUntil
SystemConfig    — key(unique), value, label (e.g. SEARCH_RADIUS_KM = 50)
```

### Key Files
```
src/lib/matching.ts          — AI matching engine (findMatchingProfessionals)
src/lib/ai/parse-job.ts      — Job-post parser (LLM + bilingual heuristic)
src/lib/otp.ts               — OTP generation, verification, rate limiting
src/lib/status.ts             — Status badges, formatPKR, formatJobDate
src/lib/celebrate.ts          — Confetti celebration system
src/lib/constants.ts          — 12 categories, 12 cities, skills, tools, colors, MIN_DAILY_WAGE
src/components/brand/         — BrandReveal (handshake→D animation), SessionSplash
src/components/illustrations/ — SkylineScene, WorkerCharacter (8 types), EmptyToolbox, SearchLight, MailBox
src/components/motion/        — Reveal, Stagger, CountUp, Marquee, TiltCard (framer-motion)
src/components/layout/        — Navbar, SideGarland, ThemeToggle, SessionSplash, DoodleBackground
src/app/api/                  — All REST endpoints
```

---

## 3. USER FLOWS (for manual testing)

### Registration Flow
1. Visit `/en` → click "I Need a Worker" or "I Am a Worker"
2. Redirected to `/en/register?role=WORKER|EMPLOYER` (role preselected)
3. Fill name, email, phone (+92 format), password
   - Password must have: uppercase, lowercase, number, special char, 8+ chars
   - Password strength meter shows live
   - Eye toggle to show/hide password
4. Click "Send Code" → OTP sent to phone
   - **DEMO MODE**: Code is displayed in the UI (no SMS provider configured)
   - In production with SMS provider: code sent via SMS
5. Enter 6-digit code → verified → auto-registered → redirected to role dashboard
   - Workers → `/worker/profile` (complete profile)
   - Employers → `/employer/dashboard`

### OTP Details
- 6-digit code, 5-minute expiry, 60-minute verified window
- Rate limiting: 60-second cooldown between sends
- Lockout: 5 failed attempts = 15-minute lockout
- Demo mode: code shown in UI (because no SMS provider configured)

### Employer: Post a Job
1. Login as sara@example.com / password123
2. Dashboard → "Create Job" OR "AI Job Assistant"
3. **AI Assistant**: type a rough description (e.g. "need electrician tomorrow morning in Lahore for wiring, 3500/day") → AI fills: category=electrician, skills=wiring, city=lahore, wage=3500, date=tomorrow
   - Uses OpenAI GPT-4o-mini when OPENAI_API_KEY is set
   - Falls back to bilingual keyword parser when no key
4. Review the pre-filled form, adjust anything, submit
5. Matching runs instantly → offers sent to top-ranked workers → status = OFFERS_SENT
6. If no immediate matches: background search starts (1-hour window, extends up to 5 hours)

### Worker: Receive and Accept Offer
1. Login as usman@example.com / password123
2. Notifications → "New Job Offer" → click → redirected to offers page
3. Offer shows: job title, employer name, date, time, wage, skills, match score + reason
4. Accept → status = ACCEPTED, escrow = HELD, mutual contact info revealed
   - Celebration confetti fires
5. Decline → status = DECLINED, removed from offers list

### Employer: Manage Job
1. Dashboard → "My Jobs" → click a job
2. Job detail shows: status badge, offers list (with scores), payment section
3. **Complete Job** → status = COMPLETED, workers notified
4. **Cancel Job** → status = CANCELLED, payment = REFUNDED, workers notified
5. **Release Payment** → status = RELEASED, platform fee (5%) deducted, workers notified
6. **Boost Job** → PKR 99 from wallet, highlighted in listings
7. **Delete Job** → only if no offers sent yet

### Worker: My Jobs
1. Dashboard → "My Jobs" → list of active and completed
2. Active job → detail page with employer contact, payment status (SECURED/HELD)
3. After employer marks COMPLETED → notification → "Rate Employer" button
4. Submit feedback (overall rating + payment/fair-treatment yes/no)
5. After both parties submit → payment RELEASED

### Mutual Feedback Flow
1. Employer rates worker: overall stars + punctuality + attitude + work quality
2. Worker rates employer: overall stars + payment on time + fair treatment
3. Both must submit for payment to be fully settled
4. Ratings update the worker's average (visible on their profile)

### Admin Panel
1. Login as admin@example.com / password123
2. `/en/admin` → blocked users list, block/unblock by email

---

## 4. CURRENT FEATURES (ALL VERIFIED WORKING)

### Core (verified by E2E tests)
- [x] Phone OTP registration (both roles)
- [x] Password strength (live meter, all character types enforced)
- [x] Duplicate account prevention (email + phone unique checks)
- [x] AI matching engine (skill 50 + wage 20 + location 15 + experience 10 + availability 5)
- [x] Bulk offers with relevance cap (max(10, 3 × positions))
- [x] Offer accept/decline with concurrent-safe transactions
- [x] Escrow payment (SECURED → HELD → RELEASED)
- [x] Platform fee (5% on release)
- [x] Mutual feedback with ratings
- [x] Cancel job with escrow refund
- [x] Auto-expiry of past-date jobs
- [x] Background search with extensions
- [x] Role-aware notification links (fixed bug: worker was sent to employer page)
- [x] Multi-profession profiles (up to 3 per worker)
- [x] Profile save → success toast → redirect to profile page
- [x] AI Job-Post Assistant (LLM + bilingual heuristic fallback)
- [x] Find Professionals (search + direct offer)
- [x] Data-driven wage suggestions
- [x] Fair Wage badge
- [x] Explainable match scores
- [x] Dark mode (midnight emerald) with no-flash init
- [x] OTP demo delivery (code shown in UI when no SMS provider)

### UI/UX
- [x] Heritage Craft design system (emerald/amber/terracotta on warm paper/midnight emerald)
- [x] Brand animation (handshake → D mark, plays once per session)
- [x] Loading animation (mp4 video + branded ring, min 1400ms)
- [x] Animated skyline hero (mosque, crane, twinkling windows, drifting clouds, birds)
- [x] Illustrated worker characters (8 professions with detailed tools)
- [x] Category marquee ticker
- [x] Count-up stats
- [x] Scroll-triggered reveals
- [x] Side garlands (rope with swinging tools / vine with ladder)
- [x] Doodle background layer
- [x] PWA manifest
- [x] Full RTL support with Nastaliq headings
- [x] English + Urdu everywhere
- [x] Security headers (nosniff, frame-deny, referrer, geolocation)
- [x] CI pipeline (lint + build on every push)

### Trust & Safety
- [x] Phone OTP verification
- [x] Escrow payment simulation
- [x] Mutual ratings (both must rate)
- [x] Fair Wage badge (configurable minimum)
- [x] Admin block/unblock
- [x] Duplicate account prevention
- [x] OTP rate limiting (60s cooldown, 5-attempt lockout)

---

## 5. KNOWN LIMITATIONS (honest disclosure)

1. **OTP delivery**: No real SMS provider configured. In demo mode, the code appears in the UI. OTP is now **mandatory** for registration and password reset — the "continue without OTP" bypass has been removed from both the UI and the API (server-side Zod requires a 6-digit code; register/reset always verify it). For production, integrate Twilio/Vonage or WhatsApp Business API in `src/lib/otp.ts`.
2. **Payments are simulated**: No real money moves. The escrow flow demonstrates the UX but does not integrate with Stripe/JazzCash/Easypaisa.
3. **AI assistant fallback**: Without an OPENAI_API_KEY, the job-post assistant uses a keyword parser (still bilingual, still functional, but not true LLM understanding).
4. **Background search cron**: Vercel Hobby plan limits crons to daily. For 10-minute cadence, use an external cron service hitting `/api/cron/background-search` with the CRON_SECRET.
5. **Single-city radius**: Matching uses straight-line distance (Haversine), not actual travel distance.
6. **No in-app chat**: Communication happens via revealed phone numbers after offer acceptance.
7. **Limited image support**: No photo uploads for worker profiles or job images.
8. **Match reason storage**: New offers store a structured JSON `{skillPct, distKm, wageOk}` in `matchReason`, rendered localized via `renderMatchReason()` (legacy plain-English rows display as-is until re-generated).

---

## 6. FOR QA TESTING — Check Every Button

### Landing Page (/en and /ur)
- [ ] Hero renders with animated skyline (mosque, crane, twinkling windows)
- [ ] Floating tool chips visible (desktop only)
- [ ] Two role cards (glass, hover tilt)
- [ ] Category marquee scrolling infinitely
- [ ] Count-up stats (live from DB)
- [ ] Three feature cards
- [ ] CTA band
- [ ] Dark mode toggle works (no flash)
- [ ] Language switch works (EN ↔ UR, RTL flips)

### Registration
- [ ] Role preselected from URL param
- [ ] Password strength meter updates live
- [ ] Eye toggle works
- [ ] Phone format validation (+92)
- [ ] OTP code appears (demo mode)
- [ ] Cooldown timer between resends
- [ ] Duplicate email/phone blocked
- [ ] After registration: redirected to correct dashboard

### Login
- [ ] Valid credentials → role-aware dashboard redirect
- [ ] Invalid credentials → error shown
- [ ] Remember: all seed accounts use password123

### Worker Flow
- [ ] Dashboard shows stats + profile card
- [ ] Browse jobs → filter by category/city → job cards with match bar
- [ ] Offers page → accept (confetti + contact revealed) or decline
- [ ] My Jobs → active (payment HELD) and completed (payment RELEASED)
- [ ] Profile → list of professions → Add/Edit → save → toast → redirect
- [ ] Notifications → click job-completed → goes to my-jobs (not employer page)

### Employer Flow
- [ ] Dashboard shows wallet + stats + recent jobs
- [ ] Create Job → AI assistant → fill form → submit → matches shown
- [ ] My Jobs → list with status badges → click job
- [ ] Job detail → offers list, payment section, complete/cancel/boost buttons
- [ ] Cancel → refund confirmation
- [ ] Find Professionals → search → send offer

### Admin
- [ ] /en/admin → blocked users list, block/unblock

### Payment States (verify in job details)
- [ ] PENDING → no payment created yet
- [ ] SECURED → after offer accepted (employer action)
- [ ] HELD → after job started (auto on accept)
- [ ] RELEASED → after both parties submit feedback
- [ ] REFUNDED → after employer cancels

### Edge Cases
- [ ] Two workers accept simultaneously → only first succeeds (transaction guard)
- [ ] Worker with 0 jobs → no rating shown
- [ ] Worker outside 50km → doesn't appear in matching
- [ ] Job with past date → auto-expires
- [ ] Boosted job → appears first in browse

---

## 7. FOR AI OPTIMIZATION — Handoff Notes

### Security Review Priorities
1. **OTP bypass**: The OTP is optional at registration ("temporary bypass"). Should be enforced.
2. **Rate limiting**: In-memory, resets on serverless cold start. Consider Upstash Redis.
3. **Input sanitization**: Zod validation on API routes ✓, but check for XSS in bio/description fields.
4. **CSRF**: NextAuth handles this ✓, but verify the setup.
5. **SQL injection**: Prisma parameterizes all queries ✓.
6. **Environment variables**: DATABASE_URL, AUTH_SECRET, CRON_SECRET — verify these are set in Vercel and not leaked.
7. **File upload**: None exists — if added later, validate file type and size.
8. **Admin routes**: Check that resolveAdminUser is called on every admin API.

### Accessibility Review Priorities
1. **Focus management**: All interactive elements have focus-visible styles ✓, but check modal focus trapping.
2. **Screen reader**: aria-labels on icon-only buttons ✓, but test with NVDA/JAWS.
3. **Color contrast**: text-muted (#a8a29e) on bg-surface (#101b17) in dark mode — verify 4.5:1 ratio.
4. **RTL**: Layout uses logical properties (ps/pe/ms/me) ✓, but test with a screen reader in Urdu.
5. **Form errors**: Error messages are text-only — consider adding aria-describedby.
6. **Keyboard navigation**: Test tab order on all pages, especially the category/city selectors.
7. **Images**: All illustrations have aria-hidden ✓, but check for meaningful images.

### Performance Review Priorities
1. **Bundle size**: Current first-load JS is 103 kB (good for Next.js) — check if framer-motion adds significantly.
2. **Database queries**: The matching engine queries all available workers — consider pagination for scale.
3. **Image optimization**: No raster images used ✓, but consider adding next/image for future photos.
4. **Caching**: Static pages are cached, dynamic pages use force-dynamic — check if ISR would help.
5. **Neon connection pooling**: Uses pooled connection string ✓ — verify pool size for Vercel concurrent requests.

### UX Review Priorities
1. **Empty states**: All covered ✓ — verify they encourage the right action.
2. **Loading states**: Skeletons on lists ✓, but check that they match the content shape.
3. **Error recovery**: ErrorBanner with retry ✓ — test network failure scenarios.
4. **Onboarding**: No guided tour — consider adding a 3-step walkthrough for first-time users.
5. **Notification urgency**: All notifications look the same — consider visual differentiation.
6. **Search**: No fuzzy search for skills — exact match only.
7. **Profile completeness**: No indicator showing how complete a profile is.
8. **Offline support**: No service worker — pages fail without internet.

---

## 8. FOR HACKATHON PRESENTATION

### Demo Script (3 minutes)
1. **Problem** (30s): Show the current process — word of mouth, no verification, no payment protection
2. **Solution** (30s): Open the landing page — animated skyline, bilingual, two clear paths
3. **Employer posts a job** (45s): Use the AI assistant with a rough sentence → form fills → matches appear with explanations → send offer
4. **Worker accepts** (30s): Switch to worker account → notification → accept → confetti → contact revealed → escrow secured
5. **Complete the loop** (30s): Employer marks complete → worker rates → employer rates → payment released → rating visible
6. **Trust & Safety** (15s): Show Fair Wage badge, admin panel, dark mode, Urdu support

### Key Differentiators to Highlight
- **AI matching with explanations** — not a black box
- **Escrow payment simulation** — wage protection built into the flow
- **Dual-role accounts** — one person can both hire and work
- **Multi-profession profiles** — a carpenter who also paints doesn't need two accounts
- **Bilingual with RTL** — not just translated, but designed for it
- **Background search** — the platform keeps looking even when no one is online
- **Fair Wage badge** — social impact built into the marketplace

### Architecture Highlights for Judges
- **PostgreSQL on Neon** — serverless-ready, not SQLite
- **AI matching engine** — transparent scoring with human-readable explanations
- **Dual authentication** — NextAuth credentials + phone OTP
- **Escrow payment simulation** — full lifecycle with refund on cancel
- **Multi-profession profiles** — one account, up to 3 professions
- **Bilingual keyword parser** — works without any API key
- **CI/CD** — GitHub Actions + Vercel auto-deploy
- **E2E tested** — Playwright golden path + regressions