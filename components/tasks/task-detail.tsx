"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarIcon, Link2, Repeat, Send, Sparkles, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PersonAvatar } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import {
  PRIORITY_ACCENT,
  PRIORITY_LABEL,
  RECURRENCE_LABEL,
  RECURRENCE_ORDER,
  ROLE_LABEL,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
  relativeTime,
  shortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  Priority,
  RecurrenceCadence,
  Task,
  TaskStatus,
} from "@/lib/store/types";

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
}: {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    state,
    getPerson,
    currentUser,
    updateTask,
    updateTaskStatus,
    reassignTask,
    addTaskComment,
  } = useAppStore();

  const creator = getPerson(task.createdById);
  const bid = task.linkedBidId
    ? state.bids.find((b) => b.id === task.linkedBidId)
    : undefined;
  const comments = task.comments ?? [];

  // Title / description edit in local state, commit on blur so a half-typed
  // title never lands in the store.
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [comment, setComment] = useState("");

  const overdue =
    task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date();

  function commitTitle() {
    const next = title.trim();
    if (next && next !== task.title) updateTask(task.id, { title: next });
    else setTitle(task.title);
  }

  function commitDescription() {
    const next = description.trim();
    if (next !== (task.description ?? "")) {
      updateTask(task.id, { description: next || undefined });
    }
  }

  function submitComment() {
    const text = comment.trim();
    if (!text) return;
    addTaskComment(task.id, text);
    setComment("");
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <div className="flex flex-wrap items-center gap-1.5">
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
            {bid && (
              <Link href={`/pipeline/${bid.id}`}>
                <Badge variant="outline" className="gap-1 hover:bg-muted">
                  <Link2 className="size-3" />
                  {bid.name}
                </Badge>
              </Link>
            )}
          </div>
          <SheetTitle className="sr-only">Task detail</SheetTitle>
          <SheetDescription className="sr-only">
            View and edit this task and its discussion.
          </SheetDescription>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            className="mt-1 h-auto border-0 px-0 text-base font-medium shadow-none focus-visible:ring-0 dark:bg-transparent"
          />
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          {/* Properties */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={task.status}
                onValueChange={(v) => updateTaskStatus(task.id, v as TaskStatus)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {TASK_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select
                value={task.priority}
                onValueChange={(v) =>
                  updateTask(task.id, { priority: v as Priority })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["high", "medium", "low"] as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Assignee</Label>
              <Select
                value={task.assigneeId}
                onValueChange={(v) => reassignTask(task.id, v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {state.people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} · {ROLE_LABEL[p.role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Due date</Label>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start gap-2 font-normal",
                        overdue && "text-red-600 dark:text-red-400",
                      )}
                    >
                      <CalendarIcon className="size-4" />
                      {task.dueDate ? shortDate(task.dueDate) : "None"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={task.dueDate ? new Date(task.dueDate) : undefined}
                      onSelect={(d) =>
                        updateTask(task.id, { dueDate: d?.toISOString() })
                      }
                    />
                  </PopoverContent>
                </Popover>
                {task.dueDate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0 text-muted-foreground"
                    onClick={() => updateTask(task.id, { dueDate: undefined })}
                    aria-label="Clear due date"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Linked bid */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Linked bid</Label>
            <Select
              value={task.linkedBidId ?? "none"}
              onValueChange={(v) =>
                updateTask(task.id, {
                  linkedBidId: v === "none" ? undefined : v,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {state.bids.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurrence */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Repeats</Label>
            <Select
              value={task.recurrence?.cadence ?? "none"}
              onValueChange={(v) =>
                updateTask(task.id, {
                  recurrence:
                    v === "none"
                      ? undefined
                      : { cadence: v as RecurrenceCadence },
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Does not repeat</SelectItem>
                {RECURRENCE_ORDER.map((c) => (
                  <SelectItem key={c} value={c}>
                    {RECURRENCE_LABEL[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {task.recurrence && (
              <p className="text-[11px] text-muted-foreground">
                Completing this task creates the next occurrence automatically.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={commitDescription}
              rows={3}
              placeholder="Add detail…"
            />
          </div>

          {/* Discussion */}
          <div className="space-y-2.5">
            <Label className="text-xs text-muted-foreground">
              Discussion {comments.length > 0 && `(${comments.length})`}
            </Label>

            {comments.length > 0 ? (
              <ul className="space-y-2">
                {comments.map((c) => {
                  const author = getPerson(c.authorId);
                  return (
                    <li key={c.id} className="rounded-md bg-muted/40 p-2.5">
                      <div className="flex items-center gap-2">
                        <PersonAvatar person={author} size="sm" />
                        <span className="text-xs font-medium">
                          {author?.name}
                        </span>
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          {relativeTime(c.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-snug">{c.body}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                No comments yet. Use this to coordinate across estimating and ops.
              </p>
            )}

            <div className="flex items-end gap-2">
              <PersonAvatar person={currentUser} size="sm" className="mb-1" />
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                    e.preventDefault();
                    submitComment();
                  }
                }}
                placeholder="Add a comment…"
                className="min-h-9 resize-none"
                rows={2}
              />
              <Button
                size="icon"
                onClick={submitComment}
                disabled={!comment.trim()}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer meta */}
        <div className="border-t p-4 text-xs text-muted-foreground">
          Created by {creator?.name ?? "—"} {relativeTime(task.createdAt)}
        </div>
      </SheetContent>
    </Sheet>
  );
}
