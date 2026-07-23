import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db-optional";
import { advertisers, savedPlans } from "@/src/db/schema/index";
import { getPodcastBySlug } from "@/lib/data/podcasts";
import { CoverArt } from "@/components/cover-art";

export const metadata = { title: "Saved Plan" };

type PlanItem = { slug: string; name: string; category?: string | null };

export default async function SavedPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();

  const db = await getDb();
  if (!db) notFound();

  let plan:
    | { itemsJson: unknown; createdAt: Date | null; company: string | null; name: string | null }
    | undefined;
  try {
    [plan] = await db
      .select({
        itemsJson: savedPlans.itemsJson,
        createdAt: savedPlans.createdAt,
        company: advertisers.company,
        name: advertisers.name,
      })
      .from(savedPlans)
      .innerJoin(advertisers, eq(savedPlans.advertiserId, advertisers.id))
      .where(eq(savedPlans.id, id));
  } catch {
    notFound();
  }
  if (!plan) notFound();

  const items = (Array.isArray(plan.itemsJson) ? plan.itemsJson : []) as PlanItem[];

  return (
    <div className="mx-auto max-w-3xl px-5 py-14">
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-500">
        Saved Plan{plan.company ? ` · ${plan.company}` : ""}
      </p>
      <h1 className="display text-4xl text-ink sm:text-5xl">Your Media Mix.</h1>
      <p className="mt-4 max-w-xl text-lg font-medium text-ink-dim">
        {items.length} {items.length === 1 ? "show" : "shows"} saved
        {plan.createdAt
          ? ` on ${plan.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
          : ""}
        . Contact each show from its profile. Pricing is confirmed with the
        creator.
      </p>

      <ul className="mt-10 flex flex-col gap-3">
        {items.map((i) => {
          const p = getPodcastBySlug(i.slug);
          return (
            <li
              key={i.slug}
              className="flex items-center justify-between gap-4 rounded-[2rem] border border-sky-50 bg-white p-5 shadow-[0_10px_30px_-15px_rgba(14,165,233,0.15)]"
            >
              <div className="flex min-w-0 items-center gap-4">
                <CoverArt
                  name={i.name}
                  slug={i.slug}
                  artworkUrl={p?.artworkUrl}
                  size={44}
                  radius={12}
                />
                <div className="min-w-0">
                  <Link
                    href={`/podcast/${i.slug}`}
                    className="block truncate text-lg font-black uppercase tracking-tight text-ink hover:text-sky-600"
                  >
                    {i.name}
                  </Link>
                  <p className="text-sm font-bold text-ink-faint">
                    {i.category ?? p?.primaryCategory ?? "Podcast"} · Contact for
                    Pricing
                  </p>
                </div>
              </div>
              <Link
                href={`/podcast/${i.slug}#contact`}
                className="flex-none rounded-full bg-sky-50 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-sky-600 transition-colors hover:bg-sky-500 hover:text-white"
              >
                Contact
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-xs font-bold uppercase tracking-widest text-ink-faint">
        This Link Is Your Plan's Permanent Home
      </p>
    </div>
  );
}
