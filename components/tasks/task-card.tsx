"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2, MessageSquare, Repeat, Sparkles, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersonAvatar } from "@/components/person-badge";
import { TaskDetailSheet } from "@/components/tasks/task-detail";
import { useAppStore } from "@/lib/store/store-context";
import {
  PRIORITY_ACCENT,
  PRIORITY_LABEL,
  RECURRENCE_LABEL,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
  shortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/store/types";

export function TaskCard({ task, showBid = true }: { task: Task; showBid?: boolean }) {
  const { state, getPerson, updateTaskStatus, reassignTask } = useAppStore();
  const [detailOpen, setDetailOpen] = useState(false);
  const assignee = getPerson(task.assigneeId);
  const bid = task.linkedBidId
    ? state.bids.find((b) => b.id === task.linkedBidId)
    : undefined;
  const commentCount = task.comments?.length ?? 0;
  const overdue =
    task.dueDate &&
    task.status !== "done" &&
    new Date(task.dueDate) < new Date();

  return (
    <>
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("text/task-id", task.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => setDetailOpen(true)}
        className="cursor-pointer rounded-lg border bg-card p-3 shadow-xs transition-colors hover:border-foreground/20 active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium leading-snug",
              task.status === "done" && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="size-7 shrink-0">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuLabel>Set status</DropdownMenuLabel>
              {TASK_STATUS_ORDER.map((s) => (
                <DropdownMenuItem
                  key={s}
                  disabled={s === task.status}
                  onClick={() => updateTaskStatus(task.id, s)}
                >
                  {TASK_STATUS_LABEL[s]}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Reassign to</DropdownMenuLabel>
              {state.people.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  disabled={p.id === task.assigneeId}
                  onClick={() => reassignTask(task.id, p.id)}
                >
                  {p.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {task.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {task.description}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={cn(PRIORITY_ACCENT[task.priority])}>
            {PRIORITY_LABEL[task.priority]}
          </Badge>
          {task.source === "template" && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="size-3" /> Auto
            </Badge>
          )}
          {task.recurrence && (
            <Badge
              variant="outline"
              className="gap-1 border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
            >
              <Repeat className="size-3" />
              {RECURRENCE_LABEL[task.recurrence.cadence]}
            </Badge>
          )}
          {showBid && bid && (
            <Link href={`/pipeline/${bid.id}`} onClick={(e) => e.stopPropagation()}>
              <Badge variant="outline" className="gap-1 hover:bg-muted">
                <Link2 className="size-3" />
                {bid.name}
              </Badge>
            </Link>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5">
            <PersonAvatar person={assignee} size="sm" />
            <span className="text-xs text-muted-foreground">{assignee?.name}</span>
          </span>
          <span className="inline-flex items-center gap-2">
            {commentCount > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="size-3.5" />
                {commentCount}
              </span>
            )}
            {task.dueDate && (
              <span
                className={cn(
                  "text-xs",
                  overdue
                    ? "font-medium text-red-600 dark:text-red-400"
                    : "text-muted-foreground",
                )}
              >
                {overdue ? "Overdue · " : "Due "}
                {shortDate(task.dueDate)}
              </span>
            )}
          </span>
        </div>
      </div>

      <TaskDetailSheet task={task} open={detailOpen} onOpenChange={setDetailOpen} />
    </>
  );
}
