import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync } from "node:fs";
const password = () =>
  process.env.REKLAM_FIXTURE_PASSWORD ||
  readFileSync("/tmp/reklambiz-work/fixture-password", "utf8");
async function login(
  page: import("@playwright/test").Page,
  role: string,
  path: string,
) {
  await page.goto(path);
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill(`${role}@reklam.test`);
  await page.getByLabel("Password", { exact: true }).fill(password());
  await page
    .locator("form")
    .getByRole("button", { name: "Sign in", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Sign in", exact: true }),
  ).toHaveCount(0);
}
test("public pages have correct language, metadata and usable mobile layouts", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const lang of ["az", "en", "ru"]) {
    await page.goto(lang === "az" ? "/" : `/${lang}`);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute(
      "href",
      `${process.env.TEST_BASE_URL || "http://localhost:3059"}${lang === "az" ? "" : `/${lang}`}`,
    );
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBeTruthy();
      await page.screenshot({
        path: `test-results/home-${lang}-${width}.png`,
        fullPage: true,
      });
    }
  }
  await page.goto("/en");
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole("button", { name: "Text ad", exact: true }).click();
  await expect(
    page.getByText("Advertise your business online.", { exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("advertiser creates, reloads and edits a text campaign", async ({
  page,
}) => {
  await login(page, "advertiser", "/en/advertiser/campaigns/create");
  await page
    .getByLabel("Name", { exact: true })
    .fill("Browser verified campaign");
  await page
    .getByLabel("Destination URL", { exact: true })
    .fill("https://example.com/product");
  await page.getByLabel("Headline", { exact: true }).fill("A useful headline");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A clear offer for the visitor.");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", { name: "Submit for review", exact: true })
    .click();
  await expect(page).toHaveURL(/\/en\/advertiser\/campaigns$/);
  await expect(
    page
      .getByRole("heading", { name: "Browser verified campaign", exact: true })
      .first(),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("article")
    .filter({
      has: page.getByRole("heading", {
        name: "Browser verified campaign",
        exact: true,
      }),
    })
    .first()
    .getByRole("link", { name: "Edit", exact: true })
    .click();
  await expect(page.getByLabel("Headline", { exact: true })).toHaveValue(
    "A useful headline",
  );
  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/editor-mobile.png",
    fullPage: true,
  });
  await page
    .getByLabel("Headline", { exact: true })
    .fill("An updated headline");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page).toHaveURL(/\/campaigns$/);
});
test("publisher creates placement and reads installation code", async ({
  page,
}) => {
  await login(page, "publisher", "/en/publisher/ad-units/create");
  await page
    .getByLabel("Name", { exact: true })
    .fill("Browser verified placement");
  await page
    .getByRole("combobox", { name: "Format", exact: true })
    .selectOption("text");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  const record = page
    .getByRole("article")
    .filter({
      has: page.getByRole("heading", {
        name: "Browser verified placement",
        exact: true,
      }),
    })
    .first();
  await record
    .getByRole("button", { name: "Installation code", exact: true })
    .click();
  await expect(record.locator("pre")).toContainText(
    "http://127.0.0.1:8059/serve.js",
  );
  await page.setViewportSize({ width: 390, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/publisher-mobile.png",
    fullPage: true,
  });
});
test("admin queues work and non-admin access is blocked", async ({ page }) => {
  await login(page, "advertiser", "/en/admin");
  await expect(
    page.getByText("You do not have access to this page."),
  ).toBeVisible();
  await page.evaluate(() => localStorage.clear());
  await login(page, "admin", "/en/admin/ads");
  await expect(page.getByRole("article").first()).toBeVisible();
  const record = page.getByRole("article").first();
  await record
    .getByLabel("Review reason", { exact: true })
    .fill("Update the destination before approval.");
  await record
    .getByRole("button", { name: "Request changes", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Changes needed", exact: true })
    .click();
  await expect(
    page.getByText("Update the destination before approval.").first(),
  ).toBeVisible();
});
test("independent publisher embeds initialize once and remain usable", async ({
  page,
}) => {
  const responses: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/track/impression")) responses.push(r.url());
  });
  await page.goto("http://127.0.0.1:8060/embed.html");
  await expect(page.locator("[data-reklam-status=rendered]")).toHaveCount(2);
  await expect(page.locator("[data-reklam] > div")).toHaveCount(2);
  await expect.poll(() => responses.length).toBe(2);
  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  await page.screenshot({
    path: "test-results/embed-mobile.png",
    fullPage: true,
  });
});
test("public secondary pages and dark theme pass accessibility checks", async ({
  page,
}) => {
  for (const route of [
    "/en/for-advertisers",
    "/en/for-publishers",
    "/en/ad-formats",
    "/ru/help",
    "/ru/privacy",
    "/ru/terms",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main")).not.toContainText("MISSING_MESSAGE");
    await page.setViewportSize({ width: 390, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.goto("/en");
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({ path: "test-results/home-dark.png", fullPage: true });
});

test("support requests are saved and administrator replies reach the requester", async ({
  page,
  browser,
}) => {
  const subject = `Placement help ${Date.now()}`;
  await login(page, "advertiser", "/en/settings/support");
  await page.getByLabel("Subject", { exact: true }).fill(subject);
  await page
    .getByLabel("Message", { exact: true })
    .fill("Please explain where to check the placement installation status.");
  await page.getByRole("button", { name: "Send request", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: new RegExp(subject) }),
  ).toBeVisible();
  const admin = await browser.newPage();
  await login(admin, "admin", "http://localhost:3059/en/admin/support");
  const ticket = admin.locator("article").filter({ hasText: subject });
  await ticket
    .getByLabel("Reply from support", { exact: true })
    .fill("Open your placements list to see the last installation request.");
  await ticket.getByRole("button", { name: "Save reply", exact: true }).click();
  await expect(ticket).toHaveCount(0);
  await page.reload();
  await expect(
    page
      .locator("article")
      .filter({ hasText: subject })
      .getByText(
        "Open your placements list to see the last installation request.",
        { exact: true },
      ),
  ).toBeVisible();
  await admin.close();
});
