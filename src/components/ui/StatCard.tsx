import { cn } from "@/lib/utils";
import { BrandAccent } from "./BrandAccent";

const TONES = {
  primary: "bg-primarysoft text-primary",
  accent: "bg-accentsoft text-accent",
  terracotta: "bg-terracottasoft text-terracotta",
  neutral: "bg-surface2 text-muted",
} as const;

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  tone?: keyof typeof TONES;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, icon, tone = "primary", hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition hover:shadow-md",
        className
      )}
    >
      <BrandAccent height="sm" />
      <div className="p-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                TONES[tone]
              )}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-xl font-bold text-ink">{value}</div>
            <div className="truncate text-xs font-medium text-muted">{label}</div>
          </div>
        </div>
        {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
      </div>
    </div>
  );
}
