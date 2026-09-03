/**
 * Row-count sanity check for the seeded database.
 * Usage: node scripts/verify-seed.cjs
 */
const { PrismaClient } = require("@prisma/client");

(async () => {
  const db = new PrismaClient();
  const counts = {
    users: await db.user.count(),
    workerProfiles: await db.workerProfile.count(),
    jobs: await db.job.count(),
    jobOffers: await db.jobOffer.count(),
    payments: await db.payment.count(),
    feedbacks: await db.feedback.count(),
    notifications: await db.notification.count(),
    systemConfig: await db.systemConfig.count(),
  };
  const byStatus = await db.job.groupBy({ by: ["status"], _count: true });
  console.log(JSON.stringify(counts, null, 2));
  console.log("Jobs by status:", byStatus.map((s) => `${s.status}=${s._count}`).join(" · "));
  await db.$disconnect();
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
