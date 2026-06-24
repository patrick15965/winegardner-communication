"use client";

import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store/store-context";
import {
  isProcurementAtRisk,
  procurementOrderBy,
} from "@/lib/store/selectors";
import {
  PROCUREMENT_CATEGORY_LABEL,
  PROCUREMENT_STATUS_LABEL,
  PROCUREMENT_STATUS_ORDER,
  ROLE_LABEL,
  shortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProcurementItem, ProcurementStatus } from "@/lib/store/types";

export function ProcurementRow({ item }: { item: ProcurementItem }) {
  const { updateProcurementItem } = useAppStore();
  const atRisk = isProcurementAtRisk(item);
  const orderBy = procurementOrderBy(item);

  return (
    <Card className={cn(atRisk && "border-red-500/40")}>
      <CardContent className="space-y-2 py-3.5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {PROCUREMENT_CATEGORY_LABEL[item.category]}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {item.vendor ?? "Vendor TBD"}
              {item.quantity ? ` · ${item.quantity}` : ""} ·{" "}
              {item.leadTimeWeeks} wk lead · {ROLE_LABEL[item.ownerRole]}
            </p>
          </div>

          <Select
            value={item.status}
            onValueChange={(v) =>
              updateProcurementItem(item.id, { status: v as ProcurementStatus })
            }
          >
            <SelectTrigger size="sm" className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROCUREMENT_STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {PROCUREMENT_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="size-3.5" /> Order by {shortDate(orderBy)}
          </span>
          <span className="text-muted-foreground">
            Need by {shortDate(item.needBy)}
          </span>
          {atRisk && (
            <span className="flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
              <AlertTriangle className="size-3.5" /> At risk — release the PO now
            </span>
          )}
        </div>

        {item.note && (
          <p className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground">
            {item.note}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
