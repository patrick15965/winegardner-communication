"use client";

import { useState } from "react";
import {
  CircleDot,
  Send,
  MessageSquare,
  ArrowRightLeft,
  CheckCircle2,
  Receipt,
  Paperclip,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PersonAvatar } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import { relativeTime, shortDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActivityEvent, ActivityKind } from "@/lib/store/types";

const KIND_ICON: Record<ActivityKind, typeof CircleDot> = {
  created: CircleDot,
  submitted: Send,
  answered: CheckCircle2,
  statusChange: ArrowRightLeft,
  converted: ArrowRightLeft,
  approved: CheckCircle2,
  billed: Receipt,
  note: MessageSquare,
  attachment: Paperclip,
};

const KIND_TONE: Record<ActivityKind, string> = {
  created: "text-slate-500 bg-slate-500/10",
  submitted: "text-sky-600 bg-sky-500/10",
  answered: "text-amber-600 bg-amber-500/10",
  statusChange: "text-sky-600 bg-sky-500/10",
  converted: "text-violet-600 bg-violet-500/10",
  approved: "text-emerald-600 bg-emerald-500/10",
  billed: "text-violet-600 bg-violet-500/10",
  note: "text-slate-500 bg-slate-500/10",
  attachment: "text-slate-500 bg-slate-500/10",
};

export function ActivityTimeline({
  events,
  onAddNote,
}: {
  events: ActivityEvent[];
  onAddNote: (body: string) => void;
}) {
  const { getPerson, currentUser } = useAppStore();
  const [note, setNote] = useState("");

  function post() {
    if (!note.trim()) return;
    onAddNote(note.trim());
    setNote("");
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-0">
        {events.map((e, i) => {
          const Icon = KIND_ICON[e.kind];
          const actor = e.actorId ? getPerson(e.actorId) : undefined;
          const who = actor?.name ?? e.actorName;
          const last = i === events.length - 1;
          return (
            <li key={e.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full",
                    KIND_TONE[e.kind],
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                {!last && <span className="w-px flex-1 bg-border" />}
              </div>
              <div className={cn("min-w-0 flex-1", last ? "pb-0" : "pb-4")}>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium">
                    {e.kind === "note" ? who ?? "Note" : e.body}
                  </span>
                  <span
                    className="text-[11px] text-muted-foreground"
                    title={shortDate(e.at)}
                  >
                    {relativeTime(e.at)}
                  </span>
                </div>
                {e.kind === "note" ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">{e.body}</p>
                ) : who ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {actor ? "by " : ""}
                    {who}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="flex items-start gap-2 border-t pt-3">
        <PersonAvatar person={currentUser} size="sm" />
        <div className="flex-1 space-y-2">
          <Textarea
            value={note}
            onChange={(ev) => setNote(ev.target.value)}
            placeholder="Add a note to the history…"
            rows={2}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={post} disabled={!note.trim()} className="gap-1.5">
              <Plus className="size-3.5" /> Log note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
