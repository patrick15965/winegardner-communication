"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, Receipt } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/store-context";
import {
  handoffForBid,
  procurementSummary,
  isProject,
} from "@/lib/store/selectors";
import { STAGE_ACCENT, STAGE_LABEL, currency } from "@/lib/format";
import { BidOverview } from "@/components/bid/bid-overview";
import {
  ProjectPlanView,
  ProjectMilestones,
} from "@/components/projects/project-plan";
import { ProcurementPlan } from "@/components/projects/procurement-plan";
import { HandoffSequence } from "@/components/handoff/handoff-sequence";
import { StageMoveMenu } from "@/components/pipeline/stage-move-menu";

const VALID_TABS = [
  "overview",
  "plan",
  "milestones",
  "procurement",
  "handoff",
];

export function ProjectWorkspace({ bidId }: { bidId: string }) {
  const { state } = useAppStore();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab =
    requestedTab && VALID_TABS.includes(requestedTab) ? requestedTab : "overview";

  const bid = state.bids.find((b) => b.id === bidId);

  if (!bid || !isProject(bid)) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="size-4" /> Back to projects
          </Link>
        </Button>
        <p className="text-muted-foreground">
          {bid ? "This bid isn't an awarded project yet." : "Project not found."}
        </p>
      </div>
    );
  }

  const handoffCount = handoffForBid(state, bid.id).length;
  const procurement = procurementSummary(state, bid.id);

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/projects">
            <ArrowLeft className="size-4" /> Projects
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{bid.name}</h2>
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
            <Button variant="outline" size="sm" asChild>
              <Link href={`/field/${bid.id}`}>
                <Receipt className="size-3.5" /> Change orders
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/pipeline/${bid.id}`}>
                <ExternalLink className="size-3.5" /> Bid file
              </Link>
            </Button>
            <StageMoveMenu bid={bid} />
          </div>
        </div>
      </div>

      <Tabs defaultValue={initialTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="procurement" className="gap-1.5">
            Procurement
            {procurement.atRisk > 0 && (
              <span className="rounded-full bg-red-500/15 px-1.5 text-[10px] font-semibold text-red-600 dark:text-red-400">
                {procurement.atRisk}
              </span>
            )}
          </TabsTrigger>
          {handoffCount > 0 && (
            <TabsTrigger value="handoff">Handoff</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <BidOverview bid={bid} />
        </TabsContent>
        <TabsContent value="plan" className="mt-4">
          <ProjectPlanView bid={bid} />
        </TabsContent>
        <TabsContent value="milestones" className="mt-4">
          <ProjectMilestones bid={bid} />
        </TabsContent>
        <TabsContent value="procurement" className="mt-4">
          <ProcurementPlan bid={bid} />
        </TabsContent>
        {handoffCount > 0 && (
          <TabsContent value="handoff" className="mt-4">
            <HandoffSequence bid={bid} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
