import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import { getMessages } from "next-intl/server";
import Navbar from "@/components/layout/Navbar";
import { BrandAccent } from "@/components/ui/BrandAccent";

type Props = { params: Promise<{ locale: string }> };

/**
 * Help & FAQ — icon-led, low-reading answers for the mainstream audience.
 * Static per locale; no data fetches.
 */
export default function HelpPage({ params }: Props) {
  const { locale } = use(params);
  void setRequestLocale(locale);

  return <HelpContent />;
}

async function HelpContent() {
  const messages = await getMessages();
  const help = messages.Help as {
    title: string;
    subtitle: string;
    items: Array<{ icon: string; q: string; a: string }>;
  };

  return (
    <>
      <Navbar />
      <main className="page-enter mx-auto max-w-2xl px-4 py-8 pb-24 sm:pb-12">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-3xl bg-primarysoft text-3xl shadow-sm">
            💡
          </div>
          <h1 className="text-2xl font-bold text-ink">{help.title}</h1>
          <p className="mt-1 text-sm text-muted">{help.subtitle}</p>
        </div>

        <BrandAccent height="sm" className="mb-6" />

        <div className="stagger grid gap-3 sm:grid-cols-2">
          {help.items.map((item, i) => (
            <div
              key={i}
              className="rounded-2xl border border-line bg-surface p-5 shadow-sm transition-all duration-200 ease-out hover:border-primary/30 hover:shadow-md motion-safe:hover:-translate-y-0.5"
            >
              <div className="mb-2 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-accentsoft text-2xl">
                  {item.icon}
                </span>
                <h2 className="text-base font-semibold leading-snug text-ink">
                  {item.q}
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-muted">{item.a}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
