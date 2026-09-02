import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig = {
  devIndicators: false as const,
};

export default withNextIntl(nextConfig);
