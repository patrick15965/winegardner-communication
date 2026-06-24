"use client";

import { useState } from "react";
import { KanbanSquare, Table2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PageHeading } from "@/components/page-heading";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskTable } from "@/components/tasks/task-table";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import { useAppStore } from "@/lib/store/store-context";
import { ROLE_LABEL } from "@/lib/format";

export function TasksView() {
  const { state, currentUser } = useAppStore();
  const [assignee, setAssignee] = useState<string>("me");
  const [source, setSource] = useState<string>("all");
  const [view, setView] = useState<"board" | "table">("table");

  const tasks = state.tasks
    .filter((t) => {
      if (assignee === "all") return true;
      if (assignee === "me") return t.assigneeId === currentUser.id;
      return t.assigneeId === assignee;
    })
    .filter((t) => source === "all" || t.source === source);

  return (
    <div>
      <PageHeading
        title="My Work"
        description="Your tasks across every bid. Coordinated tasks appear automatically when a bid enters Estimating or Handoff; switch to Everyone to see the whole team's load."
        actions={<NewTaskDialog />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={assignee} onValueChange={setAssignee}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Everyone</SelectItem>
            <SelectItem value="me">Assigned to me ({currentUser.name})</SelectItem>
            {state.people.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} · {ROLE_LABEL[p.role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={source} onValueChange={setSource}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sources</SelectItem>
            <SelectItem value="template">Auto (templated)</SelectItem>
            <SelectItem value="adhoc">Ad-hoc</SelectItem>
          </SelectContent>
        </Select>

        <span className="ml-auto text-sm text-muted-foreground">
          {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </span>

        <ToggleGroup
          type="single"
          size="sm"
          value={view}
          onValueChange={(v) => v && setView(v as "board" | "table")}
        >
          <ToggleGroupItem value="table" aria-label="Table view">
            <Table2 className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="board" aria-label="Board view">
            <KanbanSquare className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {view === "board" ? (
        <TaskBoard tasks={tasks} />
      ) : (
        <TaskTable tasks={tasks} />
      )}
    </div>
  );
}
