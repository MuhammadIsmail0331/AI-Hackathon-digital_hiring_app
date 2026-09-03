import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/employer/jobs/[id]
 * Returns a single job with offers and matched candidate info.
 */
export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await db.job.findFirst({
      where: { id, employerId: user.id },
      include: {
        payment: true,
        offers: {
          include: {
            worker: {
              select: {
                id: true,
                name: true,
                phone: true,
                workerProfiles: {
                  select: {
                    workerType: true,
                    skills: true,
                    experience: true,
                    locationName: true,
                    avgRating: true,
                    totalJobs: true,
                  },
                },
              },
            },
          },
          orderBy: { matchScore: "desc" },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const parsed = {
      ...job,
      requiredSkills: JSON.parse(job.requiredSkills || "[]"),
      toolsRequired: JSON.parse(job.toolsRequired || "[]"),
      payment: job.payment
        ? {
            status: job.payment.status,
            totalAmount: job.payment.totalAmount,
            securedAt: job.payment.securedAt,
            releasedAt: job.payment.releasedAt,
          }
        : null,
      offers: job.offers.map((o) => ({
        id: o.id,
        workerId: o.workerId,
        workerName: o.worker.name,
        // Reveal phone only after acceptance
        workerPhone: o.status === "ACCEPTED" ? o.worker.phone : null,
        workerProfile: o.worker.workerProfiles[0] ?? null
          ? {
              ...o.worker.workerProfiles[0] ?? {},
              skills: JSON.parse(o.worker.workerProfiles[0]?.skills || "[]"),
            }
          : null,
        status: o.status,
        matchScore: o.matchScore,
      })),
      offerCounts: {
        total: job.offers.length,
        pending: job.offers.filter((o) => o.status === "PENDING").length,
        accepted: job.offers.filter((o) => o.status === "ACCEPTED").length,
        declined: job.offers.filter((o) => o.status === "DECLINED").length,
      },
    };

    return NextResponse.json({ job: parsed }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/employer/jobs/[id]
 * Update a job (only if DRAFT or OPEN).
 */
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await db.job.findFirst({
      where: { id, employerId: user.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "DRAFT" && job.status !== "OPEN") {
      return NextResponse.json(
        { error: "Cannot edit a job that is already in progress" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = await db.job.update({
      where: { id },
      data: {
        title: body.title ?? job.title,
        description: body.description ?? job.description,
        wage: body.wage ?? job.wage,
        numberOfWorkers: body.numberOfWorkers ?? job.numberOfWorkers,
      },
    });

    return NextResponse.json({ job: updated }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/employer/jobs/[id]
 * Soft-cancel a job (set status=CANCELLED, decline all pending offers).
 */
export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const job = await db.job.findFirst({
      where: { id, employerId: user.id },
      include: {
        offers: { where: { status: "ACCEPTED" }, select: { id: true } },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Job is already cancelled" },
        { status: 400 }
      );
    }

    // Prevent deletion/cancellation if workers have accepted
    if (job.offers.length > 0) {
      return NextResponse.json(
        { error: `Cannot cancel this job because ${job.offers.length} worker(s) have already accepted. Please contact them directly.` },
        { status: 400 }
      );
    }

    // Cancel job, decline all pending offers, and refund any secured
    // payment (simulated) in a single transaction
    await db.$transaction([
      db.job.update({
        where: { id },
        data: { status: "CANCELLED" },
      }),
      db.jobOffer.updateMany({
        where: { jobId: id, status: "PENDING" },
        data: { status: "DECLINED" },
      }),
      // Refund rule: a payment can only be PENDING/SECURED here because
      // cancellation is blocked once a worker has accepted.
      db.payment.updateMany({
        where: { jobId: id, status: { in: ["PENDING", "SECURED"] } },
        data: { status: "CANCELLED" },
      }),
    ]);

    return NextResponse.json(
      { message: "Job cancelled successfully" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to cancel job" },
      { status: 500 }
    );
  }
}
