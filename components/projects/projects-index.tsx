"use client";

import Link from "next/link";
import {
  HardHat,
  ChevronRight,
  Truck,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeading } from "@/components/page-heading";
import { PersonBadge } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import {
  activeProjects,
  procurementSummary,
  projectProgress,
  projectPlanForBid,
} from "@/lib/store/selectors";
import { STAGE_ACCENT, STAGE_LABEL, currency, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProjectsIndex() {
  const { state, getPerson } = useAppStore();
  const projects = activeProjects(state);

  return (
    <div>
      <PageHeading
        title="Active Projects"
        description="Won work, from award to jobsite. Each project carries a procurement plan and a project plan — both generated from trade templates the moment the bid is awarded."
      />

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No awarded projects yet. Win a bid on the board and it lands here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {projects.map((bid) => {
            const proc = procurementSummary(state, bid.id);
            const progress = projectProgress(state, bid.id);
            const plan = projectPlanForBid(state, bid.id);
            const foreman = plan?.foremanId
              ? getPerson(plan.foremanId)
              : undefined;
            return (
              <Link key={bid.id} href={`/projects/${bid.id}`}>
                <Card className="group h-full transition-colors hover:border-foreground/20">
                  <CardContent className="space-y-3 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {bid.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {bid.gc} · {currency(bid.value)}
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
                      {proc.atRisk > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400">
                          <AlertTriangle className="size-3" /> {proc.atRisk} at risk
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Truck className="size-3.5" /> Procurement
                          </span>
                          <span>
                            {proc.ordered + proc.delivered}/{proc.total}
                          </span>
                        </div>
                        <Progress
                          value={
                            proc.total
                              ? Math.round(
                                  ((proc.ordered + proc.delivered) / proc.total) *
                                    100,
                                )
                              : 0
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <HardHat className="size-3.5" /> Milestones
                          </span>
                          <span>
                            {progress.done}/{progress.total}
                          </span>
                        </div>
                        <Progress value={progress.pct} />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarClock className="size-3.5" /> Mobilize{" "}
                        {shortDate(plan?.mobilizationDate)}
                      </span>
                      {foreman ? (
                        <PersonBadge person={foreman} />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Foreman TBD
                        </span>
                      )}
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
