// Core domain types for the Weingartner Ops ↔ Estimating prototype.

export type Role =
  | "CEO"
  | "EstimatorMasonry"
  | "EstimatorConcrete"
  | "PM"
  | "Ops"
  | "Accounting"
  | "Super"
  | "QC"
  | "Coordinator";

export type Trade = "masonry" | "concrete";
export type Region = "CA" | "AZ" | "NV" | "other";

export type BidStage =
  | "invited"
  | "estimating"
  | "preBidReview"
  | "submitted"
  | "awarded"
  | "handoff"
  | "active";

export interface Person {
  id: string;
  name: string;
  role: Role;
  trade?: Trade;
  initials: string;
  /** tailwind-ish background class for the avatar fallback */
  avatarColor?: string;
}

/**
 * The estimator's read on whether we'll actually submit. Crossing into
 * "likely" is the trigger that fires Plan Room's Phase-2 ops-risk questions —
 * ops gets to weigh in BEFORE we commit, not after.
 */
export type BidLikelihood = "unset" | "watching" | "likely" | "committed";

/**
 * Once a bid is submitted, how confident estimating is that we'll win it.
 * Drives the revenue forecast weighting on the Schedule view — "high" rolls up
 * with awarded work as near-booked; everything else is treated as soft pipeline.
 */
export type WinConfidence = "high" | "medium" | "low";

/** One project field the AI pulled off the documents, with its source. */
export interface DetectedField {
  /** Matches a key shown in the overview, e.g. "Square footage". */
  label: string;
  value: string;
  /** Where it came from, e.g. "Scope Letter p.1". */
  sourceRef: string;
}

export interface Bid {
  id: string;
  name: string;
  gc: string;
  location: string;
  region: Region;
  trade: Trade;
  squareFootage?: number;
  value: number;
  dueDate: string; // ISO
  estimatorId: string;
  stage: BidStage;
  createdAt: string; // ISO
  awardedAt?: string; // ISO
  submitLikelihood?: BidLikelihood;
  /** Set when the AI intake pass auto-fills project info from the documents. */
  detected?: DetectedField[];
  /** Estimating's read on winning, once submitted — feeds the revenue forecast. */
  winConfidence?: WinConfidence;
  /** Expected on-site start for not-yet-won work (ISO) — places it on the schedule. */
  expectedStart?: string;
  /** Expected on-site duration in weeks for not-yet-won work. */
  expectedDurationWeeks?: number;
  /** Expected peak crew for not-yet-won work — feeds staffing demand. */
  expectedCrew?: number;
}

export type StandardCategory =
  | "leadTime"
  | "capacity"
  | "productionRate"
  | "wage"
  | "general";

export interface StandardNote {
  id: string;
  authorId: string;
  body: string;
  createdAt: string; // ISO
  trades: Trade[];
  regions: Region[];
  category: StandardCategory;
  /** personIds who acknowledged */
  acks: string[];
  linkedBidId?: string;
}

export type TensionItemType =
  | "assumption"
  | "productionRate"
  | "risk"
  | "exclusion"
  | "scopeGap"
  | "vendorQuote"
  | "contingency";

export type TensionStatus = "open" | "addressed" | "resolved";

export type CommentKind = "challenge" | "response" | "note";

export interface Comment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string; // ISO
  kind: CommentKind;
  resolved: boolean;
}

export interface TensionItem {
  id: string;
  bidId: string;
  type: TensionItemType;
  title: string;
  detail: string;
  raisedById: string;
  createdAt: string; // ISO
  status: TensionStatus;
  comments: Comment[];
  /** The end result the team landed on — written before it can be resolved. */
  resolution?: string;
  /**
   * People who've agreed to the resolution. A concern resolves only with a
   * written resolution AND mutual agreement: the raiser plus ≥1 other person.
   */
  agreedByIds?: string[];
}

export type SignOffDecision = "approve" | "approveWithNotes" | "needsChanges";

export interface SignOff {
  id: string;
  bidId: string;
  personId: string;
  decision: SignOffDecision;
  note?: string;
  updatedAt: string; // ISO
}

export type HandoffCategory =
  | "sov"
  | "scope"
  | "productionRates"
  | "crewPlan"
  | "foreman"
  | "rfi"
  | "schedule"
  | "risk";

export type HandoffStatus = "pending" | "confirmed" | "flagged";

export interface HandoffItem {
  id: string;
  bidId: string;
  category: HandoffCategory;
  label: string;
  status: HandoffStatus;
  note?: string;
  ownerRole: Role;
}

export interface HandoffMeeting {
  attendeeIds: string[];
  notes: string;
}

export type TaskStatus = "todo" | "inProgress" | "blocked" | "done";
export type Priority = "low" | "medium" | "high";
export type TaskSource = "template" | "adhoc";

/** How often a recurring task repeats. */
export type RecurrenceCadence = "daily" | "weekly" | "biweekly" | "monthly";

/**
 * Marks a task as recurring. Completing the task spawns the next occurrence
 * with its due date advanced by the cadence — standing work that never falls
 * off the radar (weekly capacity syncs, monthly wage refresh, etc.).
 */
export interface TaskRecurrence {
  cadence: RecurrenceCadence;
}

/** A line of discussion on a task — the coordination happens here. */
export interface TaskComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string; // ISO
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assigneeId: string;
  createdById: string;
  createdAt: string; // ISO
  dueDate?: string; // ISO
  status: TaskStatus;
  priority: Priority;
  linkedBidId?: string;
  stage?: BidStage;
  source: TaskSource;
  templateId?: string;
  comments?: TaskComment[];
  recurrence?: TaskRecurrence;
}

export interface TaskTemplate {
  id: string;
  stage: Extract<BidStage, "estimating" | "handoff">;
  title: string;
  assigneeRole: Role;
  priority: Priority;
  dueOffsetDays?: number;
}

// ──────────────────────────────────────────────────────────────────────────
// Plan Room — documents are imported, an AI pass breaks them down into
// findings that need eyes from Estimating and/or Ops.
// ──────────────────────────────────────────────────────────────────────────

export type DocType =
  | "plans"
  | "specBook"
  | "addendum"
  | "geotech"
  | "scopeLetter"
  | "bidForm"
  | "other";

export interface BidDocument {
  id: string;
  bidId: string;
  name: string;
  docType: DocType;
  pageCount?: number;
  uploadedById: string;
  uploadedAt: string; // ISO
}

/**
 * Two-phase surfacing:
 * - `intake`        — runs on import: facts + questions for Estimating & Ops.
 * - `preBidCommit`  — fires when the estimator marks the bid "likely":
 *                     ops-facing risk / consideration questions before commit.
 */
export type ExtractionPhase = "intake" | "preBidCommit";
export type ExtractionKind = "fact" | "question" | "risk";
export type ExtractionAudience = "estimating" | "ops" | "both";
export type ExtractionStatus = "open" | "answered" | "dismissed";

export interface Extraction {
  id: string;
  bidId: string;
  sourceDocId?: string;
  phase: ExtractionPhase;
  kind: ExtractionKind;
  audience: ExtractionAudience;
  title: string;
  detail: string;
  /** Where in the documents this came from, e.g. "Spec §04 22 00, p.142". */
  sourceRef?: string;
  status: ExtractionStatus;
  answeredById?: string;
  answer?: string;
  /** Set when promoted into the Tension Center for formal sign-off. */
  promotedToTensionId?: string;
  createdAt: string; // ISO
}

// ──────────────────────────────────────────────────────────────────────────
// Scope Items — the unit of scope itself, threaded across a lifecycle. Every
// finding the AI pulls off the plans (Extraction) auto-promotes into a scope
// item the team walks left→right: extracted by the AI → contextualized by
// estimating (qty + assumptions) → planned by ops (method + rate + crew) →
// challenged in pre-bid review → approved and locked into the bid. The Plan
// Room stays the raw document+findings feed; this is the process-centric board
// those findings flow into.
// ──────────────────────────────────────────────────────────────────────────

export type ScopeStage =
  | "extracted" // the AI pulled it off the documents — needs eyes
  | "contextualized" // estimating attached quantity + assumptions
  | "planned" // ops attached method / production rate / crew
  | "challenged" // a concern is open on it in the Tension Center
  | "approved"; // signed off — locked into the bid scope

/** Where a scope item lands: in the base bid, out of trade, or an add alternate. */
export type ScopeDisposition = "undecided" | "included" | "excluded" | "alternate";

export interface ScopeItem {
  id: string;
  bidId: string;
  title: string;
  detail: string;
  /** Where in the documents it came from, e.g. "A-201 wall schedule". */
  sourceRef?: string;
  /** The finding(s) this scope item was promoted from — traceability back to the plans. */
  sourceExtractionIds: string[];
  /** Who owns the next move, carried from the source finding. */
  audience: ExtractionAudience;
  stage: ScopeStage;
  disposition: ScopeDisposition;
  /** Estimating context — the "what" and "how much". */
  quantity?: string;
  assumption?: string;
  /** Ops plan — the "how". */
  productionRate?: string;
  crewNote?: string;
  /** Set when the item is challenged into the Tension Center for sign-off. */
  tensionItemId?: string;
  createdAt: string; // ISO
}

// ──────────────────────────────────────────────────────────────────────────
// RFIs & Change Orders — the one loop the field lives and dies on. An RFI can
// be *born* from a Plan Room scope-gap during estimating ("draft it for me"),
// travel with the bid, come back answered after award, and — when it carries a
// cost — convert straight into a Change Order. COs are tracked to billing so
// leadership can finally see what's outstanding per job, company-wide, and per
// person instead of $600K sitting in limbo on a spreadsheet.
// ──────────────────────────────────────────────────────────────────────────

/**
 * A mock attachment riding along with an RFI or Change Order — a field photo, a
 * marked-up sheet, a T&M ticket scan. No real upload; the name + caption are
 * enough to make the paper trail read true.
 */
export type AttachmentKind = "photo" | "pdf" | "doc" | "other";

export interface Attachment {
  id: string;
  name: string;
  kind: AttachmentKind;
  /** What it shows — caption shown under the file. */
  note?: string;
  addedById?: string;
  addedAt?: string; // ISO
}

/**
 * One entry on an RFI / CO history. The lifecycle stamps (created, submitted,
 * answered, approved…) are *derived* from the record's timestamps; only manual
 * notes are stored here, so the timeline can never drift from the status.
 */
export type ActivityKind =
  | "created"
  | "submitted"
  | "answered"
  | "statusChange"
  | "converted"
  | "approved"
  | "billed"
  | "note"
  | "attachment";

export interface ActivityEvent {
  id: string;
  at: string; // ISO
  kind: ActivityKind;
  /** Internal author, if a person. */
  actorId?: string;
  /** External author (GC / AOR) when there's no person record. */
  actorName?: string;
  body: string;
}

/** Whose move it is right now — the single most-asked field question. */
export type BallInCourt = "weingartner" | "gc" | "designTeam";

/** Where an RFI came from. `planGap` = drafted from a Plan Room finding. */
export type RfiOrigin = "planGap" | "field" | "manual";

/** Urgency of an RFI — drives the response-by chase and the sort order. */
export type RfiPriority = "low" | "normal" | "high" | "urgent";

/** Which design discipline owns the answer. */
export type RfiDiscipline =
  | "architectural"
  | "structural"
  | "civil"
  | "geotech"
  | "mechanical"
  | "electrical"
  | "other";

export type RfiStatus =
  | "draft" // drafted, not yet sent (e.g. queued to submit with the bid)
  | "submitted" // out to the GC / design team
  | "answered" // response received
  | "closed" // resolved, no cost impact
  | "converted"; // rolled into a Change Order

export interface Rfi {
  id: string;
  bidId: string;
  /** Display ref, e.g. "RFI-007". Auto-numbered per bid. */
  number: string;
  subject: string;
  question: string;
  origin: RfiOrigin;
  /** The Plan Room finding it was drafted from, if any. */
  sourceExtractionId?: string;
  /** The hyperlink back to the plans, e.g. "A-301 / S-2". */
  planRef?: string;
  raisedById: string;
  createdAt: string; // ISO
  submittedAt?: string; // ISO
  status: RfiStatus;
  answer?: string;
  answeredAt?: string; // ISO
  /** External party who answered (GC / AOR) — free text. */
  answeredBy?: string;
  /** Flags the RFI as a likely change order once answered. */
  costImpactLikely?: boolean;
  linkedChangeOrderId?: string;
  /** Mock attachment names for field-raised RFIs (legacy — prefer attachments). */
  photoRefs?: string[];

  // ── Depth: distribution, urgency, references, paper trail ──
  priority?: RfiPriority;
  discipline?: RfiDiscipline;
  /** Who owes the answer — the GC / AOR it's directed to (free text). */
  directedTo?: string;
  /** Whose move it is right now. */
  ballInCourt?: BallInCourt;
  /** Response-by date — what the chase is measured against. */
  responseNeededBy?: string; // ISO
  /** Spec section reference, e.g. "04 22 00". */
  specRef?: string;
  /** Our suggested answer, sent with the RFI to speed the turnaround. */
  proposedAnswer?: string;
  /** Field's rough read on the dollars / days at stake. */
  costImpactEstimate?: number;
  scheduleImpactDays?: number;
  attachments?: Attachment[];
  /** Manually-logged notes; lifecycle events are derived, not stored. */
  activity?: ActivityEvent[];
}

/** Where a Change Order originated. `fieldTM` = auto-populated from a T&M ticket. */
export type CoOrigin = "rfi" | "fieldTM" | "manual";

/** Why the work is extra to contract — drives the GC's review and our analytics. */
export type CoReason =
  | "ownerRequest"
  | "designChange"
  | "unforeseen"
  | "fieldCondition"
  | "codeCompliance"
  | "weather"
  | "other";

/** How the CO is priced — lump sum, time & material, or unit-price. */
export type CoPricingMethod = "lumpSum" | "tm" | "unitPrice";

/** A single line on the change-order cost breakdown. */
export type CoCostCategory =
  | "labor"
  | "material"
  | "equipment"
  | "subcontractor"
  | "other";

export interface CoLineItem {
  id: string;
  category: CoCostCategory;
  description: string;
  /** Quantity × unit, or a flat amount — we keep it simple: an entered total. */
  quantity?: number;
  unit?: string;
  unitCost?: number;
  /** The line subtotal. If qty/unitCost are set, equals their product. */
  amount: number;
}

export type CoStatus =
  | "draft" // raised, not yet costed
  | "pendingPM" // PM tuning the cost / scope before it goes out
  | "submitted" // out to the GC for approval
  | "approved" // GC approved — billable
  | "rejected" // GC rejected
  | "billed"; // invoiced through to accounting

export interface ChangeOrder {
  id: string;
  bidId: string;
  /** Display ref, e.g. "CO-003". Auto-numbered per bid. */
  number: string;
  title: string;
  description: string;
  origin: CoOrigin;
  /** The RFI it converted from, if any. */
  sourceRfiId?: string;
  /** The T&M ticket it was auto-populated from (field origin). */
  tmTicketRef?: string;
  /** Drives the "per person" dashboard cut. */
  raisedById: string;
  /** Who must move it next — usually the PM. */
  ownerRole: Role;
  createdAt: string; // ISO — aging is computed from here
  submittedAt?: string; // ISO
  status: CoStatus;
  /**
   * Headline value. When `lineItems` are present this is the computed roll-up
   * (subtotal + markup); otherwise it's entered directly. Dashboards read this.
   */
  costAmount?: number;
  scheduleImpactDays?: number;
  planRef?: string;
  approvedBy?: string;
  approvedAt?: string; // ISO
  /** Mock attachment names (legacy — prefer attachments). */
  photoRefs?: string[];

  // ── Depth: justification, pricing breakdown, distribution, paper trail ──
  reason?: CoReason;
  pricingMethod?: CoPricingMethod;
  /** The cost breakdown. When set, drives `costAmount`. */
  lineItems?: CoLineItem[];
  /** Overhead & profit applied on top of the line subtotal, as a percent. */
  markupPct?: number;
  /** The GC / owner it's directed to for approval (free text). */
  directedTo?: string;
  ballInCourt?: BallInCourt;
  /** Approval-by date — what the aging chase is measured against. */
  responseNeededBy?: string; // ISO
  /** Bumped on each resubmittal after a rejection. */
  revision?: number;
  attachments?: Attachment[];
  /** Manually-logged notes; lifecycle events are derived, not stored. */
  activity?: ActivityEvent[];
}

// ──────────────────────────────────────────────────────────────────────────
// Active Projects — once a bid is awarded it becomes a project. Two plans are
// auto-seeded from trade templates: a procurement plan (long-lead materials vs.
// the mobilization date) and a project plan (milestones + crew).
// ──────────────────────────────────────────────────────────────────────────

export type ProcurementCategory =
  | "block"
  | "rebar"
  | "cement"
  | "admixture"
  | "accessories"
  | "equipment"
  | "other";

export type ProcurementStatus =
  | "notStarted"
  | "quoting"
  | "ordered"
  | "delivered";

export interface ProcurementItem {
  id: string;
  bidId: string;
  category: ProcurementCategory;
  label: string;
  vendor?: string;
  quantity?: string;
  /** Typical lead time, drives the order-by date vs. need-by. */
  leadTimeWeeks: number;
  needBy?: string; // ISO — when it must be on site
  status: ProcurementStatus;
  ownerRole: Role;
  note?: string;
}

export type MilestoneStatus = "pending" | "inProgress" | "done" | "atRisk";

export interface ProjectMilestone {
  id: string;
  bidId: string;
  label: string;
  ownerRole: Role;
  targetDate?: string; // ISO
  status: MilestoneStatus;
  note?: string;
}

export interface ProjectPlan {
  bidId: string;
  mobilizationDate?: string; // ISO
  foremanId?: string;
  superId?: string;
  crewSize?: number;
  summary?: string;
}

/**
 * One line of a project's Schedule of Values — the priced breakdown that backs
 * the single awarded contract value. Display-only at handoff: ops reads it to
 * confirm the SOV matches the award before the job mobilizes.
 */
export interface SovLine {
  id: string;
  bidId: string;
  description: string; // e.g. "Formwork — caissons & walls"
  scheduledValue: number; // dollars
  note?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// Intake Pipeline — when plans are pulled into the Plan Room a bid runs through
// an ordered sequence of intake steps. The system runs the "auto" steps on its
// own; the "estimator" steps are teed up for a person and gated until the
// automation ahead of them is done. Mirrors Angel's real process: organize →
// compliance → facts → scope → questions → takeoff → proposal.
// ──────────────────────────────────────────────────────────────────────────

export type IntakeStepKey =
  | "organize"
  | "compliance"
  | "facts"
  | "draftExclusions"
  | "confirmScope"
  | "resolveQuestions"
  | "takeoff"
  | "proposal";

/** Who does the work: the system runs "auto" steps; "estimator" steps are teed up. */
export type IntakeOwner = "auto" | "estimator";

/** Derived per-bid status of a step. Stored state only records the `done` ones. */
export type IntakeStepStatus = "blocked" | "ready" | "running" | "done";

/** Static definition of one intake step, shared across all bids. */
export interface IntakeStepDef {
  key: IntakeStepKey;
  title: string;
  /** What happens in this step. */
  detail: string;
  owner: IntakeOwner;
  /** The teed-up call to action shown on an estimator step. */
  cta?: string;
}

/** Per-bid record that a step has completed. Absence ⇒ not done yet. */
export interface IntakeStepRun {
  bidId: string;
  step: IntakeStepKey;
  completedById: string;
  completedAt: string; // ISO
  /** One-line outcome shown on the done step. Auto steps derive this if unset. */
  result?: string;
}

export interface AppState {
  people: Person[];
  bids: Bid[];
  standards: StandardNote[];
  tensionItems: TensionItem[];
  signOffs: SignOff[];
  handoffItems: HandoffItem[];
  handoffMeetings: Record<string, HandoffMeeting>;
  tasks: Task[];
  taskTemplates: TaskTemplate[];
  bidDocuments: BidDocument[];
  extractions: Extraction[];
  scopeItems: ScopeItem[];
  /** Completed intake-pipeline steps per bid (derived status from order + this). */
  intakeSteps: IntakeStepRun[];
  /** Optional pre-submission review meeting (attendees + notes) per bid. */
  reviewMeetings: Record<string, HandoffMeeting>;
  procurementItems: ProcurementItem[];
  projectMilestones: ProjectMilestone[];
  projectPlans: Record<string, ProjectPlan>;
  sovLines: SovLine[];
  rfis: Rfi[];
  changeOrders: ChangeOrder[];
  currentUserId: string;
}
