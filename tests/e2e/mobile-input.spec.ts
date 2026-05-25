import { test, expect, type Page } from "@playwright/test";

// Dispatch a touch PointerEvent at the centre of a locator's bounding box.
async function touchAt(
  page: Page,
  selector: string,
  type: "pointerdown" | "pointerup" | "pointermove",
): Promise<void> {
  const box = await page.locator(selector).boundingBox();
  if (!box) throw new Error(`Element not found: ${selector}`);
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.evaluate(
    ([sel, evType, x, y]) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.dispatchEvent(
        new PointerEvent(evType, {
          bubbles: true,
          cancelable: true,
          pointerType: "touch",
          pointerId: 1,
          clientX: x,
          clientY: y,
          isPrimary: true,
        }),
      );
    },
    [selector, type, cx, cy] as [string, string, number, number],
  );
}

async function longPress(page: Page, selector: string): Promise<void> {
  await touchAt(page, selector, "pointerdown");
  await page.waitForTimeout(600); // beyond 500ms threshold
  await touchAt(page, selector, "pointerup");
}

test.beforeEach(async ({ page }) => {
  await page.goto(".");
});

test("tap on a cell fills it", async ({ page }) => {
  // (2,0) is a filled pixel in the solution — tap fills it
  await touchAt(page, '.cell[data-x="2"][data-y="0"]', "pointerdown");
  await touchAt(page, '.cell[data-x="2"][data-y="0"]', "pointerup");
  await expect(page.locator('.cell[data-x="2"][data-y="0"]')).toHaveAttribute(
    "data-state",
    "filled",
  );
});

test("long press on a cell crosses it", async ({ page }) => {
  // (0,0) is an empty pixel — long press crosses it
  await longPress(page, '.cell[data-x="0"][data-y="0"]');
  await expect(page.locator('.cell[data-x="0"][data-y="0"]')).toHaveAttribute(
    "data-state",
    "crossed",
  );
});

test("context menu is suppressed on the board", async ({ page }) => {
  const prevented = await page.evaluate(() => {
    const el = document.querySelector(".board-cells");
    if (!el) return false;
    const e = new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
    });
    el.dispatchEvent(e);
    return e.defaultPrevented;
  });
  expect(prevented).toBe(true);
});

test("page does not scroll when interacting with the board", async ({
  page,
}) => {
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await touchAt(page, '.cell[data-x="2"][data-y="0"]', "pointerdown");
  await touchAt(page, '.cell[data-x="2"][data-y="2"]', "pointermove");
  await touchAt(page, '.cell[data-x="2"][data-y="2"]', "pointerup");
  const scrollAfter = await page.evaluate(() => window.scrollY);
  expect(scrollAfter).toBe(scrollBefore);
});
