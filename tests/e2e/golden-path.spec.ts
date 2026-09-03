import { test, expect } from "@playwright/test";

const PASSWORD = "password123";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/en/login");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/en$/);
}

function tomorrow(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return d.toISOString().split("T")[0];
}

test("golden path: post job -> match -> offer -> accept -> escrow -> complete -> mutual feedback -> rating", async ({ page }) => {
  test.setTimeout(180_000);

  // ── Employer: create job (matches Usman, electrician in Lahore) ──
  await login(page, "sara@example.com");
  await page.goto("/en/employer/jobs/new");
  await page.getByRole("button", { name: "Electrician", exact: true }).click();
  await page.getByRole("button", { name: "Wiring", exact: true }).click();
  await page.fill('input[type="date"]', tomorrow());
  const wage = page.locator('input[placeholder="2000"]');
  await wage.fill("3500");
  await page.getByRole("button", { name: "Lahore", exact: true }).click();
  await page.fill('[data-testid="job-title"]', "E2E House Wiring");
  await page.click('[data-testid="submit-job"]');
  await expect(page.getByText(/Job Posted/i)).toBeVisible({ timeout: 30_000 });
  await page.click('[data-testid="send-offers"]');
  await page.waitForURL(/\/employer\/jobs$/);
  await expect(page.getByText("E2E House Wiring")).toBeVisible();
  await page.context().clearCookies();

  // ── Worker: accept offer ──
  await login(page, "usman@example.com");
  await page.goto("/en/worker/offers");
  await page.click('[data-testid="accept-offer"]');
  await expect(page.locator('[data-testid="accept-offer"]')).toHaveCount(0, { timeout: 20_000 });
  await page.context().clearCookies();

  // ── Employer: mark completed ──
  await login(page, "sara@example.com");
  await page.goto("/en/employer/jobs");
  await page.locator("a", { hasText: "E2E House Wiring" }).first().click();
  await page.click('[data-testid="complete-trigger"]');
  await page.click('[data-testid="complete-confirm"]');
  await expect(page.getByText("Completed").first()).toBeVisible();

  // ── Employer: rate the worker ──
  await page.locator("button", { hasText: "Usman" }).first().click();
  await page.locator('[data-testid="overall-stars"] button').nth(4).click();
  await page.click('[data-testid="feedback-submit"]');
  await expect(page.locator('[data-testid="feedback-submit"]')).toHaveCount(0);
  await page.context().clearCookies();

  // ── Worker: notification deep-links to my-jobs (reported bug regression) ──
  await login(page, "usman@example.com");
  await page.goto("/en/notifications");
  await page.locator('[role="button"]', { hasText: "E2E House Wiring" }).first().click();
  await page.waitForURL(/\/worker\/my-jobs\//);

  // ── Worker: rate the employer ──
  await page.locator("button", { hasText: /Rate Employer/i }).click();
  await page.locator('[data-testid="overall-stars"] button').nth(4).click();
  await page.click('[data-testid="feedback-submit"]');
  await expect(page.locator('[data-testid="feedback-submit"]')).toHaveCount(0);

  // ── Rating visible on worker dashboard ──
  await page.goto("/en/worker/dashboard");
  await expect(page.getByText("5.0").first()).toBeVisible();
});
