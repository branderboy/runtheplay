import "server-only";

/**
 * Returns the Drizzle client only when DATABASE_URL is set (e.g. after Neon
 * storage is connected on Vercel). Returns null otherwise, so local/preview
 * runs work on the seed data without a database.
 */
type Db = Awaited<typeof import("@/src/db/client")>["db"] | null;
let cached: Db | undefined;

export async function getDb(): Promise<Db> {
  if (cached !== undefined) return cached;
  if (!process.env.DATABASE_URL) {
    cached = null;
    return cached;
  }
  try {
    const mod = await import("@/src/db/client");
    cached = mod.db;
  } catch {
    cached = null;
  }
  return cached;
}
