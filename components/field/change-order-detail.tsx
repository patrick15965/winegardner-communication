"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Clock,
  FileText,
  Link2,
  Pencil,
  Plus,
  Ticket,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  changeOrderById,
  rfiById,
  coTimeline,
  coLineSubtotal,
  coMarkupAmount,
  coComputedTotal,
  coAgeDays,
  isChangeOrderOpen,
  daysUntil,
} from "@/lib/store/selectors";
import {
  CO_STATUS_LABEL,
  CO_STATUS_ACCENT,
  CO_STATUS_ORDER,
  CO_ORIGIN_LABEL,
  CO_REASON_LABEL,
  CO_REASON_ORDER,
  CO_PRICING_LABEL,
  CO_PRICING_ORDER,
  CO_COST_CATEGORY_LABEL,
  CO_COST_CATEGORY_ORDER,
  CO_COST_CATEGORY_ACCENT,
  BALL_IN_COURT_LABEL,
  BALL_IN_COURT_ACCENT,
  ROLE_LABEL,
  currency,
  shortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  ChangeOrder,
  CoCostCategory,
  CoLineItem,
  CoPricingMethod,
  CoReason,
  CoStatus,
} from "@/lib/store/types";

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

export function ChangeOrderDetail({
  bidId,
  coId,
}: {
  bidId: string;
  coId: string;
}) {
  const {
    state,
    getPerson,
    updateChangeOrder,
    addCoNote,
    addCoAttachment,
  } = useAppStore();

  const co = changeOrderById(state, coId);
  const bid = state.bids.find((b) => b.id === bidId);

  const [editOpen, setEditOpen] = useState(false);
  const [costOpen, setCostOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approver, setApprover] = useState("");

  if (!co || !bid) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/field/${bidId}?tab=changeorders`}>
            <ArrowLeft className="size-4" /> Back
          </Link>
        </Button>
        <p className="text-muted-foreground">Change order not found.</p>
      </div>
    );
  }

  const raisedBy = getPerson(co.raisedById);
  const sourceRfi = co.sourceRfiId ? rfiById(state, co.sourceRfiId) : undefined;
  const timeline = coTimeline(co);
  const open = isChangeOrderOpen(co);
  const age = coAgeDays(co);
  const due = daysUntil(co.responseNeededBy);
  const hasBreakdown = !!co.lineItems && co.lineItems.length > 0;
  const subtotal = coLineSubtotal(co);
  const markup = coMarkupAmount(co);
  const total = coComputedTotal(co);

  const steps = [
    { key: "draft", label: "Draft" },
    { key: "pendingPM", label: "Pending PM" },
    { key: "submitted", label: "Submitted" },
    { key: "approved", label: "Approved" },
    { key: "billed", label: "Billed" },
  ];
  const activeKey = co.status === "rejected" ? "approved" : co.status;
  const terminal =
    co.status === "rejected"
      ? { label: "Rejected", variant: "stop" as const }
      : undefined;

  function recordApproval() {
    if (!co || !approver.trim()) return;
    updateChangeOrder(co.id, { status: "approved", approvedBy: approver.trim() });
    toast.success(`${co.number} approved`);
    setApproveOpen(false);
    setApprover("");
  }

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href={`/field/${bidId}?tab=changeorders`}>
            <ArrowLeft className="size-4" /> {bid.name} · Change Orders
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                {co.number}
                {co.revision ? ` · Rev ${co.revision}` : ""}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  CO_STATUS_ACCENT[co.status],
                )}
              >
                {CO_STATUS_LABEL[co.status]}
              </span>
              {co.ballInCourt && open && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                    BALL_IN_COURT_ACCENT[co.ballInCourt],
                  )}
                >
                  Ball in court: {BALL_IN_COURT_LABEL[co.ballInCourt]}
                </span>
              )}
            </div>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight">
              {co.title}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold tabular-nums">
              {currency(total)}
            </p>
            <p className="text-xs text-muted-foreground">
              {CO_PRICING_LABEL[co.pricingMethod ?? "lumpSum"]}
            </p>
          </div>
        </div>
      </div>

      {/* Lifecycle */}
      <Card>
        <CardContent className="py-5">
          <LifecycleStepper
            steps={steps}
            activeKey={activeKey}
            tone={co.status === "billed" ? "violet" : "emerald"}
            terminal={terminal}
          />
        </CardContent>
      </Card>

      {/* Aging / due */}
      {open && (age >= 30 || due !== null) && (
        <Card
          className={cn(
            age >= 60 || (due !== null && due < 0)
              ? "border-red-500/40"
              : "border-amber-500/40",
          )}
        >
          <CardContent className="flex flex-wrap items-center gap-3 py-3">
            <Clock
              className={cn(
                "size-5",
                age >= 60
                  ? "text-red-600 dark:text-red-400"
                  : "text-amber-600 dark:text-amber-400",
              )}
            />
            <p className="text-sm">
              <span className="font-semibold">{age} days</span> outstanding
              {due !== null &&
                ` · approval needed by ${shortDate(co.responseNeededBy)}${
                  due < 0 ? ` (${Math.abs(due)}d overdue)` : ""
                }`}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm">Scope of the change</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-3.5" /> Edit
              </Button>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm">{co.description}</p>
            </CardContent>
          </Card>

          {/* Cost breakdown */}
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm">Cost breakdown</CardTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => setCostOpen(true)}
              >
                <Pencil className="size-3.5" /> Edit pricing
              </Button>
            </CardHeader>
            <CardContent>
              {hasBreakdown ? (
                <div className="space-y-3">
                  <ul className="divide-y">
                    {co.lineItems!.map((li) => (
                      <li
                        key={li.id}
                        className="flex items-center justify-between gap-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              CO_COST_CATEGORY_ACCENT[li.category],
                            )}
                          >
                            {CO_COST_CATEGORY_LABEL[li.category]}
                          </span>
                          <span className="truncate text-sm">
                            {li.description}
                          </span>
                        </div>
                        <span className="shrink-0 text-sm tabular-nums">
                          {currency(li.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-1 border-t pt-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{currency(subtotal)}</span>
                    </div>
                    {(co.markupPct ?? 0) > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Overhead &amp; profit ({co.markupPct}%)</span>
                        <span className="tabular-nums">{currency(markup)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 text-base font-semibold">
                      <span>Total</span>
                      <span className="tabular-nums">{currency(total)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-muted-foreground">
                    No itemized breakdown.{" "}
                    {co.costAmount != null
                      ? `Lump value: ${currency(co.costAmount)}.`
                      : "Add line items to build the price."}
                  </p>
                </div>
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
                onAddNote={(body) => addCoNote(co.id, body)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Status control */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={co.status}
                onValueChange={(v) => {
                  updateChangeOrder(co.id, { status: v as CoStatus });
                  toast.success(
                    `${co.number} → ${CO_STATUS_LABEL[v as CoStatus]}`,
                  );
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CO_STATUS_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {CO_STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {co.status === "submitted" && (
                <Button
                  className="w-full gap-1.5"
                  onClick={() => setApproveOpen(true)}
                >
                  <CheckCircle2 className="size-4" /> Record approval
                </Button>
              )}
              {co.approvedBy && (
                <p className="text-xs text-muted-foreground">
                  {co.status === "billed" ? "Billed" : "Approved"} by{" "}
                  <span className="font-medium">{co.approvedBy}</span>
                  {co.approvedAt ? ` · ${shortDate(co.approvedAt)}` : ""}
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
              <Info label="Origin">{CO_ORIGIN_LABEL[co.origin]}</Info>
              <Info label="Reason">
                {co.reason ? CO_REASON_LABEL[co.reason] : "—"}
              </Info>
              <Info label="Raised by">
                {raisedBy ? (
                  <PersonBadge person={raisedBy} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </Info>
              <Info label="Owner">{ROLE_LABEL[co.ownerRole]}</Info>
              <Info label="Directed to">{co.directedTo ?? "—"}</Info>
              <Info label="Pricing">
                {CO_PRICING_LABEL[co.pricingMethod ?? "lumpSum"]}
              </Info>
              <Info label="Created">{shortDate(co.createdAt)}</Info>
              <Info label="Submitted">
                {co.submittedAt ? shortDate(co.submittedAt) : "—"}
              </Info>
              <Info label="Schedule impact">
                {co.scheduleImpactDays != null
                  ? `${co.scheduleImpactDays} day${co.scheduleImpactDays === 1 ? "" : "s"}`
                  : "—"}
              </Info>
              <Info label="Approval needed">
                {co.responseNeededBy ? shortDate(co.responseNeededBy) : "—"}
              </Info>
              {co.tmTicketRef && (
                <Info label="T&M ticket">
                  <span className="inline-flex items-center gap-1">
                    <Ticket className="size-3 text-muted-foreground" />
                    {co.tmTicketRef}
                  </span>
                </Info>
              )}
              {co.planRef && (
                <Info label="Plan ref">
                  <span className="inline-flex items-center gap-1">
                    <Link2 className="size-3 text-muted-foreground" />
                    {co.planRef}
                  </span>
                </Info>
              )}
              {sourceRfi && (
                <div className="col-span-2">
                  <Info label="Source RFI">
                    <Link
                      href={`/field/${bidId}/rfi/${sourceRfi.id}`}
                      className="inline-flex items-center gap-1 text-violet-600 hover:underline dark:text-violet-400"
                    >
                      <FileText className="size-3.5" /> {sourceRfi.number} —{" "}
                      {sourceRfi.subject}
                    </Link>
                  </Info>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Attachments{" "}
                <span className="font-normal text-muted-foreground">
                  ({co.attachments?.length ?? 0})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AttachmentPanel
                attachments={co.attachments ?? []}
                onAdd={(input) => {
                  addCoAttachment(co.id, input);
                  toast.success("Attachment added");
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Record approval dialog */}
      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record approval — {co.number}</DialogTitle>
            <DialogDescription>
              Who signed off on the GC / owner side? This stamps the approval
              date and clears it from the outstanding board.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Approved by</Label>
            <Input
              value={approver}
              onChange={(e) => setApprover(e.target.value)}
              placeholder="e.g. Turner Pacific"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={recordApproval} disabled={!approver.trim()}>
              Mark approved
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditCoDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        co={co}
        onSave={(patch) => {
          updateChangeOrder(co.id, patch);
          toast.success(`${co.number} updated`);
          setEditOpen(false);
        }}
      />

      <CostBreakdownDialog
        open={costOpen}
        onOpenChange={setCostOpen}
        co={co}
        onSave={(lineItems, markupPct) => {
          updateChangeOrder(co.id, { lineItems, markupPct });
          toast.success(`${co.number} pricing updated`);
          setCostOpen(false);
        }}
      />
    </div>
  );
}

function EditCoDialog({
  open,
  onOpenChange,
  co,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  co: ChangeOrder;
  onSave: (patch: {
    title: string;
    description: string;
    reason: CoReason;
    pricingMethod: CoPricingMethod;
    directedTo?: string;
    responseNeededBy?: string;
    scheduleImpactDays?: number;
  }) => void;
}) {
  const [title, setTitle] = useState(co.title);
  const [description, setDescription] = useState(co.description);
  const [reason, setReason] = useState<CoReason>(co.reason ?? "unforeseen");
  const [pricing, setPricing] = useState<CoPricingMethod>(
    co.pricingMethod ?? "lumpSum",
  );
  const [directedTo, setDirectedTo] = useState(co.directedTo ?? "");
  const [needBy, setNeedBy] = useState(isoToDateInput(co.responseNeededBy));
  const [schedDays, setSchedDays] = useState(
    co.scheduleImpactDays != null ? String(co.scheduleImpactDays) : "",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {co.number}</DialogTitle>
          <DialogDescription>
            Scope, justification, and distribution for the change order.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select
                value={reason}
                onValueChange={(v) => setReason(v as CoReason)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CO_REASON_ORDER.map((r) => (
                    <SelectItem key={r} value={r}>
                      {CO_REASON_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Pricing method</Label>
              <Select
                value={pricing}
                onValueChange={(v) => setPricing(v as CoPricingMethod)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CO_PRICING_ORDER.map((p) => (
                    <SelectItem key={p} value={p}>
                      {CO_PRICING_LABEL[p]}
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
              <Label>Approval needed by</Label>
              <Input
                type="date"
                value={needBy}
                onChange={(e) => setNeedBy(e.target.value)}
              />
            </div>
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!title.trim()}
            onClick={() =>
              onSave({
                title: title.trim(),
                description: description.trim(),
                reason,
                pricingMethod: pricing,
                directedTo: directedTo.trim() || undefined,
                responseNeededBy: dateInputToIso(needBy),
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

let draftLineSeq = 0;
function newDraftLineId(): string {
  draftLineSeq += 1;
  return `draft-line-${draftLineSeq}`;
}

function CostBreakdownDialog({
  open,
  onOpenChange,
  co,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  co: ChangeOrder;
  onSave: (lineItems: CoLineItem[], markupPct: number) => void;
}) {
  const [lines, setLines] = useState<CoLineItem[]>(
    co.lineItems && co.lineItems.length > 0
      ? co.lineItems.map((li) => ({ ...li }))
      : [{ id: newDraftLineId(), category: "labor", description: "", amount: 0 }],
  );
  const [markup, setMarkup] = useState(String(co.markupPct ?? 15));

  function patchLine(id: string, patch: Partial<CoLineItem>) {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    );
  }
  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }
  function addLine() {
    setLines((prev) => [
      ...prev,
      { id: newDraftLineId(), category: "material", description: "", amount: 0 },
    ]);
  }

  const subtotal = lines.reduce((s, l) => s + (l.amount || 0), 0);
  const markupPct = Number(markup) || 0;
  const total = Math.round(subtotal * (1 + markupPct / 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cost breakdown — {co.number}</DialogTitle>
          <DialogDescription>
            Build the price line by line. Labor, material, equipment, and subs
            roll up to a subtotal, then overhead &amp; profit on top.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="hidden grid-cols-[8rem_1fr_7rem_2rem] gap-2 px-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Category</span>
            <span>Description</span>
            <span className="text-right">Amount</span>
            <span />
          </div>
          {lines.map((l) => (
            <div
              key={l.id}
              className="grid grid-cols-1 gap-2 sm:grid-cols-[8rem_1fr_7rem_2rem] sm:items-center"
            >
              <Select
                value={l.category}
                onValueChange={(v) =>
                  patchLine(l.id, { category: v as CoCostCategory })
                }
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CO_COST_CATEGORY_ORDER.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CO_COST_CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={l.description}
                onChange={(e) => patchLine(l.id, { description: e.target.value })}
                placeholder="e.g. 3 masons × 2 days"
              />
              <Input
                type="number"
                min={0}
                value={l.amount ? String(l.amount) : ""}
                onChange={(e) =>
                  patchLine(l.id, { amount: Number(e.target.value) || 0 })
                }
                placeholder="0"
                className="text-right tabular-nums"
              />
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground hover:text-red-600"
                onClick={() => removeLine(l.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={addLine}
          >
            <Plus className="size-3.5" /> Add line
          </Button>
        </div>

        <div className="space-y-1.5 border-t pt-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span className="tabular-nums">{currency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <Label className="text-muted-foreground">Overhead &amp; profit</Label>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min={0}
                value={markup}
                onChange={(e) => setMarkup(e.target.value)}
                className="h-8 w-16 text-right tabular-nums"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1 text-base font-semibold">
            <span>Total</span>
            <span className="tabular-nums">{currency(total)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave(
                lines
                  .filter((l) => l.description.trim() || l.amount > 0)
                  .map((l) => ({
                    id: l.id,
                    category: l.category,
                    description: l.description.trim(),
                    amount: l.amount || 0,
                  })),
                markupPct,
              )
            }
          >
            Save pricing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
