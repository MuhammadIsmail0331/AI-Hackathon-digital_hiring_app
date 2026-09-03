import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { findMatchingProfessionals } from "@/lib/matching";
import { createNotification, createBulkNotifications } from "@/lib/notifications";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/employer/jobs/[id]/background-search
 * Activates or extends background search for a job with no matches.
 * Body: { action: "START" | "EXTEND" | "STOP" }
 *
 * Background search keeps the job OPEN and sets an expiry.
 * Maximum 5 extensions (5 hours total, 1 hour each).
 * In production, a cron job would check these periodically.
 */
export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user || user.isBlocked) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await _req.json();
    const { action } = body;

    const job = await db.job.findFirst({
      where: { id, employerId: user.id },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (action === "STOP") {
      await db.job.update({
        where: { id },
        data: { backgroundSearchUntil: null, backgroundSearchExtensions: 0 },
      });
      return NextResponse.json({ message: "Background search stopped" });
    }

    if (action === "START") {
      if (job.status !== "OPEN") {
        return NextResponse.json(
          { error: "Background search only available for open jobs" },
          { status: 400 }
        );
      }
      const until = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await db.job.update({
        where: { id },
        data: { backgroundSearchUntil: until, backgroundSearchExtensions: 1 },
      });

      await createNotification(
        user.id,
        "SYSTEM",
        "Background Search Started",
        `We'll search for professionals for "${job.title}" for the next hour.`,
        { jobId: id }
      );

      return NextResponse.json({
        message: "Background search started for 1 hour",
        searchUntil: until,
      });
    }

    if (action === "EXTEND") {
      if (!job.backgroundSearchUntil || job.backgroundSearchUntil < new Date()) {
        return NextResponse.json(
          { error: "No active background search to extend" },
          { status: 400 }
        );
      }
      if (job.backgroundSearchExtensions >= 5) {
        return NextResponse.json(
          { error: "Maximum search time (5 hours) reached" },
          { status: 400 }
        );
      }

      const until = new Date(Date.now() + 60 * 60 * 1000);
      await db.job.update({
        where: { id },
        data: {
          backgroundSearchUntil: until,
          backgroundSearchExtensions: { increment: 1 },
        },
      });

      return NextResponse.json({
        message: `Search extended for 1 more hour (${job.backgroundSearchExtensions + 1}/5 hours used)`,
        searchUntil: until,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to manage background search" }, { status: 500 });
  }
}
