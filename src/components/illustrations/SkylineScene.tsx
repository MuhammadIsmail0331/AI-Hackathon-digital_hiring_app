import { cn } from "@/lib/utils";

/**
 * Animated Pakistani skyline — the hero centerpiece.
 * Pure SVG: drifting clouds, birds, mosque silhouette, crane, twinkling windows.
 * Theme-aware via CSS variables; animate-* classes come from globals.css.
 */
export function SkylineScene({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 select-none",
        className
      )}
    >
      <svg
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMax slice"
        className="h-auto w-full"
        fill="none"
      >
        {/* Drifting clouds */}
        <g className="animate-drift-a" opacity="0.5">
          <ellipse cx="220" cy="70" rx="62" ry="16" fill="white" opacity="0.35" />
          <ellipse cx="272" cy="58" rx="40" ry="13" fill="white" opacity="0.3" />
        </g>
        <g className="animate-drift-b" opacity="0.45">
          <ellipse cx="1150" cy="92" rx="72" ry="18" fill="white" opacity="0.28" />
          <ellipse cx="1212" cy="80" rx="44" ry="14" fill="white" opacity="0.25" />
        </g>

        {/* Birds */}
        <g
          className="animate-birds"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth="3"
          strokeLinecap="round"
        >
          <path d="M985 118 q8 -8 16 0 q8 -8 16 0" />
          <path d="M1035 96 q7 -7 14 0 q7 -7 14 0" />
          <path d="M1078 132 q6 -6 12 0 q6 -6 12 0" />
        </g>

        {/* Back silhouette */}
        <g fill="rgba(255,255,255,0.10)">
          <rect x="60" y="200" width="90" height="220" rx="4" />
          <rect x="170" y="240" width="70" height="180" rx="4" />
          <rect x="620" y="180" width="80" height="240" rx="4" />
          <rect x="722" y="230" width="108" height="190" rx="4" />
          <rect x="1180" y="210" width="90" height="210" rx="4" />
          <rect x="1300" y="250" width="70" height="170" rx="4" />
        </g>

        {/* Mosque — Badshahi-inspired */}
        <g fill="rgba(255,255,255,0.16)">
          <rect x="330" y="290" width="240" height="130" rx="6" />
          <path d="M395 292 q55 -78 110 0 z" />
          <rect x="383" y="212" width="8" height="82" rx="3" />
          <rect x="509" y="212" width="8" height="82" rx="3" />
          <circle cx="387" cy="205" r="7" />
          <circle cx="513" cy="205" r="7" />
        </g>
        <path
          d="M450 252 a25 25 0 0 1 50 0 v28 h-50 z"
          fill="rgba(255,255,255,0.24)"
        />

        {/* Construction crane */}
        <g
          stroke="rgba(255,224,138,0.8)"
          strokeWidth="5"
          strokeLinecap="round"
        >
          <path d="M962 420 V178" />
          <path d="M962 178 h150" />
          <path d="M962 178 l-42 42 M962 204 l-32 32 M962 178 l32 32" strokeWidth="3" />
          <path d="M1082 178 v42" strokeWidth="3" />
        </g>
        <rect
          x="1074"
          y="222"
          width="16"
          height="14"
          rx="2"
          fill="rgba(255,224,138,0.8)"
        />

        {/* Foreground buildings + twinkling windows */}
        <g>
          <rect x="78" y="262" width="122" height="158" rx="6" fill="#0b4a3b" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`a${row}-${col}`}
                x={100 + col * 32}
                y={284 + row * 38}
                width="16"
                height="20"
                rx="2"
                fill="#ffe08a"
                opacity={row === 1 && col === 1 ? undefined : 0.85}
                className={row === 1 && col === 1 ? "animate-twinkle" : undefined}
              />
            ))
          )}

          <rect x="540" y="238" width="142" height="182" rx="6" fill="#0c5342" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`b${row}-${col}`}
                x={566 + col * 36}
                y={262 + row * 42}
                width="17"
                height="22"
                rx="2"
                fill="#ffe08a"
                opacity={row === 0 && col === 2 ? undefined : 0.85}
                className={row === 0 && col === 2 ? "animate-twinkle" : undefined}
              />
            ))
          )}

          <rect x="1238" y="228" width="134" height="192" rx="6" fill="#0b4a3b" />
          {[0, 1, 2].map((row) =>
            [0, 1].map((col) => (
              <rect
                key={`c${row}-${col}`}
                x={1266 + col * 44}
                y={252 + row * 44}
                width="18"
                height="22"
                rx="2"
                fill="#ffe08a"
                opacity={row === 2 && col === 0 ? undefined : 0.85}
                className={row === 2 && col === 0 ? "animate-twinkle" : undefined}
              />
            ))
          )}
        </g>
      </svg>
    </div>
  );
}
