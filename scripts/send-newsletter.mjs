/**
 * Emails the latest Play Sheet draft to the owner, ready to paste into
 * Substack. Runs in the weekly refresh right after generate-newsletter.mjs.
 *
 * Key-gated like everything else: skips cleanly until the secrets exist.
 *
 * Env (GitHub Actions secrets):
 *   RESEND_API_KEY  — from resend.com
 *   RTP_OWNER_EMAIL — where the draft goes
 *   RTP_EMAIL_FROM  — optional sender, defaults to Resend onboarding
 *   DRY_RUN=1       — write the HTML next to the draft instead of sending
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const NAVY = "#0b1021";
const SKY = "#0ea5e9";
const ORANGE = "#f97316";

const dir = join(root, "content/newsletter");
const latest = readdirSync(dir).filter((f) => f.endsWith(".md")).sort().pop();
if (!latest) {
  console.log("No newsletter drafts found. Skipping.");
  process.exit(0);
}
const md = readFileSync(join(dir, latest), "utf8");

/* Minimal markdown to email HTML. Escape first, then inline marks. */
const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) =>
  esc(s)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" style="color:${SKY};font-weight:700;">$1</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");

let title = "The Play Sheet";
const parts = [];
for (const line of md.split("\n")) {
  const t = line.trim();
  if (!t) continue;
  if (t.startsWith("# ")) {
    title = t.slice(2);
  } else if (t.startsWith("## ")) {
    parts.push(
      `<h2 style="margin:28px 0 10px;font-size:17px;color:${NAVY};font-weight:900;letter-spacing:-0.02em;">${inline(t.slice(3))}</h2>`,
    );
  } else if (t === "---") {
    parts.push(`<hr style="border:none;border-top:1px solid #e0f2fe;margin:24px 0;">`);
  } else if (/^\d+\.\s/.test(t)) {
    parts.push(
      `<p style="margin:4px 0;color:#334155;font-size:15px;line-height:1.6;">${inline(t)}</p>`,
    );
  } else {
    parts.push(
      `<p style="margin:10px 0;color:#475569;font-size:15px;line-height:1.65;">${inline(t)}</p>`,
    );
  }
}

const html = `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Inter,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
<div style="max-width:640px;margin:0 auto;padding:32px 20px;">
  <p style="font-weight:900;letter-spacing:-0.02em;color:${NAVY};font-size:18px;margin:0 0 8px;">RUN THE PLAY<span style="color:${ORANGE};">.</span></p>
  <p style="margin:0 0 20px;color:#64748b;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;">This Week's Play Sheet Draft. Paste It Into Substack and Publish.</p>
  <div style="background:#ffffff;border:1px solid #e0f2fe;border-radius:24px;padding:36px;">
    <h1 style="margin:0 0 6px;font-size:24px;line-height:1.2;color:${NAVY};font-weight:900;">${esc(title)}</h1>
    ${parts.join("\n")}
  </div>
  <p style="color:#94a3b8;font-size:12px;margin:20px 4px 0;">The raw markdown lives in the repo at content/newsletter/${latest}. Every number above is public data with a named source.</p>
</div></body></html>`;

if (process.env.DRY_RUN) {
  const out = join(dir, latest.replace(/\.md$/, ".html"));
  writeFileSync(out, html);
  console.log(`DRY_RUN: wrote ${out}`);
  process.exit(0);
}

const key = process.env.RESEND_API_KEY;
const to = process.env.RTP_OWNER_EMAIL;
if (!key || !to) {
  console.log("RESEND_API_KEY or RTP_OWNER_EMAIL not set. Skipping send.");
  process.exit(0);
}
const from = process.env.RTP_EMAIL_FROM ?? "Run the Play <onboarding@resend.dev>";
const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
  body: JSON.stringify({ from, to: [to], subject: `${title} (draft, ready to paste)`, html }),
});
if (!res.ok) {
  console.error(`Resend responded ${res.status}: ${await res.text()}`);
  process.exit(1);
}
console.log(`Emailed ${latest} to the owner.`);
