# 🗺️ Roadmap — "Regionals Ready"

> **GitHub tracking:** #1 master tracker · #2 Phase 0 · #3 Phase 1 · #4 Phase 2 · #5 Phase 3 · #6 Phase 4 · #7 Phase 5 (sub-issue hierarchy API needs broader token scope — checklist references used instead)

> **Product thesis:** *AI structures, matches, explains, and prices the job — on a trustworthy, monetizable marketplace that demos flawlessly on the live Vercel URL.*
>
> This file is the **master tracker and execution log** for the hackathon push. (The repo token used by our agent is read-only, so GitHub Issues/PRs are mirrored here; commits reference phases directly.)

## Locked decisions

| Decision | Rationale |
|---|---|
| Live demo runs on **Vercel** | Confirmed by owner → SQLite must migrate to **Neon Postgres** (serverless FS is ephemeral; demo data would vanish) |
| Not building: real SMS, in-app chat, semantic search, verification queues, image uploads | Each fails the effort-vs-demo-value test |
| Trust via visible ratings + escrow + admin blocking | Replaces a hard "feedback < 2.5 blocks posting" rule (friction/risk at demo scale) |
| Job **cancel + auto-expiry** instead of full edit | Covers 90% of the need at 10% of the cascade risk |

## Phase 0 — Foundations & Logging
- [x] `dev` branch created; `phase-*` → `dev` → `main` flow
- [x] CI workflow `.github/workflows/ci.yml` (lint + build on push/PR to main/dev)
- [x] Lint scoped to `src/` + flat-config ignores (was 1,915 errors from `tmp/`, `.node/`, `scripts/`)
- [x] `npm run setup` one-command bootstrap (install → `prisma db push` → seed)
- [x] Rich seed: 12 workers (7 categories, 3 cities + out-of-radius case), 3 employers, 6 jobs covering OPEN / OFFERS_SENT / IN_PROGRESS / COMPLETED (payment HELD & RELEASED), offers, notifications, mutual feedback, SystemConfig
- [x] Baseline `npm run build` green (all routes) — verified locally before CI landed

**Demo scenario note:** seeded job *"Custom wardrobe carpentry"* intentionally reproduces the reported bug: employer rated, worker has unread "Job Completed" notification, payment still HELD → used by Phase 1 E2E.

## Phase 1 — Demo Bulletproofing
- [ ] SQLite → **Neon Postgres** (provider change, `db push`, reseed, Vercel env vars)
- [ ] Golden-path **Playwright E2E**: post job → match → offer → accept → escrow → complete → mutual feedback → rating visible
- [ ] **Cancel job** with escrow refund + worker notifications
- [ ] **Auto-expiry** of past-date jobs
- [ ] `vercel.json` cron for `/api/cron/background-search` (CRON_SECRET)
- [ ] Replace silent `catch {}` in client loaders with visible error/loading states
- [ ] Batch notification writes (remove N+1 loops)
- [ ] Security headers in `next.config.ts`

## Phase 2 — The AI Layer
- [ ] AI Job-Post Assistant (rough sentence → structured job fields; provider-adapter + fallback)
- [ ] Explainable match scores on offers ("90% skill match · 2.3 km · wage ≥ expectation")
- [ ] Data-driven wage suggestions from platform aggregates
- [ ] Fair Wage ✓ badge (configurable daily minimum)

## Phase 3 — Marketplace & Trust
- [ ] Find Professionals (employer worker search) + direct offer
- [ ] Ratings/escrow/trust surfaced on cards & profiles
- [ ] Relevance-capped offers: `max(10, 3 × positions)`, score-ranked

## Phase 4 — Business Model & Polish
- [ ] Boost job (simulated wallet) · platform-fee line on release
- [ ] Landing business/impact section with seeded stats
- [ ] Admin stats dashboard (jobs, fill rate, avg wage, active users)
- [ ] RTL/Urdu + accessibility pass · PWA manifest
- [ ] Cleanup: `/demo` page, terms date, meta/favicon

## Phase 5 — Ship
- [ ] Full regression + production deploy smoke test
- [ ] 3-minute demo script · README rewrite · screenshots

---

## Execution log

| Date | Entry |
|---|---|
| 2026-09-03 | Phase 0 complete: CI, lint scoping (1,915 → 0 errors), `npm run setup`, rich seed, dev branch pushed |
| 2026-09-03 | Findings: build green baseline; MCP token read-only → tracking lives here; `tmp/*.cjs` scripts are env-based (no secrets in repo) |
| 2026-09-03 | Bug found & fixed: seed defined `main()` without invoking it → silent exit 0 + zero writes (misleading!). Verified counts after fix: 16 users · 12 profiles · 6 jobs · 5 offers · 3 payments · 3 feedbacks · 8 notifications |
| 2026-09-03 | Tooling note: this machine's shell output capture intermittently replays stale command output — always use markers/timestamps when verifying |
| 2026-09-03 | GitHub API token upgraded by owner: issues #1–#7 created via MCP; sub-issue hierarchy endpoint still 403 (needs broader scope) — checklist refs used instead |
| 2026-09-03 | Local dev server verified: `npm run dev` → HTTP 200 on `/en` with seeded data — owner starts manual demo-user testing against `localhost:3000` (Vercel URL still serves old `main` + ephemeral SQLite until Phase 1 deploy) |
| 2026-09-03 | **Neon Postgres migration complete**: schema provider → postgresql; libsql adapter + deps removed; schema pushed + seeded on Neon (verified 16/12/6/5/3/3/8/1); build green; local server stopped per owner preference (live-URL testing only) |
| 2026-09-03 | **Secrets incident handled**: `tmp/vercel-env.cjs` with hardcoded AUTH_SECRET/CRON_SECRET/Turso token was committed → removed from repo; values rotated; Turso abandoned (token moot); security headers added; vercel.json cron added. Deploy pending Vercel CLI auth |
