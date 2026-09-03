import { test, expect } from "@playwright/test";

const PASSWORD = "password123";

async function login(page: import("@playwright/test").Page, email: string) {
  await page.goto("/en/login");
  await page.fill("#email", email);
  await page.fill("#password", PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/en$/);
}

test("regression: JOB_COMPLETED notification deep-links worker to my-jobs (not employer page)", async ({ page }) => {
  await login(page, "naveed@example.com");
  await page.goto("/en/notifications");
  const notif = page
    .locator('[role="button"]', { hasText: "Job Completed" })
    .first();
  await expect(notif).toBeVisible();
  await notif.click();
  await page.waitForURL(/\/worker\/my-jobs\//);
  await expect(page.getByText(/Custom wardrobe carpentry/i)).toBeVisible();
});

test("regression: wage field cleanly overwrites on select-all + type", async ({ page }) => {
  await login(page, "sara@example.com");
  await page.goto("/en/employer/jobs/new");
  const wage = page.locator('input[placeholder="2000"]');
  await wage.fill("3000");
  await wage.press("ControlOrMeta+a");
  await wage.pressSequentially("5000");
  await expect(wage).toHaveValue("5000");
});

test("regression: employer cancels an open job and sees the refund confirmation", async ({ page }) => {
  await login(page, "sara@example.com");
  await page.goto("/en/employer/jobs");
  await page.locator("a", { hasText: "Garden boundary wall masonry" }).first().click();
  await page.getByRole("button", { name: "Cancel Job" }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText(/Job cancelled|refunded/i).first()).toBeVisible();
});
