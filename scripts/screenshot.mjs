import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

const OUT = "shots";
const BASE = "http://localhost:3000";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1360, height: 860 } });
const page = await ctx.newPage();

async function go(path, { theme = "light" } = {}) {
  await page.addInitScript(
    ([t]) => localStorage.setItem("rozgaar-theme", t),
    [theme]
  );
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
}

async function shot(name, { full = true } = {}) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  console.log("shot:", name);
}

async function login(email) {
  await page.goto(BASE + "/en/login", { waitUntil: "networkidle" });
  await page.fill("#email", email);
  await page.fill("#password", "password123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/en");
  await page.waitForTimeout(600);
}

// Public pages
await go("/en");
await shot("landing-light");
await go("/en", { theme: "dark" });
await shot("landing-dark");
await go("/en/login");
await shot("login-light");
await go("/en/login", { theme: "dark" });
await shot("login-dark");
await go("/en/register");
await shot("register-light");

// Worker pages
await login("usman@example.com");
await go("/en/worker/dashboard");
await shot("worker-dash-light");
await go("/en/worker/dashboard", { theme: "dark" });
await shot("worker-dash-dark");
await go("/en/worker/jobs");
await shot("worker-jobs-light");
await go("/en/worker/offers");
await shot("worker-offers-light");
await go("/en/worker/profile");
await shot("worker-profile-light");
await page.context().clearCookies();

// Employer pages
await login("sara@example.com");
await go("/en/employer/dashboard");
await shot("employer-dash-light");
await go("/en/employer/dashboard", { theme: "dark" });
await shot("employer-dash-dark");
await go("/en/employer/jobs/new");
await shot("employer-new-light");
await go("/en/notifications");
await shot("notifications-light");

// Mobile hero
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mpage = await mctx.newPage();
await mpage.goto(BASE + "/en", { waitUntil: "networkidle" });
await mpage.waitForTimeout(1000);
await mpage.screenshot({ path: `${OUT}/landing-mobile.png`, fullPage: true });
console.log("shot: landing-mobile");

await browser.close();
console.log("ALL-SHOTS-DONE");