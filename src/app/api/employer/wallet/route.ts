import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

/** GET /api/employer/wallet - simulated wallet balance */
export async function GET() {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const account = await db.user.findUnique({
      where: { id: user.id },
      select: { walletBalance: true },
    });
    return NextResponse.json(
      { walletBalance: account?.walletBalance ?? 0 },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
