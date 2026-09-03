/**
 * Illustrated side garlands (xl+ screens):
 *  left  - a rope garland with gently swinging tools
 *  right - a climbing vine with leaves and a small ladder
 * Pure SVG, transparent background, sway animation honors reduced-motion
 * via the global guard in globals.css.
 */
export function SideGarland() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 hidden xl:block">
      {/* ── Left: rope garland with swinging tools ── */}
      <svg className="absolute inset-y-0 start-2 h-full w-14" viewBox="0 0 56 800" preserveAspectRatio="xMidYMin slice" fill="none">
        <path d="M28 0 V800" stroke="var(--accent)" strokeWidth="2" strokeDasharray="1 7" strokeLinecap="round" opacity="0.6" />
        <g className="animate-sway" style={{ transformOrigin: "28px 90px", animationDelay: "0s" }}>
          <path d="M28 90 v26" stroke="var(--muted)" strokeWidth="2" />
          <rect x="16" y="116" width="24" height="16" rx="4" fill="var(--terracotta)" />
          <rect x="24" y="112" width="8" height="6" rx="2" fill="var(--muted)" />
        </g>
        <g className="animate-sway" style={{ transformOrigin: "28px 240px", animationDelay: "0.8s" }}>
          <path d="M28 240 v22" stroke="var(--muted)" strokeWidth="2" />
          <circle cx="28" cy="276" r="13" fill="var(--primary)" />
          <circle cx="28" cy="276" r="5" fill="var(--canvas)" />
        </g>
        <g className="animate-sway" style={{ transformOrigin: "28px 400px", animationDelay: "1.6s" }}>
          <path d="M28 400 v24" stroke="var(--muted)" strokeWidth="2" />
          <rect x="20" y="424" width="16" height="30" rx="7" fill="var(--accent)" />
          <rect x="22" y="452" width="12" height="8" rx="3" fill="var(--terracotta)" />
        </g>
        {/* corner diamond */}
        <rect x="22" y="760" width="12" height="12" rx="2" transform="rotate(45 28 766)" fill="var(--terracotta)" />
      </svg>

      {/* ── Right: vine + ladder ── */}
      <svg className="absolute inset-y-0 end-2 h-full w-14" viewBox="0 0 56 800" preserveAspectRatio="xMidYMin slice" fill="none">
        <path
          d="M30 0 C 10 120, 48 240, 24 380 C 4 500, 44 620, 26 800"
          stroke="var(--primary)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
        {[
          [18, 90, -30],
          [40, 160, 25],
          [14, 250, -20],
          [38, 330, 30],
          [16, 430, -25],
          [40, 520, 20],
        ].map(([x, y, r], i) => (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="9"
            ry="4.5"
            fill="var(--primary)"
            opacity="0.55"
            transform={`rotate(${r} ${x} ${y})`}
          />
        ))}
        {/* small ladder */}
        <g stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round" opacity="0.85">
          <path d="M22 560 V790" />
          <path d="M40 560 V790" />
          <path d="M22 590 H40 M22 640 H40 M22 690 H40 M22 740 H40" />
        </g>
        <rect x="18" y="770" width="26" height="10" rx="3" fill="var(--terracotta)" />
      </svg>
    </div>
  );
}
