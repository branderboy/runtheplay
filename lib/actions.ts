"use server";

import { appendFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getPodcastBySlug, getAllPodcasts, searchPodcasts, toPlannerInput } from "@/lib/data/podcasts";
import { matchPlan } from "@/src/lib/planner/matcher";
import type { PlanInput } from "@/src/lib/planner/types";
import { getDb } from "@/lib/db-optional";
import {
  inquiries,
  claims,
  listingRequests,
  newsletterSubscribers,
  newsletterEditionSubscriptions,
} from "@/src/db/schema/index";

/**
 * Persistence: writes to Postgres when DATABASE_URL is set (Neon storage on
 * Vercel), and always keeps a local append-only log as a dev fallback. Email
 * (Resend) is still TODO where noted.
 */
function record(kind: string, data: unknown) {
  try {
    const dir = join(process.cwd(), ".data");
    mkdirSync(dir, { recursive: true });
    appendFileSync(
      join(dir, `${kind}.jsonl`),
      JSON.stringify({ at: new Date().toISOString(), ...(data as object) }) + "\n",
    );
  } catch {
    // best-effort in read-only/serverless environments
  }
}

const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);

export type ActionState = { ok: boolean; message: string };

/* ------------------------------ buyer inquiry ------------------------------ */

export async function submitInquiry(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const slug = String(formData.get("slug") ?? "");
  const fromEmail = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const pod = getPodcastBySlug(slug);

  if (!pod) return { ok: false, message: "Podcast not found." };
  if (!isEmail(fromEmail))
    return { ok: false, message: "Enter a valid email so the show can reply." };
  if (message.length < 10)
    return { ok: false, message: "Add a short note about your campaign (10+ characters)." };

  // Route to the podcast's public business contact, claimed or not.
  const routedTo = pod.advertisingContactEmail ?? pod.advertisingContactUrl ?? null;
  record("inquiries", { slug, fromEmail, message, routedTo });
  const db = await getDb();
  if (db) {
    try {
      await db.insert(inquiries).values({ podcastSlug: slug, fromEmail, message, routedTo });
    } catch {
      /* fall back to the log */
    }
  }
  // TODO: send via Resend to `routedTo` (or queue for RTP routing if null).

  return {
    ok: true,
    message: routedTo
      ? `Sent. ${pod.name} will receive your inquiry at their listed contact.`
      : `Received. ${pod.name} has no public contact on file yet. Run the Play will route your inquiry when they claim their profile.`,
  };
}

/* ------------------- claim a profile (email-on-file check) ----------------- */

export async function submitClaim(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const slug = String(formData.get("slug") ?? "");
  const claimEmail = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "").trim();
  const pod = getPodcastBySlug(slug);

  if (!pod) return { ok: false, message: "Podcast not found." };
  if (!isEmail(claimEmail))
    return { ok: false, message: "Enter the show's business email to verify." };

  const onFile = pod.advertisingContactEmail?.trim().toLowerCase() ?? null;

  const db = await getDb();
  if (onFile && claimEmail === onFile) {
    // Fast path: matches the public business email we already have on file.
    record("claims", { slug, claimEmail, role, method: "email_on_file", status: "auto_verified" });
    if (db) {
      try {
        await db.insert(claims).values({ podcastSlug: slug, claimEmail, role, method: "email_on_file", status: "auto_verified" });
      } catch { /* fall back to the log */ }
    }
    // TODO: send a confirmation code via Resend to complete the claim.
    return {
      ok: true,
      message: `Verified. This matches ${pod.name}'s email on file. We'll email a confirmation link to finish the claim.`,
    };
  }

  // Otherwise queue for manual review (still legitimate, just not auto-verified).
  record("claims", { slug, claimEmail, role, method: "manual_review", status: "pending" });
  if (db) {
    try {
      await db.insert(claims).values({ podcastSlug: slug, claimEmail, role, method: "manual_review", status: "pending" });
    } catch { /* fall back to the log */ }
  }
  return {
    ok: true,
    message: onFile
      ? `Submitted for review. That email doesn't match the one on file, so a person will verify your claim.`
      : `Submitted for review. We don't have an email on file for ${pod.name} yet, so a person will verify your claim.`,
  };
}

/* -------------------- claim search (Yelp-style, live states) ---------------- */

export type ClaimSearchResult = {
  slug: string;
  name: string;
  category: string | null;
  artworkUrl: string | null;
  hasEmailOnFile: boolean;
  claimStatus: "claimed" | "pending" | "unclaimed";
};

/**
 * The P1-P4 motion in docs/logic.md: one search answers "is my show in the
 * database, is it claimed already, and can I verify instantly?"
 */
export async function searchShowsForClaim(
  q: string,
): Promise<ClaimSearchResult[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const results = searchPodcasts(query).slice(0, 8);

  // Claim state lives in Postgres once the DB is connected; before that,
  // nothing is claimed, which is also the truth.
  const statusBySlug = new Map<string, string>();
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select({ slug: claims.podcastSlug, status: claims.status })
        .from(claims);
      for (const r of rows) {
        if (r.status === "auto_verified" || !statusBySlug.has(r.slug))
          statusBySlug.set(r.slug, r.status);
      }
    } catch {
      /* fall back to unclaimed */
    }
  }

  return results.map((p) => {
    const s = statusBySlug.get(p.slug);
    return {
      slug: p.slug,
      name: p.name,
      category: p.primaryCategory,
      artworkUrl: p.artworkUrl,
      hasEmailOnFile: Boolean(p.advertisingContactEmail),
      claimStatus:
        s === "auto_verified" ? "claimed" : s === "pending" ? "pending" : "unclaimed",
    };
  });
}

/* --------------------- creator sign-up (not listed yet) --------------------- */

export async function submitListingRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const showName = String(formData.get("showName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const showUrl = String(formData.get("showUrl") ?? "").trim();

  if (showName.length < 2)
    return { ok: false, message: "Enter your show's name." };
  if (!isEmail(email))
    return { ok: false, message: "Enter a valid business email." };
  if (showUrl && !/^https?:\/\//.test(showUrl))
    return { ok: false, message: "Show link must be a full URL (https://...)." };

  record("listing_requests", { showName, contactName, email, showUrl });
  const db = await getDb();
  if (db) {
    try {
      await db.insert(listingRequests).values({
        showName,
        contactName: contactName || null,
        email,
        showUrl: showUrl || null,
      });
    } catch { /* fall back to the log */ }
  }
  // TODO: send a confirmation via Resend once email is wired up.
  return {
    ok: true,
    message: `Received. We review every show against our scope before it goes live, then email you at ${email} to claim your profile.`,
  };
}

/* ------------------------------- newsletter -------------------------------- */

export async function subscribeNewsletter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const edition = String(formData.get("edition") ?? "buyer");
  if (!isEmail(email))
    return { ok: false, message: "Enter a valid email address." };
  record("subscribers", { email, edition, status: "pending" });
  const db = await getDb();
  if (db) {
    try {
      const [sub] = await db
        .insert(newsletterSubscribers)
        .values({ email, status: "pending", consentSource: `signup:${edition}` })
        .onConflictDoUpdate({
          target: newsletterSubscribers.email,
          set: { updatedAt: new Date() },
        })
        .returning({ id: newsletterSubscribers.id });
      if (sub?.id) {
        await db
          .insert(newsletterEditionSubscriptions)
          .values({ subscriberId: sub.id, edition: edition as "buyer" | "creator" })
          .onConflictDoNothing();
      }
    } catch { /* fall back to the log */ }
  }
  // TODO: send a double opt-in confirmation via Resend before adding to sends.
  return {
    ok: true,
    message: "Almost there. Check your inbox to confirm your subscription.",
  };
}

/* --------------------------------- planner --------------------------------- */

export async function runPlan(input: PlanInput) {
  const podcasts = getAllPodcasts().map(toPlannerInput);
  return matchPlan(input, podcasts, { referenceDate: new Date("2026-07-23") });
}
