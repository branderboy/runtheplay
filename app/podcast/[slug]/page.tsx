import { notFound } from "next/navigation";
import Link from "next/link";
import { getPodcastBySlug, getAllPodcasts } from "@/lib/data/podcasts";
import { Badge } from "@/components/badges";
import { RequestForm } from "@/components/request-form";
import { ClaimForm } from "@/components/claim-form";

export function generateStaticParams() {
  return getAllPodcasts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPodcastBySlug(slug);
  if (!p) return { title: "Podcast not found" };
  return {
    title: `${p.name} — Advertising & Audience`,
    description: p.shortDescription ?? undefined,
  };
}

const platformLabel: Record<string, string> = {
  youtube: "YouTube",
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  apple: "Apple Podcasts",
  spotify: "Spotify",
};

function fmt(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${Math.round(n / 1e3)}K`;
  return String(n);
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPodcastBySlug(slug);
  if (!p) notFound();

  const location = [p.city, p.stateOrRegion].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <Link href="/directory" className="text-sm text-ink-faint hover:text-ink-dim">
        ← Explore Podcasts
      </Link>

      {/* Identity */}
      <div className="mt-4 flex flex-wrap items-start gap-2">
        <h1 className="text-3xl font-extrabold">{p.name}</h1>
      </div>
      <p className="mt-2 text-ink-dim">
        {p.primaryCategory}
        {location ? ` · ${location}` : ""}
        {p.hosts.length ? ` · ${p.hosts.join(", ")}` : ""}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone="unclaimed">Unclaimed</Badge>
        <Badge tone="public">Public source</Badge>
        {p.advertisingAvailable && <Badge tone="contact">Advertising available</Badge>}
        {p.networkName && <span className="text-xs text-ink-faint">Network: {p.networkName}</span>}
      </div>

      {p.shortDescription && (
        <p className="mt-6 max-w-2xl text-ink-dim">{p.shortDescription}</p>
      )}

      {/* Platforms / reach */}
      {p.platforms.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
            Platforms & reach
          </h2>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft sm:grid-cols-3">
            {p.platforms.map((pl) => (
              <a
                key={pl.platform}
                href={pl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-navy-1 p-4 hover:bg-navy-2"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                  {platformLabel[pl.platform] ?? pl.platform}
                </div>
                <div className="mt-1 text-xl font-extrabold tabular-nums">
                  {pl.followers ? fmt(pl.followers) : "—"}
                </div>
                <div className="mt-0.5 text-[11px] text-ink-dim">
                  {pl.followers ? "Followers · Public" : "Profile"}
                </div>
              </a>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-faint">
            Public figures from search sources, unverified. Exact, verified
            numbers appear when the creator connects their accounts.
          </p>
        </section>
      )}

      {/* Audience */}
      {p.audienceTags.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
            Audience affinity
          </h2>
          <div className="flex flex-wrap gap-2">
            {p.audienceTags.map((t) => (
              <span key={t} className="rounded-lg border border-line bg-navy-2 px-3 py-1.5 text-sm">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Advertising */}
      <section className="mt-10">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-ink-faint">
          Advertising opportunities
        </h2>
        <div className="rounded-2xl border border-line bg-navy-1 p-5 text-sm text-ink-dim">
          Pricing and inventory are set by the show.{" "}
          {p.advertisingAvailable
            ? "This show accepts advertising — send an inquiry below to get formats and rates."
            : "Advertising availability isn't confirmed yet — reach out to ask."}
          <div className="mt-2">
            <Badge tone="contact">Contact for pricing</Badge>
          </div>
        </div>
      </section>

      {/* Request + Claim */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-navy-1 p-6">
          <h2 className="text-lg font-bold">Contact {p.name}</h2>
          <p className="mb-4 mt-1 text-sm text-ink-dim">
            Your inquiry goes straight to the show's own contact.
          </p>
          <RequestForm slug={p.slug} name={p.name} />
        </section>

        <section className="rounded-2xl border border-line bg-navy-1 p-6" id="claim">
          <h2 className="text-lg font-bold">Is this your show?</h2>
          <p className="mb-4 mt-1 text-sm text-ink-dim">
            Claim it free to control your info and advertising options.
          </p>
          <ClaimForm slug={p.slug} name={p.name} />
        </section>
      </div>
    </div>
  );
}
