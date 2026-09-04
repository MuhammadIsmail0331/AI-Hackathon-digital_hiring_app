/**
 * HeritageFrame — illustrated side columns (xl+ screens), rendered at z-0
 * BEHIND all content (main/footer sit at z-10). Pointer-transparent.
 *
 *  LEFT  — jharoka arch, hanging diya lamp with pulsing glow, illustrated
 *          tools (hammer, wrench, roller) on ornate hooks, perched bird.
 *  RIGHT — flowering vine, hanging lantern, small ladder, leaf details.
 *
 * Pure inline SVG, colored via semantic tokens (theme-aware), animations
 * honor prefers-reduced-motion through the global guards in globals.css.
 */
export function HeritageFrame() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 hidden xl:block">
      {/* ════ LEFT COLUMN ════ */}
      <svg
        className="absolute inset-y-0 start-1 h-full w-16 opacity-80 dark:opacity-60"
        viewBox="0 0 64 900"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
      >
        {/* ornate rail with diamond stops */}
        <path d="M30 60 V880" stroke="var(--line)" strokeWidth="2" />
        {[60, 240, 420, 600, 780].map((y) => (
          <rect key={y} x="26" y={y - 4} width="8" height="8" rx="1.5" transform={`rotate(45 30 ${y})`} fill="var(--terracotta)" opacity="0.7" />
        ))}

        {/* jharoka arch at the very top */}
        <g opacity="0.85">
          <path d="M12 46 Q30 4 48 46" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M18 46 Q30 16 42 46" stroke="var(--terracotta)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <path d="M12 46 H48" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
          {[22, 30, 38].map((x) => (
            <circle key={x} cx={x} cy="38" r="1.6" fill="var(--muted)" opacity="0.8" />
          ))}
          <circle cx="30" cy="28" r="2" fill="var(--primary)" opacity="0.8" />
        </g>

        {/* hanging diya lamp with pulsing glow */}
        <g>
          <path d="M30 60 v56" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" />
          <circle className="animate-glow-pulse" cx="30" cy="140" r="17" fill="var(--accentsoft)" opacity="0.9" />
          <path d="M30 128 c3 4 3 8 0 11 c-3 -3 -3 -7 0 -11" fill="var(--accent)" />
          <path d="M18 142 q12 12 24 0 l-4 9 h-16 z" fill="var(--terracotta)" />
          <path d="M16 142 h28" stroke="var(--terracotta)" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* hammer on hook */}
        <g className="animate-sway" style={{ transformOrigin: "30px 262px", animationDelay: "0s" }}>
          <circle cx="30" cy="262" r="3" fill="var(--muted)" opacity="0.7" />
          <path d="M30 265 v20" stroke="var(--muted)" strokeWidth="1.5" />
          <rect x="18" y="285" width="24" height="10" rx="3" fill="var(--primary)" />
          <rect x="27" y="295" width="6" height="22" rx="2.5" fill="var(--accent)" />
        </g>

        {/* wrench on hook */}
        <g className="animate-sway" style={{ transformOrigin: "30px 442px", animationDelay: "1s" }}>
          <circle cx="30" cy="442" r="3" fill="var(--muted)" opacity="0.7" />
          <path d="M30 445 v18" stroke="var(--muted)" strokeWidth="1.5" />
          <path
            d="M24 468 a7 7 0 1 1 10 6 l6 20 a4 4 0 1 1 -7 2 l-6 -20 a7 7 0 0 1 -3 -8"
            stroke="var(--primary)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* paint roller on hook */}
        <g className="animate-sway" style={{ transformOrigin: "30px 622px", animationDelay: "2s" }}>
          <circle cx="30" cy="622" r="3" fill="var(--muted)" opacity="0.7" />
          <path d="M30 625 v16" stroke="var(--muted)" strokeWidth="1.5" />
          <rect x="16" y="641" width="22" height="11" rx="5" fill="var(--terracotta)" />
          <path d="M38 646 h6 v8 h-6" stroke="var(--muted)" strokeWidth="2" fill="none" />
          <rect x="28" y="654" width="5" height="16" rx="2" fill="var(--accent)" />
        </g>

        {/* perched bird near the bottom */}
        <g opacity="0.8" className="animate-float" style={{ animationDelay: "0.8s" }}>
          <path d="M22 812 q6 -8 12 0 q6 -2 6 3 q-1 6 -9 6 h-6 q-6 0 -3 -9" fill="var(--primary)" />
          <circle cx="36" cy="810" r="1.4" fill="var(--canvas)" />
          <path d="M40 812 l5 2 -5 1" fill="var(--accent)" />
          <path d="M25 821 v4 M31 821 v4" stroke="var(--muted)" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      </svg>
      {/* ════ RIGHT COLUMN ════ */}
      <svg
        className="absolute inset-y-0 end-1 h-full w-16 opacity-80 dark:opacity-60"
        viewBox="0 0 64 900"
        preserveAspectRatio="xMidYMin slice"
        fill="none"
      >
        {/* flowering vine */}
        <path
          d="M32 0 C 12 130, 52 260, 26 400 C 6 520, 50 650, 28 900"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.65"
        />
        {[
          [18, 80, -35], [44, 150, 28], [14, 240, -22], [42, 330, 32],
          [16, 430, -28], [44, 520, 24], [18, 620, -30], [42, 710, 26],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx="10" ry="4.5" fill="var(--primary)" opacity="0.5" transform={`rotate(${r} ${x} ${y})`} />
            <path d={`M${x} ${y} q${r > 0 ? 8 : -8} -6 ${r > 0 ? 12 : -12} -2`} stroke="var(--primary)" strokeWidth="1.2" opacity="0.5" />
          </g>
        ))}
        {/* blossoms on the vine */}
        {[
          [40, 105], [20, 285], [40, 475], [22, 665],
        ].map(([x, y], i) => (
          <g key={i} opacity="0.85">
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={x} cy={y - 4} rx="2.6" ry="4.4" fill="var(--terracotta)" transform={`rotate(${a} ${x} ${y})`} />
            ))}
            <circle cx={x} cy={y} r="2.4" fill="var(--accent)" />
          </g>
        ))}

        {/* hanging lantern with glow */}
        <g>
          <path d="M32 150 v34" stroke="var(--muted)" strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" />
          <circle className="animate-glow-pulse" cx="32" cy="212" r="16" fill="var(--accentsoft)" opacity="0.9" style={{ animationDelay: "1.4s" }} />
          <path d="M26 184 h12" stroke="var(--muted)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 188 h16 l2 26 q-10 8 -20 0 z" fill="var(--accent)" opacity="0.85" />
          <path d="M28 188 v26 M36 188 v26" stroke="var(--canvas)" strokeWidth="1.2" opacity="0.5" />
          <path d="M32 222 v6" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* small ladder leaning at the bottom */}
        <g stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" opacity="0.8">
          <path d="M20 600 L26 880" />
          <path d="M42 600 L36 880" />
          <path d="M21 650 H41 M22 705 H40 M23 760 H39 M24 815 H38" />
        </g>
        <rect x="20" y="876" width="22" height="9" rx="3" fill="var(--terracotta)" opacity="0.85" />
      </svg>
    </div>
  );
}
