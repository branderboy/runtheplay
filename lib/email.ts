import "server-only";

/**
 * Email delivery via Resend's REST API. Key-gated: every send is a silent
 * no-op until RESEND_API_KEY is set, so the whole flow ships before the key
 * exists and activates the moment it does.
 *
 * Env:
 *   RESEND_API_KEY  — from resend.com (domain must be verified there)
 *   RTP_EMAIL_FROM  — sender, e.g. "Run the Play <hello@runtheplay.com>"
 *   RTP_OWNER_EMAIL — where listing-request notifications go
 */

const BRAND_NAVY = "#0b1021";
const BRAND_SKY = "#0ea5e9";
const BRAND_ORANGE = "#f97316";

export function emailEnabled(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from =
    process.env.RTP_EMAIL_FROM ?? "Run the Play <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/* ------------------------------- templates --------------------------------- */
/* Brand-locked, table-free minimal HTML: white ground, navy ink, sky/orange
   buttons, Title Case headings, short sentences, no em-dashes. */

function shell(title: string, bodyHtml: string, cta?: { label: string; url: string; orange?: boolean }) {
  const button = cta
    ? `<a href="${cta.url}" style="display:inline-block;margin-top:24px;padding:14px 32px;border-radius:999px;background:${cta.orange ? BRAND_ORANGE : BRAND_SKY};color:#ffffff;font-weight:800;text-decoration:none;letter-spacing:0.08em;text-transform:uppercase;font-size:12px;">${cta.label}</a>`
    : "";
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Inter,-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <p style="font-weight:900;letter-spacing:-0.02em;color:${BRAND_NAVY};font-size:18px;margin:0 0 24px;">RUN THE PLAY<span style="color:${BRAND_ORANGE};">.</span></p>
    <div style="background:#ffffff;border:1px solid #e0f2fe;border-radius:24px;padding:32px;">
      <h1 style="margin:0 0 16px;font-size:22px;line-height:1.2;color:${BRAND_NAVY};font-weight:900;">${title}</h1>
      <div style="color:#475569;font-size:15px;line-height:1.6;">${bodyHtml}</div>
      ${button}
    </div>
    <p style="color:#94a3b8;font-size:12px;margin:20px 4px 0;">Advertising Made Simple for the Culture. You received this because of an action on runtheplay. Reply to this email for help.</p>
  </div></body></html>`;
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const templates = {
  inquiry: (show: string, fromEmail: string, message: string) =>
    shell(
      `New Advertising Inquiry for ${esc(show)}`,
      `<p>A buyer on Run the Play wants to talk about advertising on ${esc(show)}.</p>
       <p><strong>From:</strong> ${esc(fromEmail)}</p>
       <p style="border-left:3px solid ${BRAND_SKY};padding-left:12px;">${esc(message)}</p>
       <p>Reply directly to the buyer's email above. Run the Play does not broker the deal or take a cut.</p>`,
    ),

  claimVerified: (show: string, studioUrl: string) =>
    shell(
      `${esc(show)} Is Verified`,
      `<p>Your email matched the business contact on file. Your profile is claimed.</p>
       <p>Your Creator Studio is your dashboard: publish your thumbnail, details, and real ad inventory with your rates.</p>`,
      { label: "Open Creator Studio", url: studioUrl, orange: true },
    ),

  planSaved: (count: number, planUrl: string) =>
    shell(
      "Your Plan Is Saved",
      `<p>Your media mix with ${count} ${count === 1 ? "show" : "shows"} has a permanent home. Open it anytime to edit, add suggestions, and contact shows.</p>`,
      { label: "Open My Plan", url: planUrl },
    ),

  listingReceived: (show: string, studioUrl: string) =>
    shell(
      "Your Show Is in Review",
      `<p>We received ${esc(show)}. Every show is reviewed against our scope: Black creators, culture first, no politics.</p>
       <p>Meanwhile your Creator Studio is open. Add your thumbnail, details, and inventory so your profile is ready the moment it goes live.</p>`,
      { label: "Open Creator Studio", url: studioUrl, orange: true },
    ),

  listingNotifyOwner: (show: string, email: string, url: string | null) =>
    shell(
      `New Listing Request: ${esc(show)}`,
      `<p><strong>Show:</strong> ${esc(show)}</p>
       <p><strong>Contact:</strong> ${esc(email)}</p>
       ${url ? `<p><strong>Link:</strong> <a href="${esc(url)}" style="color:${BRAND_SKY};">${esc(url)}</a></p>` : ""}
       <p>Review against scope, then add it to data/seed/podcasts_seed.csv.</p>`,
    ),

  confirmSubscription: (confirmUrl: string) =>
    shell(
      "Confirm Your Subscription",
      `<p>One tap and you're in The Loop: new media opportunities, weekly independent charts, and budget-based campaign ideas.</p>
       <p>If you didn't sign up, ignore this email and nothing happens.</p>`,
      { label: "Confirm Subscription", url: confirmUrl },
    ),
};
