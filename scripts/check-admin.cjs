const { PrismaClient } = require from "@prisma/client";
const db = new PrismaClient();
(async () => {
  const admin = await db.user.findFirst({ where: { isAdmin: true }, select: { id: true, name: true, email: true, isAdmin: true, role: true } });
  console.log("Admin user:", JSON.stringify(admin));
  const stats = await db.$transaction([
    db.user.count(), db.job.count(), db.jobOffer.count(), db.issueReport.count(),
  ]);
  console.log("Counts [users, jobs, offers, issues]:", stats);
  await db.$disconnect();
})().catch(e => { console.error(e.message); process.exit(1); });
