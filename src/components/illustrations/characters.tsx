import { cn } from "@/lib/utils";

type CharacterType =
  | "painter"
  | "electrician"
  | "plumber"
  | "carpenter"
  | "mason"
  | "welder"
  | "labourer"
  | "generic";

const DENIM = "#3d5a80";
const DENIM_DARK = "#33517a";
const SKIN = "#f2c9a0";
const DARK = "#292524";

interface Kit {
  shirt: string;
  head: "cap" | "hat";
  capColor: string;
  tool: React.ReactNode;
}

const KIT: Record<CharacterType, Kit> = {
  painter: {
    shirt: "#f59e0b",
    head: "cap",
    capColor: "#0d7a5f",
    tool: (
      <g>
        <rect x="98" y="62" width="30" height="13" rx="6" fill="#ffffff" />
        <rect x="122" y="58" width="8" height="21" rx="3" fill="#e5e5e5" />
        <rect x="104" y="75" width="6" height="16" rx="3" fill="#78716c" />
        <circle cx="107" cy="93" r="3" fill="#f59e0b" />
      </g>
    ),
  },
  electrician: {
    shirt: "#eab308",
    head: "hat",
    capColor: "#f59e0b",
    tool: (
      <g>
        <rect x="98" y="70" width="10" height="16" rx="4" fill="#dc2626" transform="rotate(24 103 78)" />
        <rect x="106" y="82" width="5" height="18" rx="2" fill="#9ca3af" transform="rotate(24 108 91)" />
        <path d="M118 96 l3 5 M124 92 l5 2 M120 104 l4 4" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    ),
  },
  plumber: {
    shirt: "#0284c7",
    head: "cap",
    capColor: "#075985",
    tool: (
      <g>
        <rect x="106" y="66" width="6" height="30" rx="3" fill="#78716c" />
        <path d="M96 64 a12 12 0 0 1 24 0 v6 h-24 z" fill="#292524" />
      </g>
    ),
  },
  carpenter: {
    shirt: "#ea580c",
    head: "cap",
    capColor: "#9a3412",
    tool: (
      <g>
        <path d="M98 62 l30 12 -4 9 -30 -12 z" fill="#d6d3d1" />
        <path d="M100 68 l26 10" stroke="#78716c" strokeWidth="1.5" />
        <rect x="92" y="70" width="12" height="10" rx="3" fill="#92400e" />
      </g>
    ),
  },
  mason: {
    shirt: "#57534e",
    head: "hat",
    capColor: "#fbbf24",
    tool: (
      <g>
        <path d="M104 64 l22 8 -3 9 -22 -8 z" fill="#d6d3d1" />
        <rect x="96" y="70" width="10" height="8" rx="2" fill="#92400e" transform="rotate(20 101 74)" />
      </g>
    ),
  },
  welder: {
    shirt: "#475569",
    head: "cap",
    capColor: "#334155",
    tool: (
      <g>
        <rect x="100" y="70" width="8" height="22" rx="4" fill="#334155" />
        <rect x="98" y="62" width="12" height="10" rx="3" fill="#f59e0b" />
        <path d="M110 56 l4 -6 M116 62 l6 -3 M112 50 l2 -6" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    ),
  },
  labourer: {
    shirt: "#65a30d",
    head: "cap",
    capColor: "#3f6212",
    tool: (
      <g>
        <rect x="104" y="58" width="6" height="34" rx="3" fill="#92400e" />
        <path d="M96 56 a12 14 0 0 1 24 0 v10 a4 4 0 0 1 -4 4 h-16 a4 4 0 0 1 -4 -4 z" fill="#9ca3af" />
      </g>
    ),
  },
  generic: {
    shirt: "#0d7a5f",
    head: "cap",
    capColor: "#d97706",
    tool: (
      <g>
        <rect x="104" y="64" width="7" height="28" rx="3" fill="#78716c" transform="rotate(18 107 78)" />
        <rect x="98" y="56" width="22" height="12" rx="4" fill="#57534e" transform="rotate(18 109 62)" />
      </g>
    ),
  },
};

/** Chunky, friendly flat-illustration worker with overalls + detailed tools. */
export function WorkerCharacter({
  type = "generic",
  className,
}: {
  type?: CharacterType;
  className?: string;
}) {
  const kit = KIT[type] ?? KIT.generic;
  return (
    <svg
      viewBox="0 0 130 170"
      className={cn("h-auto w-auto", className)}
      aria-hidden="true"
    >
      <ellipse cx="62" cy="164" rx="40" ry="5" fill="rgba(0,0,0,0.12)" />
      {/* legs + shoes */}
      <rect x="44" y="118" width="13" height="32" rx="6" fill={DARK} />
      <rect x="64" y="118" width="13" height="32" rx="6" fill={DARK} />
      <rect x="41" y="146" width="19" height="9" rx="4.5" fill="#0c0a09" />
      <rect x="61" y="146" width="19" height="9" rx="4.5" fill="#0c0a09" />
      {/* shirt */}
      <rect x="34" y="64" width="54" height="60" rx="18" fill={kit.shirt} />
      {/* left arm (resting) */}
      <rect x="26" y="72" width="13" height="32" rx="6.5" fill={kit.shirt} />
      <circle cx="32.5" cy="106" r="6" fill={SKIN} />
      {/* overalls bib + straps */}
      <rect x="45" y="78" width="32" height="34" rx="7" fill={DENIM} />
      <rect x="48" y="64" width="7" height="20" rx="3" fill={DENIM} />
      <rect x="67" y="64" width="7" height="20" rx="3" fill={DENIM} />
      <rect x="51" y="92" width="20" height="14" rx="4" fill={DENIM_DARK} />
      {/* right arm (tool side) + hand */}
      <rect x="82" y="72" width="30" height="13" rx="6.5" fill={kit.shirt} />
      <circle cx="113" cy="78.5" r="6.5" fill={SKIN} />
      {kit.tool}
      {/* head */}
      <circle cx="61" cy="40" r="23" fill={SKIN} />
      {/* headwear */}
      {kit.head === "cap" ? (
        <g>
          <path d="M37 36 a24 24 0 0 1 48 0 z" fill={kit.capColor} />
          <rect x="30" y="33" width="62" height="8" rx="4" fill={kit.capColor} />
        </g>
      ) : (
        <g>
          <path d="M40 34 a21 16 0 0 1 42 0 z" fill={kit.capColor} />
          <ellipse cx="61" cy="35" rx="28" ry="6" fill={kit.capColor} />
          <rect x="56" y="20" width="10" height="7" rx="3" fill={kit.capColor} />
        </g>
      )}
      {/* face */}
      <circle cx="53" cy="46" r="3.2" fill={DARK} />
      <circle cx="69" cy="46" r="3.2" fill={DARK} />
      <path d="M52 56 q9 8 18 0" stroke={DARK} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="47" cy="52" r="3" fill="#e8a" opacity="0.5" />
      <circle cx="75" cy="52" r="3" fill="#e8a" opacity="0.5" />
    </svg>
  );
}


/** Empty toolbox illustration for empty states. */
export function EmptyToolbox({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 110" className={cn("h-auto w-auto", className)} aria-hidden="true">
      <ellipse cx="70" cy="102" rx="46" ry="5" fill="rgba(0,0,0,0.1)" />
      <rect x="28" y="52" width="84" height="46" rx="10" fill="#d97706" />
      <rect x="24" y="42" width="92" height="14" rx="7" fill="#b45309" />
      <path d="M56 42 a14 14 0 0 1 28 0" stroke="#b45309" strokeWidth="7" strokeLinecap="round" />
      <rect x="60" y="62" width="20" height="26" rx="6" fill="#fcd34d" />
      <circle cx="18" cy="36" r="5" fill="rgba(0,0,0,0.08)" />
      <circle cx="120" cy="30" r="7" fill="rgba(0,0,0,0.07)" />
      <circle cx="106" cy="18" r="4" fill="rgba(0,0,0,0.06)" />
    </svg>
  );
}

/** Searching worker with flashlight cone — for no-results states. */
export function SearchLight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 120" className={cn("h-auto w-auto", className)} aria-hidden="true">
      <ellipse cx="66" cy="112" rx="40" ry="5" fill="rgba(0,0,0,0.1)" />
      <path d="M78 42 L140 10 L148 44 L86 60 Z" fill="#fcd34d" opacity="0.35" />
      <rect x="44" y="56" width="42" height="48" rx="16" fill="#0d7a5f" />
      <rect x="58" y="102" width="11" height="12" rx="5" fill="#292524" />
      <circle cx="66" cy="36" r="19" fill="#f2c9a0" />
      <path d="M46 32 a20 20 0 0 1 40 0 z" fill="#0a6350" />
      <circle cx="60" cy="42" r="2.8" fill="#292524" />
      <circle cx="74" cy="42" r="2.8" fill="#292524" />
      <rect x="74" y="48" width="26" height="11" rx="5.5" fill="#0d7a5f" transform="rotate(-18 74 48)" />
      <rect x="94" y="34" width="14" height="10" rx="3" fill="#fcd34d" transform="rotate(-18 94 34)" />
      <text x="128" y="76" fontSize="26" fontWeight="bold" fill="#d97706">?</text>
    </svg>
  );
}

/** Mailbox with flag — for notifications empty state. */
export function MailBox({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 120" className={cn("h-auto w-auto", className)} aria-hidden="true">
      <ellipse cx="70" cy="112" rx="36" ry="5" fill="rgba(0,0,0,0.1)" />
      <rect x="64" y="58" width="10" height="54" fill="#78716c" />
      <rect x="40" y="104" width="58" height="8" rx="4" fill="#57534e" />
      <path d="M30 30 h56 a22 22 0 0 1 22 22 v18 h-78 z" fill="#0d7a5f" />
      <path d="M30 30 a22 22 0 0 0 0 40" fill="#0a6350" />
      <rect x="86" y="42" width="7" height="26" fill="#d97706" />
      <path d="M93 42 h20 v12 h-20 z" fill="#c2552b" />
      <rect x="46" y="44" width="34" height="5" rx="2.5" fill="#e7f4ef" />
    </svg>
  );
}

/**
 * Work crew scene: three detailed workers with a tool board —
 * used as the landing trust-section illustration. Responsive.
 */
export function WorkCrew({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)} aria-hidden="true">
      {/* backdrop blob */}
      <div className="absolute inset-x-4 top-6 bottom-2 rounded-[2.5rem] bg-gradient-to-b from-primarysoft to-accentsoft" />
      {/* tool board */}
      <div className="absolute start-6 top-8 flex flex-col gap-2 rounded-xl border border-line bg-surface p-2 shadow-md">
        {[
          <path key="1" d="M4 12 l6 -8 M14 4 l-6 8" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />,
          <circle key="2" cx="9" cy="9" r="6" fill="none" stroke="#0d7a5f" strokeWidth="2.5" />,
          <rect key="3" x="3" y="3" width="12" height="12" rx="2" fill="none" stroke="#c2552b" strokeWidth="2.5" />,
        ].map((icon, i) => (
          <span key={i} className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface2">
            <svg viewBox="0 0 18 18" width="16" height="16" fill="none">{icon}</svg>
          </span>
        ))}
      </div>
      {/* sparkles */}
      <span className="animate-pulse absolute end-8 top-4 text-lg text-amber-400">✦</span>
      <span className="animate-pulse absolute start-10 bottom-10 text-sm text-primary" style={{ animationDelay: "0.8s" }}>✦</span>
      {/* the crew */}
      <div className="relative flex items-end justify-center gap-0 px-6 pt-10">
        <WorkerCharacter type="carpenter" className="w-[26%] -me-4" />
        <WorkerCharacter type="painter" className="w-[34%] z-10" />
        <WorkerCharacter type="electrician" className="w-[27%] -ms-4" />
      </div>
    </div>
  );
}
