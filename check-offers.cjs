const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function main() {
  const offers = await db.jobOffer.findMany({
    select: {
      id: true,
      status: true,
      worker: { select: { email: true, name: true, phone: true } },
      job: {
        select: {
          id: true,
          title: true,
          status: true,
          numberOfWorkers: true,
          employer: { select: { email: true, name: true, phone: true } },
        },
      },
    },
  });
  console.log(JSON.stringify(offers, null, 2));
  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
