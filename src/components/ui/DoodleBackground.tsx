import { cn } from "@/lib/utils";

const DOODLES: Array<{ d: string; x: string; y: string; s: number; delay: string }> = [
  { d: "M2 20 L12 4 L22 20 Z M6 20 h12", x: "4%", y: "12%", s: 1, delay: "0s" },
  { d: "M4 4 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M12 4 v8 M12 12 l5 5", x: "92%", y: "18%", s: 1.1, delay: "0.6s" },
  { d: "M2 8 h20 M6 4 v8 M14 4 v8", x: "88%", y: "72%", s: 1, delay: "1.1s" },
  { d: "M3 16 q7 -14 18 -2", x: "8%", y: "68%", s: 1.2, delay: "1.6s" },
  { d: "M10 2 v16 M2 10 h16", x: "50%", y: "6%", s: 0.8, delay: "2s" },
  { d: "M4 18 L10 8 l4 6 3 -4 5 8 z", x: "70%", y: "90%", s: 0.9, delay: "0.3s" },
  { d: "M3 10 a7 7 0 0 1 14 0 h-14 z M10 10 v6", x: "30%", y: "88%", s: 0.9, delay: "0.9s" },
  { d: "M4 4 h12 v12 h-12 z M4 9 h12", x: "62%", y: "60%", s: 0.8, delay: "1.3s" },
];

/**
 * Global animated doodle-sketch layer. Mounted once in the root layout;
 * sits behind content (rendered first among body children) and adds
 * hand-sketched, gently floating workshop doodles to every page.
 */
export function DoodleBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {DOODLES.map((d, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="animate-float absolute text-muted opacity-[0.16] dark:opacity-[0.10]"
          style={{
            left: d.x,
            top: d.y,
            width: `${3.2 * d.s}rem`,
            height: `${3.2 * d.s}rem`,
            animationDelay: d.delay,
          }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={d.d} />
        </svg>
      ))}
    </div>
  );
}
