import type { Action } from "./actions";
import type {
  ActivityEvent,
  AppState,
  Attachment,
  BidStage,
  ChangeOrder,
  CoLineItem,
  Extraction,
  ExtractionKind,
  ExtractionPhase,
  IntakeStepRun,
  Person,
  ProcurementItem,
  ProjectMilestone,
  RecurrenceCadence,
  Rfi,
  Role,
  ScopeItem,
  Task,
  TaskTemplate,
  TensionItem,
  TensionItemType,
} from "./types";
import {
  cannedExtractionsFor,
  cannedProjectInfoFor,
} from "@/lib/mock-data/plan-room";
import { deriveScopeFromExtraction } from "@/lib/mock-data/scope";
import {
  buildProcurement,
  buildMilestones,
  buildProjectPlan,
  defaultMobilization,
} from "@/lib/mock-data/projects";
import {
  buildRfiFromExtraction,
  buildCoFromRfi,
  rfiNumber,
  coNumber,
} from "@/lib/mock-data/change-orders";

let idCounter = 0;
/** Client-side only (called inside reducer actions, post-hydration). */
function newId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Mutual agreement gate: a concern is "resolved" only with a written resolution
 * AND agreement from the person who raised it plus at least one other reviewer.
 * Recomputed whenever the resolution text or the agreement set changes — so
 * un-agreeing or clearing the resolution drops it back to open automatically.
 */
function withAgreementStatus(ti: TensionItem): TensionItem {
  const agreed = ti.agreedByIds ?? [];
  const raiserAgreed = agreed.includes(ti.raisedById);
  const otherAgreed = agreed.some((id) => id !== ti.raisedById);
  const resolved =
    Boolean(ti.resolution?.trim()) && raiserAgreed && otherAgreed;
  return { ...ti, status: resolved ? "resolved" : "open" };
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Advance a date by one recurrence interval. */
function advanceByCadence(iso: string, cadence: RecurrenceCadence): string {
  const d = new Date(iso);
  switch (cadence) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
  }
  return d.toISOString();
}

const ESTIMATOR_ROLES: Role[] = ["EstimatorMasonry", "EstimatorConcrete", "CEO"];

/** Resolve a template's role to a concrete person for a given bid. */
function resolveAssignee(
  template: TaskTemplate,
  bidEstimatorId: string,
  people: Person[],
): string {
  if (ESTIMATOR_ROLES.includes(template.assigneeRole)) {
    return bidEstimatorId;
  }
  const match = people.find((p) => p.role === template.assigneeRole);
  return match?.id ?? bidEstimatorId;
}

/** Next per-bid display number for an RFI or Change Order log. */
function nextNumber<T extends { bidId: string }>(
  items: T[],
  bidId: string,
  format: (n: number) => string,
): string {
  const count = items.filter((it) => it.bidId === bidId).length;
  return format(count + 1);
}

/** Roll a change order's line items + markup into a single headline value. */
function lineItemTotal(items: CoLineItem[] | undefined, markupPct?: number): number {
  if (!items || items.length === 0) return 0;
  const subtotal = items.reduce((sum, li) => sum + (li.amount || 0), 0);
  return Math.round(subtotal * (1 + (markupPct ?? 0) / 100));
}

/** One activity event with a generated id. */
function activityEvent(
  kind: ActivityEvent["kind"],
  body: string,
  opts: { actorId?: string; actorName?: string } = {},
): ActivityEvent {
  return {
    id: newId("act"),
    at: nowIso(),
    kind,
    body,
    actorId: opts.actorId,
    actorName: opts.actorName,
  };
}

/** AI-finding kind → the Tension Center type it becomes when promoted. */
const KIND_TO_TENSION_TYPE: Record<ExtractionKind, TensionItemType> = {
  fact: "assumption",
  question: "scopeGap",
  risk: "risk",
};

/**
 * Append the canned AI findings for a bid+phase, but only once — running the
 * same phase again is a no-op so the demo can't double-surface.
 */
function runExtractionPhase(
  state: AppState,
  bidId: string,
  phase: ExtractionPhase,
): Extraction[] {
  const alreadyRan = state.extractions.some(
    (e) => e.bidId === bidId && e.phase === phase,
  );
  if (alreadyRan) return state.extractions;

  const created = nowIso();
  const additions: Extraction[] = cannedExtractionsFor(bidId, phase).map(
    (f) => ({
      id: newId("ex"),
      bidId,
      phase,
      kind: f.kind,
      audience: f.audience,
      title: f.title,
      detail: f.detail,
      sourceRef: f.sourceRef,
      sourceDocId: f.sourceDocId,
      status: "open" as const,
      createdAt: created,
    }),
  );
  if (!additions.length) return state.extractions;
  return [...state.extractions, ...additions];
}

/**
 * Auto-promote a bid's findings onto the scope board: every extraction without
 * a scope item yet gets one, landing in the stage its source finding implies.
 * Idempotent — a finding only ever spawns one scope item.
 */
function deriveScopeItems(state: AppState, bidId: string): ScopeItem[] {
  const linked = new Set(
    state.scopeItems.flatMap((s) =>
      s.bidId === bidId ? s.sourceExtractionIds : [],
    ),
  );
  const additions: ScopeItem[] = state.extractions
    .filter((e) => e.bidId === bidId && !linked.has(e.id))
    .map((e) => ({ ...deriveScopeFromExtraction(e), id: newId("sc") }));
  if (!additions.length) return state.scopeItems;
  return [...state.scopeItems, ...additions];
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "MOVE_BID_STAGE": {
      const bid = state.bids.find((b) => b.id === action.bidId);
      if (!bid) return state;

      const enteringAward =
        action.toStage === "awarded" && bid.stage !== "awarded";

      const bids = state.bids.map((b) =>
        b.id === action.bidId
          ? {
              ...b,
              stage: action.toStage,
              awardedAt: enteringAward ? nowIso() : b.awardedAt,
            }
          : b,
      );

      // Auto-instantiate task templates for estimating / handoff (idempotent).
      let tasks = state.tasks;
      if (action.toStage === "estimating" || action.toStage === "handoff") {
        const entry = nowIso();
        const newTasks: Task[] = state.taskTemplates
          .filter((t) => t.stage === action.toStage)
          .filter(
            (t) =>
              !state.tasks.some(
                (existing) =>
                  existing.templateId === t.id &&
                  existing.linkedBidId === action.bidId,
              ),
          )
          .map((t) => ({
            id: newId("task"),
            title: t.title,
            assigneeId: resolveAssignee(t, bid.estimatorId, state.people),
            createdById: state.currentUserId,
            createdAt: entry,
            dueDate: t.dueOffsetDays ? addDays(entry, t.dueOffsetDays) : undefined,
            status: "todo" as const,
            priority: t.priority,
            linkedBidId: action.bidId,
            stage: action.toStage,
            source: "template" as const,
            templateId: t.id,
          }));
        if (newTasks.length) tasks = [...newTasks, ...state.tasks];
      }

      // Award → project: generate the procurement + project plans from trade
      // templates the first time a bid becomes won work (idempotent).
      let procurementItems = state.procurementItems;
      let projectMilestones = state.projectMilestones;
      let projectPlans = state.projectPlans;
      const AWARDED_PLUS: BidStage[] = ["awarded", "handoff", "active"];
      const alreadyHasPlan = state.procurementItems.some(
        (p) => p.bidId === action.bidId,
      );
      if (AWARDED_PLUS.includes(action.toStage) && !alreadyHasPlan) {
        const updated = bids.find((b) => b.id === action.bidId)!;
        const mob = defaultMobilization(updated.awardedAt ?? nowIso());
        const newProc: ProcurementItem[] = buildProcurement(updated, mob).map(
          (it) => ({ ...it, id: newId("pi") }),
        );
        const newMs: ProjectMilestone[] = buildMilestones(updated, mob).map(
          (m) => ({ ...m, id: newId("pm") }),
        );
        procurementItems = [...newProc, ...state.procurementItems];
        projectMilestones = [...newMs, ...state.projectMilestones];
        projectPlans = {
          ...state.projectPlans,
          [action.bidId]: buildProjectPlan(updated, mob),
        };
      }

      return {
        ...state,
        bids,
        tasks,
        procurementItems,
        projectMilestones,
        projectPlans,
      };
    }

    case "ADD_COMMENT": {
      const tensionItems = state.tensionItems.map((ti) =>
        ti.id === action.tensionItemId
          ? {
              ...ti,
              status:
                ti.status === "open" && action.kind === "response"
                  ? ("addressed" as const)
                  : ti.status,
              comments: [
                ...ti.comments,
                {
                  id: newId("c"),
                  authorId: action.authorId,
                  body: action.body,
                  createdAt: nowIso(),
                  kind: action.kind,
                  resolved: false,
                },
              ],
            }
          : ti,
      );
      return { ...state, tensionItems };
    }

    case "RESOLVE_TENSION_ITEM": {
      const tensionItems = state.tensionItems.map((ti) =>
        ti.id === action.tensionItemId
          ? {
              ...ti,
              status: "resolved" as const,
              comments: ti.comments.map((c) => ({ ...c, resolved: true })),
            }
          : ti,
      );
      return { ...state, tensionItems };
    }

    case "REOPEN_TENSION_ITEM": {
      const tensionItems = state.tensionItems.map((ti) =>
        ti.id === action.tensionItemId
          ? { ...ti, status: "open" as const }
          : ti,
      );
      return { ...state, tensionItems };
    }

    case "SET_TENSION_RESOLUTION": {
      const tensionItems = state.tensionItems.map((ti) =>
        ti.id === action.tensionItemId
          ? withAgreementStatus({ ...ti, resolution: action.resolution })
          : ti,
      );
      return { ...state, tensionItems };
    }

    case "TOGGLE_TENSION_AGREEMENT": {
      const tensionItems = state.tensionItems.map((ti) => {
        if (ti.id !== action.tensionItemId) return ti;
        const current = ti.agreedByIds ?? [];
        const agreedByIds = current.includes(action.personId)
          ? current.filter((id) => id !== action.personId)
          : [...current, action.personId];
        return withAgreementStatus({ ...ti, agreedByIds });
      });
      return { ...state, tensionItems };
    }

    case "ADD_TENSION_ITEM": {
      return {
        ...state,
        tensionItems: [
          ...state.tensionItems,
          {
            id: newId("ti"),
            bidId: action.bidId,
            type: action.itemType,
            title: action.title,
            detail: action.detail,
            raisedById: action.raisedById,
            createdAt: nowIso(),
            status: "open" as const,
            comments: [],
          },
        ],
      };
    }

    case "SET_SIGNOFF": {
      const existing = state.signOffs.find(
        (s) => s.bidId === action.bidId && s.personId === action.personId,
      );
      const signOffs = existing
        ? state.signOffs.map((s) =>
            s.id === existing.id
              ? {
                  ...s,
                  decision: action.decision,
                  note: action.note,
                  updatedAt: nowIso(),
                }
              : s,
          )
        : [
            ...state.signOffs,
            {
              id: newId("so"),
              bidId: action.bidId,
              personId: action.personId,
              decision: action.decision,
              note: action.note,
              updatedAt: nowIso(),
            },
          ];
      return { ...state, signOffs };
    }

    case "ADD_TASK": {
      return {
        ...state,
        tasks: [
          {
            id: newId("task"),
            title: action.title,
            description: action.description,
            assigneeId: action.assigneeId,
            createdById: action.createdById,
            createdAt: nowIso(),
            dueDate: action.dueDate,
            status: "todo" as const,
            priority: action.priority,
            linkedBidId: action.linkedBidId,
            source: "adhoc" as const,
            recurrence: action.recurrence,
          },
          ...state.tasks,
        ],
      };
    }

    case "UPDATE_TASK_STATUS": {
      const target = state.tasks.find((t) => t.id === action.taskId);
      let tasks = state.tasks.map((t) =>
        t.id === action.taskId ? { ...t, status: action.status } : t,
      );

      // Completing a recurring task spawns its next occurrence so standing
      // work never falls off the board.
      if (
        target?.recurrence &&
        action.status === "done" &&
        target.status !== "done"
      ) {
        const next: Task = {
          ...target,
          id: newId("task"),
          status: "todo",
          createdAt: nowIso(),
          dueDate: advanceByCadence(
            target.dueDate ?? nowIso(),
            target.recurrence.cadence,
          ),
          comments: undefined,
        };
        tasks = [next, ...tasks];
      }

      return { ...state, tasks };
    }

    case "REASSIGN_TASK": {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, assigneeId: action.assigneeId } : t,
        ),
      };
    }

    case "UPDATE_TASK": {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId ? { ...t, ...action.patch } : t,
        ),
      };
    }

    case "ADD_TASK_COMMENT": {
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.taskId
            ? {
                ...t,
                comments: [
                  ...(t.comments ?? []),
                  {
                    id: newId("tc"),
                    authorId: action.authorId,
                    body: action.body,
                    createdAt: nowIso(),
                  },
                ],
              }
            : t,
        ),
      };
    }

    case "POST_STANDARD": {
      return {
        ...state,
        standards: [
          {
            id: newId("std"),
            authorId: action.authorId,
            body: action.body,
            createdAt: nowIso(),
            trades: action.trades,
            regions: action.regions,
            category: action.category,
            acks: [],
            linkedBidId: action.linkedBidId,
          },
          ...state.standards,
        ],
      };
    }

    case "ACK_STANDARD": {
      return {
        ...state,
        standards: state.standards.map((s) =>
          s.id === action.standardId
            ? {
                ...s,
                acks: s.acks.includes(action.personId)
                  ? s.acks.filter((id) => id !== action.personId)
                  : [...s.acks, action.personId],
              }
            : s,
        ),
      };
    }

    case "SET_HANDOFF_ITEM": {
      return {
        ...state,
        handoffItems: state.handoffItems.map((h) =>
          h.id === action.itemId
            ? { ...h, status: action.status, note: action.note ?? h.note }
            : h,
        ),
      };
    }

    case "SET_HANDOFF_NOTES": {
      const existing = state.handoffMeetings[action.bidId] ?? {
        attendeeIds: [],
        notes: "",
      };
      return {
        ...state,
        handoffMeetings: {
          ...state.handoffMeetings,
          [action.bidId]: { ...existing, notes: action.notes },
        },
      };
    }

    case "TOGGLE_HANDOFF_ATTENDEE": {
      const existing = state.handoffMeetings[action.bidId] ?? {
        attendeeIds: [],
        notes: "",
      };
      const attendeeIds = existing.attendeeIds.includes(action.personId)
        ? existing.attendeeIds.filter((id) => id !== action.personId)
        : [...existing.attendeeIds, action.personId];
      return {
        ...state,
        handoffMeetings: {
          ...state.handoffMeetings,
          [action.bidId]: { ...existing, attendeeIds },
        },
      };
    }

    case "SET_REVIEW_NOTES": {
      const existing = state.reviewMeetings[action.bidId] ?? {
        attendeeIds: [],
        notes: "",
      };
      return {
        ...state,
        reviewMeetings: {
          ...state.reviewMeetings,
          [action.bidId]: { ...existing, notes: action.notes },
        },
      };
    }

    case "TOGGLE_REVIEW_ATTENDEE": {
      const existing = state.reviewMeetings[action.bidId] ?? {
        attendeeIds: [],
        notes: "",
      };
      const attendeeIds = existing.attendeeIds.includes(action.personId)
        ? existing.attendeeIds.filter((id) => id !== action.personId)
        : [...existing.attendeeIds, action.personId];
      return {
        ...state,
        reviewMeetings: {
          ...state.reviewMeetings,
          [action.bidId]: { ...existing, attendeeIds },
        },
      };
    }

    case "IMPORT_DOCUMENT": {
      return {
        ...state,
        bidDocuments: [
          ...state.bidDocuments,
          {
            id: newId("doc"),
            bidId: action.bidId,
            name: action.name,
            docType: action.docType,
            pageCount: action.pageCount,
            uploadedById: action.uploadedById,
            uploadedAt: nowIso(),
          },
        ],
      };
    }

    case "RUN_EXTRACTION": {
      const extractions = runExtractionPhase(state, action.bidId, action.phase);

      // The intake pass also auto-fills project info from the documents.
      let bids = state.bids;
      if (action.phase === "intake") {
        const info = cannedProjectInfoFor(action.bidId);
        if (info) {
          bids = state.bids.map((b) =>
            b.id === action.bidId
              ? { ...b, ...info.apply, detected: info.detected }
              : b,
          );
        }
      }

      // Findings auto-promote onto the scope board as they're surfaced.
      const scopeItems = deriveScopeItems({ ...state, extractions }, action.bidId);

      return { ...state, extractions, bids, scopeItems };
    }

    case "ANSWER_EXTRACTION": {
      return {
        ...state,
        extractions: state.extractions.map((e) =>
          e.id === action.extractionId
            ? {
                ...e,
                status: "answered" as const,
                answer: action.answer,
                answeredById: action.answeredById,
              }
            : e,
        ),
      };
    }

    case "DISMISS_EXTRACTION": {
      return {
        ...state,
        extractions: state.extractions.map((e) =>
          e.id === action.extractionId
            ? { ...e, status: "dismissed" as const }
            : e,
        ),
      };
    }

    case "REOPEN_EXTRACTION": {
      return {
        ...state,
        extractions: state.extractions.map((e) =>
          e.id === action.extractionId
            ? { ...e, status: "open" as const }
            : e,
        ),
      };
    }

    case "PROMOTE_EXTRACTION": {
      const ex = state.extractions.find((e) => e.id === action.extractionId);
      if (!ex || ex.promotedToTensionId) return state;

      const tensionId = newId("ti");
      const tensionItem: TensionItem = {
        id: tensionId,
        bidId: ex.bidId,
        type: KIND_TO_TENSION_TYPE[ex.kind],
        title: ex.title,
        detail: ex.sourceRef
          ? `${ex.detail}\n\nFrom Plan Room — ${ex.sourceRef}`
          : `${ex.detail}\n\nSurfaced from Plan Room.`,
        raisedById: action.raisedById,
        createdAt: nowIso(),
        status: "open" as const,
        comments: [],
      };

      return {
        ...state,
        tensionItems: [...state.tensionItems, tensionItem],
        extractions: state.extractions.map((e) =>
          e.id === action.extractionId
            ? { ...e, status: "answered" as const, promotedToTensionId: tensionId }
            : e,
        ),
      };
    }

    case "SET_BID_LIKELIHOOD": {
      const bid = state.bids.find((b) => b.id === action.bidId);
      if (!bid) return state;

      const bids = state.bids.map((b) =>
        b.id === action.bidId
          ? { ...b, submitLikelihood: action.likelihood }
          : b,
      );

      // Crossing into "likely"/"committed" fires the Phase-2 ops-risk pass —
      // ops weighs in BEFORE the bid is committed, not after.
      const fires =
        (action.likelihood === "likely" || action.likelihood === "committed") &&
        bid.submitLikelihood !== "likely" &&
        bid.submitLikelihood !== "committed";

      const extractions = fires
        ? runExtractionPhase(state, action.bidId, "preBidCommit")
        : state.extractions;

      // The Phase-2 ops-risk findings join the scope board as planning items.
      const scopeItems = fires
        ? deriveScopeItems({ ...state, extractions }, action.bidId)
        : state.scopeItems;

      return { ...state, bids, extractions, scopeItems };
    }

    case "COMPLETE_INTAKE_STEP": {
      // Idempotent — a step only completes once.
      const alreadyDone = state.intakeSteps.some(
        (r) => r.bidId === action.bidId && r.step === action.step,
      );
      if (alreadyDone) return state;

      const run: IntakeStepRun = {
        bidId: action.bidId,
        step: action.step,
        completedById: action.completedById,
        completedAt: nowIso(),
        result: action.result,
      };
      let next: AppState = {
        ...state,
        intakeSteps: [...state.intakeSteps, run],
      };

      // The "facts" auto step IS the plan breakdown — fire the existing intake
      // extraction + project auto-fill so the findings appear under the pipeline.
      if (action.step === "facts") {
        const extractions = runExtractionPhase(next, action.bidId, "intake");
        let bids = next.bids;
        const info = cannedProjectInfoFor(action.bidId);
        if (info) {
          bids = next.bids.map((b) =>
            b.id === action.bidId
              ? { ...b, ...info.apply, detected: info.detected }
              : b,
          );
        }
        next = {
          ...next,
          extractions,
          bids,
          scopeItems: deriveScopeItems({ ...next, extractions }, action.bidId),
        };
      }

      return next;
    }

    case "DERIVE_SCOPE_ITEMS": {
      return { ...state, scopeItems: deriveScopeItems(state, action.bidId) };
    }

    case "SET_SCOPE_STAGE": {
      return {
        ...state,
        scopeItems: state.scopeItems.map((s) =>
          s.id === action.scopeItemId ? { ...s, stage: action.stage } : s,
        ),
      };
    }

    case "UPDATE_SCOPE_ITEM": {
      return {
        ...state,
        scopeItems: state.scopeItems.map((s) =>
          s.id === action.scopeItemId ? { ...s, ...action.patch } : s,
        ),
      };
    }

    case "PROMOTE_SCOPE_TO_TENSION": {
      const item = state.scopeItems.find((s) => s.id === action.scopeItemId);
      if (!item || item.tensionItemId) return state;

      const tensionId = newId("ti");
      // Ops-owned scope challenges read as risks; everything else as a scope gap.
      const type: TensionItemType = item.audience === "ops" ? "risk" : "scopeGap";
      const tensionItem: TensionItem = {
        id: tensionId,
        bidId: item.bidId,
        type,
        title: item.title,
        detail: item.sourceRef
          ? `${item.detail}\n\nFrom the scope board — ${item.sourceRef}`
          : `${item.detail}\n\nFrom the scope board.`,
        raisedById: action.raisedById,
        createdAt: nowIso(),
        status: "open" as const,
        comments: [],
      };

      return {
        ...state,
        tensionItems: [...state.tensionItems, tensionItem],
        scopeItems: state.scopeItems.map((s) =>
          s.id === action.scopeItemId
            ? { ...s, stage: "challenged" as const, tensionItemId: tensionId }
            : s,
        ),
      };
    }

    case "UPDATE_PROCUREMENT_ITEM": {
      return {
        ...state,
        procurementItems: state.procurementItems.map((p) =>
          p.id === action.itemId ? { ...p, ...action.patch } : p,
        ),
      };
    }

    case "ADD_PROCUREMENT_ITEM": {
      return {
        ...state,
        procurementItems: [
          {
            id: newId("pi"),
            bidId: action.bidId,
            category: action.category,
            label: action.label,
            vendor: action.vendor,
            quantity: action.quantity,
            leadTimeWeeks: action.leadTimeWeeks,
            needBy: action.needBy,
            status: "notStarted" as const,
            ownerRole: action.ownerRole,
          },
          ...state.procurementItems,
        ],
      };
    }

    case "UPDATE_MILESTONE": {
      return {
        ...state,
        projectMilestones: state.projectMilestones.map((m) =>
          m.id === action.milestoneId ? { ...m, ...action.patch } : m,
        ),
      };
    }

    case "SET_PROJECT_PLAN": {
      const existing = state.projectPlans[action.bidId] ?? {
        bidId: action.bidId,
      };
      return {
        ...state,
        projectPlans: {
          ...state.projectPlans,
          [action.bidId]: { ...existing, ...action.patch },
        },
      };
    }

    case "DRAFT_RFI_FROM_EXTRACTION": {
      const ex = state.extractions.find((e) => e.id === action.extractionId);
      if (!ex) return state;
      // Idempotent — one RFI per finding so the demo can't double-draft.
      const already = state.rfis.some(
        (r) => r.sourceExtractionId === action.extractionId,
      );
      if (already) return state;

      const rfi: Rfi = {
        ...buildRfiFromExtraction(
          ex,
          action.raisedById,
          nextNumber(state.rfis, ex.bidId, rfiNumber),
          nowIso(),
        ),
        id: newId("rfi"),
      };
      return { ...state, rfis: [rfi, ...state.rfis] };
    }

    case "ADD_RFI": {
      const rfi: Rfi = {
        id: newId("rfi"),
        bidId: action.bidId,
        number: nextNumber(state.rfis, action.bidId, rfiNumber),
        subject: action.subject,
        question: action.question,
        origin: action.origin,
        raisedById: action.raisedById,
        createdAt: nowIso(),
        status: "draft",
        priority: "normal",
        ballInCourt: "weingartner",
        ...action.patch,
      };
      return { ...state, rfis: [rfi, ...state.rfis] };
    }

    case "UPDATE_RFI": {
      return {
        ...state,
        rfis: state.rfis.map((r) =>
          r.id === action.rfiId ? { ...r, ...action.patch } : r,
        ),
      };
    }

    case "UPDATE_RFI_STATUS": {
      return {
        ...state,
        rfis: state.rfis.map((r) =>
          r.id === action.rfiId
            ? {
                ...r,
                status: action.status,
                submittedAt:
                  action.status === "submitted" && !r.submittedAt
                    ? nowIso()
                    : r.submittedAt,
                // Submitting puts the ball in the GC/design team's court.
                ballInCourt:
                  action.status === "submitted" ? "gc" : r.ballInCourt,
              }
            : r,
        ),
      };
    }

    case "ANSWER_RFI": {
      return {
        ...state,
        rfis: state.rfis.map((r) =>
          r.id === action.rfiId
            ? {
                ...r,
                status: "answered" as const,
                answer: action.answer,
                answeredBy: action.answeredBy,
                answeredAt: nowIso(),
                // Answer's back — the next move (close / convert) is ours.
                ballInCourt: "weingartner",
              }
            : r,
        ),
      };
    }

    case "ADD_RFI_NOTE": {
      return {
        ...state,
        rfis: state.rfis.map((r) =>
          r.id === action.rfiId
            ? {
                ...r,
                activity: [
                  ...(r.activity ?? []),
                  activityEvent("note", action.body, {
                    actorId: action.authorId,
                  }),
                ],
              }
            : r,
        ),
      };
    }

    case "ADD_RFI_ATTACHMENT": {
      const attachment: Attachment = {
        id: newId("att"),
        name: action.name,
        kind: action.kind,
        note: action.note,
        addedById: action.addedById,
        addedAt: nowIso(),
      };
      return {
        ...state,
        rfis: state.rfis.map((r) =>
          r.id === action.rfiId
            ? { ...r, attachments: [...(r.attachments ?? []), attachment] }
            : r,
        ),
      };
    }

    case "CONVERT_RFI_TO_CO": {
      const rfi = state.rfis.find((r) => r.id === action.rfiId);
      if (!rfi || rfi.linkedChangeOrderId) return state;

      const coId = newId("co");
      const co: ChangeOrder = {
        ...buildCoFromRfi(
          rfi,
          action.raisedById,
          "PM",
          nextNumber(state.changeOrders, rfi.bidId, coNumber),
          nowIso(),
        ),
        id: coId,
        // Carry the field's read on dollars / days forward into the CO.
        scheduleImpactDays: rfi.scheduleImpactDays,
        costAmount: rfi.costImpactEstimate,
        directedTo: rfi.directedTo,
        ballInCourt: "weingartner",
        reason: "designChange",
      };
      return {
        ...state,
        changeOrders: [co, ...state.changeOrders],
        rfis: state.rfis.map((r) =>
          r.id === action.rfiId
            ? { ...r, status: "converted" as const, linkedChangeOrderId: coId }
            : r,
        ),
      };
    }

    case "ADD_CHANGE_ORDER": {
      const lineItems = action.patch?.lineItems;
      const markupPct = action.patch?.markupPct;
      const co: ChangeOrder = {
        id: newId("co"),
        bidId: action.bidId,
        number: nextNumber(state.changeOrders, action.bidId, coNumber),
        title: action.title,
        description: action.description,
        origin: action.origin,
        tmTicketRef: action.tmTicketRef,
        planRef: action.planRef,
        raisedById: action.raisedById,
        ownerRole: action.ownerRole,
        createdAt: nowIso(),
        status: "draft",
        pricingMethod: "lumpSum",
        ballInCourt: "weingartner",
        ...action.patch,
        // A breakdown, when present, is the source of truth for the headline.
        costAmount:
          lineItems && lineItems.length > 0
            ? lineItemTotal(lineItems, markupPct)
            : action.costAmount,
      };
      return { ...state, changeOrders: [co, ...state.changeOrders] };
    }

    case "UPDATE_CHANGE_ORDER": {
      return {
        ...state,
        changeOrders: state.changeOrders.map((co) => {
          if (co.id !== action.coId) return co;
          const next = { ...co, ...action.patch };
          // A change to the breakdown or markup re-rolls the headline value.
          if ("lineItems" in action.patch || "markupPct" in action.patch) {
            if (next.lineItems && next.lineItems.length > 0) {
              next.costAmount = lineItemTotal(next.lineItems, next.markupPct);
            }
          }
          // Stamp lifecycle timestamps as the status advances.
          if (action.patch.status === "submitted" && !next.submittedAt) {
            next.submittedAt = nowIso();
            next.ballInCourt = "gc";
          }
          if (action.patch.status === "approved" && !next.approvedAt) {
            next.approvedAt = nowIso();
            next.ballInCourt = "weingartner";
          }
          return next;
        }),
      };
    }

    case "ADD_CO_NOTE": {
      return {
        ...state,
        changeOrders: state.changeOrders.map((co) =>
          co.id === action.coId
            ? {
                ...co,
                activity: [
                  ...(co.activity ?? []),
                  activityEvent("note", action.body, {
                    actorId: action.authorId,
                  }),
                ],
              }
            : co,
        ),
      };
    }

    case "ADD_CO_ATTACHMENT": {
      const attachment: Attachment = {
        id: newId("att"),
        name: action.name,
        kind: action.kind,
        note: action.note,
        addedById: action.addedById,
        addedAt: nowIso(),
      };
      return {
        ...state,
        changeOrders: state.changeOrders.map((co) =>
          co.id === action.coId
            ? { ...co, attachments: [...(co.attachments ?? []), attachment] }
            : co,
        ),
      };
    }

    case "SET_CURRENT_USER": {
      return { ...state, currentUserId: action.personId };
    }

    case "RESET": {
      return action.state;
    }

    default:
      return state;
  }
}
