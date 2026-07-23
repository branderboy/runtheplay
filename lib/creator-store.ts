import "server-only";
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db-optional";
import { creatorProfiles } from "@/src/db/schema/index";

/**
 * Creator Studio storage. Postgres in production, a local JSON file in dev so
 * the claim-to-studio-to-publish loop runs everywhere. The studio URL is the
 * capability: whoever holds /studio/[id] edits that profile (until magic-link
 * login lands with Resend).
 */

export type InventoryItem = { placement: string; rate: string; notes?: string };

export type CreatorProfile = {
  id: string;
  podcastSlug: string;
  showName: string | null;
  contactEmail: string | null;
  thumbnailUrl: string | null;
  description: string | null;
  inventory: InventoryItem[];
  status: "draft" | "published";
  source: "claim" | "listing";
};

const FILE = join(process.cwd(), ".data", "creator_profiles.json");

function readFile(): Record<string, CreatorProfile> {
  try {
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeFile(all: Record<string, CreatorProfile>) {
  try {
    mkdirSync(join(process.cwd(), ".data"), { recursive: true });
    writeFileSync(FILE, JSON.stringify(all, null, 1));
  } catch {
    /* best-effort */
  }
}

function fromRow(r: {
  id: string;
  podcastSlug: string;
  showName: string | null;
  contactEmail: string | null;
  thumbnailUrl: string | null;
  description: string | null;
  inventoryJson: unknown;
  status: string;
  source: string;
}): CreatorProfile {
  return {
    id: r.id,
    podcastSlug: r.podcastSlug,
    showName: r.showName,
    contactEmail: r.contactEmail,
    thumbnailUrl: r.thumbnailUrl,
    description: r.description,
    inventory: (Array.isArray(r.inventoryJson) ? r.inventoryJson : []) as InventoryItem[],
    status: r.status === "published" ? "published" : "draft",
    source: r.source === "claim" ? "claim" : "listing",
  };
}

export async function createCreatorProfile(input: {
  podcastSlug: string;
  showName: string | null;
  contactEmail: string | null;
  source: "claim" | "listing";
}): Promise<string | null> {
  const db = await getDb();
  if (db) {
    try {
      const [row] = await db
        .insert(creatorProfiles)
        .values({ ...input, inventoryJson: [] })
        .returning({ id: creatorProfiles.id });
      return row?.id ?? null;
    } catch {
      return null;
    }
  }
  const id = randomUUID();
  const all = readFile();
  all[id] = {
    id,
    podcastSlug: input.podcastSlug,
    showName: input.showName,
    contactEmail: input.contactEmail,
    thumbnailUrl: null,
    description: null,
    inventory: [],
    status: "draft",
    source: input.source,
  };
  writeFile(all);
  return id;
}

export async function getCreatorProfile(
  id: string,
): Promise<CreatorProfile | null> {
  const db = await getDb();
  if (db) {
    try {
      const [row] = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.id, id));
      return row ? fromRow(row) : null;
    } catch {
      return null;
    }
  }
  return readFile()[id] ?? null;
}

/** The public overlay: the latest PUBLISHED profile for a show, if any. */
export async function getPublishedProfile(
  slug: string,
): Promise<CreatorProfile | null> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(creatorProfiles)
        .where(eq(creatorProfiles.podcastSlug, slug));
      const hit = rows.filter((r) => r.status === "published").pop();
      return hit ? fromRow(hit) : null;
    } catch {
      return null;
    }
  }
  const hit = Object.values(readFile())
    .filter((p) => p.podcastSlug === slug && p.status === "published")
    .pop();
  return hit ?? null;
}

export async function updateCreatorProfile(
  id: string,
  patch: Partial<
    Pick<
      CreatorProfile,
      "thumbnailUrl" | "description" | "contactEmail" | "inventory" | "status"
    >
  >,
): Promise<boolean> {
  const db = await getDb();
  if (db) {
    try {
      const { inventory, ...rest } = patch;
      await db
        .update(creatorProfiles)
        .set({
          ...rest,
          ...(inventory !== undefined ? { inventoryJson: inventory } : {}),
          updatedAt: new Date(),
        })
        .where(eq(creatorProfiles.id, id));
      return true;
    } catch {
      return false;
    }
  }
  const all = readFile();
  if (!all[id]) return false;
  all[id] = { ...all[id], ...patch };
  writeFile(all);
  return true;
}
