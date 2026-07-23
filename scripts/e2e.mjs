/**
 * End-to-end smoke suite. Crawls every page type for runtime/console/HTTP
 * errors and exercises the core flows (planner, newsletter, mobile nav).
 *
 *   npm run build && npm run start &        # serve the production build
 *   BASE_URL=http://localhost:3000 npm run test:e2e
 *
 * PW_EXECUTABLE can point at a Chromium binary (used in the dev sandbox);
 * in CI, `npx playwright install chromium` lets Playwright find its own.
 */
import { chromium } from "playwright";

const BASE = (process.env.BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const EXE = process.env.PW_EXECUTABLE || undefined;

// External-image and sandbox-network noise is not a product bug.
const IGNORE =
  /scdn|spotifycdn|googleusercontent|ytimg|open\.spotify\.com|net::ERR|Failed to load resource/i;

const PATHS = [
  "/",
  "/directory",
  "/directory?q=drink",
  "/podcast/drink-champs",
  "/podcast/earn-your-leisure",
  "/plan",
  "/charts",
  "/charts/youtube-subscribers",
  "/charts/combined-reach",
  "/plays",
  "/plays/500-barbershop-play",
  "/claim",
  "/claim?q=drink",
  "/legal/privacy",
  "/legal/terms",
  "/legal/ranking",
  "/legal/data-and-corrections",
];

const failures = [];
const ok = (label) => console.log(`  ✓ ${label}`);
const fail = (label, detail) => {
  console.error(`  ✗ ${label}: ${detail}`);
  failures.push(label);
};

const browser = await chromium.launch({
  executablePath: EXE,
  args: ["--no-sandbox"],
});

// 1) Crawl every page type for errors.
for (const path of PATHS) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error" && !IGNORE.test(m.text())) errors.push(m.text());
  });
  page.on("pageerror", (e) => {
    if (!IGNORE.test(e.message)) errors.push(e.message);
  });
  page.on("response", (r) => {
    if (r.status() >= 500 && r.url().startsWith(BASE))
      errors.push(`HTTP ${r.status()} ${r.url()}`);
  });
  try {
    const resp = await page.goto(BASE + path, {
      waitUntil: "networkidle",
      timeout: 20000,
    });
    if (!resp || resp.status() >= 400) errors.push(`status ${resp?.status()}`);
  } catch (e) {
    errors.push(`goto: ${e.message}`);
  }
  if (errors.length) fail(path, errors.join(" | "));
  else ok(path);
  await page.close();
}

// 2) Unknown podcast 404s (correct not-found behavior).
{
  const page = await browser.newPage();
  const resp = await page.goto(`${BASE}/podcast/does-not-exist`, {
    waitUntil: "domcontentloaded",
  });
  resp?.status() === 404
    ? ok("unknown podcast returns 404")
    : fail("unknown podcast returns 404", `got ${resp?.status()}`);
  await page.close();
}

// 3) Planner wizard: goal → budget → audience → details → results.
{
  const page = await browser.newPage();
  await page.goto(`${BASE}/plan`, { waitUntil: "networkidle" });
  await page.click('button[data-goal="product_launch"]');
  await page.fill("input[name=budget]", "3000");
  await page.click('button:has-text("Continue")');
  await page.fill("input[name=audience]", "entrepreneurs, investing");
  await page.click('button:has-text("Continue")');
  await page.click("button[type=submit]");
  await page.waitForSelector('a[href^="/podcast/"]', { timeout: 15000 });
  const results = (await page.$$('a[href^="/podcast/"]')).length;
  results > 0
    ? ok(`planner wizard returns results (${results})`)
    : fail("planner wizard", "0 results");
  await page.close();
}

// 3b) Deep link (from a Play / homepage) auto-builds the plan.
{
  const page = await browser.newPage();
  await page.goto(
    `${BASE}/plan?goal=music_release&budget=1500&audience=hip-hop`,
    { waitUntil: "networkidle" },
  );
  await page.waitForSelector('a[href^="/podcast/"]', { timeout: 15000 });
  const results = (await page.$$('a[href^="/podcast/"]')).length;
  results > 0
    ? ok(`planner deep-link auto-builds (${results})`)
    : fail("planner deep-link", "0 results");
  await page.close();
}

// 4) Newsletter signup reaches pending state.
{
  const page = await browser.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.fill("input[type=email]", "e2e@example.com");
  await page.click('button:has-text("Keep Me in the Loop")');
  await page.waitForTimeout(1500);
  const text = await page.textContent("body");
  /confirm/i.test(text ?? "")
    ? ok("newsletter signup → confirm message")
    : fail("newsletter signup", "no confirmation message");
  await page.close();
}

// 5) Mobile nav opens and shows all links.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 720 } });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await page.click('button[aria-label="Open menu"]');
  await page.waitForSelector("#mobile-menu");
  const links = (await page.$$("#mobile-menu a")).length;
  links >= 5
    ? ok(`mobile nav shows ${links} links`)
    : fail("mobile nav", `only ${links} links`);
  await page.close();
}

await browser.close();

if (failures.length) {
  console.error(`\nE2E FAILED: ${failures.length} problem(s).`);
  process.exit(1);
}
console.log(`\nE2E passed: ${PATHS.length} pages + 4 flows clean.`);
