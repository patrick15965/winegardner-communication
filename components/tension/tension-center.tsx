"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Send,
  Users,
  Lock,
  ArrowRight,
  ListChecks,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AddTensionItem } from "@/components/tension/add-tension-item";
import { ConcernResolver } from "@/components/tension/concern-resolver";
import { SignOffPanel } from "@/components/tension/signoff-panel";
import { PersonAvatar } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import { bidReadiness, tensionForBid } from "@/lib/store/selectors";
import { ROLE_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bid } from "@/lib/store/types";

type Phase = "resolve" | "signoff";

export function TensionCenter({ bid }: { bid: Bid }) {
  const { state, moveBidStage, setReviewNotes, toggleReviewAttendee } =
    useAppStore();
  const items = tensionForBid(state, bid.id);
  const readiness = bidReadiness(state, bid.id);
  const meeting = state.reviewMeetings[bid.id] ?? { attendeeIds: [], notes: "" };
  const [notes, setNotes] = useState(meeting.notes);

  const allResolved = readiness.openConcerns === 0;
  const [phase, setPhase] = useState<Phase>(allResolved ? "signoff" : "resolve");
  // Don't strand the user on a locked phase.
  const activePhase: Phase = phase === "signoff" && !allResolved ? "resolve" : phase;

  function submit() {
    moveBidStage(bid.id, "submitted");
    toast.success("Bid submitted", {
      description: `${bid.name} moved to Submitted — the whole team signed off.`,
    });
  }

  const steps: { key: Phase; n: number; label: string; sub: string; locked: boolean }[] = [
    {
      key: "resolve",
      n: 1,
      label: "Resolve concerns",
      sub: allResolved
        ? "All resolved"
        : `${readiness.openConcerns} need agreement`,
      locked: false,
    },
    {
      key: "signoff",
      n: 2,
      label: "Team sign-off",
      sub: allResolved
        ? `${readiness.collected}/${readiness.required} signed`
        : "Locked until concerns resolved",
      locked: !allResolved,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Phase stepper */}
      <div className="grid gap-2 sm:grid-cols-2">
        {steps.map((step) => {
          const isActive = activePhase === step.key;
          const isDone = step.key === "resolve" && allResolved;
          return (
            <button
              key={step.key}
              type="button"
              disabled={step.locked}
              onClick={() => setPhase(step.key)}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                isActive && "border-primary/50 bg-primary/5",
                !isActive && !step.locked && "hover:bg-muted/50",
                step.locked && "opacity-50",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                  isDone
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {isDone ? (
                  <Check className="size-4" />
                ) : step.locked ? (
                  <Lock className="size-3.5" />
                ) : (
                  step.n
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium leading-tight">
                  {step.label}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {step.sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {activePhase === "resolve" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <ListChecks className="size-4" /> Work each concern to agreement
            </h3>
            <AddTensionItem bid={bid} />
          </div>

          <ConcernResolver items={items} />

          {/* Gate to sign-off */}
          {items.length > 0 &&
            (allResolved ? (
              <Card className="border-emerald-500/40">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">
                        All concerns resolved
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Every concern reached mutual agreement — collect the
                        team sign-off to submit.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="gap-1.5"
                    onClick={() => setPhase("signoff")}
                  >
                    Continue to sign-off <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                {readiness.openConcerns} concern
                {readiness.openConcerns === 1 ? "" : "s"} still need mutual
                agreement before the team can sign off.
              </p>
            ))}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Submit banner */}
          <Card className={cn(readiness.ready && "border-emerald-500/40")}>
            <CardContent className="flex flex-wrap items-center gap-4 py-4">
              <span className="flex size-11 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-6" />
              </span>
              <div className="min-w-40 flex-1">
                <p className="text-sm font-semibold">
                  {readiness.ready
                    ? "Ready to submit"
                    : "Collecting team sign-off"}
                </p>
                <p className="text-xs text-muted-foreground">
                  All concerns resolved · {readiness.collected}/
                  {readiness.required} sign-offs collected
                </p>
              </div>
              <Button
                onClick={submit}
                disabled={!readiness.ready}
                className="gap-1.5"
              >
                <Send className="size-4" /> Submit bid
              </Button>
            </CardContent>
          </Card>

          {/* Optional review meeting */}
          <Card>
            <CardContent className="space-y-3 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <Users className="size-4 text-muted-foreground" />
                    Review meeting
                    <span className="text-xs font-normal text-muted-foreground">
                      · optional
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pull estimating and ops together to walk the bid, or just
                    collect sign-offs below. Tap a face to mark who joined.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {state.people.map((p) => {
                    const active = meeting.attendeeIds.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        title={`${p.name} · ${ROLE_LABEL[p.role]}`}
                        onClick={() => toggleReviewAttendee(bid.id, p.id)}
                        className={cn(
                          "rounded-full transition-opacity",
                          active
                            ? "opacity-100"
                            : "opacity-30 hover:opacity-60",
                        )}
                      >
                        <PersonAvatar person={p} size="sm" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={() => setReviewNotes(bid.id, notes)}
                placeholder="Meeting notes — decisions, what changed in the bid, who owns follow-ups…"
                rows={3}
              />
            </CardContent>
          </Card>

          <SignOffPanel bid={bid} />
        </div>
      )}
    </div>
  );
}
