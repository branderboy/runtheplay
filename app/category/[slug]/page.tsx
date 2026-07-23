import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { listCategoryGroups, categoryBySlug } from "@/lib/categories";
import { PodcastCard } from "@/components/podcast-card";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return listCategoryGroups().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) return { title: "Category not found" };
  const title = `${c.name} Podcasts | Black Creators Open to Advertising`;
  return {
    title,
    description: `${c.shows.length} Black-creator ${c.name} podcasts and their advertising opportunities. Plan a culture-first campaign on Run the Play.`,
    alternates: { canonical: `${SITE_URL}/category/${c.slug}` },
    // Keep thin category pages out of the index until they have enough shows.
    robots: c.indexable ? undefined : { index: false, follow: true },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  if (!c) notFound();

  const others = listCategoryGroups().filter((x) => x.slug !== c.slug).slice(0, 8);

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${c.name} Podcasts`,
          url: `${SITE_URL}/category/${c.slug}`,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: c.shows.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/podcast/${p.slug}`,
              name: p.name,
            })),
          },
        }}
      />

      <nav className="text-sm text-ink-faint" aria-label="Breadcrumb">
        <Link href="/directory" className="hover:text-ink-dim">Explore Podcasts</Link>
        <span className="mx-2">/</span>
        <span className="text-ink-dim">{c.name}</span>
      </nav>

      <h1 className="mt-3 text-balance text-3xl font-extrabold sm:text-4xl">
        {c.name} podcasts open to advertising
      </h1>
      <p className="mt-3 max-w-2xl text-ink-dim">
        {c.shows.length} Black-creator {c.name.toLowerCase()} {c.shows.length === 1 ? "show" : "shows"} with
        real reach and direct contact. Add them to a plan, or{" "}
        <Link href="/plan" className="font-semibold text-ink underline underline-offset-2">build your ad plan</Link>.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {c.shows.map((p) => (
          <PodcastCard key={p.slug} p={p} />
        ))}
      </div>

      <section className="mt-12">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
          Browse other categories
        </h2>
        <div className="flex flex-wrap gap-2">
          {others.map((o) => (
            <Link
              key={o.slug}
              href={`/category/${o.slug}`}
              className="rounded-full border border-line bg-navy-2 px-3 py-1.5 text-xs font-semibold text-ink-dim hover:text-ink"
            >
              {o.name} ({o.shows.length})
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
