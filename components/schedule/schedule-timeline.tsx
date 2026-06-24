"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { eachMonthOfInterval, endOfMonth, startOfMonth } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  TIER_LABEL,
  TIER_META,
  TIER_WEIGHT,
  type ForecastTier,
  type ScheduleEntry,
} from "@/lib/store/forecast";
import {
  TRADE_LABEL,
  TRADE_META,
  compactCurrency,
  monthLabel,
  shortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";

const TIER_ORDER: ForecastTier[] = ["confirmed", "highConfidence", "submitted"];

// "Today" as a client-only value. useSyncExternalStore renders the server
// snapshot (null) during hydration — no mismatch — then swaps to the cached
// client time. Cached so getSnapshot is stable (no render loop).
const noopSubscribe = () => () => {};
let cachedNow: number | null = null;
const clientNow = () => (cachedNow ??= Date.now());

export function ScheduleTimeline({ entries }: { entries: ScheduleEntry[] }) {
  const nowMs = useSyncExternalStore(noopSubscribe, clientNow, () => null);

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No awarded or submitted work to schedule yet.
        </CardContent>
      </Card>
    );
  }

  // One shared date→percent mapping so month headers, gridlines, the "today"
  // marker and every bar line up exactly.
  let minMs = Number.POSITIVE_INFINITY;
  let maxMs = Number.NEGATIVE_INFINITY;
  for (const e of entries) {
    minMs = Math.min(minMs, new Date(e.start).getTime());
    maxMs = Math.max(maxMs, new Date(e.end).getTime());
  }
  const rangeStart = startOfMonth(new Date(minMs)).getTime();
  const rangeEnd = endOfMonth(new Date(maxMs)).getTime();
  const span = rangeEnd - rangeStart || 1;
  const pct = (ms: number) => ((ms - rangeStart) / span) * 100;

  const months = eachMonthOfInterval({
    start: new Date(rangeStart),
    end: new Date(rangeEnd),
  });

  const nowPct = nowMs != null ? pct(nowMs) : 0;
  const nowVisible = nowMs != null && nowMs >= rangeStart && nowMs <= rangeEnd;

  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    items: entries.filter((e) => e.tier === tier),
  })).filter((g) => g.items.length > 0);

  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        {/* Month axis */}
        <div className="relative ml-[clamp(9rem,28%,16rem)] h-5 border-b text-[10px] text-muted-foreground">
          {months.map((m) => (
            <span
              key={m.toISOString()}
              className="absolute -translate-x-px border-l pl-1 leading-5"
              style={{ left: `${pct(m.getTime())}%` }}
            >
              {monthLabel(m.toISOString())}
            </span>
          ))}
          {nowVisible && (
            <span
              className="absolute top-0 z-10 -translate-x-1/2 rounded bg-red-500 px-1 text-[9px] font-medium leading-4 text-white"
              style={{ left: `${nowPct}%` }}
            >
              Today
            </span>
          )}
        </div>

        <div className="space-y-5">
          {grouped.map(({ tier, items }) => (
            <div key={tier} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={cn("size-2.5 rounded-sm", TIER_META[tier].dot)} />
                <span className="text-xs font-semibold">{TIER_LABEL[tier]}</span>
                <span className="text-[10px] text-muted-foreground">
                  {Math.round(TIER_WEIGHT[tier] * 100)}% weight · {items.length} job
                  {items.length === 1 ? "" : "s"}
                </span>
              </div>

              {items.map((e) => (
                <TimelineRow key={e.bid.id} entry={e} pct={pct} />
              ))}
            </div>
          ))}
        </div>

        {/* Footer legend for the today marker */}
        {nowVisible && (
          <p className="flex items-center gap-1.5 pt-1 text-[10px] text-muted-foreground">
            <span className="inline-block h-3 w-px bg-red-500" /> Vertical line marks
            today. Bars span mobilization → demobilization.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TimelineRow({
  entry,
  pct,
}: {
  entry: ScheduleEntry;
  pct: (ms: number) => number;
}) {
  const { bid, tier } = entry;
  const left = pct(new Date(entry.start).getTime());
  const right = pct(new Date(entry.end).getTime());
  const width = Math.max(right - left, 2.5);
  const meta = TIER_META[tier];

  return (
    <div className="group flex items-center gap-2 text-xs">
      <Link
        href={tier === "confirmed" ? `/projects/${bid.id}` : `/pipeline/${bid.id}`}
        className="flex w-[clamp(9rem,28%,16rem)] shrink-0 items-center gap-1.5 truncate pr-2 hover:underline"
        title={`${bid.name} — ${bid.gc} · ${TRADE_LABEL[bid.trade]}`}
      >
        <span
          className={cn("size-2 shrink-0 rounded-sm", TRADE_META[bid.trade].dot)}
          aria-label={TRADE_LABEL[bid.trade]}
        />
        <span className="truncate font-medium">{bid.name}</span>
        <span className="shrink-0 text-muted-foreground">
          {compactCurrency(bid.value)}
        </span>
      </Link>

      <div className="relative h-6 flex-1 rounded bg-muted/40">
        <div
          className={cn(
            "absolute top-0 flex h-6 items-center gap-1 overflow-hidden rounded px-1.5 text-[10px] font-medium text-white",
            meta.bar,
          )}
          style={{ left: `${left}%`, width: `${width}%` }}
          title={`${TRADE_LABEL[bid.trade]} · ${shortDate(entry.start)} → ${shortDate(
            entry.end,
          )} · crew ${entry.crew} · ${compactCurrency(entry.weightedValue)} weighted`}
        >
          <span className="truncate">{entry.crew} crew</span>
        </div>
      </div>
    </div>
  );
}
