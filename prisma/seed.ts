import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data (order matters due to FK constraints)
  await db.feedback.deleteMany();
  await db.issueReport.deleteMany();
  await db.blockedUser.deleteMany();
  await db.notification.deleteMany();
  await db.oTPVerification.deleteMany();
  await db.systemConfig.deleteMany();
  await db.payment.deleteMany();
  await db.jobOffer.deleteMany();
  await db.job.deleteMany();
  await db.workerProfile.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 12);

  // Worker 1: Ahmed the Painter
  const worker1 = await db.user.create({
    data: {
      name: "Ahmed Khan",
      email: "ahmed@example.com",
      phone: "03001234567",
      passwordHash,
      role: "WORKER",
      workerProfile: {
        create: {
          workerType: "painter",
          skills: '["interior_painting","exterior_painting","waterproofing"]',
          experience: 5,
          locationName: "karachi",
          locationLat: 24.8607,
          locationLng: 67.0011,
          expectedWage: 2500,
          isAvailable: true,
          availableDays: '["mon","tue","wed","thu","fri","sat"]',
          bio: "Experienced painter with 5 years of work in residential and commercial painting.",
          avgRating: 4.5,
          totalJobs: 23,
        },
      },
    },
  });
  console.log(`Created worker: ${worker1.name} (${worker1.email})`);

  // Worker 2: Bilal the Plumber
  const worker2 = await db.user.create({
    data: {
      name: "Bilal Ahmed",
      email: "bilal@example.com",
      phone: "03019876543",
      passwordHash,
      role: "WORKER",
      workerProfile: {
        create: {
          workerType: "plumber",
          skills: '["pipe_fitting","drainage","water_heater"]',
          experience: 3,
          locationName: "karachi",
          locationLat: 24.8700,
          locationLng: 67.0200,
          expectedWage: 2000,
          isAvailable: true,
          availableDays: '["mon","tue","wed","thu","fri"]',
          bio: "Skilled plumber specializing in pipe fitting and drainage systems.",
          avgRating: 4.2,
          totalJobs: 15,
        },
      },
    },
  });
  console.log(`Created worker: ${worker2.name} (${worker2.email})`);

  // Employer: Sara
  const employer = await db.user.create({
    data: {
      name: "Sara Malik",
      email: "sara@example.com",
      phone: "03211112222",
      passwordHash,
      role: "EMPLOYER",
    },
  });
  console.log(`Created employer: ${employer.name} (${employer.email})`);

  // Worker 3: Imran the Painter (Karachi, for multi-worker test)
  const worker3 = await db.user.create({
    data: {
      name: "Imran Ali",
      email: "imran@example.com",
      phone: "03021234567",
      passwordHash,
      role: "WORKER",
      workerProfile: {
        create: {
          workerType: "painter",
          skills: '["interior_painting","texture","wallpaper"]',
          experience: 7,
          locationName: "karachi",
          locationLat: 24.8500,
          locationLng: 67.0300,
          expectedWage: 3000,
          isAvailable: true,
          availableDays: '["mon","tue","wed","thu","fri","sat"]',
          bio: "Specialist in texture work and wallpaper installation.",
          avgRating: 4.8,
          totalJobs: 41,
        },
      },
    },
  });
  console.log(`Created worker: ${worker3.name} (${worker3.email})`);

  // Worker 4: Kamran the Painter (Karachi, for multi-worker test)
  const worker4 = await db.user.create({
    data: {
      name: "Kamran Shah",
      email: "kamran@example.com",
      phone: "03031234567",
      passwordHash,
      role: "WORKER",
      workerProfile: {
        create: {
          workerType: "painter",
          skills: '["interior_painting","exterior_painting"]',
          experience: 2,
          locationName: "karachi",
          locationLat: 24.8800,
          locationLng: 67.0100,
          expectedWage: 1800,
          isAvailable: true,
          availableDays: '["mon","wed","fri","sat"]',
          bio: "Young and energetic painter, good with interior work.",
          avgRating: 3.9,
          totalJobs: 8,
        },
      },
    },
  });
  console.log(`Created worker: ${worker4.name} (${worker4.email})`);

  // Worker 5: Rashid the Painter (Hyderabad, ~150km from Karachi -- outside 50km radius)
  const worker5 = await db.user.create({
    data: {
      name: "Rashid Mehmood",
      email: "rashid@example.com",
      phone: "03041234567",
      passwordHash,
      role: "WORKER",
      workerProfile: {
        create: {
          workerType: "painter",
          skills: '["interior_painting","exterior_painting","waterproofing","texture"]',
          experience: 10,
          locationName: "hyderabad",
          locationLat: 25.3960,
          locationLng: 68.3578,
          expectedWage: 3500,
          isAvailable: true,
          availableDays: '["mon","tue","wed","thu","fri"]',
          bio: "Master painter with 10 years experience in Hyderabad.",
          avgRating: 4.9,
          totalJobs: 67,
        },
      },
    },
  });
  console.log(`Created worker: ${worker5.name} (${worker5.email})`);

  // Admin user
  const admin = await db.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      phone: "03000000000",
      passwordHash,
      role: "EMPLOYER",
      isAdmin: true,
    },
  });
  console.log(`Created admin: ${admin.name} (${admin.email})`);

  // SystemConfig: search radius
  await db.systemConfig.upsert({
    where: { key: "SEARCH_RADIUS_KM" },
    create: {
      key: "SEARCH_RADIUS_KM",
      value: "50",
      label: "Default search radius in km for worker matching",
    },
    update: {
      value: "50",
      label: "Default search radius in km for worker matching",
    },
  });

  console.log("\nSeed complete!");
  console.log("\nTest credentials (password: password123):");
  console.log("  Worker:   ahmed@example.com (Painter, Karachi)");
  console.log("  Worker:   bilal@example.com (Plumber, Karachi)");
  console.log("  Worker:   imran@example.com (Painter, Karachi)");
  console.log("  Worker:   kamran@example.com (Painter, Karachi)");
  console.log("  Worker:   rashid@example.com (Painter, Hyderabad - outside 50km)");
  console.log("  Employer: sara@example.com");
  console.log("  Admin:    admin@example.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
