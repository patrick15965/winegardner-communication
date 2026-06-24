"use client";

import { TaskCard } from "@/components/tasks/task-card";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { useAppStore } from "@/lib/store/store-context";
import { tasksForBid } from "@/lib/store/selectors";
import { TASK_STATUS_LABEL, TASK_STATUS_ORDER } from "@/lib/format";
import type { Bid } from "@/lib/store/types";

export function BidTasks({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const tasks = tasksForBid(state, bid.id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {tasks.length} task{tasks.length === 1 ? "" : "s"} on this bid
        </p>
        <NewTaskDialog defaultBidId={bid.id} defaultAssigneeId={bid.estimatorId} />
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-lg border py-10 text-center text-sm text-muted-foreground">
          No tasks yet. Moving this bid into Estimating or Handoff auto-creates
          the coordinated tasks for that stage.
        </p>
      ) : (
        <div className="space-y-4">
          {TASK_STATUS_ORDER.map((status) => {
            const items = tasks.filter((t) => t.status === status);
            if (items.length === 0) return null;
            return (
              <div key={status} className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {TASK_STATUS_LABEL[status]} ({items.length})
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {items.map((t) => (
                    <TaskCard key={t.id} task={t} showBid={false} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
