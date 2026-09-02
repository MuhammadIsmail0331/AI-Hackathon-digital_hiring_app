import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/employer/jobs/[id]/payment
 * Simulated escrow actions:
 *   { action: "SECURE" }  → employer secures the total wage amount (SECURED)
 *   { action: "RELEASE" } → employer releases the held payment after job completion (RELEASED)
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Employers only" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body.action as string;

    if (action !== "SECURE" && action !== "RELEASE") {
      return NextResponse.json(
        { error: "Action must be SECURE or RELEASE" },
        { status: 400 }
      );
    }

    const job = await db.job.findFirst({
      where: { id, employerId: user.id },
      select: {
        id: true,
        title: true,
        status: true,
        wage: true,
        numberOfWorkers: true,
        payment: { select: { id: true, status: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // ── SECURE: lock in the total wage before/during the job ──
    if (action === "SECURE") {
      if (job.status === "COMPLETED" || job.status === "CANCELLED") {
        return NextResponse.json(
          { error: "Cannot secure payment for a completed or cancelled job" },
          { status: 400 }
        );
      }

      if (job.payment && job.payment.status !== "PENDING") {
        return NextResponse.json(
          { error: "Payment has already been secured for this job" },
          { status: 400 }
        );
      }

      const totalAmount = job.wage * job.numberOfWorkers;

      const payment = await db.payment.upsert({
        where: { jobId: job.id },
        create: {
          jobId: job.id,
          totalAmount,
          status: "SECURED",
          securedAt: new Date(),
        },
        update: {
          totalAmount,
          status: "SECURED",
          securedAt: new Date(),
        },
      });

      // Tell accepted workers their wage is protected
      const acceptedOffers = await db.jobOffer.findMany({
        where: { jobId: job.id, status: "ACCEPTED" },
        select: { workerId: true },
      });

      for (const offer of acceptedOffers) {
        await createNotification(
          offer.workerId,
          "SYSTEM",
          "Payment Secured",
          `The employer has secured ${totalAmount.toLocaleString()} PKR for the job "${job.title}". Your wage is protected.`,
          { jobId: job.id, link: `/worker/my-jobs/${job.id}` }
        );
      }

      return NextResponse.json(
        { payment, message: "Payment secured successfully" },
        { status: 200 }
      );
    }

    // ── RELEASE: pay out after the job is completed ──
    if (job.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Payment can only be released after the job is completed" },
        { status: 400 }
      );
    }

    if (!job.payment) {
      return NextResponse.json(
        { error: "No payment was secured for this job" },
        { status: 400 }
      );
    }

    if (job.payment.status === "RELEASED") {
      return NextResponse.json(
        { error: "Payment has already been released" },
        { status: 400 }
      );
    }

    if (job.payment.status !== "HELD" && job.payment.status !== "SECURED") {
      return NextResponse.json(
        { error: "This payment cannot be released" },
        { status: 400 }
      );
    }

    const payment = await db.payment.update({
      where: { jobId: job.id },
      data: { status: "RELEASED", releasedAt: new Date() },
    });

    // Inform the workers that they have been paid
    const acceptedOffers = await db.jobOffer.findMany({
      where: { jobId: job.id, status: "ACCEPTED" },
      select: { workerId: true },
    });

    for (const offer of acceptedOffers) {
      await createNotification(
        offer.workerId,
        "SYSTEM",
        "Payment Released",
        `The employer has released ${payment.totalAmount.toLocaleString()} PKR for the job "${job.title}". Payment settled.`,
        { jobId: job.id, link: `/worker/my-jobs/${job.id}` }
      );
    }

    return NextResponse.json(
      { payment, message: "Payment released successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process payment action" },
      { status: 500 }
    );
  }
}
