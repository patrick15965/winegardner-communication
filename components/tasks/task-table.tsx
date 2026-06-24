"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Repeat,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersonAvatar } from "@/components/person-badge";
import { TaskDetailSheet } from "@/components/tasks/task-detail";
import { useAppStore } from "@/lib/store/store-context";
import {
  PRIORITY_LABEL,
  PRIORITY_SOLID,
  RECURRENCE_LABEL,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
  TASK_STATUS_SOLID,
  shortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Priority, Task } from "@/lib/store/types";

// Monday-style group accent colors, cycled across project groups.
const GROUP_COLORS = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-teal-500",
];
const RECURRING_COLOR = "bg-indigo-500";
const GENERAL_COLOR = "bg-slate-400";

interface Group {
  key: string;
  label: string;
  color: string;
  tasks: Task[];
}

function buildGroups(tasks: Task[], bidName: (id: string) => string): Group[] {
  const recurring = tasks.filter((t) => t.recurrence);
  const rest = tasks.filter((t) => !t.recurrence);

  const groups: Group[] = [];
  if (recurring.length) {
    groups.push({
      key: "recurring",
      label: "Recurring",
      color: RECURRING_COLOR,
      tasks: recurring,
    });
  }

  // Group the remainder by linked bid, in first-seen order.
  const byBid = new Map<string, Task[]>();
  const noBid: Task[] = [];
  for (const t of rest) {
    if (!t.linkedBidId) {
      noBid.push(t);
      continue;
    }
    const arr = byBid.get(t.linkedBidId) ?? [];
    arr.push(t);
    byBid.set(t.linkedBidId, arr);
  }

  let colorIdx = 0;
  for (const [bidId, items] of byBid) {
    groups.push({
      key: bidId,
      label: bidName(bidId),
      color: GROUP_COLORS[colorIdx % GROUP_COLORS.length],
      tasks: items,
    });
    colorIdx += 1;
  }

  if (noBid.length) {
    groups.push({
      key: "general",
      label: "General",
      color: GENERAL_COLOR,
      tasks: noBid,
    });
  }

  return groups;
}

function StatusPill({ task }: { task: Task }) {
  const { updateTaskStatus } = useAppStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "w-full rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-opacity hover:opacity-90",
          TASK_STATUS_SOLID[task.status],
        )}
      >
        {TASK_STATUS_LABEL[task.status]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {TASK_STATUS_ORDER.map((s) => (
          <DropdownMenuItem
            key={s}
            disabled={s === task.status}
            onClick={() => updateTaskStatus(task.id, s)}
          >
            <span
              className={cn("size-2.5 rounded-full", TASK_STATUS_SOLID[s])}
            />
            {TASK_STATUS_LABEL[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PriorityPill({ task }: { task: Task }) {
  const { updateTask } = useAppStore();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "w-full rounded-md px-2.5 py-1 text-xs font-medium outline-none transition-opacity hover:opacity-90",
          PRIORITY_SOLID[task.priority],
        )}
      >
        {PRIORITY_LABEL[task.priority]}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {(["high", "medium", "low"] as Priority[]).map((p) => (
          <DropdownMenuItem
            key={p}
            disabled={p === task.priority}
            onClick={() => updateTask(task.id, { priority: p })}
          >
            <span className={cn("size-2.5 rounded-full", PRIORITY_SOLID[p])} />
            {PRIORITY_LABEL[p]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TaskTable({ tasks }: { tasks: Task[] }) {
  const { state, getPerson } = useAppStore();
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const bidName = (id: string) =>
    state.bids.find((b) => b.id === id)?.name ?? "Unknown project";
  const groups = buildGroups(tasks, bidName);
  const openTask = tasks.find((t) => t.id === openTaskId) ?? null;

  function toggle(key: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border py-12 text-center text-sm text-muted-foreground">
        No tasks match these filters.
      </p>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-auto">Task</TableHead>
              <TableHead className="w-40">Owner</TableHead>
              <TableHead className="w-36">Status</TableHead>
              <TableHead className="w-32">Priority</TableHead>
              <TableHead className="w-32">Due</TableHead>
              <TableHead className="w-32">Repeats</TableHead>
            </TableRow>
          </TableHeader>
          {groups.map((group) => {
            const isCollapsed = collapsed.has(group.key);
            return (
              <TableBody key={group.key}>
                <TableRow
                  className="cursor-pointer border-b-0 bg-muted/30 hover:bg-muted/50"
                  onClick={() => toggle(group.key)}
                >
                  <TableCell colSpan={6} className="py-2">
                    <span className="flex items-center gap-2">
                      <span className={cn("h-4 w-1 rounded-full", group.color)} />
                      {isCollapsed ? (
                        <ChevronRight className="size-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="size-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{group.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {group.tasks.length}
                      </span>
                    </span>
                  </TableCell>
                </TableRow>

                {!isCollapsed &&
                  group.tasks.map((task) => {
                    const owner = getPerson(task.assigneeId);
                    const commentCount = task.comments?.length ?? 0;
                    const overdue =
                      task.dueDate &&
                      task.status !== "done" &&
                      new Date(task.dueDate) < new Date();
                    return (
                      <TableRow key={task.id} className="group">
                        <TableCell>
                          <button
                            type="button"
                            onClick={() => setOpenTaskId(task.id)}
                            className={cn(
                              "flex w-full items-center gap-2 truncate text-left text-sm hover:underline",
                              task.status === "done" &&
                                "text-muted-foreground line-through",
                            )}
                          >
                            <span className="truncate">{task.title}</span>
                            {commentCount > 0 && (
                              <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
                                <MessageSquare className="size-3.5" />
                                {commentCount}
                              </span>
                            )}
                          </button>
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1.5">
                            <PersonAvatar person={owner} size="sm" />
                            <span className="truncate text-xs text-muted-foreground">
                              {owner?.name}
                            </span>
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusPill task={task} />
                        </TableCell>
                        <TableCell>
                          <PriorityPill task={task} />
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-xs",
                              overdue
                                ? "font-medium text-red-600 dark:text-red-400"
                                : "text-muted-foreground",
                            )}
                          >
                            {task.dueDate ? shortDate(task.dueDate) : "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {task.recurrence ? (
                            <span className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-300">
                              <Repeat className="size-3.5" />
                              {RECURRENCE_LABEL[task.recurrence.cadence]}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            );
          })}
        </Table>
      </div>

      {openTask && (
        <TaskDetailSheet
          task={openTask}
          open={openTaskId !== null}
          onOpenChange={(o) => !o && setOpenTaskId(null)}
        />
      )}
    </>
  );
}
