"use client";

import { Truck, AlertTriangle, PackageCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProcurementRow } from "@/components/projects/procurement-row";
import { AddProcurementItem } from "@/components/projects/add-procurement-item";
import { useAppStore } from "@/lib/store/store-context";
import {
  procurementForBid,
  procurementSummary,
  isProcurementAtRisk,
  projectPlanForBid,
} from "@/lib/store/selectors";
import { PROCUREMENT_STATUS_ORDER, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bid } from "@/lib/store/types";

export function ProcurementPlan({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const items = procurementForBid(state, bid.id);
  const summary = procurementSummary(state, bid.id);
  const plan = projectPlanForBid(state, bid.id);

  const ordered = summary.ordered + summary.delivered;
  const pct = summary.total
    ? Math.round((ordered / summary.total) * 100)
    : 0;

  // At-risk first, then by status order, so the urgent buys sit on top.
  const sorted = [...items].sort((a, b) => {
    const ar = Number(isProcurementAtRisk(b)) - Number(isProcurementAtRisk(a));
    if (ar !== 0) return ar;
    return (
      PROCUREMENT_STATUS_ORDER.indexOf(a.status) -
      PROCUREMENT_STATUS_ORDER.indexOf(b.status)
    );
  });

  return (
    <div className="space-y-5">
      {/* Summary banner */}
      <Card className={cn(summary.atRisk > 0 && "border-red-500/40")}>
        <CardContent className="flex flex-wrap items-center gap-4 py-4">
          <div
            className={cn(
              "flex size-11 items-center justify-center rounded-lg",
              summary.atRisk > 0
                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
            )}
          >
            {summary.atRisk > 0 ? (
              <AlertTriangle className="size-6" />
            ) : (
              <PackageCheck className="size-6" />
            )}
          </div>
          <div className="min-w-40">
            <p className="text-sm font-semibold">
              {summary.atRisk > 0
                ? `${summary.atRisk} order${summary.atRisk === 1 ? "" : "s"} at risk`
                : "Procurement on track"}
            </p>
            <p className="text-xs text-muted-foreground">
              {ordered}/{summary.total} ordered · mobilize{" "}
              {shortDate(plan?.mobilizationDate)}
            </p>
          </div>
          <div className="flex-1 basis-48">
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>Ordered / delivered</span>
              <span>{pct}%</span>
            </div>
            <Progress value={pct} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Truck className="size-4" /> Long-lead & materials
          <span className="text-xs font-normal text-muted-foreground">
            ({items.length})
          </span>
        </h3>
        <AddProcurementItem bid={bid} />
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No procurement items yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((item) => (
            <ProcurementRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
