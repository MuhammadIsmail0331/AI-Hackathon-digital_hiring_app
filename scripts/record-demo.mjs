/**
 * Demo Video Recorder — one automation button for the hackathon submission.
 *
 * Usage:
 *   npm run demo:record                      -> records against PRODUCTION (default)
 *   DEMO_BASE_URL=http://localhost:3000 npm run demo:record  -> records against local
 *
 * Output: demo-video/demo-take.webm (uploads directly to YouTube/Drive)
 * MP4 (optional):  ffmpeg -i demo-video/demo-take.webm demo-video/demo.mp4
 *
 * The run performs the full golden path on the REAL app: landing -> employer
 * posts job -> AI matches -> offer sent -> worker accepts (confetti + escrow)
 * -> job completed -> feedback -> dark mode -> Urdu RTL. Pauses are sized
 * for voice-over narration (~3 min take).
 */
import { chromium } from "@playwright/test";
import { mkdirSync, renameSync, existsSync } from "node:fs";

const BASE = (process.env.DEMO_BASE_URL || "https://digital-hiring-app-five.vercel.app").replace(/\/$/, "");
const PASSWORD = "password123";
const OUT = "demo-video";
const TITLE = "House Wiring Repair";

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
});
const page = await ctx.newPage();
const pause = (ms) => page.waitForTimeout(ms);

async function login(email) {
  await ctx.clearCookies();
  await page.goto(`${BASE}/en/login`);
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await pause(700);
  await page.click('button[type="submit"]');
  // Wait until we have LEFT the login page (post-login redirect can be /en, /en/employer/dashboard, ...)
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30_000 });
}

function tomorrow() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}

let step = "landing";
try {
  // ── 1. Landing: hero + role cards ──
  console.log("→ Landing");
  await page.goto(`${BASE}/en`);
  await pause(4500);
  const needCard = page.locator("a", { hasText: "I Need a Worker" }).first();
  if ((await needCard.count()) > 0) { await needCard.hover(); await pause(1400); }
  const amCard = page.locator("a", { hasText: "I Am a Worker" }).first();
  if ((await amCard.count()) > 0) { await amCard.hover(); await pause(1400); }

  // ── 2. Employer: dashboard + Create Job ──
  step = "employer-dashboard";
  console.log("→ Employer dashboard");
  await login("sara@example.com");
  await page.goto(`${BASE}/en/employer/dashboard`);
  await pause(3000);
  const createBtn = page.locator("a", { hasText: "Create New Job" }).first();
  if ((await createBtn.count()) > 0) { await createBtn.hover(); await pause(2000); await createBtn.click(); }
  else await page.goto(`${BASE}/en/employer/jobs/new`);
  await pause(2500);

  // ── 3. AI assistant + manual safety net ──
  step = "ai-assistant";
  console.log("→ AI job assistant");
  try {
    const ta = page.locator("textarea").first();
    await ta.scrollIntoViewIfNeeded();
    await ta.click();
    await ta.fill("Need an electrician tomorrow morning in Lahore for house wiring, 3500 rupees per day");
    await pause(1400);
    await page.getByText(/Fill with AI|Fill With AI/i).first().click();
    await pause(3500);
  } catch { /* AI panel optional */ }

  // Ensure everything required is set (works whether or not AI filled it)
  await page.getByRole("button", { name: "Electrician", exact: true }).click().catch(() => {});
  const wiring = page.getByRole("button", { name: "Wiring", exact: true });
  if ((await wiring.count()) > 0 && (await wiring.getAttribute("aria-pressed")) !== "true") await wiring.click();
  await page.fill('input[type="date"]', tomorrow()).catch(() => {});
  await page.fill('input[placeholder="2000"]', "3500").catch(() => {});
  const lahore = page.getByRole("button", { name: "Lahore", exact: true });
  if ((await lahore.count()) > 0 && (await lahore.getAttribute("aria-pressed")) !== "true") await lahore.click();
  await page.fill('[data-testid="job-title"]', TITLE).catch(() => {});
  await pause(1200);
  await page.click('[data-testid="submit-job"]');
  await page.getByText(/Job Posted/i).waitFor({ timeout: 30_000 });
  await pause(3000);
  await page.click('[data-testid="send-offers"]');
  await page.waitForURL(/\/employer\/jobs$/, { timeout: 30_000 });
  await pause(2500);

  // ── 4. Worker: offer accept (confetti + escrow) ──
  step = "worker-accept";
  console.log("→ Worker accepts");
  await login("usman@example.com");
  await page.goto(`${BASE}/en/worker/offers`);
  await pause(3000);
  const card = page
    .locator('[data-testid="offer-card"]', { hasText: new RegExp("^" + TITLE) })
    .filter({ has: page.locator('[data-testid="accept-offer"]') })
    .first();
  await card.locator('[data-testid="accept-offer"]').click({ timeout: 20_000 });
  await pause(4000); // confetti + escrow message

  // ── 5. Employer: complete + rate ──
  step = "complete-feedback";
  console.log("→ Complete + feedback");
  await login("sara@example.com");
  await page.goto(`${BASE}/en/employer/jobs`);
  await pause(2000);
  await page.locator("a", { hasText: new RegExp("^" + TITLE) }).first().click();
  await pause(2000);
  await page.click('[data-testid="complete-trigger"]');
  await page.click('[data-testid="complete-confirm"]');
  await page.getByText("Completed").first().waitFor({ timeout: 20_000 });
  await pause(2500);
  const rateBtn = page.locator("button", { hasText: "Usman" }).first();
  if ((await rateBtn.count()) > 0) {
    await rateBtn.click();
    await pause(1000);
    await page.locator('[data-testid="overall-stars"] button').nth(4).click();
    await pause(800);
    await page.click('[data-testid="feedback-submit"]');
    await pause(2200);
  }

  // ── 6. Dark mode + Urdu RTL ──
  step = "dark-urdu";
  console.log("→ Dark mode + Urdu");
  await page.goto(`${BASE}/en/employer/dashboard`);
  await pause(2000);
  const themeBtn = page
    .locator('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="mode" i]')
    .first();
  if ((await themeBtn.count()) > 0) { await themeBtn.click(); await pause(2200); }
  await page.goto(`${BASE}/ur/employer/dashboard`);
  await pause(3500); // RTL + Nastaliq visible

  // ── 7. Finale on landing ──
  await page.goto(`${BASE}/en`);
  await pause(3500);
  console.log("✓ Recording finished");
} catch (err) {
  console.error(`✗ Recording failed at step [${step}] (video still saved):`, err.message.split("\n")[0]);
} finally {
  const videoPath = await page.video()?.path();
  await ctx.close();
  await browser.close();
  const dest = `${OUT}/demo-take.webm`;
  if (videoPath && existsSync(videoPath)) {
    try { renameSync(videoPath, dest); console.log(`🎬 Video saved: ${dest}`); }
    catch { console.log(`🎬 Video saved: ${videoPath}`); }
  }
  console.log("\nNext steps:");
  try {
    const { execSync } = await import("node:child_process");
    execSync(`ffmpeg -y -i "${dest}" -c:v libx264 -pix_fmt yuv420p -crf 23 "${OUT}/demo.mp4"`, { stdio: "pipe", timeout: 300_000 });
    console.log(`✅ MP4 ready: ${OUT}/demo.mp4`);
  } catch {
    console.log(`(MP4 conversion skipped — webm at ${dest} uploads fine to YouTube/Drive)`);
  }
  console.log("1. Add your voice-over in CapCut/Clipchamp (free) over the video");
  console.log("2. Upload to YouTube (unlisted) or Google Drive -> submit the link");
}
