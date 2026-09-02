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
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 end-0 h-[500px] w-[500px] rounded-full bg-blue-100/50 blur-3xl" />
          <div className="absolute -bottom-40 start-0 h-[400px] w-[400px] rounded-full bg-emerald-100/40 blur-3xl" />
          <div className="absolute end-1/3 top-1/3 h-[300px] w-[300px] rounded-full bg-purple-100/30 blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
