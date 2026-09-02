import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import RouteLoader from "@/components/ui/RouteLoader";

export const metadata: Metadata = {
  title: "Digital Hiring App",
  description:
    "A marketplace connecting employers with skilled daily-wage workers across Pakistan.",
};

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
    <html lang={locale} dir={isRtl ? "rtl" : "ltr"}>
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900 antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* Keyboard users can jump straight past the navbar */}
          <a
            href="#main-content"
            className="sr-only z-[10000] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:start-4 focus:top-4"
          >
            {t("skipToContent")}
          </a>
          <RouteLoader />
          <div id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </div>
        </NextIntlClientProvider>
        <footer className="mt-auto border-t border-gray-100 bg-white py-3 pb-20 text-center sm:pb-3">
          <p className="text-xs text-gray-500">
            Developed and tested by <span className="font-semibold text-gray-600">Nasir</span>
          </p>
        </footer>
      </body>
    </html>
  );
}
