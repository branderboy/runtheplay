import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPodcastBySlug, getAllPodcasts } from "@/lib/data/podcasts";
import { similarShows, categorySlug } from "@/lib/categories";
import { deriveFormats, typicalPlacements } from "@/lib/formats";
import { Badge } from "@/components/badges";
import { ProfileHero } from "@/components/profile-hero";
import { PodcastCard } from "@/components/podcast-card";
import { RequestForm } from "@/components/request-form";
import { ClaimForm } from "@/components/claim-form";
import { JsonLd } from "@/components/json-ld";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return getAllPodcasts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getPodcastBySlug(slug);
  if (!p) return { title: "Podcast not found" };
  const title = `${p.name} — Advertising, Audience & Sponsorship`;
  const description =
    p.shortDescription ??
    `${p.name} advertising opportunities, audience, and how to reach the show on Run the Play.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/podcast/${p.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/podcast/${p.slug}`,
      images: p.artworkUrl ? [p.artworkUrl] : undefined,
    },
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

function spotifyEmbed(url?: string): string | null {
  const m = /show\/([A-Za-z0-9]+)/.exec(url ?? "");
  return m ? `https://open.spotify.com/embed/show/${m[1]}` : null;
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = getPodcastBySlug(slug);
  if (!p) notFound();

  const spotifyUrl = p.platforms.find((x) => x.platform === "spotify")?.url;
  const embed = spotifyEmbed(spotifyUrl);
  const similar = similarShows(p);
  const formats = deriveFormats(p);
  const placements = typicalPlacements(formats);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "PodcastSeries",
          name: p.name,
          url: `${SITE_URL}/podcast/${p.slug}`,
          description: p.shortDescription ?? undefined,
          image: p.artworkUrl ?? undefined,
          genre: p.primaryCategory ?? undefined,
          webFeed: undefined,
          author: p.hosts.map((h) => ({ "@type": "Person", name: h })),
          sameAs: p.platforms.map((pl) => pl.url),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Explore Podcasts", item: `${SITE_URL}/directory` },
            ...(p.primaryCategory
              ? [{ "@type": "ListItem", position: 2, name: p.primaryCategory, item: `${SITE_URL}/category/${categorySlug(p.primaryCategory)}` }]
              : []),
            { "@type": "ListItem", position: p.primaryCategory ? 3 : 2, name: p.name, item: `${SITE_URL}/podcast/${p.slug}` },
          ],
        }}
      />

      <nav className="text-sm text-ink-faint" aria-label="Breadcrumb">
        <Link href="/directory" className="hover:text-ink-dim">Explore Podcasts</Link>
        {p.primaryCategory && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/category/${categorySlug(p.primaryCategory)}`} className="hover:text-ink-dim">
              {p.primaryCategory}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-4">
        <ProfileHero p={p} />
      </div>

      {p.networkName && (
        <p className="mt-3 text-xs text-ink-faint">Network: {p.networkName}</p>
      )}

      {p.shortDescription && (
        <p className="mt-6 max-w-2xl text-ink-dim">{p.shortDescription}</p>
      )}

      {/* Format — derived from real platform presence */}
      <section className="mt-8">
        <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-ink-faint">
          Format
        </h2>
        <div className="flex flex-wrap gap-2">
          {formats.video && (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-sky-600">
              Video Podcast
            </span>
          )}
          {formats.audio && (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-sky-600">
              Audio
            </span>
          )}
          {formats.clips && (
            <span className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-sky-600">
              Clips
            </span>
          )}
          {formats.social.map((s) => (
            <span
              key={s}
              className="rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-black uppercase tracking-widest text-sky-600"
            >
              {s === "instagram" ? "Instagram" : "TikTok"}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink-faint">
          Based on the show's public platform presence.
        </p>
      </section>

      {/* Spotify player */}
      {embed && (
        <section className="mt-8" aria-label="Listen on Spotify">
          <iframe
            title={`${p.name} on Spotify`}
            src={embed}
            width="100%"
            height="152"
            loading="lazy"
            allow="encrypted-media; clipboard-write; fullscreen; picture-in-picture"
            className="rounded-2xl border border-line"
          />
        </section>
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

      {/* Ad placements — typical for this show's format */}
      <section className="mt-10">
        <h2 className="mb-3 text-xs font-black uppercase tracking-widest text-ink-faint">
          Ad placement types
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {placements.map((g) => (
            <div
              key={g.channel}
              className="rounded-[1.5rem] border border-sky-50 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-3 text-[11px] font-black uppercase tracking-widest text-sky-500">
                {g.channel}
              </h3>
              <div className="flex flex-wrap gap-2">
                {g.placements.map((pl) => (
                  <span
                    key={pl}
                    className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-ink"
                  >
                    {pl}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-sky-50 bg-sky-50/50 p-4 text-sm font-medium text-ink-dim">
          <Badge tone="contact">Contact for pricing</Badge>
          Typical placements for this format.{" "}
          {p.advertisingAvailable
            ? "This show accepts advertising. Confirm formats and rates in your inquiry."
            : "Availability not confirmed. Ask in your inquiry."}{" "}
          Claimed profiles publish real inventory and rates here.
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
            Claim it free to publish your real ad inventory — placements,
            rates, and availability — right on this page.
          </p>
          <ClaimForm slug={p.slug} name={p.name} />
        </section>
      </div>

      {/* Similar shows — internal linking */}
      {similar.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-lg font-bold">
            Similar {p.primaryCategory} podcasts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <PodcastCard key={s.slug} p={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
