import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/employer/jobs/[id]/offer
 * Direct invitation: employer picks a professional from Find Professionals
 * and sends a personal offer for this job.
 * Body: { workerId: string }
 */
export async function POST(request: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json()) as { workerId?: string };
    if (!body.workerId) {
      return NextResponse.json({ error: "workerId is required" }, { status: 400 });
    }

    const job = await db.job.findFirst({
      where: { id, employerId: user.id },
      include: { offers: { select: { workerId: true, status: true } } },
    });
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    if (!("OPEN MATCHING OFFERS_SENT".includes(job.status))) {
      return NextResponse.json(
        { error: "Offers can only be sent for open jobs" },
        { status: 400 }
      );
    }

    const accepted = job.offers.filter((o) => o.status === "ACCEPTED").length;
    if (accepted >= job.numberOfWorkers) {
      return NextResponse.json(
        { error: "All positions for this job are already filled" },
        { status: 400 }
      );
    }

    const duplicate = job.offers.find(
      (o) => o.workerId === body.workerId && o.status !== "DECLINED"
    );
    if (duplicate) {
      return NextResponse.json(
        { error: "This worker already has an offer for this job" },
        { status: 400 }
      );
    }

    const worker = await db.user.findFirst({
      where: { id: body.workerId, isBlocked: false },
      select: { id: true, name: true },
    });
    if (!worker) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }

    const offer = await db.jobOffer.create({
      data: {
        jobId: job.id,
        workerId: worker.id,
        status: "PENDING",
        matchReason: "Directly invited by the employer",
      },
    });

    if (job.status === "OPEN") {
      await db.job.update({ where: { id: job.id }, data: { status: "OFFERS_SENT" } });
    }

    await createNotification(
      worker.id,
      "JOB_OFFER",
      "Direct Job Offer",
      `${user.name} personally invited you to their job: \"${job.title}\". Check your offers!`,
      { jobId: job.id, offerId: offer.id, fromUserId: user.id, fromUserName: user.name }
    );

    return NextResponse.json(
      { message: `Offer sent to ${worker.name}`, offerId: offer.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to send offer" },
      { status: 500 }
    );
  }
}
