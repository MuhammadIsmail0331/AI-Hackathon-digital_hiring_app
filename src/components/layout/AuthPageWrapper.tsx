import Navbar from "./Navbar";

export default function AuthPageWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <div className="relative flex flex-1 items-center justify-center px-4 py-10">
        {/* Heritage background: warm glows + subtle diamond lattice */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 end-0 h-[500px] w-[500px] rounded-full bg-primarysoft blur-3xl" />
          <div className="absolute -bottom-40 start-0 h-[400px] w-[400px] rounded-full bg-accentsoft blur-3xl" />
          <div className="absolute end-1/3 top-1/3 h-[300px] w-[300px] rounded-full bg-terracottasoft blur-3xl" />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, var(--line) 0 1px, transparent 1px 28px), repeating-linear-gradient(-45deg, var(--line) 0 1px, transparent 1px 28px)",
            }}
          />
        </div>
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
