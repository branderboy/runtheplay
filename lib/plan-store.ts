import "server-only";
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db-optional";
import { advertisers, savedPlans } from "@/src/db/schema/index";

/**
 * Saved-plan storage. Postgres when DATABASE_URL is set (production); a
 * local JSON file otherwise so the full save-edit-suggest loop works in dev.
 */

export type PlanItem = { slug: string; name: string; category?: string | null };

export type StoredPlan = {
  id: string;
  email: string;
  name: string | null;
  company: string | null;
  items: PlanItem[];
  createdAt: string;
};

const FILE = join(process.cwd(), ".data", "saved_plans.json");

function readFile(): Record<string, StoredPlan> {
  try {
    return JSON.parse(readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeFile(all: Record<string, StoredPlan>) {
  try {
    mkdirSync(join(process.cwd(), ".data"), { recursive: true });
    writeFileSync(FILE, JSON.stringify(all, null, 1));
  } catch {
    /* best-effort in read-only environments */
  }
}

export async function createPlan(input: {
  email: string;
  name: string | null;
  company: string | null;
  items: PlanItem[];
}): Promise<string | null> {
  const db = await getDb();
  if (db) {
    try {
      await db
        .insert(advertisers)
        .values({ email: input.email, name: input.name, company: input.company })
        .onConflictDoNothing({ target: advertisers.email });
      const [account] = await db
        .select({ id: advertisers.id })
        .from(advertisers)
        .where(eq(advertisers.email, input.email));
      if (account) {
        const [plan] = await db
          .insert(savedPlans)
          .values({ advertiserId: account.id, itemsJson: input.items })
          .returning({ id: savedPlans.id });
        if (plan) return plan.id;
      }
      return null;
    } catch {
      return null;
    }
  }
  const id = randomUUID();
  const all = readFile();
  all[id] = { id, ...input, createdAt: new Date().toISOString() };
  writeFile(all);
  return id;
}

export async function getPlan(id: string): Promise<StoredPlan | null> {
  const db = await getDb();
  if (db) {
    try {
      const [row] = await db
        .select({
          id: savedPlans.id,
          itemsJson: savedPlans.itemsJson,
          createdAt: savedPlans.createdAt,
          email: advertisers.email,
          name: advertisers.name,
          company: advertisers.company,
        })
        .from(savedPlans)
        .innerJoin(advertisers, eq(savedPlans.advertiserId, advertisers.id))
        .where(eq(savedPlans.id, id));
      if (!row) return null;
      return {
        id: row.id,
        email: row.email,
        name: row.name,
        company: row.company,
        items: (Array.isArray(row.itemsJson) ? row.itemsJson : []) as PlanItem[],
        createdAt: row.createdAt?.toISOString() ?? new Date(0).toISOString(),
      };
    } catch {
      return null;
    }
  }
  return readFile()[id] ?? null;
}

export async function updatePlanItems(
  id: string,
  items: PlanItem[],
): Promise<boolean> {
  const db = await getDb();
  if (db) {
    try {
      await db
        .update(savedPlans)
        .set({ itemsJson: items })
        .where(eq(savedPlans.id, id));
      return true;
    } catch {
      return false;
    }
  }
  const all = readFile();
  if (!all[id]) return false;
  all[id].items = items;
  writeFile(all);
  return true;
}
