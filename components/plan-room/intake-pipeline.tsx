"use client";

import { useState } from "react";
import {
  Bot,
  UserRound,
  Check,
  Lock,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PersonAvatar } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import { intakeStepsForBid, intakeSummary } from "@/lib/store/selectors";
import {
  AUTO_STEP_KEYS,
  estimatorStepResult,
} from "@/lib/mock-data/intake";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bid, IntakeStepKey, IntakeStepStatus } from "@/lib/store/types";

const STEP_MS = 850;

export function IntakePipeline({ bid }: { bid: Bid }) {
  const { state, getPerson, completeIntakeStep } = useAppStore();
  const [running, setRunning] = useState<IntakeStepKey | null>(null);
  const [busy, setBusy] = useState(false);

  const steps = intakeStepsForBid(state, bid);
  const summary = intakeSummary(state, bid);
  const docs = state.bidDocuments.filter((d) => d.bidId === bid.id).length;

  const pendingAuto = AUTO_STEP_KEYS.filter(
    (k) => !state.intakeSteps.some((r) => r.bidId === bid.id && r.step === k),
  );

  /** Fire the remaining automated steps one after another, with a beat each. */
  function runAutomation() {
    if (busy || pendingAuto.length === 0 || docs === 0) return;
    setBusy(true);
    pendingAuto.forEach((key, i) => {
      window.setTimeout(() => setRunning(key), i * STEP_MS);
      window.setTimeout(
        () => {
          completeIntakeStep(bid.id, key);
          if (i === pendingAuto.length - 1) {
            setRunning(null);
            setBusy(false);
            toast.success("Intake automation complete", {
              description:
                "Compliance, the plan breakdown, and a scope draft are ready — the estimator steps are unlocked.",
            });
          }
        },
        i * STEP_MS + STEP_MS - 150,
      );
    });
  }

  function completeEstimatorStep(key: IntakeStepKey, title: string) {
    completeIntakeStep(bid.id, key, estimatorStepResult(key));
    toast.success(`${title} — done`);
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-44 flex-1">
            <p className="text-sm font-semibold">Intake pipeline</p>
            <p className="text-xs text-muted-foreground">
              {summary.complete
                ? "Every step complete — this bid is fully worked up."
                : `${summary.done} of ${summary.total} steps done · automation ${summary.autoCompleted}/${summary.autoTotal}`}
            </p>
          </div>
          {pendingAuto.length > 0 ? (
            <Button
              onClick={runAutomation}
              disabled={busy || docs === 0}
              className="gap-1.5"
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Running…
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Run automation
                </>
              )}
            </Button>
          ) : !summary.complete ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">
              <Bot className="size-3.5" /> Automation done
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <Check className="size-3.5" /> Complete
            </span>
          )}
        </div>

        <Progress value={summary.pct} />

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Bot className="size-3.5 text-violet-500" /> Automated
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="size-3.5 text-amber-500" /> Teed up for the
            estimator
          </span>
        </div>

        {docs === 0 && (
          <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Import a document above to start the pipeline.
          </p>
        )}

        {/* Steps */}
        <ol className="space-y-2">
          {steps.map((view, i) => {
            const isRunning = running === view.def.key;
            const status: IntakeStepStatus = isRunning ? "running" : view.status;
            const by = view.run ? getPerson(view.run.completedById) : undefined;
            const isAuto = view.def.owner === "auto";
            const last = i === steps.length - 1;

            return (
              <li key={view.def.key} className="flex gap-3">
                {/* Rail */}
                <div className="flex flex-col items-center">
                  <StepBullet status={status} owner={view.def.owner} />
                  {!last && (
                    <span
                      className={cn(
                        "w-px flex-1",
                        status === "done" ? "bg-emerald-500/40" : "bg-border",
                      )}
                    />
                  )}
                </div>

                {/* Body */}
                <div
                  className={cn(
                    "flex-1 rounded-lg border p-3 transition-colors",
                    status === "ready" && "border-primary/40 bg-primary/5",
                    status === "running" &&
                      "border-violet-500/40 bg-violet-500/5",
                    status === "blocked" && "opacity-55",
                    last ? "mb-0" : "mb-0",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">
                      {view.def.title}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                        isAuto
                          ? "border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300"
                          : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                      )}
                    >
                      {isAuto ? (
                        <Bot className="size-3" />
                      ) : (
                        <UserRound className="size-3" />
                      )}
                      {isAuto ? "Auto" : "Estimator"}
                    </span>
                    <StatusChip status={status} />
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {view.def.detail}
                  </p>

                  {/* Outcome once done */}
                  {status === "done" && view.result && (
                    <p className="mt-2 flex items-start gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span className="min-w-0">
                        {view.result}
                        {by && (
                          <span className="mt-0.5 flex items-center gap-1.5 text-muted-foreground">
                            <PersonAvatar person={by} size="sm" /> {by.name}
                            {view.run && ` · ${relativeTime(view.run.completedAt)}`}
                          </span>
                        )}
                      </span>
                    </p>
                  )}

                  {/* Teed-up CTA for the estimator */}
                  {status === "ready" && !isAuto && view.def.cta && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          completeEstimatorStep(view.def.key, view.def.title)
                        }
                        className="gap-1.5"
                      >
                        {view.def.cta} <ArrowRight className="size-3.5" />
                      </Button>
                    </div>
                  )}

                  {/* The next auto step is queued behind the Run automation button */}
                  {status === "ready" && isAuto && (
                    <p className="mt-2 text-xs font-medium text-violet-700 dark:text-violet-300">
                      Queued — runs when you start the automation.
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

function StepBullet({
  status,
  owner,
}: {
  status: IntakeStepStatus;
  owner: "auto" | "estimator";
}) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full",
        status === "done" &&
          "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
        status === "running" && "bg-violet-500/15 text-violet-600 dark:text-violet-400",
        status === "ready" && "bg-primary text-primary-foreground",
        status === "blocked" && "bg-muted text-muted-foreground",
      )}
    >
      {status === "done" ? (
        <Check className="size-4" />
      ) : status === "running" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : status === "blocked" ? (
        <Lock className="size-3.5" />
      ) : owner === "auto" ? (
        <Bot className="size-4" />
      ) : (
        <UserRound className="size-4" />
      )}
    </span>
  );
}

function StatusChip({ status }: { status: IntakeStepStatus }) {
  const map: Record<IntakeStepStatus, { label: string; cls: string }> = {
    done: {
      label: "Done",
      cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    running: {
      label: "Running",
      cls: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    },
    ready: {
      label: "Ready",
      cls: "bg-primary/10 text-primary",
    },
    blocked: {
      label: "Waiting",
      cls: "bg-muted text-muted-foreground",
    },
  };
  const { label, cls } = map[status];
  return (
    <span
      className={cn(
        "ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
        cls,
      )}
    >
      {label}
    </span>
  );
}
