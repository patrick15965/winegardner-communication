import type {
  ChangeOrder,
  Extraction,
  Rfi,
  Role,
} from "@/lib/store/types";

// ──────────────────────────────────────────────────────────────────────────
// RFIs & Change Orders seed + generators.
//
// The loop the field lives on: a Plan Room scope-gap can be drafted into an RFI
// during estimating, the RFI travels with the bid, comes back answered after
// award, and — when it carries cost — converts into a Change Order. The same
// builders run live in the reducer (Draft RFI / Convert to CO) and here to seed
// the jobs already in flight, so every dashboard cut has real data:
//   • per job   — Ontario carries the bulk of the limbo, Jordan HS is healthy
//   • company   — ~$600K outstanding, the number Casey can never see today
//   • per person — Tucker / Patrick / Casey / Rohilio all sitting on COs
// ──────────────────────────────────────────────────────────────────────────

export function rfiNumber(n: number): string {
  return `RFI-${String(n).padStart(3, "0")}`;
}

export function coNumber(n: number): string {
  return `CO-${String(n).padStart(3, "0")}`;
}

/** Draft an RFI straight off a Plan Room finding — "the system writes it, you review." */
export function buildRfiFromExtraction(
  ex: Extraction,
  raisedById: string,
  number: string,
  createdAtIso: string,
): Omit<Rfi, "id"> {
  return {
    bidId: ex.bidId,
    number,
    subject: ex.title,
    question: ex.detail,
    origin: "planGap",
    sourceExtractionId: ex.id,
    planRef: ex.sourceRef,
    raisedById,
    createdAt: createdAtIso,
    status: "draft",
    // A fact is just a clarification; a question/risk usually carries cost.
    costImpactLikely: ex.kind !== "fact",
  };
}

/** Roll an answered RFI into a Change Order — "is it a change order now? Fill it out." */
export function buildCoFromRfi(
  rfi: Rfi,
  raisedById: string,
  ownerRole: Role,
  number: string,
  createdAtIso: string,
): Omit<ChangeOrder, "id"> {
  const answer = rfi.answer ? `\n\nAnswer: ${rfi.answer}` : "";
  return {
    bidId: rfi.bidId,
    number,
    title: rfi.subject,
    description: `Converted from ${rfi.number}: ${rfi.question}${answer}`,
    origin: "rfi",
    sourceRfiId: rfi.id,
    planRef: rfi.planRef,
    raisedById,
    ownerRole,
    createdAt: createdAtIso,
    status: "draft",
  };
}

// ── Seed RFIs ───────────────────────────────────────────────────────────────

export const rfis: Rfi[] = [
  // San Diego CMU — drafted from Plan Room gaps, queued to submit with the bid.
  {
    id: "rfi-sd-rebar",
    bidId: "bid-sd-cmu",
    number: "RFI-001",
    subject: "Rebar spacing & control-joint locations not on structural set",
    question:
      "Structural sheets don't show rebar spacing or control-joint locations. Confirm typical spacing and whether reinforcing is in our scope.",
    origin: "planGap",
    sourceExtractionId: "ex-sd-q-rebar",
    planRef: "S-series (missing details)",
    raisedById: "p-angel",
    createdAt: "2026-06-13T17:00:00.000Z",
    status: "draft",
    costImpactLikely: true,
  },
  {
    id: "rfi-sd-topwall",
    bidId: "bid-sd-cmu",
    number: "RFI-002",
    subject: "Top-of-wall fire-safing — carry in base or as alternate?",
    question:
      "Drawings call for top-of-wall / mid-wall fire safing but the GC scope letter didn't take the alternate. Confirm whether it's in the base scope.",
    origin: "planGap",
    sourceExtractionId: "ex-sd-q-topwall",
    planRef: "Spec §07 84 00; Scope Letter p.2",
    raisedById: "p-angel",
    createdAt: "2026-06-13T17:01:00.000Z",
    status: "draft",
    costImpactLikely: true,
  },

  // Ontario — a field RFI that already came back answered and converted to CO-003.
  {
    id: "rfi-ont-arch",
    bidId: "bid-ontario",
    number: "RFI-001",
    subject: "Arch form geometry revision at east elevation",
    question:
      "Styrofoam arch forms at the east elevation don't match the revised architectural radius. Confirm geometry before we re-form.",
    origin: "field",
    planRef: "A-501",
    raisedById: "p-luke",
    createdAt: "2026-05-12T17:00:00.000Z",
    submittedAt: "2026-05-12T18:00:00.000Z",
    status: "converted",
    answer: "Revise per ASI-14 — additional formwork required.",
    answeredBy: "Turner Pacific",
    answeredAt: "2026-05-19T17:00:00.000Z",
    costImpactLikely: true,
    linkedChangeOrderId: "co-ont-arch",
  },

  // Purple Line — one out for response, one answered & convertible (no CO yet).
  {
    id: "rfi-pl-dewater",
    bidId: "bid-purple-line",
    number: "RFI-001",
    subject: "Confirm groundwater elevation for dewatering design",
    question:
      "Geotech gives a range; we need the design groundwater elevation to size the dewatering and caisson access before mobilization.",
    origin: "manual",
    planRef: "Geotech §4.2",
    raisedById: "p-rohilio",
    createdAt: "2026-06-19T17:00:00.000Z",
    submittedAt: "2026-06-19T18:00:00.000Z",
    status: "submitted",
  },
  {
    id: "rfi-pl-embed",
    bidId: "bid-purple-line",
    number: "RFI-002",
    subject: "Embed plate schedule for station walls missing from set",
    question:
      "Panel-to-structure embed plates are referenced but the schedule isn't in the drawings. Issue the schedule or confirm an allowance.",
    origin: "planGap",
    planRef: "S-501 (referenced, missing)",
    raisedById: "p-rohilio",
    createdAt: "2026-06-19T17:02:00.000Z",
    submittedAt: "2026-06-19T18:02:00.000Z",
    status: "answered",
    answer: "Embed schedule issued in Addendum 3 — heavier plates than carried.",
    answeredBy: "Metro Transit JV",
    answeredAt: "2026-06-22T17:00:00.000Z",
    costImpactLikely: true,
  },

  // Lincoln paver — answered & convertible during handoff.
  {
    id: "rfi-lp-base",
    bidId: "bid-lincoln-paver",
    number: "RFI-001",
    subject: "Paver base depth conflict between civil and landscape",
    question:
      "Civil shows 4\" aggregate base; landscape detail shows 6\". Confirm which governs at the plaza.",
    origin: "field",
    planRef: "C-200 / L-101",
    raisedById: "p-patrick",
    createdAt: "2026-06-16T17:00:00.000Z",
    submittedAt: "2026-06-16T18:00:00.000Z",
    status: "answered",
    answer: "Use the landscape detail — add 2\" of base across the plaza.",
    answeredBy: "Balfour West",
    answeredAt: "2026-06-20T17:00:00.000Z",
    costImpactLikely: true,
  },
];

// ── Seed Change Orders ───────────────────────────────────────────────────────
// Aging is computed from createdAt against "now" (~Jun 24, 2026): several sit
// 30–70 days out so the limbo buckets light up. Open (draft/pendingPM/submitted)
// totals ≈ $596K — the "$600K in unapproved COs" the team can't see today.

export const changeOrders: ChangeOrder[] = [
  // Ontario Sports Empire — the bulk of the outstanding work.
  {
    id: "co-ont-footing",
    bidId: "bid-ontario",
    number: "CO-001",
    title: "Unforeseen footing obstruction — hand digging",
    description:
      "Buried debris at the east footings required hand digging and a day of crew standby. T&M ticket attached.",
    origin: "fieldTM",
    tmTicketRef: "TM-1042",
    raisedById: "p-patrick",
    ownerRole: "PM",
    createdAt: "2026-04-12T17:00:00.000Z",
    status: "pendingPM",
    costAmount: 112000,
    scheduleImpactDays: 3,
    photoRefs: ["footing-obstruction-1.jpg", "footing-obstruction-2.jpg"],
  },
  {
    id: "co-ont-screenwall",
    bidId: "bid-ontario",
    number: "CO-002",
    title: "Added screen wall at parking structure",
    description:
      "Owner added a 180 lf CMU screen wall at the parking structure not in the bid set.",
    origin: "manual",
    raisedById: "p-tucker",
    ownerRole: "PM",
    createdAt: "2026-05-08T17:00:00.000Z",
    submittedAt: "2026-05-15T17:00:00.000Z",
    status: "submitted",
    costAmount: 156000,
    scheduleImpactDays: 6,
  },
  {
    id: "co-ont-arch",
    bidId: "bid-ontario",
    number: "CO-003",
    title: "Arch form geometry revision at east elevation",
    description:
      "Converted from RFI-001: arch form radius revised per ASI-14, additional formwork required.",
    origin: "rfi",
    sourceRfiId: "rfi-ont-arch",
    planRef: "A-501",
    raisedById: "p-casey",
    ownerRole: "PM",
    createdAt: "2026-05-20T17:00:00.000Z",
    submittedAt: "2026-05-21T17:00:00.000Z",
    status: "submitted",
    costAmount: 67000,
    scheduleImpactDays: 4,
  },
  {
    id: "co-ont-shoring",
    bidId: "bid-ontario",
    number: "CO-004",
    title: "Temporary shoring at arch falsework",
    description:
      "Engineer-required temporary shoring under the arch falsework during cure.",
    origin: "manual",
    raisedById: "p-casey",
    ownerRole: "PM",
    createdAt: "2026-04-28T17:00:00.000Z",
    submittedAt: "2026-05-01T17:00:00.000Z",
    status: "submitted",
    costAmount: 98000,
    scheduleImpactDays: 2,
  },
  {
    id: "co-ont-mechyard",
    bidId: "bid-ontario",
    number: "CO-005",
    title: "Additional CMU at mechanical yard",
    description: "Mechanical yard enclosure added late — extra CMU and rebar.",
    origin: "manual",
    raisedById: "p-patrick",
    ownerRole: "PM",
    createdAt: "2026-06-14T17:00:00.000Z",
    status: "draft",
    costAmount: 38000,
  },
  {
    id: "co-ont-grout",
    bidId: "bid-ontario",
    number: "CO-006",
    title: "Grout pump standby — weather delay",
    description: "Grout pump and crew standby during an unforecast rain day.",
    origin: "fieldTM",
    tmTicketRef: "TM-0978",
    raisedById: "p-tucker",
    ownerRole: "PM",
    createdAt: "2026-04-20T17:00:00.000Z",
    submittedAt: "2026-04-22T17:00:00.000Z",
    status: "approved",
    costAmount: 31000,
    approvedBy: "Turner Pacific",
    approvedAt: "2026-05-02T17:00:00.000Z",
  },
  {
    id: "co-ont-controljoint",
    bidId: "bid-ontario",
    number: "CO-007",
    title: "Saw-cut control joints added",
    description: "Inspector required additional saw-cut control joints at slabs.",
    origin: "fieldTM",
    tmTicketRef: "TM-0901",
    raisedById: "p-patrick",
    ownerRole: "PM",
    createdAt: "2026-03-30T17:00:00.000Z",
    submittedAt: "2026-04-01T17:00:00.000Z",
    status: "billed",
    costAmount: 18500,
    approvedBy: "Turner Pacific",
    approvedAt: "2026-04-10T17:00:00.000Z",
  },

  // Jordan High School — a healthier job for contrast.
  {
    id: "co-jhs-lintel",
    bidId: "bid-jordan-hs",
    number: "CO-001",
    title: "Revised lintel detail at Phase 4 openings",
    description: "Architect revised lintel sizes at the Phase 4 openings.",
    origin: "manual",
    raisedById: "p-tucker",
    ownerRole: "PM",
    createdAt: "2026-05-11T17:00:00.000Z",
    submittedAt: "2026-05-13T17:00:00.000Z",
    status: "submitted",
    costAmount: 54000,
    scheduleImpactDays: 2,
  },
  {
    id: "co-jhs-bondbeam",
    bidId: "bid-jordan-hs",
    number: "CO-002",
    title: "Added bond beam per inspector",
    description: "Inspector required an additional bond beam course at the gym wall.",
    origin: "manual",
    raisedById: "p-angel",
    ownerRole: "PM",
    createdAt: "2026-05-05T17:00:00.000Z",
    submittedAt: "2026-05-07T17:00:00.000Z",
    status: "approved",
    costAmount: 22000,
    approvedBy: "Balfour West",
    approvedAt: "2026-05-25T17:00:00.000Z",
  },
  {
    id: "co-jhs-cleanup",
    bidId: "bid-jordan-hs",
    number: "CO-003",
    title: "Extra cleanup after other trades",
    description: "Repeated cleanup of our area after other trades — T&M tracked.",
    origin: "fieldTM",
    tmTicketRef: "TM-0801",
    raisedById: "p-patrick",
    ownerRole: "PM",
    createdAt: "2026-04-18T17:00:00.000Z",
    submittedAt: "2026-04-20T17:00:00.000Z",
    status: "billed",
    costAmount: 15000,
    approvedBy: "Balfour West",
    approvedAt: "2026-04-30T17:00:00.000Z",
  },

  // Purple Line — just awarded, first CO already forming.
  {
    id: "co-pl-dewater",
    bidId: "bid-purple-line",
    number: "CO-001",
    title: "Dewatering scope clarification — added well points",
    description:
      "Groundwater higher than the geotech range; added well points to the dewatering plan.",
    origin: "manual",
    planRef: "Geotech §4.2",
    raisedById: "p-rohilio",
    ownerRole: "PM",
    createdAt: "2026-06-20T17:00:00.000Z",
    status: "pendingPM",
    costAmount: 71000,
    scheduleImpactDays: 5,
  },
];
