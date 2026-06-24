import type {
  AppState,
  BidStage,
  BidLikelihood,
  ChangeOrder,
  CoOrigin,
  CommentKind,
  DocType,
  ExtractionPhase,
  IntakeStepKey,
  Priority,
  ProcurementCategory,
  ProcurementItem,
  ProjectMilestone,
  ProjectPlan,
  RfiOrigin,
  RfiStatus,
  SignOffDecision,
  StandardCategory,
  Task,
  TaskRecurrence,
  TaskStatus,
  TensionItemType,
  Trade,
  Region,
  Role,
} from "./types";

export type Action =
  | { type: "MOVE_BID_STAGE"; bidId: string; toStage: BidStage }
  | {
      type: "ADD_COMMENT";
      tensionItemId: string;
      authorId: string;
      body: string;
      kind: CommentKind;
    }
  | { type: "RESOLVE_TENSION_ITEM"; tensionItemId: string }
  | { type: "REOPEN_TENSION_ITEM"; tensionItemId: string }
  | {
      type: "SET_TENSION_RESOLUTION";
      tensionItemId: string;
      resolution: string;
    }
  | {
      type: "TOGGLE_TENSION_AGREEMENT";
      tensionItemId: string;
      personId: string;
    }
  | {
      type: "ADD_TENSION_ITEM";
      bidId: string;
      raisedById: string;
      itemType: TensionItemType;
      title: string;
      detail: string;
    }
  | {
      type: "SET_SIGNOFF";
      bidId: string;
      personId: string;
      decision: SignOffDecision;
      note?: string;
    }
  | {
      type: "ADD_TASK";
      title: string;
      description?: string;
      assigneeId: string;
      createdById: string;
      dueDate?: string;
      priority: Priority;
      linkedBidId?: string;
      recurrence?: TaskRecurrence;
    }
  | { type: "UPDATE_TASK_STATUS"; taskId: string; status: TaskStatus }
  | { type: "REASSIGN_TASK"; taskId: string; assigneeId: string }
  | {
      type: "UPDATE_TASK";
      taskId: string;
      patch: Partial<
        Pick<
          Task,
          | "title"
          | "description"
          | "priority"
          | "dueDate"
          | "linkedBidId"
          | "recurrence"
        >
      >;
    }
  | {
      type: "ADD_TASK_COMMENT";
      taskId: string;
      authorId: string;
      body: string;
    }
  | {
      type: "POST_STANDARD";
      authorId: string;
      body: string;
      category: StandardCategory;
      trades: Trade[];
      regions: Region[];
      linkedBidId?: string;
    }
  | { type: "ACK_STANDARD"; standardId: string; personId: string }
  | {
      type: "SET_HANDOFF_ITEM";
      itemId: string;
      status: "pending" | "confirmed" | "flagged";
      note?: string;
    }
  | { type: "SET_HANDOFF_NOTES"; bidId: string; notes: string }
  | { type: "TOGGLE_HANDOFF_ATTENDEE"; bidId: string; personId: string }
  | { type: "SET_REVIEW_NOTES"; bidId: string; notes: string }
  | { type: "TOGGLE_REVIEW_ATTENDEE"; bidId: string; personId: string }
  | {
      type: "IMPORT_DOCUMENT";
      bidId: string;
      name: string;
      docType: DocType;
      pageCount?: number;
      uploadedById: string;
    }
  | { type: "RUN_EXTRACTION"; bidId: string; phase: ExtractionPhase }
  | {
      type: "ANSWER_EXTRACTION";
      extractionId: string;
      answer: string;
      answeredById: string;
    }
  | { type: "DISMISS_EXTRACTION"; extractionId: string }
  | { type: "REOPEN_EXTRACTION"; extractionId: string }
  | {
      type: "PROMOTE_EXTRACTION";
      extractionId: string;
      raisedById: string;
    }
  | {
      type: "SET_BID_LIKELIHOOD";
      bidId: string;
      likelihood: BidLikelihood;
    }
  | {
      type: "COMPLETE_INTAKE_STEP";
      bidId: string;
      step: IntakeStepKey;
      completedById: string;
      result?: string;
    }
  | {
      type: "UPDATE_PROCUREMENT_ITEM";
      itemId: string;
      patch: Partial<
        Pick<ProcurementItem, "status" | "vendor" | "needBy" | "note" | "quantity">
      >;
    }
  | {
      type: "ADD_PROCUREMENT_ITEM";
      bidId: string;
      category: ProcurementCategory;
      label: string;
      leadTimeWeeks: number;
      ownerRole: Role;
      vendor?: string;
      quantity?: string;
      needBy?: string;
    }
  | {
      type: "UPDATE_MILESTONE";
      milestoneId: string;
      patch: Partial<
        Pick<ProjectMilestone, "status" | "targetDate" | "note">
      >;
    }
  | {
      type: "SET_PROJECT_PLAN";
      bidId: string;
      patch: Partial<Omit<ProjectPlan, "bidId">>;
    }
  // ── RFIs & Change Orders ──
  | {
      type: "DRAFT_RFI_FROM_EXTRACTION";
      extractionId: string;
      raisedById: string;
    }
  | {
      type: "ADD_RFI";
      bidId: string;
      subject: string;
      question: string;
      origin: RfiOrigin;
      raisedById: string;
      planRef?: string;
      costImpactLikely?: boolean;
    }
  | { type: "UPDATE_RFI_STATUS"; rfiId: string; status: RfiStatus }
  | {
      type: "ANSWER_RFI";
      rfiId: string;
      answer: string;
      answeredBy: string;
    }
  | { type: "CONVERT_RFI_TO_CO"; rfiId: string; raisedById: string }
  | {
      type: "ADD_CHANGE_ORDER";
      bidId: string;
      title: string;
      description: string;
      origin: CoOrigin;
      raisedById: string;
      ownerRole: Role;
      costAmount?: number;
      tmTicketRef?: string;
      planRef?: string;
    }
  | {
      type: "UPDATE_CHANGE_ORDER";
      coId: string;
      patch: Partial<
        Pick<
          ChangeOrder,
          | "status"
          | "costAmount"
          | "scheduleImpactDays"
          | "approvedBy"
          | "approvedAt"
          | "description"
        >
      >;
    }
  | { type: "SET_CURRENT_USER"; personId: string }
  | { type: "RESET"; state: AppState };
