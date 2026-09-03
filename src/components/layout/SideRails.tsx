/**
 * Fixed decorative side rails (truck-art stripe + gold hairline + corner
 * diamonds) framing the page on wide screens. Hidden below xl.
 */
export function SideRails() {
  const stripe =
    "repeating-linear-gradient(180deg, var(--primary) 0px, var(--primary) 14px, var(--accent) 14px, var(--accent) 21px, var(--terracotta) 21px, var(--terracotta) 28px, var(--primary) 28px, var(--primary) 42px)";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 hidden xl:block"
    >
      {/* Left rail */}
      <div className="absolute inset-y-0 start-0 w-3.5" style={{ backgroundImage: stripe }} />
      <div className="absolute inset-y-0 start-3.5 w-px bg-accent/50" />
      <div className="absolute start-1 top-20 h-2.5 w-2.5 rotate-45 bg-accent shadow" />
      <div className="absolute start-1 bottom-20 h-2.5 w-2.5 rotate-45 bg-terracotta shadow" />

      {/* Right rail (mirrored) */}
      <div className="absolute inset-y-0 end-0 w-3.5" style={{ backgroundImage: stripe }} />
      <div className="absolute inset-y-0 end-3.5 w-px bg-accent/50" />
      <div className="absolute end-1 top-20 h-2.5 w-2.5 rotate-45 bg-terracotta shadow" />
      <div className="absolute end-1 bottom-20 h-2.5 w-2.5 rotate-45 bg-accent shadow" />

      {/* Faint lattice margins just inside the rails */}
      <div
        className="absolute inset-y-0 start-5 w-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--line) 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, var(--line) 0 1px, transparent 1px 22px)",
        }}
      />
      <div
        className="absolute inset-y-0 end-5 w-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--line) 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, var(--line) 0 1px, transparent 1px 22px)",
        }}
      />
    </div>
  );
}
