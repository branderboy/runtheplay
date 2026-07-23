import { getAllPodcasts, type Podcast } from "@/lib/data/podcasts";

/** Minimum shows before a category page is index-worthy (avoids thin pages). */
export const MIN_INDEXABLE = 4;

export function categorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface CategoryGroup {
  name: string;
  slug: string;
  shows: Podcast[];
  indexable: boolean;
}

export function listCategoryGroups(): CategoryGroup[] {
  const map = new Map<string, Podcast[]>();
  for (const p of getAllPodcasts()) {
    if (!p.primaryCategory) continue;
    const arr = map.get(p.primaryCategory) ?? [];
    arr.push(p);
    map.set(p.primaryCategory, arr);
  }
  return Array.from(map.entries())
    .map(([name, shows]) => ({
      name,
      slug: categorySlug(name),
      shows,
      indexable: shows.length >= MIN_INDEXABLE,
    }))
    .sort((a, b) => b.shows.length - a.shows.length || a.name.localeCompare(b.name));
}

export function categoryBySlug(slug: string): CategoryGroup | undefined {
  return listCategoryGroups().find((c) => c.slug === slug);
}

/** Up to `n` other shows sharing this show's primary category. */
export function similarShows(p: Podcast, n = 6): Podcast[] {
  if (!p.primaryCategory) return [];
  return getAllPodcasts()
    .filter((x) => x.slug !== p.slug && x.primaryCategory === p.primaryCategory)
    .slice(0, n);
}
