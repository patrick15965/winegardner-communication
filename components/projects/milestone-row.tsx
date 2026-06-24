"use client";

import { CircleDot, CircleCheck, CircleDashed, AlertTriangle } from "lucide-react";
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
  MILESTONE_STATUS_LABEL,
  MILESTONE_STATUS_ORDER,
  ROLE_LABEL,
  shortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MilestoneStatus, ProjectMilestone } from "@/lib/store/types";

const STATUS_ICON: Record<MilestoneStatus, React.ReactNode> = {
  pending: <CircleDashed className="size-4 text-muted-foreground" />,
  inProgress: <CircleDot className="size-4 text-sky-500" />,
  done: <CircleCheck className="size-4 text-emerald-500" />,
  atRisk: <AlertTriangle className="size-4 text-red-500" />,
};

export function MilestoneRow({ item }: { item: ProjectMilestone }) {
  const { updateMilestone } = useAppStore();

  return (
    <Card className={cn(item.status === "atRisk" && "border-red-500/40")}>
      <CardContent className="flex flex-wrap items-center gap-3 py-3">
        <span className="shrink-0">{STATUS_ICON[item.status]}</span>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              item.status === "done" && "text-muted-foreground line-through",
            )}
          >
            {item.label}
          </p>
          <p className="text-xs text-muted-foreground">
            {ROLE_LABEL[item.ownerRole]} · target {shortDate(item.targetDate)}
          </p>
        </div>
        <Select
          value={item.status}
          onValueChange={(v) =>
            updateMilestone(item.id, { status: v as MilestoneStatus })
          }
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MILESTONE_STATUS_ORDER.map((s) => (
              <SelectItem key={s} value={s}>
                {MILESTONE_STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
