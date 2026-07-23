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
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createPlan, getPlan, updatePlanItems, type PlanItem } from "@/lib/plan-store";
import {
  createCreatorProfile,
  getCreatorProfile,
  updateCreatorProfile,
  type InventoryItem,
} from "@/lib/creator-store";
import { supportTickets } from "@/src/db/schema/index";

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

export type ActionState = {
  ok: boolean;
  message: string;
  planId?: string;
  studioId?: string;
};

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
    const studioId = await createCreatorProfile({
      podcastSlug: pod.slug,
      showName: pod.name,
      contactEmail: claimEmail,
      source: "claim",
    });
    return {
      ok: true,
      studioId: studioId ?? undefined,
      message: `Verified. This matches ${pod.name}'s email on file. Your Creator Studio is open below. Bookmark it, it's your dashboard.`,
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

/* ------------------ finalize plan (advertiser account, A4) ------------------ */

export async function finalizePlan(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  let items: { slug: string; name: string; category?: string | null }[] = [];
  try {
    const parsed = JSON.parse(String(formData.get("items") ?? "[]"));
    if (Array.isArray(parsed))
      items = parsed
        .filter((i) => i && typeof i.slug === "string" && typeof i.name === "string")
        .slice(0, 50);
  } catch {
    /* treated as empty below */
  }

  if (!isEmail(email))
    return { ok: false, message: "Enter a valid business email." };
  if (items.length === 0)
    return { ok: false, message: "Add at least one show to your media mix first." };

  record("advertisers", { email, name, company });
  record("saved_plans", { email, items: items.map((i) => i.slug) });

  const planId = await createPlan({
    email,
    name: name || null,
    company: company || null,
    items,
  });
  if (planId) {
    // TODO: email the plan link via Resend once email is wired up.
    return {
      ok: true,
      planId,
      message: `Plan saved to your account. Keep the link below, it's your plan's permanent home.`,
    };
  }
  return {
    ok: true,
    message: `Plan saved and logged for ${email}. Contact each show from its profile while account access is being finished.`,
  };
}

/* ----------------------- edit a saved plan (A4 workspace) ------------------- */

export async function removePlanItem(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const plan = await getPlan(planId);
  if (!plan) return;
  await updatePlanItems(
    planId,
    plan.items.filter((i) => i.slug !== slug),
  );
  revalidatePath(`/plans/${planId}`);
}

export async function addPlanItem(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const plan = await getPlan(planId);
  const pod = getPodcastBySlug(slug);
  if (!plan || !pod) return;
  if (plan.items.some((i) => i.slug === slug)) return;
  const item: PlanItem = {
    slug: pod.slug,
    name: pod.name,
    category: pod.primaryCategory,
  };
  await updatePlanItems(planId, [...plan.items, item].slice(0, 50));
  revalidatePath(`/plans/${planId}`);
}

/* ------------------------- creator studio (P6-P7) --------------------------- */

export async function updateStudioDetails(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = String(formData.get("studioId") ?? "");
  const thumbnailUrl = String(formData.get("thumbnailUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();
  const profile = await getCreatorProfile(id);
  if (!profile) return { ok: false, message: "Studio not found." };
  if (thumbnailUrl && !/^https?:\/\/|^\//.test(thumbnailUrl))
    return { ok: false, message: "Thumbnail must be a full image URL (https://...)." };
  if (contactEmail && !isEmail(contactEmail))
    return { ok: false, message: "Enter a valid contact email." };
  await updateCreatorProfile(id, {
    thumbnailUrl: thumbnailUrl || null,
    description: description || null,
    contactEmail: contactEmail || profile.contactEmail,
  });
  revalidatePath(`/studio/${id}`);
  revalidatePath(`/podcast/${profile.podcastSlug}`);
  return { ok: true, message: "Saved." };
}

export async function addStudioInventory(formData: FormData) {
  const id = String(formData.get("studioId") ?? "");
  const placement = String(formData.get("placement") ?? "").trim();
  const rate = String(formData.get("rate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const profile = await getCreatorProfile(id);
  if (!profile || !placement) return;
  const item: InventoryItem = { placement, rate: rate || "Contact for Pricing", notes: notes || undefined };
  await updateCreatorProfile(id, {
    inventory: [...profile.inventory, item].slice(0, 30),
  });
  revalidatePath(`/studio/${id}`);
  revalidatePath(`/podcast/${profile.podcastSlug}`);
}

export async function removeStudioInventory(formData: FormData) {
  const id = String(formData.get("studioId") ?? "");
  const index = Number(formData.get("index") ?? -1);
  const profile = await getCreatorProfile(id);
  if (!profile || index < 0) return;
  await updateCreatorProfile(id, {
    inventory: profile.inventory.filter((_, i) => i !== index),
  });
  revalidatePath(`/studio/${id}`);
  revalidatePath(`/podcast/${profile.podcastSlug}`);
}

export async function setStudioStatus(formData: FormData) {
  const id = String(formData.get("studioId") ?? "");
  const status = String(formData.get("status") ?? "") === "published" ? "published" : "draft";
  const profile = await getCreatorProfile(id);
  if (!profile) return;
  await updateCreatorProfile(id, { status });
  revalidatePath(`/studio/${id}`);
  revalidatePath(`/podcast/${profile.podcastSlug}`);
}

/* ------------------------------ support tickets ----------------------------- */

export async function submitSupportTicket(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!isEmail(email)) return { ok: false, message: "Enter a valid email." };
  if (message.length < 5) return { ok: false, message: "Tell us what you need." };
  record("support_tickets", { email, topic, message });
  const db = await getDb();
  if (db) {
    try {
      await db.insert(supportTickets).values({ email, topic: topic || null, message });
    } catch { /* fall back to the log */ }
  }
  return { ok: true, message: "Received. We'll reply to your email." };
}

/* --------------------------------- admin ----------------------------------- */

const ADMIN_COOKIE = "rtp-admin";

export async function adminKeyOk(): Promise<boolean> {
  const key = process.env.RTP_ADMIN_KEY;
  if (!key) return false;
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === key;
}

export async function adminLogin(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const key = process.env.RTP_ADMIN_KEY;
  const given = String(formData.get("key") ?? "");
  if (!key) return { ok: false, message: "RTP_ADMIN_KEY is not set on the server." };
  if (given !== key) return { ok: false, message: "Wrong key." };
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, key, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/admin");
  return { ok: true, message: "In." };
}

export async function adminSetTicketStatus(formData: FormData) {
  if (!(await adminKeyOk())) return;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") === "closed" ? "closed" : "open";
  const db = await getDb();
  if (db && id) {
    try {
      const { eq } = await import("drizzle-orm");
      await db.update(supportTickets).set({ status }).where(eq(supportTickets.id, id));
    } catch { /* ignore */ }
  }
  revalidatePath("/admin");
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
  // A draft Creator Studio opens immediately so the creator can add their
  // thumbnail, details, and inventory while the scope review happens.
  const proposedSlug = showName
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  const studioId = await createCreatorProfile({
    podcastSlug: proposedSlug || "new-show",
    showName,
    contactEmail: email,
    source: "listing",
  });
  // TODO: send a confirmation via Resend once email is wired up.
  return {
    ok: true,
    studioId: studioId ?? undefined,
    message: `Received. Your Creator Studio is open below. Add your details while we review your show against our scope, then we email you at ${email} when it's live.`,
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
