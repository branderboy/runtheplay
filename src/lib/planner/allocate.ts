/**
 * Budget allocator (planner v1.1). The idea comes from open-source MMM
 * budget optimizers (Meta Robyn, Google Meridian): given a fixed budget and a
 * scored slate, propose a split and the impressions it should buy.
 *
 * Ours is deliberately simple and honest: dollars are split in proportion to
 * match score across the ORGANIC slate only (boosts never get auto-allocated
 * budget), and impressions are an ESTIMATED range derived from the sourced
 * mid-tier host-read CPM benchmarks in data/thesis.json. Estimates are always
 * labeled; they are never quoted rates.
 */

export interface AllocInput {
  podcastId: string;
  name: string;
  score: number;
}

export interface AllocLine {
  podcastId: string;
  name: string;
  dollars: number;
  share: number; // 0..1
  impressionsLow: number; // at cpmHigh (worst case)
  impressionsHigh: number; // at cpmLow (best case)
}

export interface AllocOutput {
  lines: AllocLine[];
  totalDollars: number;
  cpmLow: number;
  cpmHigh: number;
}

export function allocateBudget(
  budget: number,
  slate: AllocInput[],
  cpm: { cpmLow: number; cpmHigh: number },
  maxShows = 5,
): AllocOutput | null {
  if (!Number.isFinite(budget) || budget <= 0) return null;
  const picks = slate.slice(0, maxShows).filter((s) => s.score > 0);
  if (picks.length === 0) return null;

  const totalScore = picks.reduce((n, s) => n + s.score, 0);
  let allocated = 0;
  const lines: AllocLine[] = picks.map((s) => {
    const share = s.score / totalScore;
    const dollars = Math.floor(budget * share);
    allocated += dollars;
    return {
      podcastId: s.podcastId,
      name: s.name,
      dollars,
      share,
      impressionsLow: 0,
      impressionsHigh: 0,
    };
  });
  // Remainder from flooring goes to the strongest match.
  lines[0].dollars += budget - allocated;

  for (const l of lines) {
    l.impressionsLow = Math.round((l.dollars / cpm.cpmHigh) * 1000);
    l.impressionsHigh = Math.round((l.dollars / cpm.cpmLow) * 1000);
  }

  return {
    lines,
    totalDollars: budget,
    cpmLow: cpm.cpmLow,
    cpmHigh: cpm.cpmHigh,
  };
}
