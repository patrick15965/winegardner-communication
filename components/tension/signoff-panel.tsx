"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ThumbsUp, MessageSquareWarning, CircleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PersonBadge } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import { signOffsForBid } from "@/lib/store/selectors";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bid, SignOffDecision } from "@/lib/store/types";

const DECISION_META: Record<
  SignOffDecision,
  { label: string; icon: React.ReactNode; className: string }
> = {
  approve: {
    label: "Approve",
    icon: <ThumbsUp className="size-3.5" />,
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
  approveWithNotes: {
    label: "Approve w/ notes",
    icon: <MessageSquareWarning className="size-3.5" />,
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  needsChanges: {
    label: "Needs changes",
    icon: <CircleAlert className="size-3.5" />,
    className: "bg-red-500/15 text-red-700 dark:text-red-300",
  },
};

export function SignOffPanel({ bid }: { bid: Bid }) {
  const { state, getPerson, currentUser, setSignOff } = useAppStore();
  const offs = signOffsForBid(state, bid.id);
  const mine = offs.find((s) => s.personId === currentUser.id);

  const [decision, setDecision] = useState<SignOffDecision>(
    mine?.decision ?? "approve",
  );
  const [note, setNote] = useState(mine?.note ?? "");

  function record() {
    setSignOff(bid.id, decision, note.trim() || undefined);
    toast.success(`Sign-off recorded as ${currentUser.name}`, {
      description: DECISION_META[decision].label,
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Stakeholder sign-off</CardTitle>
        <p className="text-sm text-muted-foreground">
          Submission is a team decision — each stakeholder weighs in before this
          bid leaves Pre-Bid Review.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {offs.length > 0 && (
          <ul className="space-y-2">
            {offs.map((s) => {
              const meta = DECISION_META[s.decision];
              return (
                <li
                  key={s.id}
                  className="flex items-start justify-between gap-2 rounded-md border p-2.5"
                >
                  <div className="space-y-1">
                    <PersonBadge person={getPerson(s.personId)} withRole />
                    {s.note && (
                      <p className="text-xs text-muted-foreground">“{s.note}”</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        meta.className,
                      )}
                    >
                      {meta.icon}
                      {meta.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {relativeTime(s.updatedAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="space-y-2 rounded-md border border-dashed p-3">
          <p className="text-xs font-medium text-muted-foreground">
            {mine ? "Update your sign-off" : "Record your sign-off"} as{" "}
            {currentUser.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DECISION_META) as SignOffDecision[]).map((d) => {
              const meta = DECISION_META[d];
              return (
                <Button
                  key={d}
                  type="button"
                  variant={decision === d ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setDecision(d)}
                >
                  {meta.icon}
                  {meta.label}
                </Button>
              );
            })}
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note / condition…"
            rows={2}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button size="sm" onClick={record}>
              {mine ? "Update sign-off" : "Submit sign-off"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
