import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});

test("puzzle grid is visible on load", async ({ page }) => {
  await expect(page.locator(".board-cells")).toBeVisible();
});

test("help dialog is not open on load", async ({ page }) => {
  await expect(page.locator("#dialog-help")).not.toBeVisible();
});

test("timer shows idle state before first move", async ({ page }) => {
  await expect(page.locator(".toolbar-timer")).toHaveText("0:00");
  await expect(page.locator(".toolbar-timer")).not.toHaveClass(/running/);
});

test("first click on a correct cell fills it and starts timer", async ({
  page,
}) => {
  const cell = page.locator('.cell[data-x="2"][data-y="0"]');
  await cell.click();
  await expect(cell).toHaveAttribute("data-state", "filled");
  await expect(page.locator(".toolbar-timer")).toHaveClass(/running/);
});

test("first click on a wrong cell triggers a mistake and starts timer", async ({
  page,
}) => {
  // (0,0) is an empty pixel in the Tiny Rocket solution
  const cell = page.locator('.cell[data-x="0"][data-y="0"]');
  await cell.click();
  // Pixel stays unknown after a mistake
  await expect(cell).toHaveAttribute("data-state", "unknown");
  // Timer still starts on first interaction
  await expect(page.locator(".toolbar-timer")).toHaveClass(/running/);
});

test("right-click crosses a cell", async ({ page }) => {
  const cell = page.locator('.cell[data-x="0"][data-y="0"]');
  await cell.click({ button: "right" });
  await expect(cell).toHaveAttribute("data-state", "crossed");
});

test("undo button reverts last move", async ({ page }) => {
  const cell = page.locator('.cell[data-x="2"][data-y="0"]');
  await cell.click();
  await expect(cell).toHaveAttribute("data-state", "filled");
  await page.locator("[data-action='undo']").click();
  await expect(cell).toHaveAttribute("data-state", "unknown");
});

test("restart button resets the board", async ({ page }) => {
  const cell = page.locator('.cell[data-x="2"][data-y="0"]');
  await cell.click();
  await expect(cell).toHaveAttribute("data-state", "filled");
  await page.locator("[data-action='restart']").click();
  await expect(cell).toHaveAttribute("data-state", "unknown");
  await expect(page.locator(".toolbar-timer")).toHaveText("0:00");
});
