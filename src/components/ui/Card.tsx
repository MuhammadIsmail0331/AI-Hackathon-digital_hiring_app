import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  /** Adds a truck-art accent strip along the top edge. */
  accent?: boolean;
}

export function Card({ className, padding = "md", accent, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface shadow-sm",
        className
      )}
      {...props}
    >
      {accent && (
        <div
          aria-hidden="true"
          className="h-1 w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(-45deg, var(--primary) 0 10px, var(--accent) 10px 15px, var(--terracotta) 15px 20px, var(--primary) 20px 30px)",
          }}
        />
      )}
      <div
        className={cn(
          padding === "sm" && "p-4",
          padding === "md" && "p-6",
          padding === "lg" && "p-8"
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-4 flex items-center justify-between", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold text-ink", className)}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-4", className)} {...props} />;
}
