"use client";

import * as React from "react";
import { reducer } from "./reducer";
import { createSeedState } from "@/lib/mock-data/seed";
import { clearState, loadState, saveState } from "./persistence";
import type {
  AppState,
  AttachmentKind,
  BidStage,
  BidLikelihood,
  ChangeOrder,
  CoOrigin,
  CommentKind,
  DocType,
  ExtractionPhase,
  IntakeStepKey,
  MilestoneStatus,
  Person,
  Priority,
  ProcurementCategory,
  ProcurementStatus,
  ProjectPlan,
  Region,
  Rfi,
  RfiOrigin,
  RfiStatus,
  Role,
  ScopeItem,
  ScopeStage,
  SignOffDecision,
  StandardCategory,
  TaskRecurrence,
  TaskStatus,
  TensionItemType,
  Trade,
} from "./types";

function freshSeed(): AppState {
  return structuredClone(createSeedState());
}

interface StoreContextValue {
  state: AppState;
  hydrated: boolean;
  currentUser: Person;
  getPerson: (id: string) => Person | undefined;
  // actions
  moveBidStage: (bidId: string, toStage: BidStage) => void;
  addComment: (
    tensionItemId: string,
    body: string,
    kind: CommentKind,
  ) => void;
  resolveTensionItem: (tensionItemId: string) => void;
  reopenTensionItem: (tensionItemId: string) => void;
  setTensionResolution: (tensionItemId: string, resolution: string) => void;
  toggleTensionAgreement: (tensionItemId: string) => void;
  addTensionItem: (input: {
    bidId: string;
    itemType: TensionItemType;
    title: string;
    detail: string;
  }) => void;
  setSignOff: (
    bidId: string,
    decision: SignOffDecision,
    note?: string,
  ) => void;
  addTask: (input: {
    title: string;
    description?: string;
    assigneeId: string;
    dueDate?: string;
    priority: Priority;
    linkedBidId?: string;
    recurrence?: TaskRecurrence;
  }) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  reassignTask: (taskId: string, assigneeId: string) => void;
  updateTask: (
    taskId: string,
    patch: {
      title?: string;
      description?: string;
      priority?: Priority;
      dueDate?: string;
      linkedBidId?: string;
      recurrence?: TaskRecurrence;
    },
  ) => void;
  addTaskComment: (taskId: string, body: string) => void;
  postStandard: (input: {
    body: string;
    category: StandardCategory;
    trades: Trade[];
    regions: Region[];
    linkedBidId?: string;
  }) => void;
  acknowledgeStandard: (standardId: string) => void;
  setHandoffItem: (
    itemId: string,
    status: "pending" | "confirmed" | "flagged",
    note?: string,
  ) => void;
  setHandoffNotes: (bidId: string, notes: string) => void;
  toggleHandoffAttendee: (bidId: string, personId: string) => void;
  setReviewNotes: (bidId: string, notes: string) => void;
  toggleReviewAttendee: (bidId: string, personId: string) => void;
  // plan room
  importDocument: (input: {
    bidId: string;
    name: string;
    docType: DocType;
    pageCount?: number;
  }) => void;
  runExtraction: (bidId: string, phase: ExtractionPhase) => void;
  answerExtraction: (extractionId: string, answer: string) => void;
  dismissExtraction: (extractionId: string) => void;
  reopenExtraction: (extractionId: string) => void;
  promoteExtraction: (extractionId: string) => void;
  setBidLikelihood: (bidId: string, likelihood: BidLikelihood) => void;
  completeIntakeStep: (
    bidId: string,
    step: IntakeStepKey,
    result?: string,
  ) => void;
  // scope board
  deriveScopeItems: (bidId: string) => void;
  setScopeStage: (scopeItemId: string, stage: ScopeStage) => void;
  updateScopeItem: (
    scopeItemId: string,
    patch: Partial<
      Pick<
        ScopeItem,
        "disposition" | "quantity" | "assumption" | "productionRate" | "crewNote"
      >
    >,
  ) => void;
  promoteScopeToTension: (scopeItemId: string) => void;
  // active projects
  updateProcurementItem: (
    itemId: string,
    patch: {
      status?: ProcurementStatus;
      vendor?: string;
      needBy?: string;
      note?: string;
      quantity?: string;
    },
  ) => void;
  addProcurementItem: (input: {
    bidId: string;
    category: ProcurementCategory;
    label: string;
    leadTimeWeeks: number;
    ownerRole: Role;
    vendor?: string;
    quantity?: string;
    needBy?: string;
  }) => void;
  updateMilestone: (
    milestoneId: string,
    patch: { status?: MilestoneStatus; targetDate?: string; note?: string },
  ) => void;
  setProjectPlan: (
    bidId: string,
    patch: Partial<Omit<ProjectPlan, "bidId">>,
  ) => void;
  // rfis & change orders
  draftRfiFromExtraction: (extractionId: string) => void;
  addRfi: (input: {
    bidId: string;
    subject: string;
    question: string;
    origin: RfiOrigin;
    patch?: Partial<
      Pick<
        Rfi,
        | "planRef"
        | "specRef"
        | "discipline"
        | "priority"
        | "directedTo"
        | "responseNeededBy"
        | "proposedAnswer"
        | "costImpactLikely"
        | "costImpactEstimate"
        | "scheduleImpactDays"
      >
    >;
  }) => void;
  updateRfi: (
    rfiId: string,
    patch: Partial<
      Pick<
        Rfi,
        | "subject"
        | "question"
        | "planRef"
        | "specRef"
        | "discipline"
        | "priority"
        | "directedTo"
        | "ballInCourt"
        | "responseNeededBy"
        | "proposedAnswer"
        | "costImpactLikely"
        | "costImpactEstimate"
        | "scheduleImpactDays"
      >
    >,
  ) => void;
  updateRfiStatus: (rfiId: string, status: RfiStatus) => void;
  answerRfi: (rfiId: string, answer: string, answeredBy: string) => void;
  addRfiNote: (rfiId: string, body: string) => void;
  addRfiAttachment: (
    rfiId: string,
    input: { name: string; kind: AttachmentKind; note?: string },
  ) => void;
  convertRfiToCo: (rfiId: string) => void;
  addChangeOrder: (input: {
    bidId: string;
    title: string;
    description: string;
    origin: CoOrigin;
    ownerRole: Role;
    costAmount?: number;
    tmTicketRef?: string;
    planRef?: string;
    patch?: Partial<
      Pick<
        ChangeOrder,
        | "reason"
        | "pricingMethod"
        | "lineItems"
        | "markupPct"
        | "directedTo"
        | "responseNeededBy"
        | "scheduleImpactDays"
      >
    >;
  }) => void;
  updateChangeOrder: (
    coId: string,
    patch: Partial<
      Pick<
        ChangeOrder,
        | "title"
        | "status"
        | "costAmount"
        | "scheduleImpactDays"
        | "approvedBy"
        | "approvedAt"
        | "description"
        | "reason"
        | "pricingMethod"
        | "lineItems"
        | "markupPct"
        | "directedTo"
        | "ballInCourt"
        | "responseNeededBy"
        | "revision"
      >
    >,
  ) => void;
  addCoNote: (coId: string, body: string) => void;
  addCoAttachment: (
    coId: string,
    input: { name: string; kind: AttachmentKind; note?: string },
  ) => void;
  setCurrentUser: (personId: string) => void;
  resetDemo: () => void;
}

const StoreContext = React.createContext<StoreContextValue | null>(null);

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  // Seed is the deterministic SSR snapshot; rehydrate from localStorage on mount.
  const [state, dispatch] = React.useReducer(reducer, undefined, freshSeed);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    // One-time rehydration from localStorage after mount. Seed is the SSR
    // snapshot; we reconcile to stored state on the client, then flip the
    // hydrated flag so write-through persistence kicks in.
    const stored = loadState();
    // Reconcile stored state onto a fresh seed so top-level keys added since the
    // stored snapshot was written (e.g. rfis, changeOrders) fall back to seed
    // defaults instead of arriving as undefined and crashing selectors.
    if (stored) dispatch({ type: "RESET", state: { ...freshSeed(), ...stored } });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const currentUserId = state.currentUserId;

  const value = React.useMemo<StoreContextValue>(() => {
    const currentUser =
      state.people.find((p) => p.id === currentUserId) ?? state.people[0];
    return {
      state,
      hydrated,
      currentUser,
      getPerson: (id) => state.people.find((p) => p.id === id),
      moveBidStage: (bidId, toStage) =>
        dispatch({ type: "MOVE_BID_STAGE", bidId, toStage }),
      addComment: (tensionItemId, body, kind) =>
        dispatch({
          type: "ADD_COMMENT",
          tensionItemId,
          authorId: currentUserId,
          body,
          kind,
        }),
      resolveTensionItem: (tensionItemId) =>
        dispatch({ type: "RESOLVE_TENSION_ITEM", tensionItemId }),
      reopenTensionItem: (tensionItemId) =>
        dispatch({ type: "REOPEN_TENSION_ITEM", tensionItemId }),
      setTensionResolution: (tensionItemId, resolution) =>
        dispatch({ type: "SET_TENSION_RESOLUTION", tensionItemId, resolution }),
      toggleTensionAgreement: (tensionItemId) =>
        dispatch({
          type: "TOGGLE_TENSION_AGREEMENT",
          tensionItemId,
          personId: currentUserId,
        }),
      addTensionItem: (input) =>
        dispatch({
          type: "ADD_TENSION_ITEM",
          bidId: input.bidId,
          raisedById: currentUserId,
          itemType: input.itemType,
          title: input.title,
          detail: input.detail,
        }),
      setSignOff: (bidId, decision, note) =>
        dispatch({
          type: "SET_SIGNOFF",
          bidId,
          personId: currentUserId,
          decision,
          note,
        }),
      addTask: (input) =>
        dispatch({
          type: "ADD_TASK",
          title: input.title,
          description: input.description,
          assigneeId: input.assigneeId,
          createdById: currentUserId,
          dueDate: input.dueDate,
          priority: input.priority,
          linkedBidId: input.linkedBidId,
          recurrence: input.recurrence,
        }),
      updateTaskStatus: (taskId, status) =>
        dispatch({ type: "UPDATE_TASK_STATUS", taskId, status }),
      reassignTask: (taskId, assigneeId) =>
        dispatch({ type: "REASSIGN_TASK", taskId, assigneeId }),
      updateTask: (taskId, patch) =>
        dispatch({ type: "UPDATE_TASK", taskId, patch }),
      addTaskComment: (taskId, body) =>
        dispatch({
          type: "ADD_TASK_COMMENT",
          taskId,
          authorId: currentUserId,
          body,
        }),
      postStandard: (input) =>
        dispatch({
          type: "POST_STANDARD",
          authorId: currentUserId,
          body: input.body,
          category: input.category,
          trades: input.trades,
          regions: input.regions,
          linkedBidId: input.linkedBidId,
        }),
      acknowledgeStandard: (standardId) =>
        dispatch({ type: "ACK_STANDARD", standardId, personId: currentUserId }),
      setHandoffItem: (itemId, status, note) =>
        dispatch({ type: "SET_HANDOFF_ITEM", itemId, status, note }),
      setHandoffNotes: (bidId, notes) =>
        dispatch({ type: "SET_HANDOFF_NOTES", bidId, notes }),
      toggleHandoffAttendee: (bidId, personId) =>
        dispatch({ type: "TOGGLE_HANDOFF_ATTENDEE", bidId, personId }),
      setReviewNotes: (bidId, notes) =>
        dispatch({ type: "SET_REVIEW_NOTES", bidId, notes }),
      toggleReviewAttendee: (bidId, personId) =>
        dispatch({ type: "TOGGLE_REVIEW_ATTENDEE", bidId, personId }),
      importDocument: (input) =>
        dispatch({
          type: "IMPORT_DOCUMENT",
          bidId: input.bidId,
          name: input.name,
          docType: input.docType,
          pageCount: input.pageCount,
          uploadedById: currentUserId,
        }),
      runExtraction: (bidId, phase) =>
        dispatch({ type: "RUN_EXTRACTION", bidId, phase }),
      answerExtraction: (extractionId, answer) =>
        dispatch({
          type: "ANSWER_EXTRACTION",
          extractionId,
          answer,
          answeredById: currentUserId,
        }),
      dismissExtraction: (extractionId) =>
        dispatch({ type: "DISMISS_EXTRACTION", extractionId }),
      reopenExtraction: (extractionId) =>
        dispatch({ type: "REOPEN_EXTRACTION", extractionId }),
      promoteExtraction: (extractionId) =>
        dispatch({
          type: "PROMOTE_EXTRACTION",
          extractionId,
          raisedById: currentUserId,
        }),
      setBidLikelihood: (bidId, likelihood) =>
        dispatch({ type: "SET_BID_LIKELIHOOD", bidId, likelihood }),
      completeIntakeStep: (bidId, step, result) =>
        dispatch({
          type: "COMPLETE_INTAKE_STEP",
          bidId,
          step,
          completedById: currentUserId,
          result,
        }),
      deriveScopeItems: (bidId) =>
        dispatch({ type: "DERIVE_SCOPE_ITEMS", bidId }),
      setScopeStage: (scopeItemId, stage) =>
        dispatch({ type: "SET_SCOPE_STAGE", scopeItemId, stage }),
      updateScopeItem: (scopeItemId, patch) =>
        dispatch({ type: "UPDATE_SCOPE_ITEM", scopeItemId, patch }),
      promoteScopeToTension: (scopeItemId) =>
        dispatch({
          type: "PROMOTE_SCOPE_TO_TENSION",
          scopeItemId,
          raisedById: currentUserId,
        }),
      updateProcurementItem: (itemId, patch) =>
        dispatch({ type: "UPDATE_PROCUREMENT_ITEM", itemId, patch }),
      addProcurementItem: (input) =>
        dispatch({
          type: "ADD_PROCUREMENT_ITEM",
          bidId: input.bidId,
          category: input.category,
          label: input.label,
          leadTimeWeeks: input.leadTimeWeeks,
          ownerRole: input.ownerRole,
          vendor: input.vendor,
          quantity: input.quantity,
          needBy: input.needBy,
        }),
      updateMilestone: (milestoneId, patch) =>
        dispatch({ type: "UPDATE_MILESTONE", milestoneId, patch }),
      setProjectPlan: (bidId, patch) =>
        dispatch({ type: "SET_PROJECT_PLAN", bidId, patch }),
      draftRfiFromExtraction: (extractionId) =>
        dispatch({
          type: "DRAFT_RFI_FROM_EXTRACTION",
          extractionId,
          raisedById: currentUserId,
        }),
      addRfi: (input) =>
        dispatch({
          type: "ADD_RFI",
          bidId: input.bidId,
          subject: input.subject,
          question: input.question,
          origin: input.origin,
          patch: input.patch,
          raisedById: currentUserId,
        }),
      updateRfi: (rfiId, patch) =>
        dispatch({ type: "UPDATE_RFI", rfiId, patch }),
      updateRfiStatus: (rfiId, status) =>
        dispatch({ type: "UPDATE_RFI_STATUS", rfiId, status }),
      answerRfi: (rfiId, answer, answeredBy) =>
        dispatch({ type: "ANSWER_RFI", rfiId, answer, answeredBy }),
      addRfiNote: (rfiId, body) =>
        dispatch({
          type: "ADD_RFI_NOTE",
          rfiId,
          authorId: currentUserId,
          body,
        }),
      addRfiAttachment: (rfiId, input) =>
        dispatch({
          type: "ADD_RFI_ATTACHMENT",
          rfiId,
          addedById: currentUserId,
          name: input.name,
          kind: input.kind,
          note: input.note,
        }),
      convertRfiToCo: (rfiId) =>
        dispatch({
          type: "CONVERT_RFI_TO_CO",
          rfiId,
          raisedById: currentUserId,
        }),
      addChangeOrder: (input) =>
        dispatch({
          type: "ADD_CHANGE_ORDER",
          bidId: input.bidId,
          title: input.title,
          description: input.description,
          origin: input.origin,
          ownerRole: input.ownerRole,
          costAmount: input.costAmount,
          tmTicketRef: input.tmTicketRef,
          planRef: input.planRef,
          patch: input.patch,
          raisedById: currentUserId,
        }),
      updateChangeOrder: (coId, patch) =>
        dispatch({ type: "UPDATE_CHANGE_ORDER", coId, patch }),
      addCoNote: (coId, body) =>
        dispatch({
          type: "ADD_CO_NOTE",
          coId,
          authorId: currentUserId,
          body,
        }),
      addCoAttachment: (coId, input) =>
        dispatch({
          type: "ADD_CO_ATTACHMENT",
          coId,
          addedById: currentUserId,
          name: input.name,
          kind: input.kind,
          note: input.note,
        }),
      setCurrentUser: (personId) =>
        dispatch({ type: "SET_CURRENT_USER", personId }),
      resetDemo: () => {
        clearState();
        dispatch({ type: "RESET", state: freshSeed() });
      },
    };
  }, [state, hydrated, currentUserId]);

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useAppStore(): StoreContextValue {
  const ctx = React.useContext(StoreContext);
  if (!ctx) {
    throw new Error("useAppStore must be used within an AppStoreProvider");
  }
  return ctx;
}
