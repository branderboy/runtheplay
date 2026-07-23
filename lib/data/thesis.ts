import thesisData from "@/data/thesis.json";
import caseStudiesData from "@/data/case_studies.json";

/** The single data sheet the site's "why" pulls from — thesis facts + sources. */

export interface ThesisStat {
  id: string;
  value: string;
  label: string;
  detail: string;
  source: string;
}

export interface Thesis {
  positioning: {
    name: string;
    tagline: string;
    premise: string;
    closer: string;
  };
  whyItWorks: ThesisStat[];
  growth: ThesisStat[];
  arbitrage: {
    headline: string;
    outliers: { label: string; cpmLow: number; cpmHigh: number; note: string };
    midTier: { label: string; cpmLow: number; cpmHigh: number; note: string };
    conclusion: string;
    source: string;
  };
  whatWeDo: string[];
  sources: string[];
}

export interface CaseStudy {
  type: "partnership" | "stat";
  brand: string;
  show: string;
  showSlug: string;
  summary: string;
  outcome: string;
  sourceTitle: string;
  sourceUrl: string;
  year: string;
}

export const thesis = thesisData as Thesis;
export const caseStudies = caseStudiesData as CaseStudy[];

export const partnerships = caseStudies.filter((c) => c.type === "partnership");
export const industryStats = caseStudies.filter((c) => c.type === "stat");
