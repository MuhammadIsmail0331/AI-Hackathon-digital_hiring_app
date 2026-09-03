import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const PASSWORD = "password123";

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

function hoursFromNow(n: number): Date {
  return new Date(Date.now() + n * 60 * 60 * 1000);
}

async function main() {
  console.log("Seeding database...\n");

  // ── Clean existing data (order matters due to FK constraints) ──
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

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  // ─── Employers ────────────────────────────────────────────
  const sara = await db.user.create({
    data: {
      name: "Sara Malik",
      email: "sara@example.com",
      phone: "03211112222",
      passwordHash,
      role: "EMPLOYER",
      phoneVerified: true,
    },
  });
  const hamza = await db.user.create({
    data: {
      name: "Hamza Sheikh",
      email: "hamza@example.com",
      phone: "03213334444",
      passwordHash,
      role: "EMPLOYER",
      phoneVerified: true,
    },
  });
  const adeel = await db.user.create({
    data: {
      name: "Adeel Raza",
      email: "adeel@example.com",
      phone: "03215556666",
      passwordHash,
      role: "EMPLOYER",
      phoneVerified: true,
    },
  });
  const admin = await db.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      phone: "03000000000",
      passwordHash,
      role: "EMPLOYER",
      isAdmin: true,
      phoneVerified: true,
    },
  });
  console.log(
    `Employers: ${sara.name} (Karachi), ${hamza.name} (Lahore), ${adeel.name} (Islamabad)`
  );
  console.log(`Admin: ${admin.name}\nWorkers:`);

  // ─── Workers ──────────────────────────────────────────────
  interface WorkerSpec {
    name: string;
    email: string;
    phone: string;
    workerType: string;
    skills: string[];
    experience: number;
    locationName: string;
    lat: number;
    lng: number;
    expectedWage: number;
    bio: string;
    avgRating?: number;
    totalJobs?: number;
    language?: string;
  }

  async function createWorker(spec: WorkerSpec) {
    const user = await db.user.create({
      data: {
        name: spec.name,
        email: spec.email,
        phone: spec.phone,
        passwordHash,
        role: "WORKER",
        language: spec.language ?? "en",
        phoneVerified: true,
        workerProfile: {
          create: {
            workerType: spec.workerType,
            skills: JSON.stringify(spec.skills),
            experience: spec.experience,
            locationName: spec.locationName,
            locationLat: spec.lat,
            locationLng: spec.lng,
            expectedWage: spec.expectedWage,
            isAvailable: true,
            availableDays: JSON.stringify([
              "mon", "tue", "wed", "thu", "fri", "sat",
            ]),
            bio: spec.bio,
            avgRating: spec.avgRating ?? 0,
            totalJobs: spec.totalJobs ?? 0,
          },
        },
      },
    });
    console.log(
      `  ${spec.name} — ${spec.workerType} (${spec.locationName}) ★${spec.avgRating ?? 0}`
    );
    return user;
  }

  // Karachi
  const ahmed = await createWorker({
    name: "Ahmed Khan", email: "ahmed@example.com", phone: "03001234567",
    workerType: "painter", skills: ["interior_painting", "exterior_painting", "waterproofing"],
    experience: 5, locationName: "karachi", lat: 24.8607, lng: 67.0011,
    expectedWage: 2500, avgRating: 4.8, totalJobs: 23,
    bio: "Experienced painter with 5 years of work in residential and commercial painting.",
  });
  const bilal = await createWorker({
    name: "Bilal Ahmed", email: "bilal@example.com", phone: "03019876543",
    workerType: "plumber", skills: ["pipe_fitting", "drainage", "water_heater"],
    experience: 3, locationName: "karachi", lat: 24.8700, lng: 67.0200,
    expectedWage: 2000, avgRating: 4.7, totalJobs: 15,
    bio: "Skilled plumber specializing in pipe fitting and drainage systems.",
  });
  const imran = await createWorker({
    name: "Imran Ali", email: "imran@example.com", phone: "03021234567",
    workerType: "painter", skills: ["interior_painting", "texture", "wallpaper"],
    experience: 7, locationName: "karachi", lat: 24.8500, lng: 67.0300,
    expectedWage: 3000, avgRating: 4.9, totalJobs: 41,
    bio: "Specialist in texture work and wallpaper installation.",
  });
  const kamran = await createWorker({
    name: "Kamran Shah", email: "kamran@example.com", phone: "03031234567",
    workerType: "painter", skills: ["interior_painting", "exterior_painting"],
    experience: 2, locationName: "karachi", lat: 24.8800, lng: 67.0100,
    expectedWage: 1800, avgRating: 4.7, totalJobs: 8,
    bio: "Young and energetic painter, good with interior work.",
  });
  // Outside 50 km radius (Hyderabad) — used to test radius-based matching
  await createWorker({
    name: "Rashid Mehmood", email: "rashid@example.com", phone: "03041234567",
    workerType: "painter", skills: ["interior_painting", "exterior_painting", "waterproofing", "texture"],
    experience: 10, locationName: "hyderabad", lat: 25.3960, lng: 68.3578,
    expectedWage: 3500, avgRating: 4.9, totalJobs: 67,
    bio: "Master painter with 10 years experience in Hyderabad.",
  });

  // Lahore
  const usman = await createWorker({
    name: "Usman Ghani", email: "usman@example.com", phone: "03051234567",
    workerType: "electrician", skills: ["wiring", "fan_install", "switchboard"],
    experience: 6, locationName: "lahore", lat: 31.5204, lng: 74.3587,
    expectedWage: 3000, avgRating: 4.9, totalJobs: 32,
    bio: "Licensed electrician, expert in house wiring and switchboards.",
  });
  const tariq = await createWorker({
    name: "Tariq Jameel", email: "tariq@example.com", phone: "03061234567",
    workerType: "electrician", skills: ["wiring", "generator"],
    experience: 4, locationName: "lahore", lat: 31.5300, lng: 74.3700,
    expectedWage: 2500, avgRating: 4.7, totalJobs: 18,
    bio: "Electrician for wiring and generator repair work.",
  });
  const naveed = await createWorker({
    name: "Naveed Akhtar", email: "naveed@example.com", phone: "03071234567",
    workerType: "carpenter", skills: ["furniture", "kitchen_cabinet", "door_repair"],
    experience: 8, locationName: "lahore", lat: 31.5100, lng: 74.3400,
    expectedWage: 2800, avgRating: 4.8, totalJobs: 27,
    bio: "Master carpenter for custom furniture and cabinets.",
  });
  await createWorker({
    name: "Asif Nawaz", email: "asif@example.com", phone: "03081234567",
    workerType: "plumber", skills: ["pipe_fitting", "tap_repair", "toilet_install"],
    experience: 3, locationName: "lahore", lat: 31.4900, lng: 74.3200,
    expectedWage: 2200, avgRating: 4.7, totalJobs: 12,
    bio: "Plumber for taps, toilets and general pipe work.",
  });

  // Karachi (extra categories)
  await createWorker({
    name: "Zafar Iqbal", email: "zafar@example.com", phone: "03091234567",
    workerType: "mason", skills: ["brick_work", "plastering", "boundary_wall"],
    experience: 9, locationName: "karachi", lat: 24.8900, lng: 67.0500,
    expectedWage: 2600, avgRating: 4.9, totalJobs: 35, language: "ur",
    bio: "Mason for brick work, plaster and boundary walls.",
  });
  await createWorker({
    name: "Sultan Mirza", email: "sultan@example.com", phone: "03101234567",
    workerType: "welder", skills: ["gate_grill", "structural", "repair"],
    experience: 7, locationName: "karachi", lat: 24.8400, lng: 67.0600,
    expectedWage: 3200, avgRating: 4.8, totalJobs: 21, language: "ur",
    bio: "Welder for gates, grills and structural work.",
  });

  // Islamabad
  const fiaz = await createWorker({
    name: "Fiaz Ahmed", email: "fiaz@example.com", phone: "03111234567",
    workerType: "driver", skills: ["car", "rickshaw"],
    experience: 5, locationName: "islamabad", lat: 33.6844, lng: 73.0479,
    expectedWage: 3500, avgRating: 4.8, totalJobs: 16,
    bio: "Family event driver with clean record, car and rickshaw.",
  });

  // ─── Jobs ─────────────────────────────────────────────────
  console.log("\nJobs:");

  // J1 — IN_PROGRESS (Sara · Karachi · painter accepted, escrow held)
  const job1 = await db.job.create({
    data: {
      employerId: sara.id,
      title: "Interior painting for 2 bedrooms",
      description: "Two bedrooms need fresh paint, walls prepared first.",
      workerType: "painter",
      requiredSkills: JSON.stringify(["interior_painting"]),
      numberOfWorkers: 1,
      date: daysFromNow(1),
      startTimeHour: 9, startTimeMinute: 0, startTimePeriod: "AM",
      endTimeHour: 5, endTimeMinute: 0, endTimePeriod: "PM",
      wage: 3000,
      toolsRequired: JSON.stringify(["brush", "paint_roller"]),
      locationName: "karachi",
      locationLat: 24.8607, locationLng: 67.0011,
      status: "IN_PROGRESS",
    },
  });
  const offer1 = await db.jobOffer.create({
    data: { jobId: job1.id, workerId: imran.id, status: "ACCEPTED", matchScore: 91 },
  });
  await db.payment.create({
    data: { jobId: job1.id, totalAmount: 3000, status: "HELD", securedAt: new Date() },
  });
  await db.notification.create({
    data: {
      userId: imran.id, type: "JOB_OFFER", title: "New Job Offer",
      message: `Sara Malik has posted a job: "${job1.title}". Check your offers!`,
      data: JSON.stringify({ jobId: job1.id, offerId: offer1.id, fromUserId: sara.id, fromUserName: sara.name }),
      read: true,
    },
  });
  await db.notification.create({
    data: {
      userId: sara.id, type: "JOB_ACCEPTED", title: "Worker Confirmed",
      message: `${imran.name} accepted your job "${job1.title}". You can now contact ${imran.name} at 03021234567.`,
      data: JSON.stringify({ jobId: job1.id, offerId: offer1.id, phone: "03021234567", contactName: imran.name, link: `/employer/jobs/${job1.id}` }),
      read: true,
    },
  });
  console.log(`  [IN_PROGRESS]  ${job1.title} (Sara · ${imran.name} accepted)`);

  // J2 — OFFERS_SENT (Hamza · Lahore · electrician, offers pending)
  const job2 = await db.job.create({
    data: {
      employerId: hamza.id,
      title: "House wiring repair",
      description: "Sparks from lounge switchboard, full room wiring check needed.",
      workerType: "electrician",
      requiredSkills: JSON.stringify(["wiring"]),
      numberOfWorkers: 1,
      date: daysFromNow(3),
      startTimeHour: 10, startTimeMinute: 0, startTimePeriod: "AM",
      endTimeHour: 4, endTimeMinute: 0, endTimePeriod: "PM",
      wage: 3500,
      toolsRequired: JSON.stringify([]),
      locationName: "lahore",
      locationLat: 31.5204, locationLng: 74.3587,
      status: "OFFERS_SENT",
    },
  });
  const offer2a = await db.jobOffer.create({
    data: { jobId: job2.id, workerId: usman.id, status: "PENDING", matchScore: 92 },
  });
  const offer2b = await db.jobOffer.create({
    data: { jobId: job2.id, workerId: tariq.id, status: "PENDING", matchScore: 85 },
  });
  for (const [worker, offer] of [[usman, offer2a], [tariq, offer2b]] as const) {
    await db.notification.create({
      data: {
        userId: worker.id, type: "JOB_OFFER", title: "New Job Offer",
        message: `Hamza Sheikh has posted a job: "${job2.title}". Check your offers!`,
        data: JSON.stringify({ jobId: job2.id, offerId: offer.id, fromUserId: hamza.id, fromUserName: hamza.name }),
        read: false,
      },
    });
  }
  console.log(`  [OFFERS_SENT]  ${job2.title} (Hamza · offers pending: ${usman.name} ★92, ${tariq.name} ★85)`);

  // J3 — OPEN (Adeel · Islamabad · background search active)
  const job3 = await db.job.create({
    data: {
      employerId: adeel.id,
      title: "Driver for family event",
      description: "Need a driver with car for a wedding event, evening duty.",
      workerType: "driver",
      requiredSkills: JSON.stringify(["car"]),
      numberOfWorkers: 1,
      date: daysFromNow(5),
      startTimeHour: 6, startTimeMinute: 0, startTimePeriod: "PM",
      endTimeHour: 10, endTimeMinute: 0, endTimePeriod: "PM",
      wage: 4000,
      toolsRequired: JSON.stringify([]),
      locationName: "islamabad",
      locationLat: 33.6844, locationLng: 73.0479,
      status: "OPEN",
      backgroundSearchUntil: hoursFromNow(1),
      backgroundSearchExtensions: 0,
    },
  });
  console.log(`  [OPEN]         ${job3.title} (Adeel · background search active)`);

  // J4 — COMPLETED (Sara · Karachi · plumbing, payment RELEASED, mutual feedback)
  const job4 = await db.job.create({
    data: {
      employerId: sara.id,
      title: "Bathroom plumbing fix",
      description: "Leaking pipes under the bathroom sink need fixing.",
      workerType: "plumber",
      requiredSkills: JSON.stringify(["pipe_fitting", "tap_repair"]),
      numberOfWorkers: 1,
      date: daysFromNow(-2),
      startTimeHour: 11, startTimeMinute: 0, startTimePeriod: "AM",
      endTimeHour: 2, endTimeMinute: 0, endTimePeriod: "PM",
      wage: 2500,
      toolsRequired: JSON.stringify(["wrench"]),
      locationName: "karachi",
      locationLat: 24.8700, locationLng: 67.0200,
      status: "COMPLETED",
    },
  });
  await db.jobOffer.create({
    data: { jobId: job4.id, workerId: bilal.id, status: "ACCEPTED", matchScore: 88 },
  });
  await db.payment.create({
    data: { jobId: job4.id, totalAmount: 2500, status: "RELEASED", securedAt: daysFromNow(-2), releasedAt: daysFromNow(-1) },
  });
  await db.feedback.create({
    data: {
      jobId: job4.id, authorId: sara.id, subjectId: bilal.id, type: "EMPLOYER_TO_WORKER",
      overallRating: 5, punctuality: 5, attitude: 5, workQuality: 5,
      comment: "Excellent work — arrived on time and fixed everything quickly.",
    },
  });
  await db.feedback.create({
    data: {
      jobId: job4.id, authorId: bilal.id, subjectId: sara.id, type: "WORKER_TO_EMPLOYER",
      overallRating: 5, paymentOnTime: 5, fairTreatment: 5,
      comment: "Great employer, paid the full amount as agreed.",
    },
  });
  await db.notification.create({
    data: {
      userId: bilal.id, type: "JOB_COMPLETED", title: "Job Completed",
      message: `The job "${job4.title}" has been marked as completed. Please submit your feedback.`,
      data: JSON.stringify({ jobId: job4.id, employerId: sara.id, employerName: sara.name }),
      read: true,
    },
  });
  await db.notification.create({
    data: {
      userId: sara.id, type: "FEEDBACK_REQUEST", title: "Rate Your Worker",
      message: `Please rate ${bilal.name} for the job "${job4.title}"`,
      data: JSON.stringify({ jobId: job4.id, workerId: bilal.id, workerName: bilal.name }),
      read: true,
    },
  });
  console.log(`  [COMPLETED]    ${job4.title} (Sara · ${bilal.name} · payment RELEASED · mutual feedback)`);

  // J5 — COMPLETED (Hamza · Lahore · carpentry, payment HELD, worker feedback pending)
  // Intentionally reproduces the reported bug scenario: employer rated, worker has an
  // unread "Job Completed" notification and hasn't rated back — payment stays HELD.
  // Used by the Phase 1 golden-path E2E test (see docs/ROADMAP.md).
  const job5 = await db.job.create({
    data: {
      employerId: hamza.id,
      title: "Custom wardrobe carpentry",
      description: "Built-in wardrobe for the master bedroom.",
      workerType: "carpenter",
      requiredSkills: JSON.stringify(["furniture", "kitchen_cabinet"]),
      numberOfWorkers: 1,
      date: daysFromNow(-1),
      startTimeHour: 9, startTimeMinute: 0, startTimePeriod: "AM",
      endTimeHour: 6, endTimeMinute: 0, endTimePeriod: "PM",
      wage: 4500,
      toolsRequired: JSON.stringify(["saw", "measuring_tape"]),
      locationName: "lahore",
      locationLat: 31.5204, locationLng: 74.3587,
      status: "COMPLETED",
    },
  });
  await db.jobOffer.create({
    data: { jobId: job5.id, workerId: naveed.id, status: "ACCEPTED", matchScore: 90 },
  });
  await db.payment.create({
    data: { jobId: job5.id, totalAmount: 4500, status: "HELD", securedAt: daysFromNow(-1) },
  });
  await db.feedback.create({
    data: {
      jobId: job5.id, authorId: hamza.id, subjectId: naveed.id, type: "EMPLOYER_TO_WORKER",
      overallRating: 4, punctuality: 4, attitude: 5, workQuality: 4,
      comment: "Good work, minor delay on delivery.",
    },
  });
  await db.notification.create({
    data: {
      userId: naveed.id, type: "JOB_COMPLETED", title: "Job Completed",
      message: `The job "${job5.title}" has been marked as completed. Please submit your feedback.`,
      data: JSON.stringify({ jobId: job5.id, employerId: hamza.id, employerName: hamza.name }),
      read: false,
    },
  });
  await db.notification.create({
    data: {
      userId: hamza.id, type: "FEEDBACK_REQUEST", title: "Rate Your Worker",
      message: `Please rate ${naveed.name} for the job "${job5.title}"`,
      data: JSON.stringify({ jobId: job5.id, workerId: naveed.id, workerName: naveed.name }),
      read: true,
    },
  });
  console.log(`  [COMPLETED]    ${job5.title} (Hamza · ${naveed.name} · payment HELD · worker feedback PENDING)`);

  // J6 — OPEN (Sara · Karachi · mason, 2 workers needed, browseable)
  const job6 = await db.job.create({
    data: {
      employerId: sara.id,
      title: "Garden boundary wall masonry",
      description: "Boundary wall around the garden, roughly 40 feet.",
      workerType: "mason",
      requiredSkills: JSON.stringify(["brick_work", "boundary_wall"]),
      numberOfWorkers: 2,
      date: daysFromNow(7),
      startTimeHour: 8, startTimeMinute: 0, startTimePeriod: "AM",
      endTimeHour: 3, endTimeMinute: 0, endTimePeriod: "PM",
      wage: 2800,
      toolsRequired: JSON.stringify(["shovel"]),
      locationName: "karachi",
      locationLat: 24.8607, locationLng: 67.0011,
      status: "OPEN",
    },
  });
  console.log(`  [OPEN]         ${job6.title} (Sara · needs ${job6.numberOfWorkers} masons)`);

  // ─── System config ────────────────────────────────────────
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

  // ─── Summary ──────────────────────────────────────────────
  console.log("\nSeed complete!");
  console.log(`\nTest credentials (password: ${PASSWORD}):`);
  console.log("  Employers: sara@example.com (Karachi) · hamza@example.com (Lahore) · adeel@example.com (Islamabad)");
  console.log("  Admin:     admin@example.com");
  console.log(
    `  Workers:   ${ahmed.email} · ${kamran.email} · ${bilal.email} · ${imran.email} · usman@example.com · tariq@example.com · naveed@example.com · asif@example.com · zafar@example.com · sultan@example.com · ${fiaz.email} · rashid@example.com (out of radius)`
  );
  console.log("\nDemo states: 2 OPEN · 1 OFFERS_SENT (pending offers) · 1 IN_PROGRESS · 2 COMPLETED (1 with worker feedback pending)");

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
