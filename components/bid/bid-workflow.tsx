"use client";

import { useState } from "react";
import {
  Check,
  Lock,
  ArrowRight,
  ChevronDown,
  FileUp,
  Sparkles,
  ShieldCheck,
  Handshake,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/store-context";
import {
  documentsForBid,
  extractionPhaseRan,
  bidReadiness,
  handoffReadiness,
} from "@/lib/store/selectors";
import { STAGE_ORDER } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bid } from "@/lib/store/types";

type Step = {
  key: string;
  label: string;
  icon: React.ElementType;
  tab: string;
  cta: string;
  sub: string;
  done: boolean;
  locked: boolean;
};

export function BidWorkflow({
  bid,
  goToTab,
}: {
  bid: Bid;
  goToTab: (tab: string) => void;
}) {
  const { state } = useAppStore();

  const docs = documentsForBid(state, bid.id).length;
  const intakeRan = extractionPhaseRan(state, bid.id, "intake");
  const readiness = bidReadiness(state, bid.id);
  const handoff = handoffReadiness(state, bid.id);

  const idx = STAGE_ORDER.indexOf(bid.stage);
  const submittedIdx = STAGE_ORDER.indexOf("submitted");
  const awardedIdx = STAGE_ORDER.indexOf("awarded");
  const beforeAward = idx < awardedIdx;

  const steps: Step[] = [
    {
      key: "plans",
      label: "Pull in plans",
      icon: FileUp,
      tab: "planroom",
      cta: "Import plans",
      sub: docs > 0 ? `${docs} document${docs === 1 ? "" : "s"} in` : "No documents yet",
      done: docs > 0,
      locked: false,
    },
    {
      key: "ai",
      label: "AI breakdown",
      icon: Sparkles,
      tab: "planroom",
      cta: "Run AI breakdown",
      sub: intakeRan ? "Extracted + auto-filled" : "Pulls facts & fills project info",
      done: intakeRan,
      locked: docs === 0,
    },
    {
      key: "review",
      label: "Pre-submission review",
      icon: ShieldCheck,
      tab: "tension",
      cta: "Open review",
      sub:
        idx >= submittedIdx
          ? "Submitted"
          : `${readiness.openConcerns} open · ${readiness.collected}/${readiness.required} signed`,
      done: idx >= submittedIdx,
      locked: false,
    },
    {
      key: "handoff",
      label: "Handoff to ops",
      icon: Handshake,
      tab: "handoff",
      cta: "Open handoff",
      sub:
        bid.stage === "active"
          ? "Complete — ops owns it"
          : beforeAward
            ? "After the bid is won"
            : `${handoff.confirmed}/${handoff.total} confirmed`,
      done: bid.stage === "active",
      locked: beforeAward,
    },
  ];

  const current = steps.find((s) => !s.done && !s.locked);
  const doneCount = steps.filter((s) => s.done).length;
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardContent className="space-y-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {current ? (
                  <>Next: {current.label}</>
                ) : (
                  "Bid path complete"
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {doneCount} of {steps.length} steps done ·{" "}
                <CollapsibleTrigger className="inline-flex items-center gap-0.5 underline-offset-2 hover:underline">
                  {open ? "hide steps" : "show all steps"}
                  <ChevronDown
                    className={cn(
                      "size-3 transition-transform",
                      open && "rotate-180",
                    )}
                  />
                </CollapsibleTrigger>
              </p>
            </div>
            {current ? (
              <Button onClick={() => goToTab(current.tab)} className="gap-1.5">
                {current.cta} <ArrowRight className="size-4" />
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                <Check className="size-4" /> All steps complete
              </span>
            )}
          </div>

          <CollapsibleContent>
            <ol className="flex flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-0">
          {steps.map((step, i) => {
            const isCurrent = current?.key === step.key;
            const Icon = step.icon;
            return (
              <li
                key={step.key}
                className="flex flex-1 items-center gap-2 sm:flex-col sm:items-stretch"
              >
                <button
                  type="button"
                  disabled={step.locked}
                  onClick={() => goToTab(step.tab)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors",
                    isCurrent && "border-primary/40 bg-primary/5",
                    !isCurrent && !step.locked && "hover:bg-muted/50",
                    step.locked && "opacity-50",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full",
                      step.done
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {step.done ? (
                      <Check className="size-4" />
                    ) : step.locked ? (
                      <Lock className="size-3.5" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1.5 text-sm font-medium leading-tight">
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {i + 1}
                      </span>
                      {step.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {step.sub}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
            </ol>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}
