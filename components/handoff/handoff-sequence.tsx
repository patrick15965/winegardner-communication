"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Check,
  Flag,
  Circle,
  ArrowLeft,
  ArrowRight,
  Users,
  ClipboardCheck,
  FileSpreadsheet,
  ListTree,
  Gauge,
  HardHat,
  UserCheck,
  HelpCircle,
  CalendarClock,
  TriangleAlert,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import {
  handoffForBid,
  handoffReadiness,
  tensionForBid,
} from "@/lib/store/selectors";
import {
  HANDOFF_CATEGORY_LABEL,
  ROLE_LABEL,
  TENSION_TYPE_ACCENT,
  TENSION_TYPE_LABEL,
  STANDARD_CATEGORY_LABEL,
  currency,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  Bid,
  HandoffCategory,
  HandoffStatus,
  Person,
  StandardCategory,
  StandardNote,
  TensionItem,
  TensionItemType,
} from "@/lib/store/types";

type StepDef = {
  key: HandoffCategory;
  icon: React.ComponentType<{ className?: string }>;
  blurb: string;
  tensionTypes: TensionItemType[];
  standardCats: StandardCategory[];
  showValue?: boolean;
};

const STEPS: StepDef[] = [
  {
    key: "sov",
    icon: FileSpreadsheet,
    blurb:
      "Confirm the Schedule of Values matches the awarded contract and the pricing decisions carry over.",
    tensionTypes: ["contingency", "vendorQuote"],
    standardCats: [],
    showValue: true,
  },
  {
    key: "scope",
    icon: ListTree,
    blurb:
      "Walk the assumptions, exclusions and scope gaps the estimator carried — so ops builds what was actually bid.",
    tensionTypes: ["assumption", "exclusion", "scopeGap"],
    standardCats: [],
  },
  {
    key: "productionRates",
    icon: Gauge,
    blurb:
      "Reconcile the production rates the bid was priced at against real field numbers.",
    tensionTypes: ["productionRate"],
    standardCats: ["productionRate"],
  },
  {
    key: "crewPlan",
    icon: HardHat,
    blurb: "Lock the crew plan and ratios with the superintendent.",
    tensionTypes: [],
    standardCats: ["capacity"],
  },
  {
    key: "foreman",
    icon: UserCheck,
    blurb: "Name and brief the foreman who will run the job (two weeks out).",
    tensionTypes: [],
    standardCats: [],
  },
  {
    key: "rfi",
    icon: HelpCircle,
    blurb: "Identify the RFIs that have to go out now to protect the schedule.",
    tensionTypes: ["scopeGap"],
    standardCats: [],
  },
  {
    key: "schedule",
    icon: CalendarClock,
    blurb:
      "Confirm the mobilization date against the GC schedule and any lead-time / wage constraints.",
    tensionTypes: [],
    standardCats: ["leadTime", "wage"],
  },
  {
    key: "risk",
    icon: TriangleAlert,
    blurb: "Hand over the key risks so ops manages them from day one.",
    tensionTypes: ["risk"],
    standardCats: [],
  },
];

function deriveStepStatus(statuses: HandoffStatus[]): HandoffStatus {
  if (statuses.length === 0) return "pending";
  if (statuses.some((s) => s === "flagged")) return "flagged";
  if (statuses.every((s) => s === "confirmed")) return "confirmed";
  return "pending";
}

export function HandoffSequence({ bid }: { bid: Bid }) {
  const {
    state,
    getPerson,
    setHandoffItem,
    setHandoffNotes,
    toggleHandoffAttendee,
    moveBidStage,
  } = useAppStore();

  const items = handoffForBid(state, bid.id);
  const readiness = handoffReadiness(state, bid.id);
  const meeting = state.handoffMeetings[bid.id] ?? {
    attendeeIds: [],
    notes: "",
  };
  const tension = tensionForBid(state, bid.id);

  const [step, setStep] = useState(0);
  const [notes, setNotes] = useState(meeting.notes);
  const isSummary = step >= STEPS.length;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No handoff yet. Move this bid to{" "}
          <span className="font-medium">Awarded</span> or{" "}
          <span className="font-medium">Handoff</span> to start the
          estimating → ops handoff sequence.
        </CardContent>
      </Card>
    );
  }

  const allAddressed = items.every((i) => i.status !== "pending");
  const completed = bid.stage === "active";

  function complete() {
    if (bid.stage !== "active") moveBidStage(bid.id, "active");
    toast.success("Handoff complete", {
      description: `${bid.name} is now Active — ops owns it from here.`,
    });
  }

  const current = !isSummary ? STEPS[step] : null;
  const currentItems = current
    ? items.filter((i) => i.category === current.key)
    : [];
  const carriedTension = current
    ? tension.filter((t) => current.tensionTypes.includes(t.type))
    : [];
  const carriedStandards = current
    ? state.standards.filter(
        (s) =>
          current.standardCats.includes(s.category) &&
          (s.trades.includes(bid.trade) || s.regions.includes(bid.region)),
      )
    : [];

  return (
    <div className="space-y-4">
      {/* Header: progress + attendees */}
      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                Estimating → Ops handoff sequence
              </p>
              <p className="text-xs text-muted-foreground">
                {completed
                  ? "Completed — ops owns this job."
                  : `Step ${Math.min(step + 1, STEPS.length)} of ${STEPS.length} · ${readiness.confirmed}/${readiness.total} confirmed${readiness.flagged ? ` · ${readiness.flagged} flagged` : ""}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-1.5">
                {state.people.map((p) => {
                  const active = meeting.attendeeIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={`${p.name} · ${ROLE_LABEL[p.role]}`}
                      onClick={() => toggleHandoffAttendee(bid.id, p.id)}
                      className={cn(
                        "rounded-full transition-opacity",
                        active ? "opacity-100" : "opacity-30 hover:opacity-60",
                      )}
                    >
                      <PersonAvatar person={p} size="sm" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <Progress value={completed ? 100 : readiness.pct} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
        {/* Step rail */}
        <nav className="flex flex-col gap-1">
          {STEPS.map((s, i) => {
            const stepStatus = deriveStepStatus(
              items.filter((it) => it.category === s.key).map((it) => it.status),
            );
            const activeStep = i === step;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-sm transition-colors",
                  activeStep
                    ? "border-foreground/20 bg-muted"
                    : "border-transparent hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full",
                    stepStatus === "confirmed" &&
                      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    stepStatus === "flagged" &&
                      "bg-red-500/15 text-red-600 dark:text-red-400",
                    stepStatus === "pending" && "bg-muted text-muted-foreground",
                  )}
                >
                  {stepStatus === "confirmed" ? (
                    <Check className="size-3.5" />
                  ) : stepStatus === "flagged" ? (
                    <Flag className="size-3.5" />
                  ) : (
                    <span className="text-[10px] font-semibold">{i + 1}</span>
                  )}
                </span>
                <span className={cn(activeStep && "font-medium")}>
                  {HANDOFF_CATEGORY_LABEL[s.key]}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setStep(STEPS.length)}
            className={cn(
              "mt-1 flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-sm transition-colors",
              isSummary
                ? "border-foreground/20 bg-muted"
                : "border-transparent hover:bg-muted/50",
            )}
          >
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <ClipboardCheck className="size-3.5" />
            </span>
            <span className={cn(isSummary && "font-medium")}>Review & complete</span>
          </button>
        </nav>

        {/* Step panel + carried-context reference */}
        <div
          className={cn(
            "grid gap-4",
            !isSummary && "xl:grid-cols-[minmax(0,1fr)_300px]",
          )}
        >
          <div className="min-w-0">
          {!isSummary && current ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <current.icon className="size-5 text-muted-foreground" />
                  {HANDOFF_CATEGORY_LABEL[current.key]}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{current.blurb}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {current.showValue && (
                  <div className="rounded-md border p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Awarded value
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {currency(bid.value)}
                    </p>
                  </div>
                )}

                {/* Confirm / flag the agenda item(s) */}
                {currentItems.map((item) => (
                  <StepItem
                    key={item.id}
                    label={item.label}
                    ownerRole={ROLE_LABEL[item.ownerRole]}
                    status={item.status}
                    note={item.note}
                    onSet={(status, note) => setHandoffItem(item.id, status, note)}
                  />
                ))}

                {/* Nav */}
                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={step === 0}
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                  >
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <Button size="sm" onClick={() => setStep((s) => s + 1)}>
                    {step === STEPS.length - 1 ? "Review" : "Next"}
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Summary / complete */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="size-5 text-muted-foreground" />
                  Review &amp; complete
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Confirm everything is handed over, capture notes, and pass the
                  job to operations.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {STEPS.map((s, i) => {
                    const st = deriveStepStatus(
                      items
                        .filter((it) => it.category === s.key)
                        .map((it) => it.status),
                    );
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setStep(i)}
                        className="flex items-center gap-2 rounded-md border p-2 text-left text-sm hover:bg-muted/50"
                      >
                        {st === "confirmed" ? (
                          <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                        ) : st === "flagged" ? (
                          <Flag className="size-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground" />
                        )}
                        {HANDOFF_CATEGORY_LABEL[s.key]}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Meeting notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    onBlur={() => setHandoffNotes(bid.id, notes)}
                    placeholder="Decisions, open items, who owns what next…"
                    rows={5}
                  />
                </div>

                {completed ? (
                  <div className="flex items-center gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
                    <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
                    Handoff complete — this job is Active and owned by ops.
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      {allAddressed
                        ? "All agenda items addressed."
                        : "Confirm or flag every agenda item to complete the handoff."}
                    </p>
                    <Button
                      onClick={complete}
                      disabled={!allAddressed}
                      className="gap-1.5"
                    >
                      <CheckCircle2 className="size-4" /> Complete handoff
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          </div>

          {!isSummary && (
            <aside className="h-fit xl:sticky xl:top-4">
              <CarriedContext
                tension={carriedTension}
                standards={carriedStandards}
                getPerson={getPerson}
              />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function CarriedContext({
  tension,
  standards,
  getPerson,
}: {
  tension: TensionItem[];
  standards: StandardNote[];
  getPerson: (id: string) => Person | undefined;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Carried from this bid
      </p>
      {tension.length === 0 && standards.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Nothing flagged in the bid carries into this step — just confirm the
          agenda items.
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {tension.map((t) => (
            <div key={t.id} className="rounded-md border bg-background p-2.5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                    TENSION_TYPE_ACCENT[t.type],
                  )}
                >
                  {TENSION_TYPE_LABEL[t.type]}
                </span>
                <span className="text-sm font-medium">{t.title}</span>
                {t.status === "resolved" && (
                  <Badge
                    variant="outline"
                    className="ml-auto gap-1 text-emerald-700 dark:text-emerald-300"
                  >
                    <Check className="size-3" /> resolved
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.detail}</p>
            </div>
          ))}
          {standards.map((s) => (
            <div key={s.id} className="rounded-md border bg-background p-2.5">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {STANDARD_CATEGORY_LABEL[s.category]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  standard · {getPerson(s.authorId)?.name}
                </span>
              </div>
              <p className="mt-1 text-sm">{s.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StepItem({
  label,
  ownerRole,
  status,
  note,
  onSet,
}: {
  label: string;
  ownerRole: string;
  status: HandoffStatus;
  note?: string;
  onSet: (status: HandoffStatus, note?: string) => void;
}) {
  const [draft, setDraft] = useState(note ?? "");
  return (
    <div className="rounded-md border p-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">Owner: {ownerRole}</p>
        </div>
        <ToggleGroup
          type="single"
          size="sm"
          value={status}
          onValueChange={(v) => v && onSet(v as HandoffStatus, draft)}
        >
          <ToggleGroupItem value="pending" aria-label="Pending">
            <Circle className="size-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="confirmed" aria-label="Confirmed">
            <Check className="size-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="flagged" aria-label="Flagged">
            <Flag className="size-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      {status === "flagged" && (
        <div className="mt-2 flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What needs resolving before mobilization?"
            rows={2}
            className="resize-none text-sm"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSet("flagged", draft)}
          >
            Save
          </Button>
        </div>
      )}
      {status !== "flagged" && note && (
        <p className="mt-2 text-xs italic text-muted-foreground">{note}</p>
      )}
    </div>
  );
}
