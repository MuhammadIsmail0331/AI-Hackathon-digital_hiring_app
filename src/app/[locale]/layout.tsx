import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { Sora, Inter, Noto_Nastaliq_Urdu, Noto_Naskh_Arabic } from "next/font/google";
import { routing } from "@/i18n/routing";
import "../globals.css";
import RouteLoader from "@/components/ui/RouteLoader";
import { Toaster } from "sonner";
import { SideGarland } from "@/components/layout/SideGarland";
import { BrandAccent } from "@/components/ui/BrandAccent";

const sora = Sora({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-sora", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const nastaliq = Noto_Nastaliq_Urdu({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-nastaliq", display: "swap" });
const naskh = Noto_Naskh_Arabic({ subsets: ["arabic"], variable: "--font-naskh", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Digital Hiring (Rozgaar) · Find Workers. Find Work.", template: "%s · Digital Hiring" },
  description:
    "Rozgaar connects employers with skilled daily-wage workers across Pakistan — AI matching, escrow-protected payments, and ratings you can trust.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1512" },
  ],
};

/* Sets the theme class before first paint (no flash). Read by ThemeToggle. */
const themeScript = `(function(){try{var t=localStorage.getItem("rozgaar-theme");var d=t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Common" });
  const isRtl = locale === "ur";

  return (
    <html
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${sora.variable} ${inter.variable} ${nastaliq.variable} ${naskh.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen flex-col bg-canvas text-ink antialiased">
        <SideGarland />
        <NextIntlClientProvider messages={messages}>
          {/* Keyboard users can jump straight past the navbar */}
          <a
            href="#main-content"
            className="sr-only z-[10000] rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:start-4 focus:top-4"
          >
            {t("skipToContent")}
          </a>
          <RouteLoader />
          <Toaster richColors position="top-center" toastOptions={{ classNames: { toast: "font-sans" } }} />
          <div id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </div>
          <footer className="mt-auto">
            <BrandAccent height="sm" />
            <div className="bg-surface py-3 pb-20 text-center sm:pb-3">
              <p className="text-xs text-muted">
                Developed and tested by <span className="font-semibold text-ink">Nasir</span>
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
