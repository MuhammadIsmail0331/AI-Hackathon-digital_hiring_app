import { cn } from "@/lib/utils";

interface BrandAccentProps {
  className?: string;
  height?: "sm" | "md";
  flip?: boolean;
}

/**
 * Truck-art-inspired brand ribbon: a repeating emerald / amber / terracotta
 * chevron stripe. Pure CSS (no images), RTL-safe, theme-aware via tokens.
 */
export function BrandAccent({ className, height = "md", flip = false }: BrandAccentProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("w-full", height === "sm" ? "h-1.5" : "h-2.5", className)}
      style={{
        backgroundImage: `repeating-linear-gradient(
          ${flip ? "45" : "-45"}deg,
          var(--primary) 0px, var(--primary) 12px,
          var(--accent) 12px, var(--accent) 18px,
          var(--terracotta) 18px, var(--terracotta) 24px,
          var(--primary) 24px, var(--primary) 36px
        )`,
      }}
    />
  );
}
