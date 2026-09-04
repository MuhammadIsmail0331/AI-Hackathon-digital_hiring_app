# Design Brief

## The task

Redesign the **app shell** of "Digital Hiring (Rozgaar)" — a bilingual (English/Urdu, RTL) Next.js 15 marketplace connecting Pakistan's daily-wage workers with employers. The interior pages currently look plain compared to the landing page. Your job: make the top navigation, bottom navigation (mobile), side boundaries, page backgrounds, and footer feel like ONE continuous, premium, culturally-grounded visual identity — without touching any logic.

## Hard constraints (do not violate)

1. **Stack:** Next.js 15 App Router + Tailwind CSS v4 (`@import "tailwindcss"` in `src/app/globals.css`) + semantic CSS variables.
2. **Design tokens already exist and MUST be reused** (defined in `globals.css`): `--color-canvas, --color-surface, --color-surface2, --color-line, --color-ink, --color-muted, --color-primary (#0d7a5f emerald), --color-primarystrong, --color-accent (#d97706 amber), --color-terracotta (#c2552b), --color-danger, --color-success` (+ `-soft` variants). Dark mode = `html.dark` overrides of the same tokens. Never hardcode hex values in components; use tokens (`bg-surface`, `text-ink`, `border-line`) or add NEW tokens in globals.css.
3. **RTL + bilingual:** every layout must work mirrored (Urdu). Use logical properties (`ms-`, `me-`, `start-`, `end-`) — never `ml-`/`mr-`/`left-`/`right-` for directional spacing.
4. **Dark mode:** every design decision must have a dark counterpart via tokens only (backgrounds: warm paper `#faf7f2` light / midnight-emerald `#0c1512` dark).
5. **Layering (critical):** decorative backgrounds at `z-0` (or negative), content `z-10`, sticky header `z-50`. Decorations must NEVER overlap text/cards.
6. **Performance:** CSS-first (gradients, SVG inline, `background-image`), no new JS animation libraries, no large images (≤150KB, prefer SVG/WebP), animations must respect `prefers-reduced-motion`.
7. **No text changes:** keep all i18n keys as-is; you may restyle containers only.
8. **Mobile-first:** primary experience is a low-end Android phone, 360px wide.

## Files you may modify

- `src/app/globals.css` — tokens + utilities + keyframes
- `src/components/layout/Navbar.tsx` — top bar (sticky, glassy, has BrandAccent ribbon)
- `src/components/layout/MobileNav.tsx` (+ `WorkerBottomNav.tsx`, `EmployerBottomNav.tsx`) — mobile bottom tab bars
- `src/components/layout/SideGarland.tsx` — desktop side illustrations (currently: rope garland + swinging tools left, vine + ladder right)
- `src/components/layout/DoodleBackground.tsx` — faint workshop doodles layer (z-0)
- `src/components/ui/BrandAccent.tsx` — truck-art chevron ribbon strip
- `src/app/[locale]/layout.tsx` — shell composition only
- `src/app/[locale]/page.tsx` — ONLY the outer sections if needed (hero is already rich; don't degrade it)

## Design direction (Heritage Craft)

- Palette: deep emerald `#0d7a5f` + warm amber `#d97706` + terracotta `#c2552b` on warm paper `#faf7f2` (light) / midnight emerald `#0c1512` (dark).
- Motifs: Pakistani truck-art (chevrons, diamonds, small mirrors), jharoka arches, geometric patterns — always SUBTLE and small in scale, never louder than the content.
- Typography already loaded: Sora (display), Inter (body), Noto Nastaliq Urdu.

## Deliverables

1. **Top bar:** keep sticky + glass (backdrop-blur), but give it a stronger branded bottom edge (e.g., 3px truck-art gradient ribbon), refined link pills, and a visible pressed/hover state on every item.
2. **Side boundaries (desktop ≥1280px only):** replace the current garland with cohesive illustrated side columns — either (a) jharoka-arch window strips with hanging plants/lanters, or (b) vertical truck-art carved board with hanging tools — must be transparent-background inline SVG, sway-float animation, hidden below xl, and pointer-events-none.
3. **Inner-page backgrounds:** replace the flat canvas with a barely-there layered treatment: warm paper tint + 2–3% opacity geometric pattern + one large soft radial glow per corner (emerald/amber), all at z-0 behind content. It must read as "crafted paper," not noise, in BOTH themes.
4. **Bottom nav (mobile):** floating pill-style tab bar with soft shadow, active tab gets a small animated indicator (sliding dot/pill), icons get a spring press.
5. **Footer:** slightly richer — thin truck-art ribbon on top, three tidy columns, same tokens.
6. Write everything as clean, commented code, split into small components, and list every file you changed with a one-line reason.

## Success criteria

- Open /en and /ur in light and dark: boundaries and backgrounds feel designed but content is the hero.
- No horizontal scrollbars, no CLS, decorations behind text at all sizes.
- A judge scrolling inner pages should feel the same identity as the landing page.

## Optional assets (will be generated separately)

- `bg-paper-texture.png` — seamless tileable warm-paper texture, 512×512, ≤80KB
- `border-truckart-strip.png` — seamless horizontal truck-art border strip, 1024×128
- `side-jharoka-column.svg` — vector jharoka arch column, transparent bg
