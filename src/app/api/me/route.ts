import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";

/** Lightweight session probe for client chrome (role only, no PII). */
export async function GET() {
  const user = await resolveSessionUser();
  if (!user) return NextResponse.json({}, { status: 401 });
  return NextResponse.json({ role: user.role });
}
