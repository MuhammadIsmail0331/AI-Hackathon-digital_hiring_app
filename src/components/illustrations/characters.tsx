import { cn } from "@/lib/utils";

type CharacterType = "painter" | "electrician" | "plumber" | "generic";

const KIT: Record<
  CharacterType,
  { body: string; cap: string; tool: React.ReactNode }
> = {
  painter: {
    body: "#f59e0b",
    cap: "#0d7a5f",
    tool: (
      <g>
        <rect x="86" y="76" width="30" height="11" rx="5" fill="#ffffff" />
        <rect x="112" y="72" width="8" height="19" rx="3" fill="#e5e5e5" />
      </g>
    ),
  },
  electrician: {
    body: "#eab308",
    cap: "#f59e0b",
    tool: (
      <path
        d="M84 78 l18 18"
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
      />
    ),
  },
  plumber: {
    body: "#0284c7",
    cap: "#075985",
    tool: (
      <g>
        <circle cx="92" cy="88" r="11" fill="#ffffff" />
        <circle cx="92" cy="88" r="4" fill="#0284c7" />
      </g>
    ),
  },
  generic: {
    body: "#0d7a5f",
    cap: "#d97706",
    tool: (
      <rect x="86" y="78" width="26" height="11" rx="5" fill="#ffffff" />
    ),
  },
};

/** Chunky, friendly flat-illustration worker. */
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
      viewBox="0 0 130 150"
      className={cn("h-auto w-auto", className)}
      aria-hidden="true"
    >
      <ellipse cx="62" cy="146" rx="38" ry="5" fill="rgba(0,0,0,0.12)" />
      <rect x="44" y="110" width="13" height="36" rx="6" fill="#292524" />
      <rect x="64" y="110" width="13" height="36" rx="6" fill="#292524" />
      <rect x="34" y="60" width="54" height="60" rx="19" fill={kit.body} />
      <rect x="82" y="68" width="32" height="13" rx="6.5" fill={kit.body} />
      {kit.tool}
      <circle cx="61" cy="38" r="23" fill="#f2c9a0" />
      <path d="M37 34 a24 24 0 0 1 48 0 z" fill={kit.cap} />
      <rect x="30" y="31" width="62" height="8" rx="4" fill={kit.cap} />
      <circle cx="53" cy="45" r="3.2" fill="#292524" />
      <circle cx="69" cy="45" r="3.2" fill="#292524" />
      <path
        d="M52 55 q9 8 18 0"
        stroke="#292524"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
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
      <path
        d="M56 42 a14 14 0 0 1 28 0"
        stroke="#b45309"
        strokeWidth="7"
        strokeLinecap="round"
      />
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
