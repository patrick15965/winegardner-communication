"use client";

import { useState } from "react";
import { CalendarClock, Users, Milestone as MilestoneIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MilestoneRow } from "@/components/projects/milestone-row";
import { useAppStore } from "@/lib/store/store-context";
import { milestonesForBid, projectPlanForBid, projectProgress } from "@/lib/store/selectors";
import { ROLE_LABEL } from "@/lib/format";
import type { Bid, Role } from "@/lib/store/types";

const NONE = "none";

function toDateInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export function ProjectPlanView({ bid }: { bid: Bid }) {
  const { state, setProjectPlan } = useAppStore();
  const plan = projectPlanForBid(state, bid.id);

  const [summary, setSummary] = useState(plan?.summary ?? "");

  const foremanOptions = state.people.filter(
    (p) => p.role === "Ops" || p.role === "Super",
  );
  const superOptions = state.people.filter((p) => p.role === "Super");

  function saveSummary() {
    setProjectPlan(bid.id, { summary: summary.trim() });
    toast.success("Project notes saved");
  }

  return (
    <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarClock className="size-4" /> Execution plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Mobilization</Label>
              <Input
                type="date"
                value={toDateInput(plan?.mobilizationDate)}
                onChange={(e) =>
                  setProjectPlan(bid.id, {
                    mobilizationDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Foreman</Label>
              <Select
                value={plan?.foremanId ?? NONE}
                onValueChange={(v) =>
                  setProjectPlan(bid.id, {
                    foremanId: v === NONE ? undefined : v,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {foremanOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} · {ROLE_LABEL[p.role as Role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Superintendent</Label>
              <Select
                value={plan?.superId ?? NONE}
                onValueChange={(v) =>
                  setProjectPlan(bid.id, {
                    superId: v === NONE ? undefined : v,
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Unassigned</SelectItem>
                  {superOptions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Crew size</Label>
              <Input
                type="number"
                min={0}
                value={plan?.crewSize ?? ""}
                onChange={(e) =>
                  setProjectPlan(bid.id, {
                    crewSize: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                placeholder="—"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Notes / sequence</Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              placeholder="Key sequencing, access, or coordination notes for the field…"
            />
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={saveSummary} className="gap-1.5">
                <Save className="size-3.5" /> Save notes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  );
}

export function ProjectMilestones({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const milestones = milestonesForBid(state, bid.id);
  const progress = projectProgress(state, bid.id);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <MilestoneIcon className="size-4" /> Milestones
          <span className="text-xs font-normal text-muted-foreground">
            ({progress.done}/{progress.total} done)
          </span>
        </h3>
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <span className="w-28">
            <Progress value={progress.pct} />
          </span>
          <span className="text-xs text-muted-foreground">{progress.pct}%</span>
        </div>
      </div>

      {milestones.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No milestones yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {milestones.map((m) => (
            <MilestoneRow key={m.id} item={m} />
          ))}
        </div>
      )}
    </div>
  );
}
