import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { createNotification, createBulkNotifications } from "@/lib/notifications";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/employer/jobs/[id]/complete
 * Marks a job as completed. Only employer can do this.
 * Triggers feedback requests to all accepted workers.
 */
export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Employers only" }, { status: 403 });
    }

    const { id } = await params;

    const job = await db.job.findFirst({
      where: { id, employerId: user.id },
      include: {
        offers: {
          where: { status: "ACCEPTED" },
          select: { workerId: true, worker: { select: { name: true } } },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Only in-progress jobs can be completed" },
        { status: 400 }
      );
    }

    if (job.offers.length === 0) {
      return NextResponse.json(
        { error: "Cannot complete a job with no accepted workers" },
        { status: 400 }
      );
    }

    // Mark job as completed and update payment
    await db.$transaction(async (tx) => {
      await tx.job.update({
        where: { id },
        data: { status: "COMPLETED" },
      });

      // Keep the secured payment in escrow (HELD) — the employer
      // explicitly confirms the release afterwards via the payment route.
      // If it was secured after acceptance (missed the HELD transition),
      // normalize it to HELD now.
      const payment = await tx.payment.findUnique({ where: { jobId: id } });
      if (
        payment &&
        (payment.status === "HELD" || payment.status === "SECURED")
      ) {
        await tx.payment.update({
          where: { jobId: id },
          data: { status: "HELD" },
        });
      }
    });

    // Notify all accepted workers about completion + request feedback
    const workerIds = job.offers.map((o) => o.workerId);

    await createBulkNotifications(
      workerIds,
      "JOB_COMPLETED",
      "Job Completed",
      `The job "${job.title}" has been marked as completed. Please submit your feedback.`,
      { jobId: id, employerId: user.id, employerName: user.name }
    );

    // Create feedback request notification for employer (remind to rate workers)
    for (const offer of job.offers) {
      await createNotification(
        user.id,
        "FEEDBACK_REQUEST",
        "Rate Your Worker",
        `Please rate ${offer.worker.name} for the job "${job.title}"`,
        { jobId: id, workerId: offer.workerId, workerName: offer.worker.name }
      );
    }

    return NextResponse.json(
      { message: "Job marked as completed", workerIds },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to complete job" }, { status: 500 });
  }
}
