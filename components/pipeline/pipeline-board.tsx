"use client";

import { Fragment } from "react";
import { Handshake } from "lucide-react";
import { BidCard } from "@/components/pipeline/bid-card";
import {
  STAGE_LABEL,
  STAGE_ACCENT,
  STAGE_ZONES,
  GATE_STAGES,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bid, BidStage } from "@/lib/store/types";

function StageColumn({ stage, bids }: { stage: BidStage; bids: Bid[] }) {
  const items = bids.filter((b) => b.stage === stage);
  const gateHint = GATE_STAGES[stage];

  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
              STAGE_ACCENT[stage],
            )}
          >
            {STAGE_LABEL[stage]}
          </span>
          {gateHint && (
            <Handshake className="size-3.5 text-primary" aria-label="Handshake gate" />
          )}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {items.length}
        </span>
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col gap-2 rounded-lg p-2",
          gateHint
            ? "bg-primary/5 ring-1 ring-primary/25"
            : "bg-muted/40",
        )}
      >
        {gateHint && (
          <p className="px-1 pb-0.5 text-[11px] font-medium leading-snug text-primary/80">
            {gateHint}
          </p>
        )}
        {items.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-muted-foreground">
            No bids
          </p>
        ) : (
          items.map((bid) => <BidCard key={bid.id} bid={bid} />)
        )}
      </div>
    </div>
  );
}

export function PipelineBoard({ bids }: { bids: Bid[] }) {
  return (
    <div className="flex items-stretch gap-4 overflow-x-auto pb-4">
      {STAGE_ZONES.map((zone, zi) => (
        <Fragment key={zone.key}>
          {zi > 0 && (
            <div className="flex shrink-0 flex-col items-center justify-center gap-2 px-1 pt-7">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Handshake className="size-4" />
              </div>
              <div className="h-full w-px bg-border" />
            </div>
          )}
          <div className="flex shrink-0 flex-col">
            <div className="mb-2 px-1">
              <span className="text-sm font-semibold">{zone.label}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {zone.caption}
              </span>
            </div>
            <div className="flex gap-3">
              {zone.stages.map((stage) => (
                <StageColumn key={stage} stage={stage} bids={bids} />
              ))}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
