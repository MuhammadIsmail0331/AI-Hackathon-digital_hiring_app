import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { createBulkNotifications } from "@/lib/notifications";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const CANCELLABLE = ["OPEN", "MATCHING", "OFFERS_SENT", "IN_PROGRESS"];
const REFUNDABLE = ["SECURED", "HELD"];

/**
 * POST /api/employer/jobs/[id]/cancel
 * Employer cancels a job.
 * - Job status becomes CANCELLED.
 * - Any escrow payment is refunded (status REFUNDED).
 * - PENDING workers are told the job is no longer available.
 * - ACCEPTED workers are told the employer cancelled; secured wages are refunded.
 */
export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await db.job.findFirst({
      where: { id, employerId: user.id },
      include: {
        offers: { select: { workerId: true, status: true } },
        payment: { select: { id: true, status: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (!CANCELLABLE.includes(job.status)) {
      return NextResponse.json(
        { error: "Only active jobs can be cancelled" },
        { status: 400 }
      );
    }

    const wasSecured =
      job.payment && REFUNDABLE.includes(job.payment.status);

    await db.$transaction(async (tx) => {
      await tx.job.update({
        where: { id },
        data: { status: "CANCELLED", backgroundSearchUntil: null },
      });
      if (job.payment && ["PENDING", "SECURED", "HELD"].includes(job.payment.status)) {
        await tx.payment.update({
          where: { id: job.payment.id },
          data: { status: "REFUNDED", releasedAt: new Date() },
        });
      }
    });

    const offered = job.offers
      .filter((o) => o.status === "PENDING")
      .map((o) => o.workerId);
    const accepted = job.offers
      .filter((o) => o.status === "ACCEPTED")
      .map((o) => o.workerId);

    if (offered.length > 0) {
      await createBulkNotifications(
        offered,
        "JOB_DECLINED",
        "Job no longer available",
        `The job "${job.title}" was cancelled by the employer before you accepted.`,
        { jobId: job.id, link: "/worker/jobs" }
      );
    }
    if (accepted.length > 0) {
      await createBulkNotifications(
        accepted,
        "SYSTEM",
        "Job cancelled",
        `The employer cancelled "${job.title}".${
          wasSecured ? " Your secured payment has been refunded to them and you will not be needed." : ""
        }`,
        { jobId: job.id, link: "/worker/my-jobs" }
      );
    }

    return NextResponse.json(
      { message: "Job cancelled", notifiedWorkers: offered.length + accepted.length },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to cancel job" },
      { status: 500 }
    );
  }
}
