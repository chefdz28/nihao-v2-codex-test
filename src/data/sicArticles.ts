// V2.4 — combine all Study-in-China articles into one lookup array.
import type { SicArticle } from '@/data/studyInChina';
import { generalArticles } from '@/data/sicGeneral';
import { regionalArticles, bonusArticles } from '@/data/sicRegional';

export const sicArticles: SicArticle[] = [
  ...generalArticles,
  ...regionalArticles,
  ...bonusArticles,
];

export function sicArticleBySlug(slug: string): SicArticle | undefined {
  return sicArticles.find(a => a.slug === slug);
}

// groupings for the hub
export const sicGeneralSlugs = generalArticles.map(a => a.slug);
export const sicRegionalSlugs = regionalArticles.map(a => a.slug);
export const sicBonusSlugs = bonusArticles.map(a => a.slug);
