import { test, expect } from "@playwright/test";

// Force dark system color scheme so the initial resolved theme is dark and
// the first Theme click produces a measurable change (dark → light).
test.use({ colorScheme: "dark" });

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});

test("initial data-theme reflects system preference", async ({ page }) => {
  // With colorScheme:'dark', resolveTheme('system') → 'dark'
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("Theme button toggles between dark and light", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.locator("[data-action='theme']").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("theme preference persists after page reload", async ({ page }) => {
  // Switch from dark to light
  await page.locator("[data-action='theme']").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.reload();

  // After reload, saved preference 'light' overrides system 'dark'
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("toggling twice returns to original theme", async ({ page }) => {
  await page.locator("[data-action='theme']").click(); // dark → light
  await page.locator("[data-action='theme']").click(); // light → dark
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
