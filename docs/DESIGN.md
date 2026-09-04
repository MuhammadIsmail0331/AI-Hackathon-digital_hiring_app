# Design System — Heritage Craft

## Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| canvas | #faf7f2 | #0c1512 | Page background |
| surface | #ffffff | #101b17 | Cards, inputs |
| surface2 | #f4efe6 | #16241f | Subtle fills, chips |
| ink | #1c1917 | #e7e5e4 | Primary text |
| muted | #78716c | #a8a29e | Secondary text |
| line | #e7e0d4 | #233530 | Borders, dividers |
| primary | #0d7a5f | #34d399 | Brand, buttons, links |
| primarystrong | #0a6350 | #6ee7b7 | Hover state |
| primarysoft | #e7f4ef | #12291f | Tinted backgrounds |
| accent | #d97706 | #f59e0b | Warnings, highlights |
| accentsoft | #fdf3e3 | #2a2113 | Tinted backgrounds |
| terracotta | #c2552b | #e8956b | Decorative, brand |
| terracottasoft | #fbeae2 | #2c1a12 | Tinted backgrounds |
| success | #15803d | #4ade80 | Positive states |
| danger | #b91c1c | #f87171 | Errors, destructive |

## Typography

| Font | Variable | Usage |
|------|----------|-------|
| Sora | --font-sora | Display headings (EN) |
| Inter | --font-inter | Body text (EN) |
| Noto Nastaliq Urdu | --font-nastaliq | Urdu headings |
| Noto Naskh Arabic | --font-naskh | Urdu body text |

## Animations

- `animate-marquee` — infinite horizontal ticker (30s)
- `animate-drift-a/b` — cloud drift (16-20s alternate)
- `animate-birds` — bird flock path (14s alternate)
- `animate-twinkle` — window opacity pulse (2.6s)
- `animate-float` — vertical bob (5s)
- `animate-sway` — side garland swing (3.2s)
- `animate-fadeup` — scroll reveal
- `animate-pop` — spring pop for badges
- `animate-shimmer` — skeleton loading
- `bh-*` — BrandReveal handshake sequence

All respect `prefers-reduced-motion: reduce`.

## Rules

1. Use semantic tokens (`bg-surface`, `text-ink`, `border-line`) — never raw Tailwind colors
2. Use logical properties (`ps/pe/ms/me/start/end`) for RTL support
3. All text via i18n keys (en + ur)
4. Focus rings: `focus-visible:ring-ring` on all interactive elements
5. Reduced motion: all animations respect `prefers-reduced-motion`
## Interaction & Motion System (final)

- **Press (all devices):** every `button`, `a`, and `[role=button]` squishes to `scale(0.95)` + dims to `brightness(0.92)` on `:active` (80ms) — global rule in `globals.css`, so nav links, bottom tabs, and cards all respond consistently.
- **Hover (pointer devices only):** primary/secondary/danger buttons lift 4px with a colored glow + `brightness(1.10)` + a diagonal shine sweep (`btn-shine`, 650ms). Outline/ghost elements lift 2px. Desktop nav links lift 2px.
- **Reduced motion:** all of the above is wrapped in `motion-safe:` / `prefers-reduced-motion` guards; the shine only fires under `@media (hover: hover)`.
