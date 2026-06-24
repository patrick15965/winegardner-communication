"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CREW_CAPACITY,
  TIER_META,
  type ForecastTier,
  type MonthBucket,
} from "@/lib/store/forecast";
import {
  TRADE_LABEL,
  TRADE_META,
  compactCurrency,
  monthLabel,
} from "@/lib/format";
import type { Trade } from "@/lib/store/types";
import { cn } from "@/lib/utils";

const TIER_ORDER: ForecastTier[] = ["confirmed", "highConfidence", "submitted"];
const TRADE_ORDER: Trade[] = ["masonry", "concrete"];

type Series<K extends string> = { key: K; color: string };

export function ScheduleRollup({ buckets }: { buckets: MonthBucket[] }) {
  if (buckets.length === 0) return null;

  const maxRevenue = Math.max(...buckets.map((b) => b.totalRevenue), 1);
  const maxCrew = Math.max(...buckets.map((b) => b.totalCrew), CREW_CAPACITY, 1);

  // Only chart trades that actually have crew in the window (respects the filter).
  const activeTrades = TRADE_ORDER.filter((t) =>
    buckets.some((b) => b.crew[t] > 0),
  );

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {/* Revenue — by confidence tier */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Expected revenue by month</CardTitle>
          <p className="text-xs text-muted-foreground">
            Probability-weighted (value × win likelihood), spread across each
            project&apos;s run.
          </p>
        </CardHeader>
        <CardContent>
          <StackedBars
            buckets={buckets}
            max={maxRevenue}
            series={TIER_ORDER.map((t) => ({ key: t, color: TIER_META[t].bar }))}
            valueOf={(b, k) => b.revenue[k as ForecastTier]}
            totalOf={(b) => b.totalRevenue}
            formatTotal={(v) => compactCurrency(v)}
          />
        </CardContent>
      </Card>

      {/* Staffing — by trade */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Crew demand by month</CardTitle>
          <p className="text-xs text-muted-foreground">
            Headcount by trade if the work lands. Dashed line is field capacity
            (~{CREW_CAPACITY}).
          </p>
        </CardHeader>
        <CardContent>
          <StackedBars
            buckets={buckets}
            max={maxCrew}
            series={activeTrades.map((t) => ({ key: t, color: TRADE_META[t].bar }))}
            valueOf={(b, k) => b.crew[k as Trade]}
            totalOf={(b) => b.totalCrew}
            formatTotal={(v) => `${Math.round(v)}`}
            capacity={CREW_CAPACITY}
          />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {activeTrades.map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <span className={cn("size-2.5 rounded-sm", TRADE_META[t].dot)} />
                {TRADE_LABEL[t]}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StackedBars<K extends string>({
  buckets,
  max,
  series,
  valueOf,
  totalOf,
  formatTotal,
  capacity,
}: {
  buckets: MonthBucket[];
  max: number;
  series: Series<K>[];
  valueOf: (b: MonthBucket, k: K) => number;
  totalOf: (b: MonthBucket) => number;
  formatTotal: (v: number) => string;
  capacity?: number;
}) {
  return (
    <div className="relative">
      {capacity != null && (
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-red-500/60"
          style={{ bottom: `${(capacity / max) * 100 * 0.82 + 18}%` }}
          aria-hidden
        />
      )}
      <div className="flex h-44 items-end gap-1">
        {buckets.map((b) => {
          const total = totalOf(b);
          return (
            <div
              key={b.monthIso}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
              title={`${monthLabel(b.monthIso)} · ${formatTotal(total)}`}
            >
              <span className="text-[9px] tabular-nums text-muted-foreground opacity-0 group-hover:opacity-100">
                {total > 0 ? formatTotal(total) : ""}
              </span>
              <div className="flex w-full flex-col-reverse overflow-hidden rounded-sm">
                {series.map(({ key, color }) => {
                  const v = valueOf(b, key);
                  if (v <= 0) return null;
                  const h = (v / max) * 100 * 0.82; // leave headroom for labels
                  return (
                    <div
                      key={key}
                      className={cn(color)}
                      style={{ height: `${h}%`, minHeight: v > 0 ? 2 : 0 }}
                    />
                  );
                })}
              </div>
              <span className="text-[9px] text-muted-foreground">
                {monthLabel(b.monthIso).replace(/ '\d+/, "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
