# Initial Temp Implementation Plan 

## [Overview]

**Goal:** Transform the app from a generic blue Tailwind UI into a distinctive **"Heritage Craft"** identity (deep emerald + warm amber + terracotta, truck-art-inspired geometric motifs, bilingual English/Nastaliq-Urdu typography as a design feature, warm light theme + midnight-emerald dark theme) across **every page**, add a **dark-mode toggle**, and finish the remaining **Phase 1 reliability items** — all without changing business logic, API contracts, i18n structure, or RTL behavior.

**Scope & context.** Investigation found the root causes of the "AI-generated" look: (1) fonts declared in CSS but **never loaded** — Inter and Noto Nastaliq Urdu fall back to system fonts, and Urdu body text renders in a fallback serif today; (2) 30+ pages hardcode utility classes (`bg-white`, `text-gray-900`) with no design tokens, so theming means touching every page twice; (3) shared UI components are lightly styled and mostly unused by pages; (4) no dark-mode infrastructure exists; (5) the reported "Job Completed → worker lands on empty employer page" bug lives in `src/app/[locale]/notifications/page.tsx` `handleClick` (any non-`JOB_OFFER` type falls through to `/employer/jobs`); (6) the wage input on `employer/jobs/new` clamps via `Math.max(100, Number(...))`, causing the reported "type 5 after 2000 → 1005" bug.

**Approach.** Token-first theming: semantic CSS variables (`canvas, surface, surface2, ink, muted, line, primary, accent, terracotta, success, danger`) with light values on `:root` and dark values under `.dark`, exposed to Tailwind v4 via `@theme inline` — so `bg-surface`, `text-ink`, `border-line` switch themes automatically. Add `@custom-variant dark` for explicit variants. Restyle shared components once, then sweep every page replacing hardcoded classes with semantic ones (mechanical, verifiable per page). Load real fonts via `next/font/google`. Add the toggle with a no-flash inline script. Fold Phase 1 technical fixes (error states, cancel-job, auto-expiry, notification batching, notification-link fix, wage-input fix) into the same page sweeps so each page is touched exactly once. Playwright E2E validates the golden path; deploy via the git-connected Vercel project (push to `main` auto-deploys).

**Non-goals (explicit):** no new runtime dependencies (motion is CSS-only), no chat/SMS/semantic-search/verification-queues/image-uploads, no API contract changes beyond listed additions, registered name stays "Digital Hiring App" (display brand becomes **"Rozgaar روزگار"** via i18n keys — reversible).

## [Types]

- `type ThemeMode = "light" | "dark" | "system"` — used by `ThemeToggle` and the no-flash script; persisted in `localStorage` key `"rozgaar-theme"`.
- `src/lib/constants.ts`: extend `JOB_STATUSES` with `"EXPIRED"`; extend `PAYMENT_STATUSES` with `"REFUNDED"`; add `CATEGORY_COLORS: Record<WorkerCategoryId, { from: string; to: string; tint: string }>` (Tailwind literal class strings, one hue family per category across the 12 categories).
- `src/lib/status.ts` (new): `type StatusTone = "success" | "warning" | "danger" | "info" | "default" | "purple" | "expired"`; `getStatusBadge(status: string, t: (k: string) => string): { tone: StatusTone; label: string }`; `formatPKR(n: number): string`; `formatJobDate(iso: string, locale: "en" | "ur"): string`. Replaces the 5 duplicated `getStatusBadge` copies in pages.
- Component prop types (exported from each new file): `PageHeaderProps { title: string; subtitle?: string; actions?: React.ReactNode; backHref?: string }`; `StatCardProps { label: string; value: React.ReactNode; icon?: React.ReactNode; tone?: "primary" | "accent" | "terracotta" | "neutral"; hint?: string }`; `EmptyStateProps { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }`; `BrandAccentProps { className?: string; height?: "sm" | "md"; flip?: boolean }`; `ErrorBannerProps { message: string; onRetry?: () => void }`; `SuccessBannerProps { message: string }`; `ThemeToggleProps { className?: string }`.

## [Files]

**New files**
- `src/components/layout/ThemeToggle.tsx` — sun/moon button; resolves stored → system on first visit; toggles `.dark` on `document.documentElement`; i18n `aria-label`.
- `src/components/ui/BrandAccent.tsx` — the truck-art signature: repeating SVG chevron/diamond ribbon (emerald→amber→terracotta segments); used as nav strip, hero divider, footer accent, StatCard top edge.
- `src/components/ui/PageHeader.tsx` — consistent title block (title, subtitle, actions slot, optional back button).
- `src/components/ui/StatCard.tsx` — icon tile + value + label + hint with BrandAccent top edge; used on both dashboards.
- `src/components/ui/EmptyState.tsx` — icon + title + description + action; replaces the differing dashed boxes.
- `src/components/ui/Skeleton.tsx` — `Skeleton`, `SkeletonCard`, `SkeletonList` shimmer components for list loading states.
- `src/components/ui/Feedback.tsx` — `ErrorBanner` (with retry), `SuccessBanner`, `InlineLoader` — the Phase 1 error-state standard for every fetch page.
- `src/lib/status.ts` — shared status/badge/format helpers (see Types).
- `src/app/api/employer/jobs/[id]/cancel/route.ts` — POST: session check (employer + owner); job status must be `OPEN | MATCHING | OFFERS_SENT | IN_PROGRESS`; transaction: job → `CANCELLED`, payment → `REFUNDED` (+ `releasedAt`), notifications to PENDING workers ("no longer available") and ACCEPTED workers ("cancelled by employer") with links; existing DELETE route untouched.
- `src/app/icon.svg` — brand favicon: emerald rounded square with white chevron mark.
- `tests/e2e/golden-path.spec.ts`, `tests/e2e/regressions.spec.ts`, `playwright.config.ts` — see Testing.
- `docs/DESIGN.md` — token reference, palette, usage rules for future pages.

**Modified files (foundation)**
- `src/app/globals.css` — `@custom-variant dark (&:where(.dark, .dark *));`; `:root`/`.dark` semantic variable sets; `@theme inline` mapping (`--color-canvas`, `--color-surface`, `--color-surface2`, `--color-ink`, `--color-muted`, `--color-line`, `--color-primary`, `--color-primarysoft`, `--color-accent`, `--color-terracotta`, `--color-success`, `--color-danger`); font vars wired from `next/font`; keyframes `fade-up`, `shimmer`, `pop`; `prefers-reduced-motion` global guard; selection color; focus-ring token.
- `src/app/[locale]/layout.tsx` — `next/font/google`: `Sora` (display), `Inter` (body), `Noto_Nastaliq_Urdu` (subsets ["arabic"]) for Urdu headings, `Noto_Naskh_Arabic` (subsets ["arabic"]) for Urdu body; CSS vars `--font-display/--font-sans/--font-urdu-heading/--font-urdu-body`; `[dir="rtl"] body` uses `--font-urdu-body`; no-flash theme `<script>` (reads `rozgaar-theme`, else `prefers-color-scheme`, sets `.dark` pre-paint); `<html suppressHydrationWarning>`; metadata (title template `%s · Rozgaar`, description) + `viewport` export with `themeColor` light `#faf7f2` / dark `#0c1512`; restyled footer (BrandAccent strip; "Developed and tested by Nasir" preserved); skip-link restyle.
- `src/components/layout/Navbar.tsx` — brand: emerald tile with chevron mark + "Rozgaar" wordmark (display font) + Urdu sub-mark; `ThemeToggle` before `LanguageSwitch`; token + dark classes; dropdown restyle; truck-art strip replaces the blue-purple gradient line.
- `src/components/layout/MobileNav.tsx` — surface/line tokens; active item = emerald pill with icon pop animation; dark styles.
- `src/components/layout/LanguageSwitch.tsx`, `AuthPageWrapper.tsx` — token restyle; AuthPageWrapper gets heritage pattern + warm glows (dark-aware).
- `src/components/ui/RouteLoader.tsx`, `LoadingVideo.tsx` — overlay uses `--color-canvas` (dark-aware, not hardcoded `#fff`); branded ring around the mp4; if `prefers-reduced-motion`, skip video (compact branded spinner instead); keep `/loading-animation.mp4`.
- `src/app/[locale]/loading.tsx` — branded route-transition skeleton.
- `src/components/ui/Button.tsx` — variants: `primary` (emerald gradient), `secondary` (amber), `outline`, `ghost`, `danger`; token focus rings; micro press animation (CSS).
- `src/components/ui/Card.tsx` (`surface` token + layered shadow + optional `accent` prop), `Badge.tsx` (token tones incl. `expired`), `Input.tsx` (surface, emerald focus ring), `CategorySelector.tsx` (**per-category color tiles via CATEGORY_COLORS** — icons tinted, selected = gradient ring), `CitySelector.tsx`, `SkillSelector.tsx`, `ToolSelector.tsx`, `DayPicker.tsx`, `TimeSelector.tsx`, `NumberSelector.tsx` (token + dark + hover/active micro-interactions).

**Modified files (pages sweep — every page exactly once)**
- `src/app/[locale]/page.tsx` — landing rebuild: patterned hero (BrandAccent + brand-hue mesh), bilingual headline (English + Urdu wordmark), role cards with colored icon tiles, honest stats strip, features trio, CTA footer.
- Auth trio: `login/page.tsx`, `register/page.tsx`, `forgot-password/page.tsx` — token restyle, password-strength colors, OTP dev-code box; **no logic changes**.
- Worker: `dashboard/page.tsx` (StatCards for rating/jobs/active; profile card with category-color tile), `jobs/page.tsx` (filter chips, job cards with wage emphasis + branded match bar + SkeletonList/ErrorBanner/EmptyState), `offers/page.tsx` (offer cards + confirm restyle), `my-jobs/page.tsx`, `my-jobs/[id]/page.tsx` (status/payment badges via lib/status incl. REFUNDED), `profile/page.tsx` (numbered section cards restyle).
- Employer: `dashboard/page.tsx` (StatCards + recent jobs), `jobs/page.tsx`, `jobs/new/page.tsx` (full form restyle + **wage fix**: `useState<string>("")` + placeholder, validate integer 100–100000 on submit; total-cost preview parses safely), `jobs/[id]/page.tsx` (offers list, escrow badges incl. REFUNDED, **Cancel button → POST /cancel** with confirm + result banner; delete flow unchanged), `profile/page.tsx`.
- `notifications/page.tsx` — restyle + **fix `handleClick`**: prefer `n.data.link`; for `JOB_COMPLETED` without link, role-aware (fetch session: WORKER → `/worker/my-jobs/{jobId}`, EMPLOYER → `/employer/jobs/{jobId}`); FEEDBACK_REQUEST → `/feedback/{jobId}?...` when data present.
- `feedback/[jobId]/page.tsx`, `terms/page.tsx`, `report/page.tsx`, `admin/page.tsx` — token sweep + restyle.

**Modified files (APIs & config)**
- `src/app/api/employer/jobs/[id]/complete/route.ts` — add `link: /worker/my-jobs/{jobId}` to worker `JOB_COMPLETED` notifications.
- `src/app/api/cron/background-search/route.ts` — add expiry pass: jobs with `date < startOfToday` and status in `OPEN/MATCHING/OFFERS_SENT` → `EXPIRED` + employer notification; include `expiredJobs` count in response.
- `src/app/api/employer/jobs/route.ts` — replace per-match notification loop with `createBulkNotifications`; after job creation, fire-and-forget POST to own `/api/cron/background-search` with `Authorization: Bearer ${process.env.CRON_SECRET}` (background search starts instantly; Vercel cron stays as backstop).
- `src/app/api/worker/offers/[id]/route.ts` — batch auto-decline loop via `createBulkNotifications`.
- `src/i18n/messages/en.json` + `ur.json` — new keys: `Theme.*`, `Common.{errorTitle,retry,cancelled,refunded,expired}`, `Jobs.{cancelJob,cancelConfirm,jobCancelledRefund}`, `Notifications.jobExpired`, landing stats labels — with Urdu translations.
- `package.json` — devDependency `@playwright/test`; scripts: `"test:e2e": "playwright test"`.

**Deleted**
- `src/app/[locale]/demo/page.tsx` (component playground exposed in production).

## [Functions]

**New:** POST handler (`src/app/api/employer/jobs/[id]/cancel/route.ts`); `expirePastJobs()` inside cron route; `getStatusBadge`, `formatPKR`, `formatJobDate` (`src/lib/status.ts`); `applyTheme(mode)` (ThemeToggle helper); `categoryGradient(id)` (constants helper).

**Modified:** `handleClick` (notifications page); wage `onChange`/submit validation (jobs/new); `show()/hide()` (RouteLoader reduced-motion branch); employer jobs POST handler (bulk + trigger); offers PUT accept handler (bulk decline notifications).

**Removed:** none — no logic deletions; every existing fetch/validation flow is preserved.

## [Classes]

No class components exist; all React function components. Only structural addition is ThemeToggle's module-level pure helpers.

## [Dependencies]

- devDependency `@playwright/test` (1.x) + `npx playwright install chromium`.
- `next/font/google` is built into Next 15 (no install); fonts download at build (Vercel OK).
- **No runtime dependency changes** — CSS-only motion (no framer-motion), per project simplicity rules.

## [Testing]

1. `npm run lint` → 0 errors; `npm run build` → green.
2. Playwright against local dev server (Neon):
   - **golden-path.spec**: employer login (`sara@example.com`) → create job via visual selectors → matches screen → offers sent → logout → worker login (`usman@example.com`) → accept offer → my-jobs IN_PROGRESS → employer completes → worker sees JOB_COMPLETED and lands on `/worker/my-jobs/[id]` (**regression for the reported bug**) → worker feedback → employer feedback → rating visible.
   - **regressions.spec**: cancel-job refunds escrow (REFUNDED badge + worker notification); past-date job auto-expires via cron call; wage field overwrite `2000` → select-all → `5000` yields exactly `5000`.
3. Manual matrix per project rules: {en, ur} × {light, dark} × {mobile, desktop} on landing, auth, both dashboards, jobs/new, jobs/[id], notifications, feedback. Verify Nastaliq headings render, WCAG-AA contrast on key text, visible focus rings, reduced-motion honored.
4. Deploy: merge `dev` → `main`, push (git-connected Vercel auto-deploys) → live curl smoke + theme/font check on production.

## [Implementation Order]

1. **Foundation:** globals.css tokens + dark variant + keyframes; layout.tsx fonts + no-flash script + metadata; `icon.svg`; ThemeToggle; Navbar/MobileNav/LanguageSwitch/footer shell.
2. **Shared UI:** Button/Card/Badge/Input + all selectors; new PageHeader/StatCard/EmptyState/Skeleton/Feedback/BrandAccent; `lib/status.ts`; constants (`EXPIRED`, `REFUNDED`, `CATEGORY_COLORS`); delete demo page.
3. **Landing + auth** pages.
4. **Worker sweep** (dashboard → jobs → offers → my-jobs → detail → profile) with error/skeleton/empty states.
5. **Employer sweep** (incl. wage fix + cancel wiring).
6. **Notifications (link fix) + feedback + terms + report + admin + loading + RouteLoader branding.**
7. **APIs:** cancel route; cron expiry; bulk notifications + opportunistic trigger; complete-route link; i18n keys (en+ur).
8. **Playwright** setup + specs; run and fix until green.
9. **Ship:** lint + build; merge dev→main; push; live verification; update `docs/ROADMAP.md` + issue #3; phase summary.

**Guardrails:** no business-logic edits beyond listed; all new text via i18n keys (en+ur); logical CSS properties (ps/pe/ms/me/start/end) everywhere for RTL; preserve all existing `aria-*`, the skip-link, and the loading video; no DB schema changes; seed data untouched (E2E runs against it); commit + push after each step per the owner's git workflow.

---

## Postscript — delivered beyond the original scope (submission round)

- Role-aware landing CTAs (dual-mode routing per team spec)
- One-command demo recorder: `npm run demo:record` (webm + ffmpeg mp4)
- Global press-feedback system + boosted hover animations (see docs/DESIGN.md)
- `docs/PROJECT_SUMMARY.md` (paste-ready judge summary), `docs/DESIGN-BRIEF.md` (design iteration brief)
- Repo hygiene: legacy test screenshots -> version_1.0-tests/, brand video -> brand-assets/, debug scripts and IDE configs removed
