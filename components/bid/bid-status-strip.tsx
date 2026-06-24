"use client";

import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/store-context";
import {
  bidReadiness,
  handoffReadiness,
  standardsForBid,
  tasksForBid,
} from "@/lib/store/selectors";
import type { Bid } from "@/lib/store/types";

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  tone?: "danger" | "default";
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          tone === "danger" && "text-red-600 dark:text-red-400",
        )}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Compact, always-visible health row. Replaces the dense "At a glance" card
 * that used to be buried inside the Overview tab — status now stays on screen
 * no matter which tab the user is in.
 */
export function BidStatusStrip({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const readiness = bidReadiness(state, bid.id);
  const handoff = handoffReadiness(state, bid.id);
  const openTasks = tasksForBid(state, bid.id).filter(
    (t) => t.status !== "done",
  ).length;
  const linkedStandards = standardsForBid(state, bid.id).length;

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-lg border bg-muted/30 px-4 py-3">
      <Stat
        label="Readiness"
        value={readiness.ready ? "Ready to submit" : "In review"}
      />
      <Stat
        label="Open concerns"
        value={readiness.openConcerns}
        tone={readiness.openConcerns ? "danger" : "default"}
      />
      <Stat
        label="Sign-offs"
        value={`${readiness.collected}/${readiness.required}`}
      />
      {handoff.total > 0 && (
        <Stat
          label="Handoff"
          value={`${handoff.confirmed}/${handoff.total}`}
        />
      )}
      <Stat label="Open tasks" value={openTasks} />
      <Stat label="Standards" value={linkedStandards} />
    </div>
  );
}
