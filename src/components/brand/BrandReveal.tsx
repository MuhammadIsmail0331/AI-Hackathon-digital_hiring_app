"use client";

import { cn } from "@/lib/utils";

/**
 * THE brand animation: two hands reach out to shake, meet with a spark,
 * and fuse into the Digital Hiring "D" mark + wordmark.
 * Pure SVG + CSS (keyframes live in globals.css). Remount (key=) to replay.
 */
export function BrandReveal({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn("relative select-none text-center", className)}
      aria-label="Digital Hiring - Rozgaar"
    >
      <svg
        viewBox="0 0 260 130"
        className={cn("mx-auto h-auto", compact ? "w-44" : "w-64")}
        fill="none"
      >
        {/* left arm + hand */}
        <g className="bh-arm-l">
          <rect x="-10" y="52" width="86" height="26" rx="13" fill="var(--primary)" />
          <path
            d="M76 52 c14 0 20 6 20 13 s-6 13 -20 13 -14 -5 -14 -13 z"
            fill="var(--primarystrong)"
          />
          <rect x="70" y="58" width="18" height="14" rx="7" fill="var(--accent)" />
        </g>
        {/* right arm + hand */}
        <g className="bh-arm-r">
          <rect x="184" y="52" width="86" height="26" rx="13" fill="var(--accent)" />
          <path
            d="M184 52 c-14 0 -20 6 -20 13 s6 13 20 13 14 -5 14 -13 z"
            fill="var(--terracotta)"
          />
          <rect x="172" y="58" width="18" height="14" rx="7" fill="var(--primary)" />
        </g>
        {/* spark at the meeting point */}
        <g className="bh-spark" stroke="var(--accent)" strokeWidth="3.5" strokeLinecap="round">
          <path d="M130 34 v-12" />
          <path d="M108 42 l-8 -8" />
          <path d="M152 42 l8 -8" />
          <path d="M130 62 v6" />
        </g>
        {/* the D mark (emerges from the shake) */}
        <g className="bh-mark">
          <rect x="96" y="26" width="68" height="68" rx="16" fill="var(--primary)" />
          <path
            d="M114 76 l17 -28 11 18 8 -12 15 22"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M108 86 h44" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round" />
        </g>
      </svg>

      {!compact && (
        <div className="bh-wordmark mt-2">
          <div
            className="text-2xl font-extrabold tracking-tight text-ink"
            style={{ fontFamily: "var(--font-sora), sans-serif" }}
          >
            Digital <span className="text-primary">Hiring</span>
          </div>
          <div className="mt-1 text-sm font-semibold text-muted">
            Rozgaar · <span dir="rtl" style={{ fontFamily: "var(--font-nastaliq), serif" }}>روزگار</span>
          </div>
        </div>
      )}
    </div>
  );
}
