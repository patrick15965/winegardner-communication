"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  Link2,
  Pencil,
  Receipt,
  Send,
  AlertTriangle,
  CalendarClock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PersonBadge } from "@/components/person-badge";
import { LifecycleStepper } from "@/components/field/lifecycle-stepper";
import { ActivityTimeline } from "@/components/field/activity-timeline";
import { AttachmentPanel } from "@/components/field/attachment-panel";
import { useAppStore } from "@/lib/store/store-context";
import {
  rfiById,
  rfiTimeline,
  daysUntil,
  changeOrderById,
} from "@/lib/store/selectors";
import {
  RFI_STATUS_LABEL,
  RFI_STATUS_ACCENT,
  RFI_ORIGIN_LABEL,
  RFI_PRIORITY_LABEL,
  RFI_PRIORITY_ACCENT,
  RFI_PRIORITY_ORDER,
  RFI_DISCIPLINE_LABEL,
  RFI_DISCIPLINE_ORDER,
  BALL_IN_COURT_LABEL,
  BALL_IN_COURT_ACCENT,
  currency,
  shortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RfiDiscipline, RfiPriority } from "@/lib/store/types";

/** yyyy-mm-dd (date input) ↔ ISO helpers. */
function isoToDateInput(iso?: string): string {
  return iso ? iso.slice(0, 10) : "";
}
function dateInputToIso(v: string): string | undefined {
  return v ? new Date(`${v}T17:00:00.000Z`).toISOString() : undefined;
}

function Info({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function RfiDetail({ bidId, rfiId }: { bidId: string; rfiId: string }) {
  const {
    state,
    getPerson,
    updateRfi,
    updateRfiStatus,
    answerRfi,
    convertRfiToCo,
    addRfiNote,
    addRfiAttachment,
  } = useAppStore();

  const rfi = rfiById(state, rfiId);
  const bid = state.bids.find((b) => b.id === bidId);

  const [answerOpen, setAnswerOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answeredBy, setAnsweredBy] = useState(rfi?.directedTo ?? "");
  const [editOpen, setEditOpen] = useState(false);

  if (!rfi || !bid) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/field/${bidId}?tab=rfis`}>
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
        <p className="text-muted-foreground">RFI not found.</p>
      </div>
    );
  }

  const raisedBy = getPerson(rfi.raisedById);
  const linkedCo = rfi.linkedChangeOrderId
    ? changeOrderById(state, rfi.linkedChangeOrderId)
    : undefined;
  const timeline = rfiTimeline(rfi);
  const due = daysUntil(rfi.responseNeededBy);
  const open = rfi.status !== "closed" && rfi.status !== "converted";

  const steps = [
    { key: "draft", label: "Draft" },
    { key: "submitted", label: "Submitted" },
    { key: "answered", label: "Answered" },
    { key: "resolved", label: "Resolved" },
  ];
  const activeKey =
    rfi.status === "closed" || rfi.status === "converted"
      ? "resolved"
      : rfi.status;
  const terminal =
    rfi.status === "converted"
      ? { label: "→ Change order", variant: "done" as const }
      : rfi.status === "closed"
        ? { label: "Closed — no cost", variant: "done" as const }
        : undefined;

  function submitAnswer() {
    if (!rfi || !answer.trim() || !answeredBy.trim()) return;
    answerRfi(rfi.id, answer.trim(), answeredBy.trim());
    toast.success(`${rfi.number} answered`);
    setAnswerOpen(false);
    setAnswer("");
  }

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/field/${bidId}?tab=rfis`}>
            <ArrowLeft className="size-4" /> {bid.name} · RFIs
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                {rfi.number}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  RFI_STATUS_ACCENT[rfi.status],
                )}
              >
                {RFI_STATUS_LABEL[rfi.status]}
              </span>
              {rfi.priority && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                    RFI_PRIORITY_ACCENT[rfi.priority],
                  )}
                >
                  {RFI_PRIORITY_LABEL[rfi.priority]} priority
                </span>
              )}
              {rfi.ballInCourt && open && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                    BALL_IN_COURT_ACCENT[rfi.ballInCourt],
                  )}
                >
                  Ball in court: {BALL_IN_COURT_LABEL[rfi.ballInCourt]}
                </span>
              )}
            </div>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight">
              {rfi.subject}
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="size-3.5" /> Edit
          </Button>
        </div>
      </div>

      {/* Lifecycle */}
      <Card>
        <CardContent className="py-5">
          <LifecycleStepper
            steps={steps}
            activeKey={activeKey}
            tone={rfi.status === "converted" ? "violet" : "emerald"}
            terminal={terminal}
          />
        </CardContent>
      </Card>

      {/* Response-needed alert */}
      {open && due !== null && (
        <Card
          className={cn(
            due < 0
              ? "border-red-500/40"
              : due <= 3
                ? "border-amber-500/40"
                : undefined,
          )}
        >
          <CardContent className="flex flex-wrap items-center gap-3 py-3">
            <CalendarClock
              className={cn(
                "size-5",
                due < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-amber-600 dark:text-amber-400",
              )}
            />
            <p className="text-sm">
              Response needed by{" "}
              <span className="font-semibold">
                {shortDate(rfi.responseNeededBy)}
              </span>{" "}
              —{" "}
              {due < 0
                ? `${Math.abs(due)} day${Math.abs(due) === 1 ? "" : "s"} overdue`
                : due === 0
                  ? "due today"
                  : `${due} day${due === 1 ? "" : "s"} out`}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="whitespace-pre-line text-sm">{rfi.question}</p>
              {rfi.proposedAnswer && (
                <div className="rounded-md border border-dashed bg-muted/30 px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Our proposed answer (sent to speed the turnaround)
                  </p>
                  <p className="mt-1 text-sm">{rfi.proposedAnswer}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Response</CardTitle>
            </CardHeader>
            <CardContent>
              {rfi.answer ? (
                <div className="rounded-md bg-muted/50 px-3 py-2.5">
                  <p className="text-xs font-medium">
                    {rfi.answeredBy ?? "Response"}
                    {rfi.answeredAt ? ` · ${shortDate(rfi.answeredAt)}` : ""}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm">
                    {rfi.answer}
                  </p>
                </div>
              ) : rfi.status === "submitted" ? (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    Out to {rfi.directedTo ?? "the design team"} — no response
                    logged yet.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => setAnswerOpen(true)}
                  >
                    <CheckCircle2 className="size-3.5" /> Record answer
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not submitted yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline
                events={timeline}
                onAddNote={(body) => addRfiNote(rfi.id, body)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Next step</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {rfi.status === "draft" && (
                <Button
                  className="w-full gap-1.5"
                  onClick={() => {
                    updateRfiStatus(rfi.id, "submitted");
                    toast.success(`${rfi.number} submitted`);
                  }}
                >
                  <Send className="size-4" /> Submit RFI
                </Button>
              )}
              {rfi.status === "submitted" && (
                <Button
                  className="w-full gap-1.5"
                  onClick={() => setAnswerOpen(true)}
                >
                  <CheckCircle2 className="size-4" /> Record answer
                </Button>
              )}
              {rfi.status === "answered" && (
                <>
                  <Button
                    className="w-full gap-1.5"
                    onClick={() => {
                      convertRfiToCo(rfi.id);
                      toast.success(`${rfi.number} converted to a change order`);
                    }}
                  >
                    <ArrowRightLeft className="size-4" /> Convert to change order
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      updateRfiStatus(rfi.id, "closed");
                      toast.success(`${rfi.number} closed — no cost impact`);
                    }}
                  >
                    Close — no cost impact
                  </Button>
                </>
              )}
              {rfi.status === "converted" && linkedCo && (
                <Button variant="outline" className="w-full gap-1.5" asChild>
                  <Link href={`/field/${bidId}/co/${linkedCo.id}`}>
                    <Receipt className="size-4" /> View {linkedCo.number}
                  </Link>
                </Button>
              )}
              {rfi.status === "closed" && (
                <p className="text-sm text-muted-foreground">
                  Closed with no cost impact. Nothing outstanding.
                </p>
              )}
              {rfi.costImpactLikely && rfi.status !== "converted" && (
                <p className="flex items-center gap-1.5 pt-1 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="size-3.5" /> Flagged as a likely
                  change order
                </p>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Info label="Origin">{RFI_ORIGIN_LABEL[rfi.origin]}</Info>
              <Info label="Discipline">
                {rfi.discipline ? RFI_DISCIPLINE_LABEL[rfi.discipline] : "—"}
              </Info>
              <Info label="Raised by">
                {raisedBy ? (
                  <PersonBadge person={raisedBy} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </Info>
              <Info label="Directed to">{rfi.directedTo ?? "—"}</Info>
              <Info label="Created">{shortDate(rfi.createdAt)}</Info>
              <Info label="Response needed">
                {rfi.responseNeededBy ? shortDate(rfi.responseNeededBy) : "—"}
              </Info>
              <Info label="Plan ref">
                {rfi.planRef ? (
                  <span className="inline-flex items-center gap-1">
                    <Link2 className="size-3 text-muted-foreground" />
                    {rfi.planRef}
                  </span>
                ) : (
                  "—"
                )}
              </Info>
              <Info label="Spec ref">{rfi.specRef ?? "—"}</Info>
              <Info label="Est. cost impact">
                {rfi.costImpactEstimate != null
                  ? currency(rfi.costImpactEstimate)
                  : "—"}
              </Info>
              <Info label="Schedule impact">
                {rfi.scheduleImpactDays != null
                  ? `${rfi.scheduleImpactDays} day${rfi.scheduleImpactDays === 1 ? "" : "s"}`
                  : "—"}
              </Info>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Attachments{" "}
                <span className="font-normal text-muted-foreground">
                  ({rfi.attachments?.length ?? 0})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttachmentPanel
                attachments={rfi.attachments ?? []}
                onAdd={(input) => {
                  addRfiAttachment(rfi.id, input);
                  toast.success("Attachment added");
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record answer dialog */}
      <Dialog open={answerOpen} onOpenChange={setAnswerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record the answer — {rfi.number}</DialogTitle>
            <DialogDescription>
              Log the response from the GC / design team. If it carries cost,
              you can convert it straight into a change order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Answered by</Label>
              <Input
                value={answeredBy}
                onChange={(e) => setAnsweredBy(e.target.value)}
                placeholder="e.g. Turner Pacific"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Response</Label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="What did they come back with?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnswerOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitAnswer}
              disabled={!answer.trim() || !answeredBy.trim()}
            >
              Save answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditRfiDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        rfi={rfi}
        onSave={(patch) => {
          updateRfi(rfi.id, patch);
          toast.success(`${rfi.number} updated`);
          setEditOpen(false);
        }}
      />
    </div>
  );
}

function EditRfiDialog({
  open,
  onOpenChange,
  rfi,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  rfi: NonNullable<ReturnType<typeof rfiById>>;
  onSave: (patch: {
    subject: string;
    question: string;
    priority: RfiPriority;
    discipline: RfiDiscipline;
    directedTo?: string;
    planRef?: string;
    specRef?: string;
    responseNeededBy?: string;
    proposedAnswer?: string;
    costImpactLikely: boolean;
    costImpactEstimate?: number;
    scheduleImpactDays?: number;
  }) => void;
}) {
  const [subject, setSubject] = useState(rfi.subject);
  const [question, setQuestion] = useState(rfi.question);
  const [priority, setPriority] = useState<RfiPriority>(
    rfi.priority ?? "normal",
  );
  const [discipline, setDiscipline] = useState<RfiDiscipline>(
    rfi.discipline ?? "architectural",
  );
  const [directedTo, setDirectedTo] = useState(rfi.directedTo ?? "");
  const [planRef, setPlanRef] = useState(rfi.planRef ?? "");
  const [specRef, setSpecRef] = useState(rfi.specRef ?? "");
  const [needBy, setNeedBy] = useState(isoToDateInput(rfi.responseNeededBy));
  const [proposed, setProposed] = useState(rfi.proposedAnswer ?? "");
  const [costLikely, setCostLikely] = useState(rfi.costImpactLikely ?? false);
  const [costEst, setCostEst] = useState(
    rfi.costImpactEstimate != null ? String(rfi.costImpactEstimate) : "",
  );
  const [schedDays, setSchedDays] = useState(
    rfi.scheduleImpactDays != null ? String(rfi.scheduleImpactDays) : "",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {rfi.number}</DialogTitle>
          <DialogDescription>
            Distribution, references, and impact — everything that travels with
            the RFI.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Question</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as RfiPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RFI_PRIORITY_ORDER.map((p) => (
                    <SelectItem key={p} value={p}>
                      {RFI_PRIORITY_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Discipline</Label>
              <Select
                value={discipline}
                onValueChange={(v) => setDiscipline(v as RfiDiscipline)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RFI_DISCIPLINE_ORDER.map((d) => (
                    <SelectItem key={d} value={d}>
                      {RFI_DISCIPLINE_LABEL[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Directed to</Label>
              <Input
                value={directedTo}
                onChange={(e) => setDirectedTo(e.target.value)}
                placeholder="e.g. Turner Pacific"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Response needed by</Label>
              <Input
                type="date"
                value={needBy}
                onChange={(e) => setNeedBy(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Plan ref</Label>
              <Input
                value={planRef}
                onChange={(e) => setPlanRef(e.target.value)}
                placeholder="e.g. A-501 / S-2"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Spec ref</Label>
              <Input
                value={specRef}
                onChange={(e) => setSpecRef(e.target.value)}
                placeholder="e.g. 04 22 00"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Proposed answer (optional)</Label>
            <Textarea
              value={proposed}
              onChange={(e) => setProposed(e.target.value)}
              placeholder="Our suggested resolution, sent with the RFI"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Est. cost impact ($)</Label>
              <Input
                type="number"
                min={0}
                value={costEst}
                onChange={(e) => setCostEst(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Schedule impact (days)</Label>
              <Input
                type="number"
                min={0}
                value={schedDays}
                onChange={(e) => setSchedDays(e.target.value)}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={costLikely}
              onCheckedChange={(v) => setCostLikely(v === true)}
            />
            Likely to carry a cost impact (flag for a change order)
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!subject.trim() || !question.trim()}
            onClick={() =>
              onSave({
                subject: subject.trim(),
                question: question.trim(),
                priority,
                discipline,
                directedTo: directedTo.trim() || undefined,
                planRef: planRef.trim() || undefined,
                specRef: specRef.trim() || undefined,
                responseNeededBy: dateInputToIso(needBy),
                proposedAnswer: proposed.trim() || undefined,
                costImpactLikely: costLikely,
                costImpactEstimate: costEst ? Number(costEst) : undefined,
                scheduleImpactDays: schedDays ? Number(schedDays) : undefined,
              })
            }
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
