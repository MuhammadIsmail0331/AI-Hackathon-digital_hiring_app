const { createClient } = require("@libsql/client");

const DATABASE_URL = process.env.DATABASE_URL;
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!DATABASE_URL || !AUTH_TOKEN) {
  console.error("Missing DATABASE_URL or TURSO_AUTH_TOKEN");
  process.exit(1);
}

const SQL = `
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'WORKER',
    "language" TEXT NOT NULL DEFAULT 'en',
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "WorkerProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workerType" TEXT NOT NULL,
    "skills" TEXT NOT NULL DEFAULT '[]',
    "experience" INTEGER NOT NULL DEFAULT 0,
    "locationLat" REAL,
    "locationLng" REAL,
    "locationName" TEXT,
    "expectedWage" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "availableDays" TEXT NOT NULL DEFAULT '[]',
    "bio" TEXT,
    "avatarUrl" TEXT,
    "avgRating" REAL NOT NULL DEFAULT 0,
    "totalJobs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "workerType" TEXT NOT NULL,
    "requiredSkills" TEXT NOT NULL DEFAULT '[]',
    "numberOfWorkers" INTEGER NOT NULL DEFAULT 1,
    "date" DATETIME NOT NULL,
    "startTimeHour" INTEGER NOT NULL,
    "startTimeMinute" INTEGER NOT NULL,
    "startTimePeriod" TEXT NOT NULL DEFAULT 'AM',
    "endTimeHour" INTEGER NOT NULL,
    "endTimeMinute" INTEGER NOT NULL,
    "endTimePeriod" TEXT NOT NULL DEFAULT 'PM',
    "wage" INTEGER NOT NULL,
    "toolsRequired" TEXT NOT NULL DEFAULT '[]',
    "locationLat" REAL,
    "locationLng" REAL,
    "locationName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "aiDescription" TEXT,
    "backgroundSearchUntil" DATETIME,
    "backgroundSearchExtensions" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "JobOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "matchScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "securedAt" DATETIME,
    "releasedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "SystemConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "OTPVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL DEFAULT 'REGISTRATION',
    "expiresAt" DATETIME NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT NOT NULL DEFAULT '{}',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Feedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "overallRating" INTEGER NOT NULL,
    "punctuality" INTEGER,
    "attitude" INTEGER,
    "workQuality" INTEGER,
    "paymentOnTime" INTEGER,
    "fairTreatment" INTEGER,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "BlockedUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "reason" TEXT,
    "blockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "IssueReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX IF NOT EXISTS "WorkerProfile_userId_key" ON "WorkerProfile"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "JobOffer_jobId_workerId_key" ON "JobOffer"("jobId", "workerId");
CREATE UNIQUE INDEX IF NOT EXISTS "Payment_jobId_key" ON "Payment"("jobId");
CREATE UNIQUE INDEX IF NOT EXISTS "SystemConfig_key_key" ON "SystemConfig"("key");
CREATE INDEX IF NOT EXISTS "OTPVerification_phone_purpose_idx" ON "OTPVerification"("phone", "purpose");
CREATE INDEX IF NOT EXISTS "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE UNIQUE INDEX IF NOT EXISTS "Feedback_jobId_authorId_key" ON "Feedback"("jobId", "authorId");
CREATE UNIQUE INDEX IF NOT EXISTS "BlockedUser_userId_key" ON "BlockedUser"("userId");
`;

async function main() {
  console.log(`Connecting to: ${DATABASE_URL}`);
  const client = createClient({ url: DATABASE_URL, authToken: AUTH_TOKEN });

  try {
    // Split into individual statements and execute
    const statements = SQL.split(";").map((s) => s.trim()).filter(Boolean);
    console.log(`Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.execute(stmt + ";");
        if (stmt.includes("CREATE TABLE")) {
          const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1];
          console.log(`  ✓ Table "${tableName}" created/exists`);
        } else if (stmt.includes("CREATE INDEX") || stmt.includes("CREATE UNIQUE INDEX")) {
          const indexName = stmt.match(/INDEX IF NOT EXISTS "([^"]+)"/)?.[1];
          console.log(`  ✓ Index "${indexName}" created/exists`);
        }
      } catch (err) {
        console.error(`  ✗ Error on statement ${i + 1}: ${err.message}`);
      }
    }

    console.log("\nSchema pushed successfully!");

    // Verify tables
    const result = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log(`\nTables in database (${result.rows.length}):`);
    result.rows.forEach((row) => console.log(`  - ${row.name}`));
  } finally {
    client.close();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
