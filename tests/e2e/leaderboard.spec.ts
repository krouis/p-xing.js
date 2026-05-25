import { test, expect } from "@playwright/test";

// Tiny Rocket filled pixels (x, y)
const SOLUTION: [number, number][] = [
  [2, 0],
  [1, 1],
  [2, 1],
  [3, 1],
  [2, 2],
  [1, 3],
  [2, 3],
  [3, 3],
  [0, 4],
  [2, 4],
  [4, 4],
];

async function solvePuzzle(
  page: import("@playwright/test").Page,
): Promise<void> {
  for (const [x, y] of SOLUTION) {
    await page.locator(`.cell[data-x="${x}"][data-y="${y}"]`).click();
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});

test("result dialog appears after solving the puzzle", async ({ page }) => {
  await solvePuzzle(page);
  await expect(page.locator("#dialog-result")).toBeVisible();
  await expect(page.locator(".result-score-value")).toBeVisible();
});

test("result dialog shows time, mistakes, and hints", async ({ page }) => {
  await solvePuzzle(page);
  await expect(page.locator(".result-stat-label").nth(0)).toContainText("time");
  await expect(page.locator(".result-stat-label").nth(1)).toContainText(
    "mistakes",
  );
  await expect(page.locator(".result-stat-label").nth(2)).toContainText(
    "hints",
  );
});

test("initials input accepts exactly 3 alphanumeric characters", async ({
  page,
}) => {
  await solvePuzzle(page);
  const input = page.locator(".result-initials-input");
  await input.fill("ABC");
  await expect(input).toHaveValue("ABC");
});

test("lowercase initials are auto-converted to uppercase", async ({ page }) => {
  await solvePuzzle(page);
  const input = page.locator(".result-initials-input");
  await input.fill("abc");
  await expect(input).toHaveValue("ABC");
});

test("invalid characters are stripped from initials", async ({ page }) => {
  await solvePuzzle(page);
  const input = page.locator(".result-initials-input");
  await input.fill("A!B");
  await expect(input).toHaveValue("AB");
});

test("saving score updates the leaderboard", async ({ page }) => {
  await solvePuzzle(page);
  const input = page.locator(".result-initials-input");
  await input.fill("TST");
  await page.locator(".result-submit-btn").click();
  await expect(page.locator(".result-submit-btn")).toHaveText("Saved!");
  await expect(page.locator(".leaderboard-table")).toContainText("TST");
});

test("play again restarts the puzzle", async ({ page }) => {
  await solvePuzzle(page);
  await page.locator(".result-play-again-btn").click();
  await expect(page.locator("#dialog-result")).not.toBeVisible();
  await expect(page.locator(".toolbar-timer")).toHaveText("0:00");
  await expect(page.locator('.cell[data-x="2"][data-y="0"]')).toHaveAttribute(
    "data-state",
    "unknown",
  );
});
