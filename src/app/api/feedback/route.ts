import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { feedbackSchema } from "@/lib/validation/feedback.schemas";
import { createNotification } from "@/lib/notifications";

/**
 * GET /api/feedback
 * Get feedback for a specific job (for the authenticated user).
 */
export async function GET(request: Request) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const jobId = url.searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const feedbacks = await db.feedback.findMany({
      where: {
        jobId,
        OR: [{ authorId: user.id }, { subjectId: user.id }],
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ feedbacks }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}

/**
 * POST /api/feedback
 * Submit feedback for a completed job.
 */
export async function POST(request: Request) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const job = await db.job.findUnique({
      where: { id: data.jobId },
      select: { id: true, status: true, employerId: true, title: true },
    });

    if (!job || job.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Feedback can only be submitted for completed jobs" },
        { status: 400 }
      );
    }

    // Verify the author is part of this job
    if (data.type === "EMPLOYER_TO_WORKER") {
      if (job.employerId !== user.id) {
        return NextResponse.json({ error: "Only the employer can submit this feedback" }, { status: 403 });
      }
      const offer = await db.jobOffer.findFirst({
        where: { jobId: data.jobId, workerId: data.subjectId, status: "ACCEPTED" },
      });
      if (!offer) {
        return NextResponse.json({ error: "This worker did not work on this job" }, { status: 400 });
      }
    } else {
      const offer = await db.jobOffer.findFirst({
        where: { jobId: data.jobId, workerId: user.id, status: "ACCEPTED" },
      });
      if (!offer) {
        return NextResponse.json({ error: "Only workers who completed this job can submit feedback" }, { status: 403 });
      }
      if (data.subjectId !== job.employerId) {
        return NextResponse.json({ error: "Subject must be the employer" }, { status: 400 });
      }
    }

    const feedback = await db.feedback.upsert({
      where: { jobId_authorId: { jobId: data.jobId, authorId: user.id } },
      create: {
        jobId: data.jobId,
        authorId: user.id,
        subjectId: data.subjectId,
        type: data.type,
        overallRating: data.overallRating,
        punctuality: data.punctuality,
        attitude: data.attitude,
        workQuality: data.workQuality,
        paymentOnTime: data.paymentOnTime,
        fairTreatment: data.fairTreatment,
        comment: data.comment,
      },
      update: {
        overallRating: data.overallRating,
        punctuality: data.punctuality,
        attitude: data.attitude,
        workQuality: data.workQuality,
        paymentOnTime: data.paymentOnTime,
        fairTreatment: data.fairTreatment,
        comment: data.comment,
      },
    });

    // Update worker rating if employer-to-worker
    if (data.type === "EMPLOYER_TO_WORKER") {
      await recalculateWorkerRating(data.subjectId);
    }

    await createNotification(
      data.subjectId,
      "FEEDBACK_REQUEST",
      "Feedback Received",
      `${user.name} has left you a ${data.overallRating}-star rating for "${job.title}"`,
      { jobId: data.jobId }
    );

    return NextResponse.json({ feedback, message: "Feedback submitted successfully" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

async function recalculateWorkerRating(workerId: string): Promise<void> {
  const feedbacks = await db.feedback.findMany({
    where: { subjectId: workerId, type: "EMPLOYER_TO_WORKER" },
    select: { overallRating: true },
  });

  if (feedbacks.length === 0) return;

  const avgRating =
    feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / feedbacks.length;

  await db.workerProfile.update({
    where: { userId: workerId },
    data: {
      avgRating: Math.round(avgRating * 10) / 10,
      totalJobs: feedbacks.length,
    },
  });
}
