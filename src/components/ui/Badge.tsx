import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      tone: {
        default: "bg-surface2 text-muted",
        success: "bg-successsoft text-success",
        warning: "bg-accentsoft text-accent",
        danger: "bg-dangersoft text-danger",
        info: "bg-primarysoft text-primary",
        purple: "bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
        expired: "bg-surface2 text-muted line-through decoration-1",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Convenience: text content instead of children. */
  label?: string;
}

export function Badge({ className, tone, label, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {label ?? children}
    </span>
  );
}
