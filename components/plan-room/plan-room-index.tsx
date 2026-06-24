"use client";

import Link from "next/link";
import {
  Sparkles,
  FileText,
  ChevronRight,
  AlertTriangle,
  CircleHelp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";
import { PersonBadge } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import { bidsWithDocuments, planRoomSummary } from "@/lib/store/selectors";
import {
  LIKELIHOOD_ACCENT,
  LIKELIHOOD_LABEL,
  STAGE_ACCENT,
  STAGE_LABEL,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export function PlanRoomIndex() {
  const { state, getPerson } = useAppStore();
  const bids = bidsWithDocuments(state);

  return (
    <div>
      <PageHeading
        title="Plan Room"
        description="Project plans and scope documents land here. An AI pass breaks them down — pulling the facts and surfacing the questions Estimating and Ops need to answer before a bid is committed."
      />

      {bids.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No documents imported yet. Open a bid and import its plans to begin.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {bids.map((bid) => {
            const s = planRoomSummary(state, bid.id);
            const likelihood = bid.submitLikelihood ?? "unset";
            const openTotal = s.openForOps + s.openForEstimating;
            return (
              <Link key={bid.id} href={`/pipeline/${bid.id}?tab=planroom`}>
                <Card className="group h-full transition-colors hover:border-foreground/20">
                  <CardContent className="space-y-3 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {bid.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {bid.gc} · {bid.location}
                        </p>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          STAGE_ACCENT[bid.stage],
                        )}
                      >
                        {STAGE_LABEL[bid.stage]}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                          LIKELIHOOD_ACCENT[likelihood],
                        )}
                      >
                        {LIKELIHOOD_LABEL[likelihood]}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="size-3.5" /> {s.docs} doc
                        {s.docs === 1 ? "" : "s"}
                      </span>
                      {s.intakeRan ? (
                        <>
                          <span className="flex items-center gap-1">
                            <Sparkles className="size-3.5" /> {s.findings} findings
                          </span>
                          {openTotal > 0 && (
                            <span className="flex items-center gap-1 font-medium text-orange-600 dark:text-orange-400">
                              <CircleHelp className="size-3.5" /> {openTotal} open
                            </span>
                          )}
                          {s.openForOps > 0 && (
                            <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                              <AlertTriangle className="size-3.5" />
                              {s.openForOps} for ops
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="font-medium text-foreground">
                          Not yet extracted
                        </span>
                      )}
                    </div>

                    <div className="pt-1">
                      <PersonBadge person={getPerson(bid.estimatorId)} withRole />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
