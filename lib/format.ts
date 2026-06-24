import { formatDistanceToNow, format, isValid, parseISO } from "date-fns";
import type {
  BidStage,
  BidLikelihood,
  CoOrigin,
  CoStatus,
  DocType,
  ExtractionAudience,
  ExtractionKind,
  HandoffCategory,
  MilestoneStatus,
  Priority,
  ProcurementCategory,
  ProcurementStatus,
  RecurrenceCadence,
  BallInCourt,
  CoCostCategory,
  CoPricingMethod,
  CoReason,
  RfiDiscipline,
  RfiOrigin,
  RfiPriority,
  RfiStatus,
  Role,
  ScopeDisposition,
  ScopeStage,
  StandardCategory,
  TaskStatus,
  TensionItemType,
  Trade,
  WinConfidence,
} from "@/lib/store/types";

export function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function relativeTime(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

export function shortDate(iso?: string): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  if (!isValid(d)) return "—";
  return format(d, "MMM d, yyyy");
}

export const ROLE_LABEL: Record<Role, string> = {
  CEO: "CEO / Estimator",
  EstimatorMasonry: "Masonry Estimator",
  EstimatorConcrete: "Concrete Estimator",
  PM: "Project Manager",
  Ops: "Operations",
  Accounting: "Accounting",
  Super: "Superintendent",
  QC: "QC / Safety",
  Coordinator: "Coordinator",
};

export const STAGE_LABEL: Record<BidStage, string> = {
  invited: "Invited",
  estimating: "Estimating",
  preBidReview: "Pre-Bid Review",
  submitted: "Submitted",
  awarded: "Awarded",
  handoff: "Handoff",
  active: "Active",
};

export const STAGE_ORDER: BidStage[] = [
  "invited",
  "estimating",
  "preBidReview",
  "submitted",
  "awarded",
  "handoff",
  "active",
];

/**
 * The board reads as one story: Estimating hands a won bid to Operations.
 * Each zone groups its stages so the track shows two sides, not seven peers.
 */
export const STAGE_ZONES: {
  key: "estimating" | "operations";
  label: string;
  caption: string;
  stages: BidStage[];
}[] = [
  {
    key: "estimating",
    label: "Estimating",
    caption: "Invite → submit",
    stages: ["invited", "estimating", "preBidReview", "submitted"],
  },
  {
    key: "operations",
    label: "Operations",
    caption: "Win → jobsite",
    stages: ["awarded", "handoff", "active"],
  },
];

/**
 * The two moments where estimating and ops actually shake hands — the whole
 * point of the product. These columns get highlighted on the board.
 */
export const GATE_STAGES: Partial<Record<BidStage, string>> = {
  preBidReview: "Challenge the bid before it goes out",
  handoff: "Hand a clean win to the field",
};

/** Tailwind classes for stage chips / column accents. */
export const STAGE_ACCENT: Record<BidStage, string> = {
  invited: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  estimating: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  preBidReview: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  submitted: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  awarded: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  handoff: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
};

export const TRADE_LABEL: Record<Trade, string> = {
  masonry: "Masonry",
  concrete: "Concrete",
};

/** Trade color language — masonry reads as brick (orange), concrete as gray. */
export const TRADE_META: Record<
  Trade,
  { bar: string; dot: string; text: string; chip: string }
> = {
  masonry: {
    bar: "bg-orange-500",
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-300",
    chip: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
  },
  concrete: {
    bar: "bg-slate-500",
    dot: "bg-slate-500",
    text: "text-slate-700 dark:text-slate-300",
    chip: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30",
  },
};

export const TENSION_TYPE_LABEL: Record<TensionItemType, string> = {
  assumption: "Assumption",
  productionRate: "Production Rate",
  risk: "Risk",
  exclusion: "Exclusion",
  scopeGap: "Scope Gap",
  vendorQuote: "Vendor / Sub Quote",
  contingency: "Contingency",
};

export const TENSION_TYPE_ACCENT: Record<TensionItemType, string> = {
  assumption: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  productionRate: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  risk: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  exclusion: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  scopeGap: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  vendorQuote: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  contingency: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
};

export const STANDARD_CATEGORY_LABEL: Record<StandardCategory, string> = {
  leadTime: "Lead Time",
  capacity: "Capacity",
  productionRate: "Production Rate",
  wage: "Wage / Region",
  general: "General",
};

export const HANDOFF_CATEGORY_LABEL: Record<HandoffCategory, string> = {
  sov: "Schedule of Values",
  scope: "Scope Assumptions",
  productionRates: "Production Rates",
  crewPlan: "Crew Plan",
  foreman: "Foreman Assignment",
  rfi: "RFIs Needed Now",
  schedule: "Schedule",
  risk: "Key Risks",
};

// ── Plan Room ────────────────────────────────────────────────────────────

export const DOC_TYPE_LABEL: Record<DocType, string> = {
  plans: "Plans",
  specBook: "Spec Book",
  addendum: "Addendum",
  geotech: "Geotech Report",
  scopeLetter: "Scope Letter",
  bidForm: "Bid Form",
  other: "Other",
};

export const EXTRACTION_KIND_LABEL: Record<ExtractionKind, string> = {
  fact: "Fact",
  question: "Question",
  risk: "Risk",
};

export const EXTRACTION_KIND_ACCENT: Record<ExtractionKind, string> = {
  fact: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  question: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  risk: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
};

export const EXTRACTION_AUDIENCE_LABEL: Record<ExtractionAudience, string> = {
  estimating: "Estimating",
  ops: "Operations",
  both: "Estimating + Ops",
};

export const EXTRACTION_AUDIENCE_ACCENT: Record<ExtractionAudience, string> = {
  estimating: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  ops: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  both: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
};

export const LIKELIHOOD_LABEL: Record<BidLikelihood, string> = {
  unset: "Not set",
  watching: "Watching",
  likely: "Likely to bid",
  committed: "Committed",
};

export const LIKELIHOOD_ACCENT: Record<BidLikelihood, string> = {
  unset: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  watching: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  likely: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  committed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
};

export const WIN_CONFIDENCE_LABEL: Record<WinConfidence, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

export const WIN_CONFIDENCE_ACCENT: Record<WinConfidence, string> = {
  high: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
};

/** Compact currency for chart axes / chips, e.g. "$13.5M", "$540K". */
export function compactCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** "Aug '26" — month axis label for the schedule + forecast charts. */
export function monthLabel(iso: string): string {
  const d = parseISO(iso);
  if (!isValid(d)) return "";
  return format(d, "MMM ''yy");
}

// ── Active Projects ──────────────────────────────────────────────────────

export const PROCUREMENT_CATEGORY_LABEL: Record<ProcurementCategory, string> = {
  block: "Block / CMU",
  rebar: "Rebar / Steel",
  cement: "Ready-Mix",
  admixture: "Admixtures",
  accessories: "Accessories",
  equipment: "Equipment",
  other: "Other",
};

export const PROCUREMENT_STATUS_LABEL: Record<ProcurementStatus, string> = {
  notStarted: "Not Started",
  quoting: "Quoting",
  ordered: "Ordered",
  delivered: "Delivered",
};

export const PROCUREMENT_STATUS_ACCENT: Record<ProcurementStatus, string> = {
  notStarted: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  quoting: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  ordered: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  delivered: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
};

export const PROCUREMENT_STATUS_ORDER: ProcurementStatus[] = [
  "notStarted",
  "quoting",
  "ordered",
  "delivered",
];

export const MILESTONE_STATUS_LABEL: Record<MilestoneStatus, string> = {
  pending: "Pending",
  inProgress: "In Progress",
  done: "Done",
  atRisk: "At Risk",
};

export const MILESTONE_STATUS_ACCENT: Record<MilestoneStatus, string> = {
  pending: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  inProgress: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  atRisk: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
};

export const MILESTONE_STATUS_ORDER: MilestoneStatus[] = [
  "pending",
  "inProgress",
  "done",
  "atRisk",
];

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_ACCENT: Record<Priority, string> = {
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  high: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To Do",
  inProgress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

export const TASK_STATUS_ORDER: TaskStatus[] = [
  "todo",
  "inProgress",
  "blocked",
  "done",
];

/** Solid, saturated pills for the Monday-style table cells. */
export const TASK_STATUS_SOLID: Record<TaskStatus, string> = {
  todo: "bg-slate-400 text-white dark:bg-slate-500",
  inProgress: "bg-amber-500 text-white",
  blocked: "bg-red-500 text-white",
  done: "bg-emerald-500 text-white",
};

export const PRIORITY_SOLID: Record<Priority, string> = {
  low: "bg-slate-400 text-white dark:bg-slate-500",
  medium: "bg-amber-500 text-white",
  high: "bg-red-500 text-white",
};

export const RECURRENCE_LABEL: Record<RecurrenceCadence, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
};

export const RECURRENCE_ORDER: RecurrenceCadence[] = [
  "daily",
  "weekly",
  "biweekly",
  "monthly",
];

// ── Scope Board ──────────────────────────────────────────────────────────

export const SCOPE_STAGE_LABEL: Record<ScopeStage, string> = {
  extracted: "Extracted",
  contextualized: "Contextualized",
  planned: "Planned",
  challenged: "Challenged",
  approved: "Approved",
};

/** One-line caption per column — what has to happen for an item to move on. */
export const SCOPE_STAGE_CAPTION: Record<ScopeStage, string> = {
  extracted: "AI pulled it off the plans",
  contextualized: "Estimating: quantity + assumptions",
  planned: "Ops: method, rate & crew",
  challenged: "In pre-bid review",
  approved: "Locked into the bid",
};

export const SCOPE_STAGE_ORDER: ScopeStage[] = [
  "extracted",
  "contextualized",
  "planned",
  "challenged",
  "approved",
];

export const SCOPE_STAGE_ACCENT: Record<ScopeStage, string> = {
  extracted: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  contextualized: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  planned: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  challenged: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
};

/** Solid dot color for the column headers. */
export const SCOPE_STAGE_DOT: Record<ScopeStage, string> = {
  extracted: "bg-slate-400",
  contextualized: "bg-amber-500",
  planned: "bg-sky-500",
  challenged: "bg-orange-500",
  approved: "bg-emerald-500",
};

export const SCOPE_DISPOSITION_LABEL: Record<ScopeDisposition, string> = {
  undecided: "Undecided",
  included: "Included",
  excluded: "Excluded",
  alternate: "Alternate",
};

export const SCOPE_DISPOSITION_ACCENT: Record<ScopeDisposition, string> = {
  undecided: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  included: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  excluded: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  alternate: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
};

export const SCOPE_DISPOSITION_ORDER: ScopeDisposition[] = [
  "undecided",
  "included",
  "excluded",
  "alternate",
];

// ── RFIs & Change Orders ───────────────────────────────────────────────────

export const RFI_STATUS_LABEL: Record<RfiStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  answered: "Answered",
  closed: "Closed",
  converted: "→ Change Order",
};

export const RFI_STATUS_ACCENT: Record<RfiStatus, string> = {
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  submitted: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  answered: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  closed: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  converted: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
};

export const RFI_ORIGIN_LABEL: Record<RfiOrigin, string> = {
  planGap: "From plan gap",
  field: "From field",
  manual: "Manual",
};

export const CO_STATUS_LABEL: Record<CoStatus, string> = {
  draft: "Draft",
  pendingPM: "Pending PM",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
  billed: "Billed",
};

export const CO_STATUS_ACCENT: Record<CoStatus, string> = {
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  pendingPM: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  submitted: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  approved: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
  billed: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
};

/** The lifecycle order a Change Order moves through, for status dropdowns. */
export const CO_STATUS_ORDER: CoStatus[] = [
  "draft",
  "pendingPM",
  "submitted",
  "approved",
  "rejected",
  "billed",
];

export const CO_ORIGIN_LABEL: Record<CoOrigin, string> = {
  rfi: "From RFI",
  fieldTM: "From T&M ticket",
  manual: "Manual",
};

// ── RFI / CO depth: priority, discipline, ball-in-court, reason, pricing ─────

export const RFI_PRIORITY_LABEL: Record<RfiPriority, string> = {
  low: "Low",
  normal: "Normal",
  high: "High",
  urgent: "Urgent",
};

export const RFI_PRIORITY_ACCENT: Record<RfiPriority, string> = {
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
  normal: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  high: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  urgent: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20",
};

export const RFI_PRIORITY_ORDER: RfiPriority[] = [
  "low",
  "normal",
  "high",
  "urgent",
];

export const RFI_DISCIPLINE_LABEL: Record<RfiDiscipline, string> = {
  architectural: "Architectural",
  structural: "Structural",
  civil: "Civil",
  geotech: "Geotechnical",
  mechanical: "Mechanical",
  electrical: "Electrical",
  other: "Other",
};

export const RFI_DISCIPLINE_ORDER: RfiDiscipline[] = [
  "architectural",
  "structural",
  "civil",
  "geotech",
  "mechanical",
  "electrical",
  "other",
];

export const BALL_IN_COURT_LABEL: Record<BallInCourt, string> = {
  weingartner: "Weingartner",
  gc: "General Contractor",
  designTeam: "Design Team",
};

export const BALL_IN_COURT_ACCENT: Record<BallInCourt, string> = {
  weingartner:
    "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  gc: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  designTeam:
    "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
};

export const CO_REASON_LABEL: Record<CoReason, string> = {
  ownerRequest: "Owner request",
  designChange: "Design change",
  unforeseen: "Unforeseen condition",
  fieldCondition: "Field condition",
  codeCompliance: "Code / inspector",
  weather: "Weather",
  other: "Other",
};

export const CO_REASON_ORDER: CoReason[] = [
  "ownerRequest",
  "designChange",
  "unforeseen",
  "fieldCondition",
  "codeCompliance",
  "weather",
  "other",
];

export const CO_PRICING_LABEL: Record<CoPricingMethod, string> = {
  lumpSum: "Lump sum",
  tm: "Time & material",
  unitPrice: "Unit price",
};

export const CO_PRICING_ORDER: CoPricingMethod[] = [
  "lumpSum",
  "tm",
  "unitPrice",
];

export const CO_COST_CATEGORY_LABEL: Record<CoCostCategory, string> = {
  labor: "Labor",
  material: "Material",
  equipment: "Equipment",
  subcontractor: "Subcontractor",
  other: "Other",
};

export const CO_COST_CATEGORY_ORDER: CoCostCategory[] = [
  "labor",
  "material",
  "equipment",
  "subcontractor",
  "other",
];

export const CO_COST_CATEGORY_ACCENT: Record<CoCostCategory, string> = {
  labor: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20",
  material:
    "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20",
  equipment:
    "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20",
  subcontractor:
    "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20",
  other:
    "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
};

/** "Jun 24" — compact day label for timelines. */
export function dayLabel(iso?: string): string {
  if (!iso) return "—";
  const d = parseISO(iso);
  if (!isValid(d)) return "—";
  return format(d, "MMM d");
}
