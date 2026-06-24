import type {
  Bid,
  ProcurementItem,
  ProjectMilestone,
  ProjectPlan,
  Trade,
} from "@/lib/store/types";

// ──────────────────────────────────────────────────────────────────────────
// Active Projects seed + generators.
//
// When a bid is awarded it becomes a project and two plans are generated from
// trade templates: a procurement plan (materials + lead times vs. mobilization)
// and a project plan (milestones + crew). The same builders run live in the
// reducer on award, and here to seed the already-won jobs.
// ──────────────────────────────────────────────────────────────────────────

function addDaysIso(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/** Default mobilization ≈ 6.5 weeks after award unless overridden. */
export function defaultMobilization(awardedAtIso: string): string {
  return addDaysIso(awardedAtIso, 45);
}

type ProcTemplate = {
  category: ProcurementItem["category"];
  label: string;
  vendor?: string;
  quantity?: string;
  leadTimeWeeks: number;
  /** Days from mobilization the material must be on site (usually 0). */
  needByOffsetDays?: number;
  ownerRole: ProcurementItem["ownerRole"];
};

type MilestoneTemplate = {
  label: string;
  ownerRole: ProjectMilestone["ownerRole"];
  /** Days from mobilization (negative = before mobilization). */
  offsetDays: number;
};

const PROCUREMENT_TEMPLATES: Record<Trade, ProcTemplate[]> = {
  masonry: [
    { category: "block", label: "CMU block (per wall schedule)", vendor: "Angelus Block", quantity: "per takeoff", leadTimeWeeks: 6, ownerRole: "Ops" },
    { category: "rebar", label: "Rebar, dowels & bond beam steel", vendor: "Harris Rebar", leadTimeWeeks: 3, ownerRole: "Ops" },
    { category: "accessories", label: "Mortar, grout & color admixture", vendor: "Orco", leadTimeWeeks: 2, ownerRole: "Ops" },
    { category: "accessories", label: "Reinforcing accessories (ladder wire, ties)", vendor: "White Cap", leadTimeWeeks: 2, ownerRole: "Ops" },
    { category: "accessories", label: "Anchors, embeds & flashing", leadTimeWeeks: 4, needByOffsetDays: 7, ownerRole: "PM" },
    { category: "equipment", label: "Scaffold / mast climber rental", vendor: "Sunbelt", leadTimeWeeks: 2, ownerRole: "Super" },
  ],
  concrete: [
    { category: "rebar", label: "Rebar fab & delivery", vendor: "Harris Rebar", quantity: "per structural", leadTimeWeeks: 5, ownerRole: "Ops" },
    { category: "accessories", label: "Embeds, weld plates & anchor bolts", leadTimeWeeks: 6, ownerRole: "PM" },
    { category: "cement", label: "Ready-mix supplier agreement & mix design", vendor: "Robertson's Ready Mix", leadTimeWeeks: 4, ownerRole: "Ops" },
    { category: "accessories", label: "Formwork & shoring", vendor: "White Cap", leadTimeWeeks: 3, ownerRole: "Super" },
    { category: "admixture", label: "Admixtures & curing compound", vendor: "CEMEX", leadTimeWeeks: 2, ownerRole: "Ops" },
    { category: "accessories", label: "Waterstop & joint materials", leadTimeWeeks: 3, needByOffsetDays: 14, ownerRole: "Ops" },
    { category: "equipment", label: "Crane / pump scheduling", leadTimeWeeks: 4, ownerRole: "Super" },
  ],
};

const MILESTONE_TEMPLATES: Record<Trade, MilestoneTemplate[]> = {
  masonry: [
    { label: "Pre-construction meeting & submittals", ownerRole: "PM", offsetDays: -14 },
    { label: "Mobilize — site setup & scaffold", ownerRole: "Super", offsetDays: 0 },
    { label: "Layout & first course", ownerRole: "Super", offsetDays: 3 },
    { label: "Wall lifts to height", ownerRole: "Ops", offsetDays: 10 },
    { label: "Grout & special inspection", ownerRole: "QC", offsetDays: 20 },
    { label: "Top-out & detailing", ownerRole: "Super", offsetDays: 30 },
    { label: "Demob & punch", ownerRole: "Super", offsetDays: 38 },
  ],
  concrete: [
    { label: "Pre-construction meeting & submittals", ownerRole: "PM", offsetDays: -14 },
    { label: "Mobilize — formwork & rebar staging", ownerRole: "Super", offsetDays: 0 },
    { label: "Subgrade / excavation coordination", ownerRole: "Ops", offsetDays: 2 },
    { label: "Rebar & embeds placement", ownerRole: "Ops", offsetDays: 6 },
    { label: "Inspection & first pour", ownerRole: "QC", offsetDays: 12 },
    { label: "Strip, cure & backfill", ownerRole: "Super", offsetDays: 20 },
    { label: "Final pours & demob", ownerRole: "Super", offsetDays: 30 },
  ],
};

/** Build a fresh (all not-started) procurement plan for an awarded bid. */
export function buildProcurement(
  bid: Bid,
  mobilizationIso: string,
): Omit<ProcurementItem, "id">[] {
  return PROCUREMENT_TEMPLATES[bid.trade].map((t) => ({
    bidId: bid.id,
    category: t.category,
    label: t.label,
    vendor: t.vendor,
    quantity: t.quantity,
    leadTimeWeeks: t.leadTimeWeeks,
    needBy: addDaysIso(mobilizationIso, t.needByOffsetDays ?? 0),
    status: "notStarted" as const,
    ownerRole: t.ownerRole,
  }));
}

/** Build a fresh (all pending) milestone plan for an awarded bid. */
export function buildMilestones(
  bid: Bid,
  mobilizationIso: string,
): Omit<ProjectMilestone, "id">[] {
  return MILESTONE_TEMPLATES[bid.trade].map((t) => ({
    bidId: bid.id,
    label: t.label,
    ownerRole: t.ownerRole,
    targetDate: addDaysIso(mobilizationIso, t.offsetDays),
    status: "pending" as const,
  }));
}

export function buildProjectPlan(bid: Bid, mobilizationIso: string): ProjectPlan {
  return { bidId: bid.id, mobilizationDate: mobilizationIso };
}

// ── Seed: build for the already-won jobs and advance status by stage ────────

const FOREMAN_BY_BID: Record<string, { foremanId?: string; superId?: string; crewSize?: number; summary?: string }> = {
  "bid-purple-line": {
    superId: "p-luke",
    crewSize: 8,
    summary:
      "Deep underground concrete at a live transit station. Dewatering and caisson access drive the sequence — lock the ready-mix windows early.",
  },
  "bid-lincoln-paver": {
    foremanId: "p-patrick",
    superId: "p-luke",
    crewSize: 5,
    summary:
      "Tight school site, paver plaza. Saw selection settled at handoff (tile saw). Containment + mud-tub approach approved.",
  },
  "bid-ontario": {
    foremanId: "p-patrick",
    superId: "p-luke",
    crewSize: 14,
    summary: "Large masonry package at the sports complex — multiple crews phased by building.",
  },
  "bid-jordan-hs": {
    superId: "p-luke",
    crewSize: 9,
    summary: "Phase 4 masonry — coordinate around occupied campus and summer schedule.",
  },
};

function advanceProcurement(
  items: ProcurementItem[],
  stage: Bid["stage"],
): ProcurementItem[] {
  const n = items.length;
  return items.map((it, i) => {
    if (stage === "active") {
      return {
        ...it,
        status: i < Math.ceil(n * 0.7) ? "delivered" : "ordered",
      };
    }
    if (stage === "handoff") {
      if (it.leadTimeWeeks >= 5)
        return {
          ...it,
          status: "ordered",
          note: it.note ?? "Long-lead — released early to protect mobilization.",
        };
      if (i % 3 === 0) return { ...it, status: "quoting" };
      return it;
    }
    // awarded — nothing started yet
    return it;
  });
}

function advanceMilestones(
  ms: ProjectMilestone[],
  stage: Bid["stage"],
): ProjectMilestone[] {
  const n = ms.length;
  return ms.map((m, i) => {
    if (stage === "active") {
      const doneCount = Math.ceil(n * 0.6);
      if (i < doneCount) return { ...m, status: "done" };
      if (i === doneCount) return { ...m, status: "inProgress" };
      return m;
    }
    if (stage === "handoff") {
      if (i === 0) return { ...m, status: "inProgress" };
      return m;
    }
    return m;
  });
}

export interface SeededProjectData {
  procurementItems: ProcurementItem[];
  projectMilestones: ProjectMilestone[];
  projectPlans: Record<string, ProjectPlan>;
}

/** Seed procurement + project plans for every bid that's awarded or later. */
export function seedProjectData(bids: Bid[]): SeededProjectData {
  const procurementItems: ProcurementItem[] = [];
  const projectMilestones: ProjectMilestone[] = [];
  const projectPlans: Record<string, ProjectPlan> = {};

  const AWARDED_PLUS: Bid["stage"][] = ["awarded", "handoff", "active"];

  for (const bid of bids) {
    if (!AWARDED_PLUS.includes(bid.stage)) continue;
    const mob = defaultMobilization(bid.awardedAt ?? bid.createdAt);

    const proc = buildProcurement(bid, mob).map((it, i) => ({
      ...it,
      id: `pi-${bid.id}-${i}`,
    }));
    procurementItems.push(...advanceProcurement(proc, bid.stage));

    const ms = buildMilestones(bid, mob).map((m, i) => ({
      ...m,
      id: `pm-${bid.id}-${i}`,
    }));
    projectMilestones.push(...advanceMilestones(ms, bid.stage));

    projectPlans[bid.id] = {
      ...buildProjectPlan(bid, mob),
      ...FOREMAN_BY_BID[bid.id],
    };
  }

  return { procurementItems, projectMilestones, projectPlans };
}
