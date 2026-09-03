import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** TEMPORARY debug route - returns non-secret runtime env + host info. */
export async function GET() {
  const h = await headers();
  return NextResponse.json({
    host: h.get("host"),
    xfh: h.get("x-forwarded-host"),
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL ?? null,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL ?? null,
    VERCEL_ENV: process.env.VERCEL_ENV ?? null,
    AUTH_URL_set: !!process.env.AUTH_URL,
    NEXTAUTH_URL_set: !!process.env.NEXTAUTH_URL,
    AUTH_SECRET_set: !!process.env.AUTH_SECRET,
    DATABASE_URL_starts_with: (process.env.DATABASE_URL ?? "").split("://")[0],
  });
}
