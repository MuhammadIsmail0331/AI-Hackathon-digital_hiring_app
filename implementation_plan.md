# Implementation Plan

## [Overview]

**Goal:** Give Digital Hiring (Rozgaar) a one-of-a-kind visual identity (rich boundaries + layered backgrounds + purposeful animation) while hardening every technical flow and making the app genuinely usable by a low-literacy mainstream Pakistani audience.

The codebase is currently healthy: local `main` = GitHub `main` = `dc5ff2d`, TypeScript clean, build green, 4/4 E2E passing, design-token system in place (`globals.css`), dark mode + RTL working, all core marketplace flows implemented. Investigation found concrete gaps this plan closes:

**Visual gaps:** `SideGarland` sits at `z-30` (above content `z-10` — the overlap the user complained about), is sparse (a dashed rope + 3 basic shapes); `DoodleBackground` is 8 tiny monochrome sketches at 16% opacity; interior pages feel flat vs. the landing; ~20 files still contain off-palette `blue-*`/`gray-*` classes.

**Technical gaps:** registration OTP is **optional** (`// OTP verification — skip if not provided (temporary bypass)` in `src/app/api/auth/register/route.ts`); `matchReason` is stored and rendered as hardcoded English strings (broken in Urdu mode); dashboards swallow fetch failures with silent `catch {}` (no error UI); no job-edit UI; worker availability is a read-only badge (no toggle); no help/FAQ page.

**Approach:** Two parallel workstreams that never touch business logic while the visual layer is rebuilt, then a hardening pass, then new user-facing features, then tests + deploy. All decorations render at `z-0` behind content (`z-10`), are `aria-hidden` + `pointer-events-none`, honor `prefers-reduced-motion`, and use only semantic tokens (auto-correct in dark mode + RTL).

## [Types]

**New structured match reason (replaces free-text English string):**
```ts
// src/lib/matching.ts
export interface MatchReasonData {
  skillPct: number;            // 0-100
  distKm: number | null;       // null when coords unavailable
  wageOk: boolean;             // job.wage >= expectedWage
}
```
- `JobOffer.matchReason` (existing DB column, `String?`) will store `JSON.stringify(MatchReasonData)` for NEW offers.
- Renderer detects legacy plain-text rows (`!value.startsWith("{")`) and displays them raw; JSON rows render via localized templates.

**New i18n keys** (both `en.json` and `ur.json`, current count 560/560 stays balanced):
- `Voice.*` — button label, "listening/speaking" states, unsupported message
- `Help.*` — FAQ page title + 8 Q&A pairs (icon-driven)
- `Dashboard.availToggle`, `Dashboard.availOn`, `Dashboard.availOff`
- `JobForm.step1/step2/step3` labels
- `MatchReason.template` variants: full ("90% skill match · 2.3 km away · wage meets expectation"), no-distance, below-wage — EN + UR
- `Jobs.edit*` — edit button, modal labels, saved message

**No schema changes** (no Prisma migration needed this round).

## [Files]

### New files
| Path | Purpose |
|---|---|
| `src/components/layout/HeritageFrame.tsx` | Replaces `SideGarland.tsx`. Fixed `z-0` decorative columns: LEFT — jharoka arch top, hanging diya lamp with pulsing amber glow, 4 illustrated tools on ornate brackets, perched birds; RIGHT — flowering vine, hanging lantern, small ladder, leaf details. Pure inline SVG, theme tokens, `xl:block` only. |
| `src/components/ui/LayeredBackground.tsx` | Replaces `DoodleBackground.tsx`: (1) two soft radial gradient glows (emerald top-left, amber bottom-right, theme-aware), (2) CSS paper-grain via inline SVG `feTurbulence` data-URI at ~2.5% opacity, (3) 14 richer tool doodles (brush, gear, hard-hat, ladder, bricks, wrench, roller, saw, trowel, bucket, level, wire-spark, paint-can, plumb-line) with varied sizes/opacity (0.10–0.18 light / 0.07–0.12 dark) and slow drift. `z-0`, `aria-hidden`, `pointer-events-none`. |
| `src/components/ui/VoiceHelp.tsx` | Floating "🔊 Sunen / Listen" pill for key pages. Web Speech API (`speechSynthesis`), reads a page-specific guidance string in active locale (`ur-PK`/`en-PK` voice lookup, graceful "not supported" toast fallback). Zero backend. |
| `src/app/[locale]/help/page.tsx` | Visual FAQ: 8 icon-led Q&A cards (how to get work / how to hire / payment safety / OTP help / ratings / blocking / contact / language), bilingual, linked from footer + login/register. `generateStaticParams` via `setRequestLocale`. |
| `tests/e2e/security.spec.ts` | Registration REQUIRES OTP: submit without code → blocked with message; wrong code → error; correct code → success + redirect. |
| `tests/e2e/worker-tools.spec.ts` | Availability toggle flips + persists; help page renders both locales. |

### Modified files
| Path | Changes |
|---|---|
| `src/app/[locale]/layout.tsx` | Swap `SideGarland`→`HeritageFrame`, `DoodleBackground`→`LayeredBackground`; add Help link in footer strip. |
| `src/app/globals.css` | New keyframes: `glow-pulse` (diya/lantern), `ripple` (touch feedback), `draw-check` (success ✓), `badge-pulse` (unread notifications), `page-enter`; utility classes `.animate-*`; tap-ripple class for large action buttons; keep reduced-motion guard. |
| `src/components/layout/SideGarland.tsx` | **DELETE** (replaced by HeritageFrame). |
| `src/components/ui/DoodleBackground.tsx` | **DELETE** (replaced by LayeredBackground). |
| `src/app/[locale]/worker/dashboard/page.tsx` | (1) silent `catch {}` → `ErrorBanner` + retry; (2) availability **toggle** (big switch → `PATCH /api/worker/profile {isAvailable}` + animated ✓); (3) stat tiles get colored icon medallions; (4) `VoiceHelp` mount; (5) page-enter animation. |
| `src/app/[locale]/employer/dashboard/page.tsx` | Same error-state fix; off-palette `bg-blue-100`/`shadow-blue-200/300` → tokens; `VoiceHelp`; wallet tile icon medallion. |
| `src/app/api/auth/register/route.ts` | **Remove OTP bypass**: `otpCode` becomes required (`registerSchema` update), verified via existing `isPhoneOTPVerified`/`verifyOTP`; 400 with clear message if missing/invalid. |
| `src/lib/validation/auth.schemas.ts` | `otpCode: z.string().length(6)` (required). |
| `src/app/[locale]/register/page.tsx` | OTP block marked required with icon guidance; demo-code box remains (always works); submit disabled until code verified state. |
| `src/lib/matching.ts` | Emit `MatchReasonData` JSON in `reason` field (interface renamed accordingly); keep score math identical. |
| `src/app/[locale]/worker/offers/page.tsx` | Parse JSON reason → localized template; legacy strings fall back raw. |
| `src/app/[locale]/employer/jobs/new/page.tsx` | 3-step icon progress indicator (Describe → Wage/Time → Review) driven by scroll/section state; `VoiceHelp` mount. |
| `src/app/api/employer/jobs/[id]/route.ts` | VERIFY existing PATCH; if absent, add PATCH handler (owner-only, only `OPEN`/`MATCHING` status AND zero accepted offers) updating title/wage/date/times/location; Zod-validated. |
| `src/app/[locale]/employer/jobs/[id]/page.tsx` | "Edit job" entry (visible when OPEN/MATCHING + no accepted offers) → prefilled modal → PATCH → success toast. |
| `src/lib/validation/job.schemas.ts` + `profile.schemas.ts` + `feedback.schemas.ts` | Trim + max lengths (title 120, bio 500, custom "Other" inputs 60, comment 500) + strip control chars. |
| `next.config.ts` | Add `Permissions-Policy: camera=(), microphone=(), geolocation=(self)` header. |
| `src/i18n/messages/en.json`, `ur.json` | New keys listed in [Types] (scripted deep-merge, keeps 1:1 parity). |
| Palette sweep (script) | Replace remaining `blue-*`/`gray-*` classes with tokens in: `src/components/ui/Badge.tsx`, `src/lib/constants.ts` (category accent colors keep hue but via explicit hex constants — allowed), and any `[locale]` page hits found by grep. |
| `docs/ROADMAP.md`, `docs/DESIGN.md`, `README.md`, `docs/CONTEXT.md` | Log this pass; document HeritageFrame/LayeredBackground/VoiceHelp/OTP-enforcement. |

### Deleted
- `src/components/layout/SideGarland.tsx`, `src/components/ui/DoodleBackground.tsx` (replaced, not patched).

## [Functions]

| Function | File | Change |
|---|---|---|
| `findMatchingProfessionals(job, excludeIds)` | `src/lib/matching.ts` | `reason` output becomes `JSON.stringify({skillPct, distKm, wageOk})`. Score logic untouched. |
| `renderMatchReason(raw, t)` (NEW) | `src/lib/labels.ts` | Parses JSON reason → localized string via `MatchReason.*` templates; falls back to raw text for legacy rows. |
| `POST register` | `src/app/api/auth/register/route.ts` | OTP enforcement: reject missing/unverified `otpCode` (400). |
| `PATCH /api/employer/jobs/[id]` | `src/app/api/employer/jobs/[id]/route.ts` | Add if missing: owner + status + zero-offers guard, Zod body, returns updated job. |
| `speak(text, locale)` (NEW) | `src/components/ui/VoiceHelp.tsx` | Wraps `speechSynthesis`: voice selection for `ur-PK`/`en-PK`, cancel-previous, unsupported detection. |
| `toggleAvailability()` (NEW) | worker dashboard `page.tsx` | PATCH profile `isAvailable`, optimistic UI + animated confirmation, ErrorBanner on failure. |
| Client loaders (dashboards, offers, my-jobs, profile pages) | various `[locale]` pages | Silent `catch {}` → set error state → render `<ErrorBanner onRetry>`. |

## [Classes]

No classes are used in this codebase (functional components + Prisma client). All new components are function components; `VoiceHelp` and availability toggle are client components (`"use client"`). HeritageFrame/LayeredBackground are server-renderable (pure SVG/CSS).

## [Dependencies]

**None added.** VoiceHelp uses the native Web Speech API; decorations are inline SVG + CSS keyframes; framer-motion, sonner, canvas-confetti already installed and reused. This keeps bundle size unchanged (current first-load ~103 kB).

## [Testing]

1. `npx tsc --noEmit` → 0 errors.
2. `npm run lint` → 0 errors.
3. `npm run build` → green (gate before any push to `main`).
4. Playwright: existing 4 specs stay green + `security.spec.ts` (OTP required at registration: no-code blocked, wrong-code error, correct-code success) + `worker-tools.spec.ts` (availability toggle persists; `/help` + `/ur/help` render) → `npm run test:e2e` 6/6.
5. Screenshot loop (`scripts/screenshot.mjs`) for light/dark × EN/UR on: landing, both dashboards, help, offers — verify no decoration overlaps content, no gray-on-surface contrast issues.
6. Live smoke after deploy: home 200 both locales; register WITHOUT code → 400 message; `/help` 200; availability PATCH persists (DB check via `scripts/check-admin.cjs`-style query).
7. Git protocol: commits per workstream, push `main` only after build+tests green; log each step in `docs/ROADMAP.md`.

## [Implementation Order]

1. **Baseline + plan into repo** — copy plan file to repo root; `tsc` + `build` baseline green.
2. **Visual foundation** — `HeritageFrame` + `LayeredBackground` + layout swap + delete old components + new keyframes in `globals.css`; screenshot-verify z-order (decorations behind content, both themes).
3. **Dashboard visual upgrade** — icon medallions, BrandAccent section underlines, off-palette color sweep (Badge.tsx, dashboards, remaining hits).
4. **Micro-animations** — tap-ripple on large action buttons, success draw-check, unread-badge pulse, page-enter on dashboards.
5. **Low-literacy features** — VoiceHelp (mount on both dashboards, create-job, offers), worker availability toggle, create-job step indicator.
6. **Help page** — `/help` + `/ur/help` with 8 icon Q&As + footer/auth-page links + i18n keys.
7. **Security hardening** — OTP enforcement (route + schema + register page), input max-lengths/control-char strip, Permissions-Policy header, generic login errors verified.
8. **matchReason i18n** — structured JSON from matching.ts + localized renderer on offers page.
9. **Job edit** — verify/add PATCH route + edit UI on employer job detail (guarded states only).
10. **Error-state sweep** — replace all remaining silent catches with ErrorBanner+retry.
11. **Tests** — add 2 specs, run full suite 6/6.
12. **Docs + deploy** — ROADMAP/DESIGN/README/CONTEXT updates, push `main`, Vercel auto-deploy, live smoke test, final report.
