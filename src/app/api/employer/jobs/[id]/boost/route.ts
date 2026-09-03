import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

const BOOST_COST = 99;

/**
 * POST /api/employer/jobs/[id]/boost
 * Spend PKR 99 from the simulated wallet to boost a job:
 * highlighted listing + priority placement in worker browse/matching.
 */
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const job = await db.job.findFirst({
      where: { id, employerId: user.id },
      select: { id: true, status: true, boosted: true, title: true },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (job.boosted) {
      return NextResponse.json({ error: "This job is already boosted" }, { status: 400 });
    }
    if (!("OPEN MATCHING OFFERS_SENT".includes(job.status))) {
      return NextResponse.json(
        { error: "Only active jobs can be boosted" },
        { status: 400 }
      );
    }

    const account = await db.user.findUnique({
      where: { id: user.id },
      select: { walletBalance: true },
    });
    if (!account || account.walletBalance < BOOST_COST) {
      return NextResponse.json(
        { error: "Not enough wallet balance" },
        { status: 400 }
      );
    }

    const [updatedUser, updatedJob] = await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: BOOST_COST } },
        select: { walletBalance: true },
      }),
      db.job.update({
        where: { id: job.id },
        data: { boosted: true, boostedAt: new Date() },
        select: { id: true, boosted: true },
      }),
    ]);

    return NextResponse.json(
      {
        message: `Job boosted. ${BOOST_COST} PKR deducted from your wallet.`,
        walletBalance: updatedUser.walletBalance,
        boosted: updatedJob.boosted,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to boost job" },
      { status: 500 }
    );
  }
}
