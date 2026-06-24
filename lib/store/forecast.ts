// ──────────────────────────────────────────────────────────────────────────
// Revenue & staffing forecast.
//
// Bridges estimating and ops on the money/time axis: it takes the won jobs
// (awarded → active) and the submitted-but-not-yet-won bids, tiers them by how
// likely the revenue is, and spreads each project's value and crew across the
// calendar months it runs. The Schedule view reads everything from here.
//
//   confirmed       awarded / handoff / active     weight 1.00 (booked)
//   highConfidence  submitted + winConfidence high  weight 0.75 (near-booked)
//   submitted       submitted, medium/low/unset     weight 0.40 (soft pipeline)
//
// Revenue is probability-weighted (value × tier weight). Crew is NOT weighted —
// staffing demand reflects the bodies the work needs if it lands, so you can see
// the committed load vs. the speculative load it would stack on top.
// ──────────────────────────────────────────────────────────────────────────

import {
  addDays,
  eachMonthOfInterval,
  endOfMonth,
  startOfMonth,
} from "date-fns";
import type { AppState, Bid, Trade } from "./types";
import { milestonesForBid, projectPlanForBid } from "./selectors";
import { defaultMobilization } from "@/lib/mock-data/projects";

export type ForecastTier = "confirmed" | "highConfidence" | "submitted";

export const FORECAST_TIERS: ForecastTier[] = [
  "confirmed",
  "highConfidence",
  "submitted",
];

export const TIER_WEIGHT: Record<ForecastTier, number> = {
  confirmed: 1,
  highConfidence: 0.75,
  submitted: 0.4,
};

export const TIER_LABEL: Record<ForecastTier, string> = {
  confirmed: "Awarded & confirmed",
  highConfidence: "Submitted — high confidence",
  submitted: "Submitted — pipeline",
};

export const TIER_SHORT: Record<ForecastTier, string> = {
  confirmed: "Confirmed",
  highConfidence: "High confidence",
  submitted: "Submitted",
};

/** Tailwind tokens for each tier — bars, chips, and chart fills. */
export const TIER_META: Record<
  ForecastTier,
  { bar: string; soft: string; dot: string; text: string; border: string }
> = {
  confirmed: {
    bar: "bg-emerald-500",
    soft: "bg-emerald-500/15",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-500/30",
  },
  highConfidence: {
    bar: "bg-amber-500",
    soft: "bg-amber-500/15",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-500/30",
  },
  submitted: {
    bar: "bg-sky-500",
    soft: "bg-sky-500/15",
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-500/30",
  },
};

/**
 * Illustrative total field capacity (masons + finishers we can put to work in a
 * month). Mock standard — used as the reference line on the staffing chart so
 * over-committed months are visible.
 */
export const CREW_CAPACITY = 34;

const CONFIRMED_STAGES: Bid["stage"][] = ["awarded", "handoff", "active"];

/** Which forecast tier a bid belongs to, or null if it isn't bid yet / lost. */
export function forecastTier(bid: Bid): ForecastTier | null {
  if (CONFIRMED_STAGES.includes(bid.stage)) return "confirmed";
  if (bid.stage === "submitted") {
    return bid.winConfidence === "high" ? "highConfidence" : "submitted";
  }
  return null;
}

export interface ScheduleEntry {
  bid: Bid;
  tier: ForecastTier;
  weight: number;
  /** On-site window (ISO). */
  start: string;
  end: string;
  durationDays: number;
  crew: number;
  grossValue: number;
  weightedValue: number;
}

/** Rough crew fallback when a plan/estimate hasn't set one ($/crew-month heuristic). */
function estimateCrew(value: number): number {
  return Math.max(3, Math.round(value / 250_000));
}

/** The on-site window + crew for one bid, given its tier. */
function spanFor(
  state: AppState,
  bid: Bid,
  tier: ForecastTier,
): { start: string; end: string; crew: number } {
  if (tier === "confirmed") {
    const plan = projectPlanForBid(state, bid.id);
    const mob =
      plan?.mobilizationDate ??
      defaultMobilization(bid.awardedAt ?? bid.createdAt);
    let start = mob;
    let end = mob;
    for (const m of milestonesForBid(state, bid.id)) {
      if (!m.targetDate) continue;
      if (m.targetDate < start) start = m.targetDate;
      if (m.targetDate > end) end = m.targetDate;
    }
    // Guard against a degenerate (single-milestone) span.
    if (new Date(end).getTime() - new Date(start).getTime() < 14 * 86_400_000) {
      end = addDays(new Date(start), 8 * 7).toISOString();
    }
    return { start, end, crew: plan?.crewSize ?? estimateCrew(bid.value) };
  }

  // Submitted / high-confidence — no project plan yet, use the estimate.
  const start = bid.expectedStart ?? defaultMobilization(bid.dueDate);
  const weeks = bid.expectedDurationWeeks ?? 8;
  const end = addDays(new Date(start), weeks * 7).toISOString();
  return { start, end, crew: bid.expectedCrew ?? estimateCrew(bid.value) };
}

/** Optional trade filter shared across the forecast selectors. */
export type TradeFilter = Trade | "all";

function matchesTrade(bid: Bid, trade: TradeFilter): boolean {
  return trade === "all" || bid.trade === trade;
}

/** Every project that carries forecastable revenue, earliest start first. */
export function scheduleEntries(
  state: AppState,
  trade: TradeFilter = "all",
): ScheduleEntry[] {
  const entries: ScheduleEntry[] = [];
  for (const bid of state.bids) {
    if (!matchesTrade(bid, trade)) continue;
    const tier = forecastTier(bid);
    if (!tier) continue;
    const { start, end, crew } = spanFor(state, bid, tier);
    const weight = TIER_WEIGHT[tier];
    const durationDays = Math.max(
      1,
      Math.round(
        (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000,
      ),
    );
    entries.push({
      bid,
      tier,
      weight,
      start,
      end,
      durationDays,
      crew,
      grossValue: bid.value,
      weightedValue: bid.value * weight,
    });
  }
  return entries.sort((a, b) => a.start.localeCompare(b.start));
}

export interface ForecastTotals {
  /** Gross + weighted value per tier. */
  byTier: Record<ForecastTier, { gross: number; weighted: number; count: number }>;
  totalGross: number;
  totalWeighted: number;
}

export function forecastTotals(
  state: AppState,
  trade: TradeFilter = "all",
): ForecastTotals {
  const byTier = {
    confirmed: { gross: 0, weighted: 0, count: 0 },
    highConfidence: { gross: 0, weighted: 0, count: 0 },
    submitted: { gross: 0, weighted: 0, count: 0 },
  } as ForecastTotals["byTier"];

  for (const e of scheduleEntries(state, trade)) {
    byTier[e.tier].gross += e.grossValue;
    byTier[e.tier].weighted += e.weightedValue;
    byTier[e.tier].count += 1;
  }

  const totalGross =
    byTier.confirmed.gross + byTier.highConfidence.gross + byTier.submitted.gross;
  const totalWeighted =
    byTier.confirmed.weighted +
    byTier.highConfidence.weighted +
    byTier.submitted.weighted;

  return { byTier, totalGross, totalWeighted };
}

export interface MonthBucket {
  /** Start-of-month ISO key. */
  monthIso: string;
  /** Probability-weighted revenue recognized this month, per tier. */
  revenue: Record<ForecastTier, number>;
  /** Crew needed this month (unweighted), per trade — staffing is trade-specific. */
  crew: Record<Trade, number>;
  totalRevenue: number;
  totalCrew: number;
}

function zeroTier(): Record<ForecastTier, number> {
  return { confirmed: 0, highConfidence: 0, submitted: 0 };
}

function zeroTrade(): Record<Trade, number> {
  return { masonry: 0, concrete: 0 };
}

function overlaps(aS: number, aE: number, bS: number, bE: number): boolean {
  return aS <= bE && bS <= aE;
}

/**
 * The full forecast window bucketed by calendar month. Each project's weighted
 * value is spread evenly across the months it runs; its crew is added to every
 * month it's on site. Returns [] when there's nothing to forecast.
 */
export function monthlyForecast(
  state: AppState,
  trade: TradeFilter = "all",
): MonthBucket[] {
  const entries = scheduleEntries(state, trade);
  if (entries.length === 0) return [];

  let min = entries[0].start;
  let max = entries[0].end;
  for (const e of entries) {
    if (e.start < min) min = e.start;
    if (e.end > max) max = e.end;
  }

  const months = eachMonthOfInterval({
    start: startOfMonth(new Date(min)),
    end: startOfMonth(new Date(max)),
  });

  const buckets: MonthBucket[] = months.map((m) => ({
    monthIso: m.toISOString(),
    revenue: zeroTier(),
    crew: zeroTrade(),
    totalRevenue: 0,
    totalCrew: 0,
  }));

  for (const e of entries) {
    const eS = new Date(e.start).getTime();
    const eE = new Date(e.end).getTime();

    // Which buckets does this project touch?
    const touched: number[] = [];
    buckets.forEach((b, i) => {
      const mS = new Date(b.monthIso).getTime();
      const mE = endOfMonth(new Date(b.monthIso)).getTime();
      if (overlaps(eS, eE, mS, mE)) touched.push(i);
    });
    if (touched.length === 0) continue;

    const revenuePerMonth = e.weightedValue / touched.length;
    for (const i of touched) {
      buckets[i].revenue[e.tier] += revenuePerMonth;
      buckets[i].crew[e.bid.trade] += e.crew;
    }
  }

  for (const b of buckets) {
    b.totalRevenue =
      b.revenue.confirmed + b.revenue.highConfidence + b.revenue.submitted;
    b.totalCrew = b.crew.masonry + b.crew.concrete;
  }

  return buckets;
}
