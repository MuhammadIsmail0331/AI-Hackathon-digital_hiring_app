import { cn } from "@/lib/utils";

const shimmerClasses =
  "animate-shimmer bg-[linear-gradient(90deg,var(--surface2)_25%,var(--line)_37%,var(--surface2)_63%)] bg-[length:200%_100%]";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("rounded-lg", shimmerClasses, className)} />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-2xl border border-line bg-surface p-4 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-3 flex gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div aria-label="Loading" role="status" className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
