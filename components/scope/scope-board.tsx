"use client";

import { Layers, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScopeCard } from "@/components/scope/scope-card";
import { useAppStore } from "@/lib/store/store-context";
import {
  scopeItemsForBid,
  scopeSummary,
  unpromotedExtractionCount,
  extractionPhaseRan,
} from "@/lib/store/selectors";
import {
  SCOPE_STAGE_CAPTION,
  SCOPE_STAGE_DOT,
  SCOPE_STAGE_LABEL,
  SCOPE_STAGE_ORDER,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bid, ScopeItem, ScopeStage } from "@/lib/store/types";

export function ScopeBoard({ bid }: { bid: Bid }) {
  const { state, deriveScopeItems } = useAppStore();

  const items = scopeItemsForBid(state, bid.id);
  const summary = scopeSummary(state, bid.id);
  const intakeRan = extractionPhaseRan(state, bid.id, "intake");
  const unpromoted = unpromotedExtractionCount(state, bid.id);

  const byStage = (stage: ScopeStage): ScopeItem[] =>
    items
      .filter((i) => i.stage === stage)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  function pull() {
    deriveScopeItems(bid.id);
    toast.success("Scope pulled from findings", {
      description: `${unpromoted} item${unpromoted === 1 ? "" : "s"} added to the board.`,
    });
  }

  // Nothing extracted yet — the board feeds off Plan Room findings.
  if (!intakeRan) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <Sparkles className="size-6" />
          </div>
          <div>
            <p className="text-sm font-semibold">No scope items yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              The scope board fills from the AI plan breakdown. Run the intake
              pass in the Plan Room and every finding lands here as a scope item
              to contextualize, plan, challenge, and approve.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header / summary */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-4">
          <div className="flex size-11 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <Layers className="size-6" />
          </div>
          <div className="min-w-44 flex-1">
            <p className="text-sm font-semibold">Scope items</p>
            <p className="text-xs text-muted-foreground">
              {summary.total} item{summary.total === 1 ? "" : "s"} ·{" "}
              {summary.byStage.approved} approved
              {summary.challenged > 0 ? ` · ${summary.challenged} challenged` : ""}
              {summary.openItems > 0 ? ` · ${summary.openItems} open` : ""}
            </p>
          </div>
          {unpromoted > 0 && (
            <Button size="sm" variant="outline" onClick={pull}>
              <Sparkles className="size-3.5" /> Pull {unpromoted} from findings
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Lifecycle legend */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {SCOPE_STAGE_ORDER.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", SCOPE_STAGE_DOT[s])} />
              {SCOPE_STAGE_LABEL[s]}
            </span>
            {i < SCOPE_STAGE_ORDER.length - 1 && (
              <ArrowRight className="size-3 text-muted-foreground/50" />
            )}
          </span>
        ))}
      </div>

      {/* Kanban */}
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {SCOPE_STAGE_ORDER.map((stage) => {
          const col = byStage(stage);
          return (
            <div key={stage} className="flex w-72 shrink-0 flex-col gap-2">
              <div className="sticky top-0 flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
                <span className={cn("size-2 rounded-full", SCOPE_STAGE_DOT[stage])} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold">{SCOPE_STAGE_LABEL[stage]}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {SCOPE_STAGE_CAPTION[stage]}
                  </p>
                </div>
                <span className="rounded-full bg-background px-1.5 text-[10px] font-semibold text-muted-foreground">
                  {col.length}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {col.map((item) => (
                  <ScopeCard key={item.id} item={item} />
                ))}
                {col.length === 0 && (
                  <div className="rounded-lg border border-dashed py-6 text-center text-[11px] text-muted-foreground/60">
                    —
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
