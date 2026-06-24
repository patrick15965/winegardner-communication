"use client";

import { useState } from "react";
import { TrendingUp, CalendarRange, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeading } from "@/components/page-heading";
import { useAppStore } from "@/lib/store/store-context";
import {
  CREW_CAPACITY,
  TIER_META,
  TIER_SHORT,
  TIER_WEIGHT,
  forecastTotals,
  monthlyForecast,
  scheduleEntries,
  type ForecastTier,
  type TradeFilter,
} from "@/lib/store/forecast";
import { TRADE_LABEL, TRADE_META, compactCurrency, currency } from "@/lib/format";
import type { Trade } from "@/lib/store/types";
import { cn } from "@/lib/utils";
import { ScheduleTimeline } from "./schedule-timeline";
import { ScheduleRollup } from "./schedule-rollup";

const TIER_ORDER: ForecastTier[] = ["confirmed", "highConfidence", "submitted"];
const TRADE_ORDER: Trade[] = ["masonry", "concrete"];

export function ScheduleView() {
  const { state } = useAppStore();
  const [trade, setTrade] = useState<TradeFilter>("all");
  const entries = scheduleEntries(state, trade);
  const totals = forecastTotals(state, trade);
  const buckets = monthlyForecast(state, trade);

  const peak = buckets.reduce(
    (acc, b) => (b.totalCrew > acc.crew ? { crew: b.totalCrew, iso: b.monthIso } : acc),
    { crew: 0, iso: "" },
  );

  return (
    <div className="space-y-5">
      <PageHeading
        title="Revenue & Schedule"
        description="Awarded work plus submitted bids, laid out over time and weighted by win confidence. Answers how much revenue is booked vs. expected, when it runs, and the crew it will take."
        actions={<TradeFilterControl value={trade} onChange={setTrade} />}
      />

      <Tabs defaultValue="pipeline">
        <TabsList>
          <TabsTrigger value="pipeline">Backlog &amp; Pipeline</TabsTrigger>
          <TabsTrigger value="timeline">Timeline &amp; Crew</TabsTrigger>
        </TabsList>

        {/* Tab 1 — the numbers: what's booked vs. expected */}
        <TabsContent value="pipeline" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard
              icon={<TrendingUp className="size-4" />}
              label="Confirmed backlog"
              value={currency(totals.byTier.confirmed.gross)}
              sub={`${totals.byTier.confirmed.count} awarded job${
                totals.byTier.confirmed.count === 1 ? "" : "s"
              } · booked`}
              tier="confirmed"
            />
            <KpiCard
              icon={<TrendingUp className="size-4" />}
              label="Pipeline (weighted)"
              value={currency(
                totals.byTier.highConfidence.weighted +
                  totals.byTier.submitted.weighted,
              )}
              sub={`High ${compactCurrency(
                totals.byTier.highConfidence.weighted,
              )} · Submitted ${compactCurrency(
                totals.byTier.submitted.weighted,
              )}`}
              tier="highConfidence"
            />
            <KpiCard
              icon={<CalendarRange className="size-4" />}
              label="Total expected"
              value={currency(totals.totalWeighted)}
              sub={`${compactCurrency(totals.totalGross)} gross potential`}
            />
          </div>

          {/* Staffing callout */}
          {peak.crew > 0 && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                peak.crew > CREW_CAPACITY
                  ? "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300"
                  : "border-border bg-muted/40 text-muted-foreground",
              )}
            >
              <Users className="size-4 shrink-0" />
              <span>
                Peak crew demand is <strong>{peak.crew}</strong> if all this work
                lands — against ~{CREW_CAPACITY} field capacity.
                {peak.crew > CREW_CAPACITY
                  ? " Some pipeline months exceed capacity; sequencing or hiring needed."
                  : " Within capacity."}
              </span>
            </div>
          )}
        </TabsContent>

        {/* Tab 2 — when the work runs and the crew it takes */}
        <TabsContent value="timeline" className="mt-4 space-y-4">
          <ScheduleTimeline entries={entries} />
          <ScheduleRollup buckets={buckets} />
          <Legend />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TradeFilterControl({
  value,
  onChange,
}: {
  value: TradeFilter;
  onChange: (t: TradeFilter) => void;
}) {
  const options: { key: TradeFilter; label: string; dot?: Trade }[] = [
    { key: "all", label: "All trades" },
    ...TRADE_ORDER.map((t) => ({ key: t, label: TRADE_LABEL[t], dot: t })),
  ];
  return (
    <div className="inline-flex items-center rounded-lg border bg-muted/40 p-0.5 text-xs">
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.dot && (
              <span className={cn("size-2 rounded-sm", TRADE_META[o.dot].dot)} />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
  tier,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tier?: ForecastTier;
}) {
  return (
    <Card>
      <CardContent className="space-y-1 py-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {tier && (
            <span className={cn("size-2.5 rounded-sm", TIER_META[tier].dot)} />
          )}
          {!tier && icon}
          <span>{label}</span>
        </div>
        <p className="text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function Legend() {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Confidence:</span>
        {TIER_ORDER.map((tier) => (
          <span key={tier} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm", TIER_META[tier].dot)} />
            {TIER_SHORT[tier]}
            <span className="text-muted-foreground/70">
              ({Math.round(TIER_WEIGHT[tier] * 100)}%)
            </span>
          </span>
        ))}
        <span className="h-3 w-px bg-border" />
        <span className="font-medium text-foreground">Trade:</span>
        {TRADE_ORDER.map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span className={cn("size-2.5 rounded-sm", TRADE_META[t].dot)} />
            {TRADE_LABEL[t]}
          </span>
        ))}
        <span className="text-muted-foreground/70">
          Revenue is weighted by win likelihood; crew is not — it&apos;s the bodies
          needed by trade if the work lands.
        </span>
      </CardContent>
    </Card>
  );
}
