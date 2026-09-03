import { NextResponse } from "next/server";
import { resolveSessionUser } from "@/lib/session";
import { db } from "@/lib/db";
import { createNotification, createBulkNotifications } from "@/lib/notifications";
import { WORKER_CATEGORIES, PAKISTAN_CITIES } from "@/lib/constants";

function categoryLabel(id: string | null | undefined) {
  return WORKER_CATEGORIES.find((c) => c.id === id)?.en || id || "";
}

function cityLabel(id: string | null | undefined) {
  return PAKISTAN_CITIES.find((c) => c.id === id)?.en || id || "";
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/worker/offers/[id]
 * Accept or decline an offer.
 * Body: { action: "ACCEPT" | "DECLINE" }
 *
 * Concurrent-safe: uses Prisma $transaction to ensure
 * accepted count never exceeds job.numberOfWorkers.
 */
export async function PUT(request: Request, { params }: RouteContext) {
  try {
    const user = await resolveSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const action = body.action as string;

    if (action !== "ACCEPT" && action !== "DECLINE") {
      return NextResponse.json(
        { error: "Action must be ACCEPT or DECLINE" },
        { status: 400 }
      );
    }

    // Verify this offer belongs the authenticated worker
    const offer = await db.jobOffer.findFirst({
      where: { id, workerId: user.id },
      include: {
        job: {
          select: {
            id: true,
            numberOfWorkers: true,
            status: true,
            title: true,
            employerId: true,
            date: true,
            startTimeHour: true,
            startTimeMinute: true,
            startTimePeriod: true,
            locationName: true,
            employer: { select: { name: true, phone: true } },
          },
        },
        worker: {
          select: {
            phone: true,
            workerProfiles: {
              select: { workerType: true, experience: true, locationName: true },
            },
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.status !== "PENDING") {
      return NextResponse.json(
        {
          error:
            offer.status === "ACCEPTED"
              ? "You have already accepted this offer"
              : "This offer has been declined",
        },
        { status: 400 }
      );
    }

    // Decline is straightforward
    if (action === "DECLINE") {
      await db.jobOffer.update({
        where: { id },
        data: { status: "DECLINED" },
      });

      // Notify employer about decline
      await createNotification(
        offer.job.employerId,
        "JOB_DECLINED",
        "Offer Declined",
        `${user.name} has declined the offer for "${offer.job.title}"`,
        { jobId: offer.job.id, offerId: id }
      );

      return NextResponse.json(
        { message: "Offer declined", status: "DECLINED" },
        { status: 200 }
      );
    }

    // Accept with concurrent-safe transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Count already-accepted offers for this job
      const acceptedCount = await tx.jobOffer.count({
        where: {
          jobId: offer.job.id,
          status: "ACCEPTED",
        },
      });

      // 2. If all positions are already filled, auto-decline this offer
      if (acceptedCount >= offer.job.numberOfWorkers) {
        await tx.jobOffer.update({
          where: { id },
          data: { status: "DECLINED" },
        });
        return { status: "DECLINED" as const, reason: "allPositionsFilled" };
      }

      // 3. Accept this offer
      await tx.jobOffer.update({
        where: { id },
        data: { status: "ACCEPTED" },
      });

      // 3b. If the employer already secured the payment, it now moves into escrow
      const paymentUpdate = await tx.payment.updateMany({
        where: { jobId: offer.job.id, status: "SECURED" },
        data: { status: "HELD" },
      });
      const paymentHeld = paymentUpdate.count > 0;

      const newAcceptedCount = acceptedCount + 1;

      // 4. If all positions now filled, decline remaining pending offers + set job to IN_PROGRESS
      if (newAcceptedCount >= offer.job.numberOfWorkers) {
        // Collect affected worker ids first so they can be notified afterwards
        const remaining = await tx.jobOffer.findMany({
          where: {
            jobId: offer.job.id,
            status: "PENDING",
            id: { not: id },
          },
          select: { workerId: true },
        });

        await tx.jobOffer.updateMany({
          where: {
            jobId: offer.job.id,
            status: "PENDING",
            id: { not: id },
          },
          data: { status: "DECLINED" },
        });

        await tx.job.update({
          where: { id: offer.job.id },
          data: { status: "IN_PROGRESS" },
        });

        return {
          status: "ACCEPTED" as const,
          reason: "allPositionsFilled",
          acceptedCount: newAcceptedCount,
          needed: offer.job.numberOfWorkers,
          autoDeclinedWorkerIds: remaining.map((r) => r.workerId),
          paymentHeld,
        };
      }

      return {
        status: "ACCEPTED" as const,
        reason: "positionSecured",
        acceptedCount: newAcceptedCount,
        needed: offer.job.numberOfWorkers,
        paymentHeld,
      };
    });

    // Positions already filled → the offer was auto-declined
    if (result.status === "DECLINED") {
      return NextResponse.json(
        {
          message: "Sorry, all positions have been filled",
          ...result,
        },
        { status: 200 }
      );
    }

    // ── Contact exchange: both parties receive each other's details ──
    const workerProfile = offer.worker.workerProfiles[0] ?? null;
    const workerPhone = offer.worker.phone;
    const employerName = offer.job.employer.name;
    const employerPhone = offer.job.employer.phone;
    const jobDate = new Date(offer.job.date).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const startTime = `${String(offer.job.startTimeHour).padStart(2, "0")}:${String(
      offer.job.startTimeMinute
    ).padStart(2, "0")} ${offer.job.startTimePeriod}`;

    // 1. Employer receives the worker's profile + phone number
    const profileBits = [
      categoryLabel(workerProfile?.workerType),
      workerProfile?.experience ? `${workerProfile.experience}+ yrs exp` : null,
      cityLabel(workerProfile?.locationName),
    ]
      .filter(Boolean)
      .join(" · ");

    await createNotification(
      offer.job.employerId,
      "JOB_ACCEPTED",
      "Worker Confirmed",
      `${user.name} accepted your job "${offer.job.title}"${
        profileBits ? ` (${profileBits})` : ""
      }. You can now contact ${user.name} at ${workerPhone}.`,
      {
        jobId: offer.job.id,
        offerId: id,
        phone: workerPhone,
        contactName: user.name,
        category: categoryLabel(workerProfile?.workerType),
        experience: workerProfile?.experience,
        location: cityLabel(workerProfile?.locationName),
        link: `/employer/jobs/${offer.job.id}`,
      }
    );

    // 2. Worker receives the employer's contact details to coordinate
    await createNotification(
      user.id,
      "JOB_ACCEPTED",
      "Job Accepted — Employer Contact",
      `You accepted "${offer.job.title}". Contact employer ${employerName} at ${employerPhone}. Job: ${jobDate}, ${startTime}, ${cityLabel(
        offer.job.locationName
      )}.`,
      {
        jobId: offer.job.id,
        offerId: id,
        phone: employerPhone,
        contactName: employerName,
        jobDate,
        startTime,
        location: cityLabel(offer.job.locationName),
        link: "/worker/offers",
      }
    );

    // 3. Auto-declined workers are informed the positions were filled
    if (result.autoDeclinedWorkerIds?.length) {
      await createBulkNotifications(
        result.autoDeclinedWorkerIds,
        "JOB_DECLINED",
        "Offer No Longer Available",
        `All positions for "${offer.job.title}" have been filled. Keep browsing — new jobs are posted every day!`,
        { jobId: offer.job.id, offerId: id, link: "/worker/jobs" }
      );
    }

    // 4. If the payment moved into escrow on acceptance, tell the worker
    // (covers the case where the employer secured it before anyone accepted)
    if (result.paymentHeld) {
      const payment = await db.payment.findUnique({
        where: { jobId: offer.job.id },
        select: { totalAmount: true },
      });
      if (payment) {
        await createNotification(
          user.id,
          "SYSTEM",
          "Payment Secured",
          `The employer has secured ${payment.totalAmount.toLocaleString()} PKR for "${offer.job.title}". Your wage is protected and will be released after the job is completed.`,
          { jobId: offer.job.id, offerId: id, link: `/worker/my-jobs/${offer.job.id}` }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Offer accepted! Employer contact details have been shared with you.",
        ...result,
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to process offer" },
      { status: 500 }
    );
  }
}
