import { NextResponse } from "next/server";
import { resolveAdminUser } from "@/lib/session";
import { db } from "@/lib/db";

/** GET /api/admin/stats - platform-wide statistics for the admin dashboard. */
export async function GET() {
  try {
    const admin = await resolveAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const [totalUsers, totalWorkers, totalEmployers, totalJobs, completedJobs, activeJobs, totalOffers, totalPaymentsAgg] =
      await Promise.all([
        db.user.count(),
        db.user.count({ where: { role: "WORKER" } }),
        db.user.count({ where: { role: "EMPLOYER" } }),
        db.job.count(),
        db.job.count({ where: { status: "COMPLETED" } }),
        db.job.count({ where: { status: { in: ["OPEN", "MATCHING", "OFFERS_SENT", "IN_PROGRESS"] } } }),
        db.jobOffer.count(),
        db.payment.aggregate({ where: { status: "RELEASED" }, _sum: { totalAmount: true } }),
      ]);

    const wageAgg = await db.job.aggregate({
      where: { status: { in: ["OPEN", "OFFERS_SENT", "IN_PROGRESS", "COMPLETED"] } },
      _avg: { wage: true },
    });

    return NextResponse.json(
      {
        totalUsers,
        totalWorkers,
        totalEmployers,
        totalJobs,
        completedJobs,
        activeJobs,
        totalOffers,
        totalPaidOut: totalPaymentsAgg._sum.totalAmount ?? 0,
        avgWage: Math.round(wageAgg._avg.wage ?? 0),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
