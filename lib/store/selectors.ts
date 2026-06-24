import type {
  ActivityEvent,
  AppState,
  Bid,
  BidDocument,
  ChangeOrder,
  Extraction,
  ExtractionAudience,
  ExtractionPhase,
  IntakeStepDef,
  IntakeStepRun,
  IntakeStepStatus,
  Person,
  ProcurementItem,
  ProjectMilestone,
  ProjectPlan,
  Rfi,
  Role,
  ScopeItem,
  ScopeStage,
  SovLine,
  StandardNote,
  TensionItem,
} from "./types";
import { REQUIRED_SIGNOFF_ROLES } from "@/lib/mock-data/tension";
import {
  INTAKE_STEPS,
  AUTO_STEP_KEYS,
  autoStepResult,
} from "@/lib/mock-data/intake";

const ESTIMATOR_ROLES: Role[] = [
  "EstimatorMasonry",
  "EstimatorConcrete",
  "CEO",
];

/** Bid stages where a standard is still actionable during estimating. */
const BIDDING_STAGES: Bid["stage"][] = [
  "invited",
  "estimating",
  "preBidReview",
];

/** Who a standard is aimed at: the estimators who'll bid its trade(s). */
export function standardAudience(state: AppState, note: StandardNote): Person[] {
  return state.people.filter((p) => {
    if (!ESTIMATOR_ROLES.includes(p.role)) return false;
    if (p.role === "CEO") return true; // Casey estimates across trades
    return p.trade ? note.trades.includes(p.trade) : false;
  });
}

/** Audience members who still owe an acknowledgement. */
export function standardPendingAcks(
  state: AppState,
  note: StandardNote,
): Person[] {
  return standardAudience(state, note).filter(
    (p) => !note.acks.includes(p.id),
  );
}

/** Open bids this standard currently bears on (trade + region match, mid-bid). */
export function standardAppliesToBids(
  state: AppState,
  note: StandardNote,
): Bid[] {
  return state.bids.filter((b) => {
    if (b.id === note.linkedBidId) return true;
    if (!BIDDING_STAGES.includes(b.stage)) return false;
    const tradeMatch = note.trades.includes(b.trade);
    const regionMatch =
      note.regions.length === 0 || note.regions.includes(b.region);
    return tradeMatch && regionMatch;
  });
}

/** Does this user still need to acknowledge this standard? */
export function userNeedsToAck(
  state: AppState,
  note: StandardNote,
  userId: string,
): boolean {
  if (note.acks.includes(userId)) return false;
  return standardAudience(state, note).some((p) => p.id === userId);
}

export function bidById(state: AppState, bidId: string): Bid | undefined {
  return state.bids.find((b) => b.id === bidId);
}

export function tensionForBid(state: AppState, bidId: string) {
  return state.tensionItems.filter((t) => t.bidId === bidId);
}

/** Concerns still needing mutual resolution — anything not yet resolved. */
export function openConcernsForBid(state: AppState, bidId: string): number {
  return tensionForBid(state, bidId).filter((t) => t.status !== "resolved")
    .length;
}

export interface TensionAgreement {
  /** People who've agreed to the resolution. */
  agreedIds: string[];
  /** Has the person who raised the concern agreed? */
  raiserAgreed: boolean;
  /** Has at least one other person agreed? */
  otherAgreed: boolean;
  /** Resolution text written and both sides have agreed. */
  resolved: boolean;
}

/**
 * Mutual-agreement state for one concern — drives the one-at-a-time resolver UI.
 * Mirrors the reducer's `withAgreementStatus` gate: raiser + ≥1 reviewer.
 */
export function tensionAgreement(item: TensionItem): TensionAgreement {
  const agreedIds = item.agreedByIds ?? [];
  const raiserAgreed = agreedIds.includes(item.raisedById);
  const otherAgreed = agreedIds.some((id) => id !== item.raisedById);
  return {
    agreedIds,
    raiserAgreed,
    otherAgreed,
    resolved: Boolean(item.resolution?.trim()) && raiserAgreed && otherAgreed,
  };
}

export function totalOpenConcerns(state: AppState): number {
  return state.tensionItems.filter((t) => t.status !== "resolved").length;
}

export function signOffsForBid(state: AppState, bidId: string) {
  return state.signOffs.filter((s) => s.bidId === bidId);
}

/** How many of the required sign-off roles have a decision recorded. */
export function signOffProgress(
  state: AppState,
  bidId: string,
): { collected: number; required: number; roles: Role[] } {
  const required = REQUIRED_SIGNOFF_ROLES as readonly Role[];
  const offs = signOffsForBid(state, bidId);
  const peopleById = new Map(state.people.map((p) => [p.id, p]));
  const collectedRoles = new Set<Role>();
  for (const so of offs) {
    const person = peopleById.get(so.personId);
    if (person && required.includes(person.role)) {
      collectedRoles.add(person.role);
    }
  }
  return {
    collected: collectedRoles.size,
    required: required.length,
    roles: [...required],
  };
}

/** A bid is "ready to submit" when no open concerns and all required sign-offs in. */
export function bidReadiness(
  state: AppState,
  bidId: string,
): { ready: boolean; openConcerns: number; collected: number; required: number } {
  const openConcerns = openConcernsForBid(state, bidId);
  const { collected, required } = signOffProgress(state, bidId);
  return {
    ready: openConcerns === 0 && collected >= required,
    openConcerns,
    collected,
    required,
  };
}

export function handoffForBid(state: AppState, bidId: string) {
  return state.handoffItems.filter((h) => h.bidId === bidId);
}

export function handoffReadiness(
  state: AppState,
  bidId: string,
): { confirmed: number; total: number; flagged: number; pct: number } {
  const items = handoffForBid(state, bidId);
  const confirmed = items.filter((h) => h.status === "confirmed").length;
  const flagged = items.filter((h) => h.status === "flagged").length;
  const total = items.length;
  return {
    confirmed,
    total,
    flagged,
    pct: total ? Math.round((confirmed / total) * 100) : 0,
  };
}

export function tasksForBid(state: AppState, bidId: string) {
  return state.tasks.filter((t) => t.linkedBidId === bidId);
}

export function tasksForUser(state: AppState, personId: string) {
  return state.tasks.filter((t) => t.assigneeId === personId);
}

export function standardsForBid(state: AppState, bidId: string) {
  return state.standards.filter((s) => s.linkedBidId === bidId);
}

// ── Plan Room ──────────────────────────────────────────────────────────────

export function documentsForBid(state: AppState, bidId: string): BidDocument[] {
  return state.bidDocuments.filter((d) => d.bidId === bidId);
}

export function extractionsForBid(state: AppState, bidId: string): Extraction[] {
  return state.extractions.filter((e) => e.bidId === bidId);
}

export function extractionPhaseRan(
  state: AppState,
  bidId: string,
  phase: ExtractionPhase,
): boolean {
  return state.extractions.some((e) => e.bidId === bidId && e.phase === phase);
}

/** Open (un-triaged) findings for a bid, optionally filtered to an audience. */
export function openExtractionsForBid(
  state: AppState,
  bidId: string,
  audience?: ExtractionAudience,
): Extraction[] {
  return extractionsForBid(state, bidId).filter(
    (e) =>
      e.status === "open" &&
      (audience ? e.audience === audience || e.audience === "both" : true),
  );
}

export interface PlanRoomSummary {
  docs: number;
  findings: number;
  openForOps: number;
  openForEstimating: number;
  intakeRan: boolean;
  commitRan: boolean;
}

export function planRoomSummary(
  state: AppState,
  bidId: string,
): PlanRoomSummary {
  const findings = extractionsForBid(state, bidId);
  return {
    docs: documentsForBid(state, bidId).length,
    findings: findings.length,
    openForOps: openExtractionsForBid(state, bidId, "ops").length,
    openForEstimating: openExtractionsForBid(state, bidId, "estimating").length,
    intakeRan: extractionPhaseRan(state, bidId, "intake"),
    commitRan: extractionPhaseRan(state, bidId, "preBidCommit"),
  };
}

/** Org-wide count of un-triaged Plan Room findings (for the nav badge). */
export function totalOpenExtractions(state: AppState): number {
  return state.extractions.filter((e) => e.status === "open").length;
}

// ── Scope Board ──────────────────────────────────────────────────────────

export function scopeItemsForBid(state: AppState, bidId: string): ScopeItem[] {
  return state.scopeItems.filter((s) => s.bidId === bidId);
}

/** Findings on a bid that haven't been promoted onto the scope board yet. */
export function unpromotedExtractionCount(
  state: AppState,
  bidId: string,
): number {
  const linked = new Set(
    scopeItemsForBid(state, bidId).flatMap((s) => s.sourceExtractionIds),
  );
  return extractionsForBid(state, bidId).filter((e) => !linked.has(e.id)).length;
}

export interface ScopeSummary {
  total: number;
  byStage: Record<ScopeStage, number>;
  /** Items not yet approved — the open work on the board. */
  openItems: number;
  challenged: number;
}

export function scopeSummary(state: AppState, bidId: string): ScopeSummary {
  const items = scopeItemsForBid(state, bidId);
  const byStage: Record<ScopeStage, number> = {
    extracted: 0,
    contextualized: 0,
    planned: 0,
    challenged: 0,
    approved: 0,
  };
  for (const it of items) byStage[it.stage] += 1;
  return {
    total: items.length,
    byStage,
    openItems: items.filter((s) => s.stage !== "approved").length,
    challenged: byStage.challenged,
  };
}

// ── Intake Pipeline ──────────────────────────────────────────────────────

export interface IntakeStepView {
  def: IntakeStepDef;
  status: IntakeStepStatus;
  run?: IntakeStepRun;
  /** Display outcome once done — auto steps derive it when no result is stored. */
  result?: string;
}

/**
 * The intake pipeline for a bid, each step resolved to a status. Steps run in
 * the defined order: a step is `done` if recorded, `ready` if it's the earliest
 * not-yet-done step (its predecessors are all done), and `blocked` otherwise.
 * "running" is a transient UI-only state the component layers on during the
 * automation animation — it's never stored.
 */
export function intakeStepsForBid(state: AppState, bid: Bid): IntakeStepView[] {
  const runs = state.intakeSteps.filter((r) => r.bidId === bid.id);
  const runByStep = new Map(runs.map((r) => [r.step, r]));
  let readyAssigned = false;

  return INTAKE_STEPS.map((def) => {
    const run = runByStep.get(def.key);
    if (run) {
      return {
        def,
        status: "done" as const,
        run,
        result:
          run.result ??
          (def.owner === "auto" ? autoStepResult(bid, def.key) : undefined),
      };
    }
    if (!readyAssigned) {
      readyAssigned = true;
      return { def, status: "ready" as const };
    }
    return { def, status: "blocked" as const };
  });
}

export interface IntakeSummary {
  done: number;
  total: number;
  /** Have all four automated steps completed for this bid? */
  autoDone: boolean;
  autoTotal: number;
  autoCompleted: number;
  /** Pipeline fully run (every step done). */
  complete: boolean;
  pct: number;
  /** The next step needing attention, if any. */
  next?: IntakeStepView;
}

export function intakeSummary(state: AppState, bid: Bid): IntakeSummary {
  const views = intakeStepsForBid(state, bid);
  const done = views.filter((v) => v.status === "done").length;
  const total = views.length;
  const autoCompleted = AUTO_STEP_KEYS.filter((k) =>
    state.intakeSteps.some((r) => r.bidId === bid.id && r.step === k),
  ).length;
  return {
    done,
    total,
    autoDone: autoCompleted === AUTO_STEP_KEYS.length,
    autoTotal: AUTO_STEP_KEYS.length,
    autoCompleted,
    complete: done === total,
    pct: total ? Math.round((done / total) * 100) : 0,
    next: views.find((v) => v.status === "ready"),
  };
}

// ── Active Projects ─────────────────────────────────────────────────────────

const AWARDED_PLUS: Bid["stage"][] = ["awarded", "handoff", "active"];

/** Won work — awarded, in handoff, or active — newest award first. */
export function activeProjects(state: AppState): Bid[] {
  return state.bids
    .filter((b) => AWARDED_PLUS.includes(b.stage))
    .sort((a, b) => (b.awardedAt ?? "").localeCompare(a.awardedAt ?? ""));
}

export function isProject(bid: Bid): boolean {
  return AWARDED_PLUS.includes(bid.stage);
}

export function procurementForBid(
  state: AppState,
  bidId: string,
): ProcurementItem[] {
  return state.procurementItems.filter((p) => p.bidId === bidId);
}

export function milestonesForBid(
  state: AppState,
  bidId: string,
): ProjectMilestone[] {
  return state.projectMilestones.filter((m) => m.bidId === bidId);
}

export function sovLinesForBid(state: AppState, bidId: string): SovLine[] {
  return state.sovLines.filter((l) => l.bidId === bidId);
}

/** Sum of a set of SOV lines — compared against the awarded bid value. */
export function sovTotal(lines: SovLine[]): number {
  return lines.reduce((sum, l) => sum + l.scheduledValue, 0);
}

export function projectPlanForBid(
  state: AppState,
  bidId: string,
): ProjectPlan | undefined {
  return state.projectPlans[bidId];
}

/** The date a procurement item must be ordered to land by its need-by date. */
export function procurementOrderBy(item: ProcurementItem): string | undefined {
  if (!item.needBy) return undefined;
  const d = new Date(item.needBy);
  d.setDate(d.getDate() - item.leadTimeWeeks * 7);
  return d.toISOString();
}

/**
 * An item is "at risk" when it isn't ordered yet and the order-by date is here
 * or already past (within a week of buffer) — the thing that quietly slips a job.
 */
export function isProcurementAtRisk(
  item: ProcurementItem,
  nowMs: number = Date.now(),
): boolean {
  if (item.status === "ordered" || item.status === "delivered") return false;
  const orderBy = procurementOrderBy(item);
  if (!orderBy) return false;
  return new Date(orderBy).getTime() <= nowMs + 7 * 86_400_000;
}

export interface ProcurementSummary {
  total: number;
  notStarted: number;
  quoting: number;
  ordered: number;
  delivered: number;
  atRisk: number;
}

export function procurementSummary(
  state: AppState,
  bidId: string,
): ProcurementSummary {
  const items = procurementForBid(state, bidId);
  return {
    total: items.length,
    notStarted: items.filter((i) => i.status === "notStarted").length,
    quoting: items.filter((i) => i.status === "quoting").length,
    ordered: items.filter((i) => i.status === "ordered").length,
    delivered: items.filter((i) => i.status === "delivered").length,
    atRisk: items.filter((i) => isProcurementAtRisk(i)).length,
  };
}

export function projectProgress(
  state: AppState,
  bidId: string,
): { done: number; total: number; pct: number } {
  const ms = milestonesForBid(state, bidId);
  const done = ms.filter((m) => m.status === "done").length;
  const total = ms.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

/** Org-wide count of at-risk procurement items (for the nav badge). */
export function totalProcurementAtRisk(state: AppState): number {
  return state.procurementItems.filter((p) => isProcurementAtRisk(p)).length;
}

/** Bids that have documents in the Plan Room — the index lives off this. */
export function bidsWithDocuments(state: AppState): Bid[] {
  const ids = new Set(state.bidDocuments.map((d) => d.bidId));
  return state.bids.filter((b) => ids.has(b.id));
}

const ESTIMATOR_ROLE_SET: Role[] = [
  "EstimatorMasonry",
  "EstimatorConcrete",
  "CEO",
];

export type InboxItem = {
  id: string;
  kind:
    | "signoff"
    | "concern"
    | "handoff"
    | "task"
    | "ack"
    | "planroom"
    | "procurement";
  title: string;
  detail: string;
  href: string;
  urgent: boolean;
};

const OPS_ROLES: Role[] = ["Ops", "Super", "PM"];

/**
 * "Needs you now" — the single most important thing the home screen answers.
 * Role-aware so each person sees their slice of the estimating↔ops handshake,
 * not a wall of KPIs. Ordered urgent-first.
 */
export function inboxForUser(state: AppState, userId: string): InboxItem[] {
  const me = state.people.find((p) => p.id === userId);
  if (!me) return [];
  const items: InboxItem[] = [];
  const required = REQUIRED_SIGNOFF_ROLES as readonly Role[];

  // Sign-offs I owe on bids waiting in pre-bid review.
  if (required.includes(me.role)) {
    for (const bid of state.bids.filter((b) => b.stage === "preBidReview")) {
      const signed = signOffsForBid(state, bid.id).some(
        (s) => s.personId === me.id,
      );
      if (!signed) {
        items.push({
          id: `signoff-${bid.id}`,
          kind: "signoff",
          title: `Sign off on ${bid.name}`,
          detail: "Pre-bid review — challenge or approve before we submit",
          href: `/pipeline/${bid.id}?tab=tension`,
          urgent: true,
        });
      }
    }
  }

  // Open concerns on bids I'm estimating.
  if (ESTIMATOR_ROLE_SET.includes(me.role)) {
    for (const bid of state.bids) {
      if (bid.estimatorId !== me.id) continue;
      if (bid.stage !== "estimating" && bid.stage !== "preBidReview") continue;
      const open = openConcernsForBid(state, bid.id);
      if (open > 0) {
        items.push({
          id: `concern-${bid.id}`,
          kind: "concern",
          title: `${open} open concern${open === 1 ? "" : "s"} on ${bid.name}`,
          detail: "Resolve with ops before this bid goes out",
          href: `/pipeline/${bid.id}?tab=tension`,
          urgent: true,
        });
      }
    }
  }

  // Handoff items waiting on my role.
  for (const bid of state.bids.filter((b) => b.stage === "handoff")) {
    const mine = handoffForBid(state, bid.id).filter(
      (h) => h.ownerRole === me.role && h.status === "pending",
    );
    if (mine.length > 0) {
      items.push({
        id: `handoff-${bid.id}`,
        kind: "handoff",
        title: `${mine.length} handoff item${mine.length === 1 ? "" : "s"} to confirm — ${bid.name}`,
        detail: "Confirm your part of the handoff for the field",
        href: `/pipeline/${bid.id}?tab=handoff`,
        urgent: false,
      });
    }
  }

  // Plan Room — ops-facing risk questions waiting on a committing bid.
  if (OPS_ROLES.includes(me.role)) {
    for (const bid of state.bids) {
      if (bid.submitLikelihood !== "likely" && bid.submitLikelihood !== "committed")
        continue;
      const open = openExtractionsForBid(state, bid.id, "ops").length;
      if (open > 0) {
        items.push({
          id: `planroom-${bid.id}`,
          kind: "planroom",
          title: `${open} risk question${open === 1 ? "" : "s"} to weigh in on — ${bid.name}`,
          detail: "Plan Room flagged these before the bid is committed",
          href: `/pipeline/${bid.id}?tab=planroom`,
          urgent: true,
        });
      }
    }
  }

  // Procurement at risk — long-lead items that need a PO now, on my projects.
  if (OPS_ROLES.includes(me.role)) {
    for (const bid of state.bids) {
      if (!AWARDED_PLUS.includes(bid.stage)) continue;
      const atRisk = procurementForBid(state, bid.id).filter((p) =>
        isProcurementAtRisk(p),
      );
      const mine = atRisk.filter((p) => p.ownerRole === me.role);
      if (mine.length > 0) {
        items.push({
          id: `procurement-${bid.id}`,
          kind: "procurement",
          title: `${mine.length} order${mine.length === 1 ? "" : "s"} at risk — ${bid.name}`,
          detail: "Long-lead material needs a PO to protect mobilization",
          href: `/projects/${bid.id}?tab=procurement`,
          urgent: true,
        });
      }
    }
  }

  // My open tasks (overdue ones float up as urgent).
  const now = Date.now();
  for (const t of tasksForUser(state, me.id)) {
    if (t.status === "done") continue;
    const overdue = t.dueDate ? new Date(t.dueDate).getTime() < now : false;
    const bid = t.linkedBidId
      ? state.bids.find((b) => b.id === t.linkedBidId)
      : undefined;
    items.push({
      id: `task-${t.id}`,
      kind: "task",
      title: t.title,
      detail: `${bid ? bid.name : "Ad-hoc"}${overdue ? " · overdue" : ""}`,
      href: "/tasks",
      urgent: overdue,
    });
  }

  // Standards I still need to acknowledge (rolled up to one line).
  const unacked = state.standards.filter((s) =>
    userNeedsToAck(state, s, me.id),
  );
  if (unacked.length > 0) {
    items.push({
      id: "acks",
      kind: "ack",
      title: `${unacked.length} standard${unacked.length === 1 ? "" : "s"} to acknowledge`,
      detail: "New estimating standards for your trade",
      href: "/standards",
      urgent: false,
    });
  }

  return items.sort((a, b) => Number(b.urgent) - Number(a.urgent));
}

// ── RFIs & Change Orders ─────────────────────────────────────────────────────

export function rfisForBid(state: AppState, bidId: string): Rfi[] {
  return state.rfis.filter((r) => r.bidId === bidId);
}

export function changeOrdersForBid(
  state: AppState,
  bidId: string,
): ChangeOrder[] {
  return state.changeOrders.filter((co) => co.bidId === bidId);
}

/** An RFI still in flight — not yet closed or rolled into a CO. */
export function isRfiOpen(rfi: Rfi): boolean {
  return rfi.status !== "closed" && rfi.status !== "converted";
}

export function openRfisForBid(state: AppState, bidId: string): Rfi[] {
  return rfisForBid(state, bidId).filter(isRfiOpen);
}

export function totalOpenRfis(state: AppState): number {
  return state.rfis.filter(isRfiOpen).length;
}

/**
 * A Change Order is "outstanding" until the GC approves or rejects it (or it's
 * billed) — exactly the money that sits in limbo today.
 */
export function isChangeOrderOpen(co: ChangeOrder): boolean {
  return (
    co.status === "draft" ||
    co.status === "pendingPM" ||
    co.status === "submitted"
  );
}

/** Days a CO has been alive — the aging that drives the limbo buckets. */
export function coAgeDays(co: ChangeOrder, nowMs: number = Date.now()): number {
  return Math.max(
    0,
    Math.floor((nowMs - new Date(co.createdAt).getTime()) / 86_400_000),
  );
}

export function openChangeOrders(state: AppState): ChangeOrder[] {
  return state.changeOrders.filter(isChangeOrderOpen);
}

/** Count of outstanding COs — the sidebar badge. */
export function totalOpenChangeOrders(state: AppState): number {
  return openChangeOrders(state).length;
}

export interface ChangeOrderTotals {
  openCount: number;
  openValue: number;
  approvedValue: number;
  billedValue: number;
  oldestOpenAgeDays: number;
}

/** Company-wide headline numbers for the Field dashboard. */
export function changeOrderTotals(
  state: AppState,
  nowMs: number = Date.now(),
): ChangeOrderTotals {
  const open = openChangeOrders(state);
  return {
    openCount: open.length,
    openValue: open.reduce((sum, co) => sum + (co.costAmount ?? 0), 0),
    approvedValue: state.changeOrders
      .filter((co) => co.status === "approved")
      .reduce((sum, co) => sum + (co.costAmount ?? 0), 0),
    billedValue: state.changeOrders
      .filter((co) => co.status === "billed")
      .reduce((sum, co) => sum + (co.costAmount ?? 0), 0),
    oldestOpenAgeDays: open.reduce(
      (max, co) => Math.max(max, coAgeDays(co, nowMs)),
      0,
    ),
  };
}

export interface CoAgingBucket {
  count: number;
  value: number;
}

/** Outstanding COs bucketed by age — current / 30+ / 60+ days in limbo. */
export function coAgingBuckets(
  state: AppState,
  nowMs: number = Date.now(),
): { current: CoAgingBucket; over30: CoAgingBucket; over60: CoAgingBucket } {
  const empty = (): CoAgingBucket => ({ count: 0, value: 0 });
  const out = { current: empty(), over30: empty(), over60: empty() };
  for (const co of openChangeOrders(state)) {
    const age = coAgeDays(co, nowMs);
    const bucket =
      age >= 60 ? out.over60 : age >= 30 ? out.over30 : out.current;
    bucket.count += 1;
    bucket.value += co.costAmount ?? 0;
  }
  return out;
}

export interface ChangeOrdersByJob {
  bid: Bid;
  openCount: number;
  openValue: number;
  oldestAgeDays: number;
  total: number;
}

/** The "per job" cut — which jobs are sitting on outstanding COs. */
export function changeOrdersByJob(
  state: AppState,
  nowMs: number = Date.now(),
): ChangeOrdersByJob[] {
  const byBid = new Map<string, ChangeOrder[]>();
  for (const co of state.changeOrders) {
    const list = byBid.get(co.bidId) ?? [];
    list.push(co);
    byBid.set(co.bidId, list);
  }
  const rows: ChangeOrdersByJob[] = [];
  for (const [bidId, cos] of byBid) {
    const bid = bidById(state, bidId);
    if (!bid) continue;
    const open = cos.filter(isChangeOrderOpen);
    rows.push({
      bid,
      total: cos.length,
      openCount: open.length,
      openValue: open.reduce((s, co) => s + (co.costAmount ?? 0), 0),
      oldestAgeDays: open.reduce(
        (max, co) => Math.max(max, coAgeDays(co, nowMs)),
        0,
      ),
    });
  }
  // Most outstanding value first — the job that needs chasing sits on top.
  return rows.sort((a, b) => b.openValue - a.openValue);
}

export interface ChangeOrdersByPerson {
  person: Person;
  openCount: number;
  openValue: number;
}

/** The "individually" cut — who's holding outstanding COs. */
export function changeOrdersByPerson(state: AppState): ChangeOrdersByPerson[] {
  const byPerson = new Map<string, ChangeOrder[]>();
  for (const co of openChangeOrders(state)) {
    const list = byPerson.get(co.raisedById) ?? [];
    list.push(co);
    byPerson.set(co.raisedById, list);
  }
  const rows: ChangeOrdersByPerson[] = [];
  for (const [personId, cos] of byPerson) {
    const person = state.people.find((p) => p.id === personId);
    if (!person) continue;
    rows.push({
      person,
      openCount: cos.length,
      openValue: cos.reduce((s, co) => s + (co.costAmount ?? 0), 0),
    });
  }
  return rows.sort((a, b) => b.openValue - a.openValue);
}

// ── Single-record lookups + the detail-view derivations ─────────────────────

export function rfiById(state: AppState, id: string): Rfi | undefined {
  return state.rfis.find((r) => r.id === id);
}

export function changeOrderById(
  state: AppState,
  id: string,
): ChangeOrder | undefined {
  return state.changeOrders.find((co) => co.id === id);
}

/** Sum of a CO's line items before markup. */
export function coLineSubtotal(co: ChangeOrder): number {
  return (co.lineItems ?? []).reduce((sum, li) => sum + (li.amount || 0), 0);
}

/** The overhead & profit dollars applied on top of the subtotal. */
export function coMarkupAmount(co: ChangeOrder): number {
  return Math.round(coLineSubtotal(co) * ((co.markupPct ?? 0) / 100));
}

/** Subtotal + markup. Falls back to the entered headline when there's no breakdown. */
export function coComputedTotal(co: ChangeOrder): number {
  if (co.lineItems && co.lineItems.length > 0) {
    return coLineSubtotal(co) + coMarkupAmount(co);
  }
  return co.costAmount ?? 0;
}

/** Days until (positive) / since (negative) a response-by date. */
export function daysUntil(iso?: string, nowMs: number = Date.now()): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - nowMs) / 86_400_000);
}

/**
 * The full RFI history — lifecycle stamps derived from the record's own
 * timestamps, merged with any manually-logged notes, oldest first. Derived so
 * the timeline can never disagree with the status.
 */
export function rfiTimeline(rfi: Rfi): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  events.push({
    id: `${rfi.id}-created`,
    at: rfi.createdAt,
    kind: "created",
    actorId: rfi.raisedById,
    body: `${rfi.number} raised`,
  });
  if (rfi.submittedAt) {
    events.push({
      id: `${rfi.id}-submitted`,
      at: rfi.submittedAt,
      kind: "submitted",
      actorId: rfi.raisedById,
      body: rfi.directedTo
        ? `Submitted to ${rfi.directedTo}`
        : "Submitted for response",
    });
  }
  if (rfi.answeredAt) {
    events.push({
      id: `${rfi.id}-answered`,
      at: rfi.answeredAt,
      kind: "answered",
      actorName: rfi.answeredBy,
      body: rfi.answer ?? "Response received",
    });
  }
  if (rfi.status === "converted" && rfi.linkedChangeOrderId) {
    events.push({
      id: `${rfi.id}-converted`,
      at: rfi.answeredAt ?? rfi.createdAt,
      kind: "converted",
      body: "Converted to a change order",
    });
  }
  events.push(...(rfi.activity ?? []));
  return events.sort((a, b) => a.at.localeCompare(b.at));
}

/** The full CO history — derived lifecycle stamps merged with manual notes. */
export function coTimeline(co: ChangeOrder): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  events.push({
    id: `${co.id}-created`,
    at: co.createdAt,
    kind: "created",
    actorId: co.raisedById,
    body: co.sourceRfiId ? `${co.number} created from an RFI` : `${co.number} raised`,
  });
  if (co.submittedAt) {
    events.push({
      id: `${co.id}-submitted`,
      at: co.submittedAt,
      kind: "submitted",
      body: co.directedTo
        ? `Submitted to ${co.directedTo} for approval`
        : "Submitted for approval",
    });
  }
  if (co.approvedAt) {
    events.push({
      id: `${co.id}-approved`,
      at: co.approvedAt,
      kind: co.status === "rejected" ? "statusChange" : "approved",
      actorName: co.approvedBy,
      body:
        co.status === "rejected"
          ? "Rejected by the GC"
          : `Approved${co.approvedBy ? ` by ${co.approvedBy}` : ""}`,
    });
  }
  if (co.status === "billed") {
    events.push({
      id: `${co.id}-billed`,
      at: co.approvedAt ?? co.createdAt,
      kind: "billed",
      body: "Billed through to accounting",
    });
  }
  events.push(...(co.activity ?? []));
  return events.sort((a, b) => a.at.localeCompare(b.at));
}
