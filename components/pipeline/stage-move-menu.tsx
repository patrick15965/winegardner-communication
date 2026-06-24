"use client";

import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/store-context";
import { STAGE_LABEL, STAGE_ORDER } from "@/lib/format";
import type { Bid, BidStage } from "@/lib/store/types";

export function StageMoveMenu({
  bid,
  trigger,
}: {
  bid: Bid;
  trigger?: React.ReactNode;
}) {
  const { moveBidStage, state } = useAppStore();

  function move(toStage: BidStage) {
    if (toStage === bid.stage) return;
    const before = state.tasks.length;
    moveBidStage(bid.id, toStage);
    const spawns =
      toStage === "estimating" || toStage === "handoff"
        ? state.taskTemplates.filter(
            (t) =>
              t.stage === toStage &&
              !state.tasks.some(
                (x) => x.templateId === t.id && x.linkedBidId === bid.id,
              ),
          ).length
        : 0;
    void before;
    if (spawns > 0) {
      toast.success(`Moved to ${STAGE_LABEL[toStage]}`, {
        description: `${spawns} ${STAGE_LABEL[toStage].toLowerCase()} task${spawns > 1 ? "s" : ""} auto-created for ${bid.name}.`,
      });
    } else {
      toast.success(`Moved to ${STAGE_LABEL[toStage]}`, {
        description: bid.name,
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm" className="gap-1">
            Move <ChevronRight className="size-3.5" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Move to stage</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {STAGE_ORDER.map((stage) => (
          <DropdownMenuItem
            key={stage}
            disabled={stage === bid.stage}
            onClick={() => move(stage)}
          >
            {STAGE_LABEL[stage]}
            {stage === bid.stage && (
              <span className="ml-auto text-xs text-muted-foreground">
                current
              </span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
