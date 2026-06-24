"use client";

import { useState } from "react";
import { Plus, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAppStore } from "@/lib/store/store-context";
import {
  ROLE_LABEL,
  PRIORITY_LABEL,
  RECURRENCE_LABEL,
  RECURRENCE_ORDER,
} from "@/lib/format";
import type { Priority, RecurrenceCadence } from "@/lib/store/types";

export function NewTaskDialog({
  defaultBidId,
  defaultAssigneeId,
  trigger,
}: {
  defaultBidId?: string;
  defaultAssigneeId?: string;
  trigger?: React.ReactNode;
}) {
  const { state, addTask } = useAppStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(
    defaultAssigneeId ?? state.people[0]?.id ?? "",
  );
  const [priority, setPriority] = useState<Priority>("medium");
  const [bidId, setBidId] = useState<string>(defaultBidId ?? "none");
  const [due, setDue] = useState<Date | undefined>(undefined);
  const [repeat, setRepeat] = useState<RecurrenceCadence | "none">("none");

  function submit() {
    if (!title.trim()) return;
    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      assigneeId,
      dueDate: due?.toISOString(),
      priority,
      linkedBidId: bidId === "none" ? undefined : bidId,
      recurrence: repeat === "none" ? undefined : { cadence: repeat },
    });
    toast.success("Task created");
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDue(undefined);
    setRepeat("none");
    if (!defaultBidId) setBidId("none");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" /> New task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a task</DialogTitle>
          <DialogDescription>
            Assign coordinated work to anyone, any time.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Confirm rebar spacing with GC"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional detail…"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
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
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
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
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 font-normal"
                  >
                    <CalendarIcon className="size-4" />
                    {due ? format(due, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={due} onSelect={setDue} />
                </PopoverContent>
              </Popover>
            </div>
            {!defaultBidId && (
              <div className="space-y-1.5">
                <Label>Linked bid</Label>
                <Select value={bidId} onValueChange={setBidId}>
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
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Repeats</Label>
            <Select
              value={repeat}
              onValueChange={(v) => setRepeat(v as RecurrenceCadence | "none")}
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
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={!title.trim()}>
            Create task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
