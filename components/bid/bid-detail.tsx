"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/store-context";
import {
  openConcernsForBid,
  handoffForBid,
  tasksForBid,
  openExtractionsForBid,
  openRfisForBid,
  scopeSummary,
  isProject,
} from "@/lib/store/selectors";
import { STAGE_ACCENT, STAGE_LABEL, STAGE_ORDER, currency } from "@/lib/format";
import { BidOverview } from "@/components/bid/bid-overview";
import { BidStatusStrip } from "@/components/bid/bid-status-strip";
import { BidWorkflow } from "@/components/bid/bid-workflow";
import { BidRfis } from "@/components/bid/bid-rfis";
import { TensionCenter } from "@/components/tension/tension-center";
import { PlanRoom } from "@/components/plan-room/plan-room";
import { ScopeBoard } from "@/components/scope/scope-board";
import { HandoffSequence } from "@/components/handoff/handoff-sequence";
import { BidTasks } from "@/components/tasks/bid-tasks";
import { BidStandards } from "@/components/standards/bid-standards";
import { StageMoveMenu } from "@/components/pipeline/stage-move-menu";

const VALID_TABS = [
  "overview",
  "planroom",
  "scope",
  "tension",
  "rfis",
  "handoff",
  "tasks",
  "standards",
];

export function BidDetail({ bidId }: { bidId: string }) {
  const { state } = useAppStore();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab =
    requestedTab && VALID_TABS.includes(requestedTab)
      ? requestedTab
      : "overview";
  const [tab, setTab] = useState(initialTab);
  const bid = state.bids.find((b) => b.id === bidId);

  if (!bid) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/board">
            <ArrowLeft className="size-4" /> Back to board
          </Link>
        </Button>
        <p className="text-muted-foreground">Bid not found.</p>
      </div>
    );
  }

  const openConcerns = openConcernsForBid(state, bid.id);
  const openFindings = openExtractionsForBid(state, bid.id).length;
  const scope = scopeSummary(state, bid.id);
  const openRfis = openRfisForBid(state, bid.id).length;
  const handoffCount = handoffForBid(state, bid.id).length;
  const taskCount = tasksForBid(state, bid.id).filter(
    (t) => t.status !== "done",
  ).length;

  // Stage-gate tabs: only surface what's relevant to where the bid is now.
  // Pre-Bid Review drops off once the bid is past submission and has no open
  // concerns left to resolve; it stays put while concerns are still live.
  const stageIdx = STAGE_ORDER.indexOf(bid.stage);
  const showTension =
    stageIdx <= STAGE_ORDER.indexOf("submitted") || openConcerns > 0;
  const showScope = scope.total > 0;
  const activeTab =
    (tab === "tension" && !showTension) || (tab === "scope" && !showScope)
      ? "overview"
      : tab;

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/board">
            <ArrowLeft className="size-4" /> Board
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                {bid.name}
              </h2>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  STAGE_ACCENT[bid.stage],
                )}
              >
                {STAGE_LABEL[bid.stage]}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {bid.gc} · {bid.location} · {currency(bid.value)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isProject(bid) && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/projects/${bid.id}`}>
                  <Building2 className="size-3.5" /> Project workspace
                </Link>
              </Button>
            )}
            <StageMoveMenu bid={bid} />
          </div>
        </div>
      </div>

      <BidWorkflow bid={bid} goToTab={setTab} />

      <BidStatusStrip bid={bid} />

      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="planroom" className="gap-1.5">
            Plan Room
            {openFindings > 0 && (
              <span className="rounded-full bg-orange-500/15 px-1.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                {openFindings}
              </span>
            )}
          </TabsTrigger>
          {scope.total > 0 && (
            <TabsTrigger value="scope" className="gap-1.5">
              Scope
              {scope.openItems > 0 && (
                <span className="rounded-full bg-violet-500/15 px-1.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                  {scope.openItems}
                </span>
              )}
            </TabsTrigger>
          )}
          {showTension && (
            <TabsTrigger value="tension" className="gap-1.5">
              Pre-Bid Review
              {openConcerns > 0 && (
                <span className="rounded-full bg-red-500/15 px-1.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                  {openConcerns}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="rfis" className="gap-1.5">
            RFIs
            {openRfis > 0 && (
              <span className="rounded-full bg-sky-500/15 px-1.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                {openRfis}
              </span>
            )}
          </TabsTrigger>
          {handoffCount > 0 && (
            <TabsTrigger value="handoff">Handoff</TabsTrigger>
          )}
          <TabsTrigger value="tasks" className="gap-1.5">
            Tasks
            {taskCount > 0 && (
              <span className="rounded-full bg-muted px-1.5 text-[10px] font-semibold">
                {taskCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <BidOverview bid={bid} />
        </TabsContent>
        <TabsContent value="planroom" className="mt-4">
          <PlanRoom bid={bid} />
        </TabsContent>
        {showScope && (
          <TabsContent value="scope" className="mt-4">
            <ScopeBoard bid={bid} />
          </TabsContent>
        )}
        {showTension && (
          <TabsContent value="tension" className="mt-4">
            <TensionCenter bid={bid} />
          </TabsContent>
        )}
        <TabsContent value="rfis" className="mt-4">
          <BidRfis bid={bid} />
        </TabsContent>
        {handoffCount > 0 && (
          <TabsContent value="handoff" className="mt-4">
            <HandoffSequence bid={bid} />
          </TabsContent>
        )}
        <TabsContent value="tasks" className="mt-4">
          <BidTasks bid={bid} />
        </TabsContent>
        <TabsContent value="standards" className="mt-4">
          <BidStandards bid={bid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
