import { cn } from "@/lib/utils";

interface BrandAccentProps {
  className?: string;
  height?: "sm" | "md";
  flip?: boolean;
}

/**
 * Truck-art ribbon: layered pure-CSS motifs — emerald chevrons carrying a row
 * of amber/terracotta diamonds between double rails. No images, RTL-safe,
 * theme-aware via tokens. `flip` reverses the chevron direction.
 */
export function BrandAccent({ className, height = "md", flip = false }: BrandAccentProps) {
  const isSm = height === "sm";
  const dir = flip ? "45" : "-45";

  const chevrons = `repeating-linear-gradient(
    ${dir}deg,
    var(--primary) 0px, var(--primary) 10px,
    color-mix(in srgb, var(--primary) 55%, black) 10px, color-mix(in srgb, var(--primary) 55%, black) 12px,
    var(--primary) 12px, var(--primary) 20px
  )`;
  const diamonds = `repeating-linear-gradient(
    90deg,
    transparent 0px, transparent 7px,
    var(--accent) 7px, var(--accent) 10px,
    var(--terracotta) 10px, var(--terracotta) 13px,
    transparent 13px, transparent 20px
  )`;
  const railTop = `linear-gradient(to bottom, color-mix(in srgb, var(--accent) 80%, white) 0 2px, transparent 2px)`;
  const railBottom = `linear-gradient(to top, color-mix(in srgb, var(--accent) 80%, white) 0 2px, transparent 2px)`;

  return (
    <div
      aria-hidden="true"
      className={cn("w-full", isSm ? "h-2" : "h-3", className)}
      style={{
        backgroundColor: "var(--primary)",
        backgroundImage: isSm
          ? `${chevrons}`
          : `${railTop}, ${railBottom}, ${diamonds}, ${chevrons}`,
        backgroundSize: isSm
          ? "auto"
          : "100% 3px, 100% 3px, 20px 40%, auto",
        backgroundPosition: isSm
          ? "center"
          : "top left, bottom left, center, center",
        backgroundRepeat: "repeat-x, repeat-x, repeat-x, repeat",
      }}
    />
  );
}
