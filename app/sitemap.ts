import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllPodcasts } from "@/lib/data/podcasts";
import { getAllPlays } from "@/lib/data/plays";
import { CHARTS } from "@/lib/charts";
import { listCategoryGroups } from "@/lib/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = (path: string) => `${SITE_URL}${path}`;

  const staticPages = [
    "/",
    "/directory",
    "/plan",
    "/plays",
    "/charts",
    "/creators",
    "/claim",
    "/support",
    "/legal/privacy",
    "/legal/terms",
    "/legal/data-and-corrections",
    "/legal/ranking",
  ].map((p) => ({ url: u(p), changeFrequency: "weekly" as const, priority: 0.7 }));

  const podcasts = getAllPodcasts().map((p) => ({
    url: u(`/podcast/${p.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const plays = getAllPlays().map((p) => ({
    url: u(`/plays/${p.slug}`),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const charts = CHARTS.map((c) => ({
    url: u(`/charts/${c.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Only index category pages that clear the quality threshold.
  const categories = listCategoryGroups()
    .filter((c) => c.indexable)
    .map((c) => ({
      url: u(`/category/${c.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...podcasts, ...plays, ...charts, ...categories];
}
