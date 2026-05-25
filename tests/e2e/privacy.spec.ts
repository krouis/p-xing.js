import { test, expect } from "@playwright/test";

test.describe("privacy", () => {
  test("no cookies are set on load or after interaction", async ({
    page,
    context,
  }) => {
    await page.goto(".");
    expect(await context.cookies(), "no cookies on load").toHaveLength(0);

    await page.locator('.cell[data-x="2"][data-y="0"]').click();
    expect(
      await context.cookies(),
      "no cookies after interaction",
    ).toHaveLength(0);
  });

  test("no external network requests are made", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (!url.startsWith("http://localhost") && !url.startsWith("data:")) {
        external.push(url);
      }
    });

    await page.goto(".");
    await page.locator('.cell[data-x="2"][data-y="0"]').click();

    expect(
      external,
      `unexpected external requests: ${external.join(", ")}`,
    ).toHaveLength(0);
  });

  test("localStorage only uses p-xing namespaced keys", async ({ page }) => {
    await page.goto(".");
    await page.locator('.cell[data-x="2"][data-y="0"]').click();

    const keys: string[] = await page.evaluate(() => Object.keys(localStorage));
    for (const key of keys) {
      expect(key, `unexpected localStorage key: "${key}"`).toMatch(/^p-xing\./);
    }
  });

  test("no third-party scripts are injected into the page", async ({
    page,
  }) => {
    await page.goto(".");
    const external: string[] = await page.evaluate(() =>
      Array.from(document.querySelectorAll<HTMLScriptElement>("script[src]"))
        .map((s) => s.src)
        .filter((src) => !src.startsWith("http://localhost")),
    );
    expect(
      external,
      `unexpected external scripts: ${external.join(", ")}`,
    ).toHaveLength(0);
  });
});
