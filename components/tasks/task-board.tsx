"use client";

import { useState } from "react";
import { TaskCard } from "@/components/tasks/task-card";
import { useAppStore } from "@/lib/store/store-context";
import { TASK_STATUS_LABEL, TASK_STATUS_ORDER } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/store/types";

export function TaskBoard({
  tasks,
  showBid = true,
}: {
  tasks: Task[];
  showBid?: boolean;
}) {
  const { updateTaskStatus } = useAppStore();
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {TASK_STATUS_ORDER.map((status) => {
        const items = tasks.filter((t) => t.status === status);
        return (
          <div key={status} className="flex flex-col">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-medium">
                {TASK_STATUS_LABEL[status]}
              </span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {items.length}
              </span>
            </div>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOver !== status) setDragOver(status);
              }}
              onDragLeave={(e) => {
                // Only clear when the cursor actually leaves the column.
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOver((s) => (s === status ? null : s));
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const id = e.dataTransfer.getData("text/task-id");
                if (id) updateTaskStatus(id, status);
              }}
              className={cn(
                "flex flex-1 flex-col gap-2 rounded-lg bg-muted/40 p-2 transition-colors",
                dragOver === status && "bg-primary/10 ring-2 ring-primary/40",
              )}
            >
              {items.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                  {dragOver === status ? "Drop here" : "—"}
                </p>
              ) : (
                items.map((t) => (
                  <TaskCard key={t.id} task={t} showBid={showBid} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
