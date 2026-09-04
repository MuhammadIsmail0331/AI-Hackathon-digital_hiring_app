/**
 * LayeredBackground — global atmospheric layer mounted once in the root
 * layout at z-0 (content lives at z-10). Three layers:
 *   1. soft radial glows (emerald / amber / terracotta, theme-aware)
 *   2. CSS paper-grain texture (SVG feTurbulence, ~3% opacity)
 *   3. 14 floating workshop doodles (stroke line-art, slow drift)
 * aria-hidden, pointer-transparent, honors prefers-reduced-motion.
 */
const DOODLES: Array<{
  d: string;
  x: string;
  y: string;
  s: number;
  delay: string;
  anim: "float" | "drift-a" | "drift-b";
}> = [
  { d: "M4 5 H14 V9 H10 L12 19 H9 L7 9 H4 Z", x: "5%", y: "14%", s: 1, delay: "0s", anim: "float" },
  { d: "M14 4 a4 4 0 1 0 5 5 L10 18 a2.4 2.4 0 1 1 -3.4 -3.4 L15 6", x: "91%", y: "12%", s: 1.15, delay: "0.7s", anim: "drift-a" },
  { d: "M4 4 h11 v5 h-11 z M9 9 v4 M9 13 v7", x: "88%", y: "68%", s: 1.05, delay: "1.2s", anim: "float" },
  { d: "M12 8 a4 4 0 1 0 0 8 a4 4 0 1 0 0 -8 M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3 M5 5 l2 2 M17 17 l2 2 M19 5 l-2 2 M7 17 l-2 2", x: "7%", y: "64%", s: 1.2, delay: "1.8s", anim: "drift-b" },
  { d: "M4 15 a8 8 0 0 1 16 0 M2 15 h20 M12 7 V4", x: "48%", y: "7%", s: 0.9, delay: "0.4s", anim: "float" },
  { d: "M8 2 v20 M16 2 v20 M8 6 h8 M8 11 h8 M8 16 h8", x: "72%", y: "88%", s: 1, delay: "2.2s", anim: "drift-a" },
  { d: "M3 3 h18 v18 H3 z M3 9 h18 M3 15 h18 M9 3 v6 M15 9 v6 M7 15 v6 M13 15 v6", x: "28%", y: "86%", s: 1.1, delay: "0.9s", anim: "float" },
  { d: "M3 9 L21 5 M3 9 l2 2 2 -2 2 2 2 -2 2 2 2 -2 2 2 2 -2 M21 5 V2 h-3", x: "62%", y: "55%", s: 0.95, delay: "1.5s", anim: "drift-b" },
  { d: "M12 3 L18 9 L12 15 L6 9 Z M12 15 v5 M10 20 h4", x: "12%", y: "40%", s: 0.85, delay: "2.6s", anim: "float" },
  { d: "M5 9 h14 l-2 11 H7 z M5 9 a7 5 0 0 1 14 0", x: "84%", y: "36%", s: 1, delay: "0.2s", anim: "drift-a" },
  { d: "M13 3 l4 4 -9 9 -5 1 1 -5 z", x: "38%", y: "68%", s: 0.8, delay: "3s", anim: "float" },
  { d: "M13 2 L6 13 h5 l-1 9 8 -12 h-5 z", x: "55%", y: "22%", s: 0.9, delay: "1s", anim: "drift-b" },
  { d: "M5 9 h14 v11 H5 z M5 9 a7 3 0 0 1 14 0 M9 4 h6 M12 4 v5", x: "20%", y: "8%", s: 0.85, delay: "2s", anim: "float" },
  { d: "M2 10 h20 v5 H2 z M10 10 v5 M14 10 v5 M12 12.5 a0.9 0.9 0 1 0 0.01 0", x: "68%", y: "10%", s: 1, delay: "3.4s", anim: "drift-a" },
];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function LayeredBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* 1 — soft radial glows */}
      <div className="absolute -top-32 -start-32 h-[34rem] w-[34rem] rounded-full bg-primarysoft blur-3xl dark:opacity-40" />
      <div className="absolute -bottom-40 -end-32 h-[38rem] w-[38rem] rounded-full bg-accentsoft blur-3xl dark:opacity-30" />
      <div className="absolute top-1/3 end-1/4 h-72 w-72 rounded-full bg-terracottasoft opacity-70 blur-3xl dark:opacity-25" />

      {/* 2 — paper grain */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05]"
        style={{ backgroundImage: GRAIN }}
      />

      {/* 3 — workshop doodles */}
      {DOODLES.map((d, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`animate-${d.anim} absolute text-muted opacity-[0.15] dark:opacity-[0.09]`}
          style={{
            left: d.x,
            top: d.y,
            width: `${3.6 * d.s}rem`,
            height: `${3.6 * d.s}rem`,
            animationDelay: d.delay,
          }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={d.d} />
        </svg>
      ))}
    </div>
  );
}

