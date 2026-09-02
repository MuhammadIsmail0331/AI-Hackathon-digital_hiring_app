const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

function generateId() {
  return crypto.randomUUID();
}

const DATABASE_URL = process.env.DATABASE_URL;
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!DATABASE_URL || !AUTH_TOKEN) {
  console.error("Missing DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

async function seed() {
  console.log("Seeding Turso database...");
  const client = createClient({ url: DATABASE_URL, authToken: AUTH_TOKEN });

  const passwordHash = await bcrypt.hash("password123", 12);
  const now = new Date().toISOString();

  const users = [
    { id: generateId(), name: "Ahmed Khan", email: "ahmed@example.com", phone: "03001234567", role: "WORKER", isAdmin: 0 },
    { id: generateId(), name: "Bilal Ahmed", email: "bilal@example.com", phone: "03019876543", role: "WORKER", isAdmin: 0 },
    { id: generateId(), name: "Sara Malik", email: "sara@example.com", phone: "03211112222", role: "EMPLOYER", isAdmin: 0 },
    { id: generateId(), name: "Imran Ali", email: "imran@example.com", phone: "03021234567", role: "WORKER", isAdmin: 0 },
    { id: generateId(), name: "Kamran Shah", email: "kamran@example.com", phone: "03031234567", role: "WORKER", isAdmin: 0 },
    { id: generateId(), name: "Rashid Mehmood", email: "rashid@example.com", phone: "03041234567", role: "WORKER", isAdmin: 0 },
    { id: generateId(), name: "Admin User", email: "admin@example.com", phone: "03000000000", role: "EMPLOYER", isAdmin: 1 },
  ];

  for (const u of users) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "User" (id, name, email, phone, passwordHash, role, language, isBlocked, isAdmin, phoneVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'en', 0, ?, 0, ?, ?)`,
      args: [u.id, u.name, u.email, u.phone, passwordHash, u.role, u.isAdmin, now, now],
    });
    console.log(`  User: ${u.name} (${u.email})`);
  }

  const ahmedId = users[0].id;
  const bilalId = users[1].id;
  const imranId = users[3].id;
  const kamranId = users[4].id;
  const rashidId = users[5].id;

  const profiles = [
    { userId: ahmedId, workerType: "painter", skills: '["interior_painting","exterior_painting","waterproofing"]', experience: 5, locationName: "karachi", lat: 24.8607, lng: 67.0011, wage: 2500, days: '["mon","tue","wed","thu","fri","sat"]', bio: "Experienced painter with 5 years of work.", rating: 4.5, jobs: 23 },
    { userId: bilalId, workerType: "plumber", skills: '["pipe_fitting","drainage","water_heater"]', experience: 3, locationName: "karachi", lat: 24.87, lng: 67.02, wage: 2000, days: '["mon","tue","wed","thu","fri"]', bio: "Skilled plumber.", rating: 4.2, jobs: 15 },
    { userId: imranId, workerType: "painter", skills: '["interior_painting","texture","wallpaper"]', experience: 7, locationName: "karachi", lat: 24.85, lng: 67.03, wage: 3000, days: '["mon","tue","wed","thu","fri","sat"]', bio: "Texture specialist.", rating: 4.8, jobs: 41 },
    { userId: kamranId, workerType: "painter", skills: '["interior_painting","exterior_painting"]', experience: 2, locationName: "karachi", lat: 24.88, lng: 67.01, wage: 1800, days: '["mon","wed","fri","sat"]', bio: "Young painter.", rating: 3.9, jobs: 8 },
    { userId: rashidId, workerType: "painter", skills: '["interior_painting","exterior_painting","waterproofing","texture"]', experience: 10, locationName: "hyderabad", lat: 25.396, lng: 68.3578, wage: 3500, days: '["mon","tue","wed","thu","fri"]', bio: "Master painter in Hyderabad.", rating: 4.9, jobs: 67 },
  ];

  for (const p of profiles) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO "WorkerProfile" (id, userId, workerType, skills, experience, locationLat, locationLng, locationName, expectedWage, isAvailable, availableDays, bio, avgRating, totalJobs, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
      args: [generateId(), p.userId, p.workerType, p.skills, p.experience, p.lat, p.lng, p.locationName, p.wage, p.days, p.bio, p.rating, p.jobs, now, now],
    });
    console.log(`  WorkerProfile: ${p.workerType} in ${p.locationName}`);
  }

  await client.execute({
    sql: `INSERT OR IGNORE INTO "SystemConfig" (id, key, value, label, updatedAt) VALUES (?, 'SEARCH_RADIUS_KM', '50', 'Default search radius in km', ?)`,
    args: [generateId(), now],
  });
  console.log("  SystemConfig: SEARCH_RADIUS_KM = 50");

  console.log("\nSeed complete!");
  console.log("\nTest credentials (password: password123):");
  console.log("  Worker:   ahmed@example.com | bilal@example.com | imran@example.com");
  console.log("  Employer: sara@example.com");
  console.log("  Admin:    admin@example.com");

  client.close();
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
