import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});

test("help dialog is closed by default", async ({ page }) => {
  await expect(page.locator("#dialog-help")).not.toBeVisible();
});

test("clicking Help opens the dialog", async ({ page }) => {
  await page.locator("[data-action='help']").click();
  await expect(page.locator("#dialog-help")).toBeVisible();
});

test("help content uses the term 'pixel crossing'", async ({ page }) => {
  await page.locator("[data-action='help']").click();
  await expect(page.locator(".help-content")).toContainText("pixel crossing");
});

test("help content explains desktop controls", async ({ page }) => {
  await page.locator("[data-action='help']").click();
  const content = page.locator(".help-content");
  await expect(content).toContainText("left click");
  await expect(content).toContainText("right click");
  await expect(content).toContainText("Ctrl");
});

test("help content explains mobile controls", async ({ page }) => {
  await page.locator("[data-action='help']").click();
  const content = page.locator(".help-content");
  await expect(content).toContainText("touch");
  await expect(content).toContainText("long press");
});

test("close button dismisses the dialog", async ({ page }) => {
  await page.locator("[data-action='help']").click();
  await expect(page.locator("#dialog-help")).toBeVisible();
  await page.locator("#dialog-help .dialog-close").click();
  await expect(page.locator("#dialog-help")).not.toBeVisible();
});

test("Escape key closes the dialog", async ({ page }) => {
  await page.locator("[data-action='help']").click();
  await expect(page.locator("#dialog-help")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#dialog-help")).not.toBeVisible();
});

test("game board remains visible after closing help", async ({ page }) => {
  await page.locator("[data-action='help']").click();
  await page.locator("#dialog-help .dialog-close").click();
  await expect(page.locator(".board-cells")).toBeVisible();
});

test("? key toggles the help dialog", async ({ page }) => {
  await expect(page.locator("#dialog-help")).not.toBeVisible();
  await page.keyboard.press("?");
  await expect(page.locator("#dialog-help")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#dialog-help")).not.toBeVisible();
});
