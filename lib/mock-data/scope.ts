import type {
  Extraction,
  ScopeDisposition,
  ScopeItem,
  ScopeStage,
} from "@/lib/store/types";

// ──────────────────────────────────────────────────────────────────────────
// Scope board seed + derivation.
//
// Every Plan Room finding auto-promotes into a scope item. San Diego CMU
// (bid-sd-cmu) is hand-seeded as the "finished" showcase — its nine findings
// are spread across all five lifecycle stages so the board reads as a story.
// Live bids (e.g. Mesa Tilt-Up) derive their scope items the moment the AI
// pass runs, via `deriveScopeFromExtraction` below.
// ──────────────────────────────────────────────────────────────────────────

/** Left→right lifecycle a scope item walks through. */
export const SCOPE_STAGE_ORDER: ScopeStage[] = [
  "extracted",
  "contextualized",
  "planned",
  "challenged",
  "approved",
];

/**
 * Where a freshly-promoted scope item lands, read off its source finding:
 * a promoted finding is already a live concern (challenged); an ops risk is a
 * planning consideration (planned); an answered finding has been worked
 * (contextualized); everything else is raw (extracted).
 */
export function initialScopeStage(ex: Extraction): ScopeStage {
  if (ex.promotedToTensionId) return "challenged";
  if (ex.kind === "risk") return "planned";
  if (ex.status === "answered") return "contextualized";
  return "extracted";
}

/** A scope item built from a finding, minus the id the reducer stamps. */
export type DerivedScope = Omit<ScopeItem, "id">;

export function deriveScopeFromExtraction(ex: Extraction): DerivedScope {
  return {
    bidId: ex.bidId,
    title: ex.title,
    detail: ex.detail,
    sourceRef: ex.sourceRef,
    sourceExtractionIds: [ex.id],
    audience: ex.audience,
    stage: initialScopeStage(ex),
    disposition: "undecided",
    tensionItemId: ex.promotedToTensionId,
    createdAt: ex.createdAt,
  };
}

const incl: ScopeDisposition = "included";

/** Hand-seeded showcase board for San Diego CMU — one item per finding. */
export const scopeItems: ScopeItem[] = [
  // ── Approved — worked, agreed, locked into the takeoff ──
  {
    id: "sc-sd-qty",
    bidId: "bid-sd-cmu",
    title: "8\" precision gray CMU — elevated runs",
    detail:
      "Running-bond 8\" precision gray block around two 2nd-floor electrical enclosures.",
    sourceRef: "A-201 wall schedule",
    sourceExtractionIds: ["ex-sd-fact-qty"],
    audience: "estimating",
    stage: "approved",
    disposition: incl,
    quantity: "~1,200 sf",
    assumption: "Matches takeoff — carried at 1,200 sf.",
    createdAt: "2026-06-12T17:00:00.000Z",
  },
  {
    id: "sc-sd-pw",
    bidId: "bid-sd-cmu",
    title: "DIR prevailing wage + San Diego per diem",
    detail:
      "Public works — DIR prevailing wage with the 90+ mile per-diem rule applied to the full crew.",
    sourceRef: "Front-end §00 73 00",
    sourceExtractionIds: ["ex-sd-fact-pw"],
    audience: "estimating",
    stage: "approved",
    disposition: incl,
    assumption: "Per diem carried for full crew, Nov–Dec.",
    createdAt: "2026-06-12T17:01:00.000Z",
  },
  // ── Challenged — a live concern in the Tension Center ──
  {
    id: "sc-sd-prod",
    bidId: "bid-sd-cmu",
    title: "Elevated production rate around enclosures",
    detail:
      "Cut-up elevated work with hoisting historically runs slower than the carried rate.",
    sourceRef: "A-301 elevations",
    sourceExtractionIds: ["ex-sd-risk-prod"],
    audience: "ops",
    stage: "challenged",
    disposition: incl,
    productionRate: "130/day proposed → 105–110 under review",
    crewNote: "Hoisting + scaffolding around live electrical.",
    tensionItemId: "ti-sd-prod",
    createdAt: "2026-06-19T17:00:00.000Z",
  },
  // ── Planned — ops has weighed in on method / lead / crew ──
  {
    id: "sc-sd-encl",
    bidId: "bid-sd-cmu",
    title: "30 ft elevated walls at wet electrical enclosures",
    detail:
      "Elevated, cut-up 2nd-floor work around live electrical — hoisting and scaffolding implied but not detailed.",
    sourceRef: "E-401 / A-301",
    sourceExtractionIds: ["ex-sd-fact-encl"],
    audience: "both",
    stage: "planned",
    disposition: incl,
    productionRate: "Scaffold + hoist plan required.",
    crewNote: "Experienced cut-up crew.",
    createdAt: "2026-06-12T17:02:00.000Z",
  },
  {
    id: "sc-sd-lead",
    bidId: "bid-sd-cmu",
    title: "Block lead time vs. a Nov–Dec start",
    detail:
      "Precision gray has been running ~6 weeks; ordering lands in the holiday slowdown.",
    sourceExtractionIds: ["ex-sd-risk-lead"],
    audience: "ops",
    stage: "planned",
    disposition: incl,
    crewNote: "Confirm yard can hit the dates before commit.",
    createdAt: "2026-06-19T17:01:00.000Z",
  },
  {
    id: "sc-sd-crew",
    bidId: "bid-sd-cmu",
    title: "Crew availability for Nov–Dec elevated work",
    detail:
      "Tight elevated footprint needs an experienced cut-up crew in a constrained window.",
    sourceExtractionIds: ["ex-sd-risk-crew"],
    audience: "ops",
    stage: "planned",
    disposition: incl,
    crewNote: "Foreman + masons to be confirmed against other jobs.",
    createdAt: "2026-06-19T17:02:00.000Z",
  },
  // ── Contextualized — estimating has dispositioned it ──
  {
    id: "sc-sd-topwall",
    bidId: "bid-sd-cmu",
    title: "Top-of-wall fire safing",
    detail:
      "Drawings call for top-of-wall / mid-wall fire safing; the GC scope letter didn't take the alternate.",
    sourceRef: "Spec §07 84 00; Scope Letter p.2",
    sourceExtractionIds: ["ex-sd-q-topwall"],
    audience: "both",
    stage: "contextualized",
    disposition: "alternate",
    assumption: "Carry as alternate only per the GC scope letter.",
    createdAt: "2026-06-12T17:06:00.000Z",
  },
  {
    id: "sc-sd-welding",
    bidId: "bid-sd-cmu",
    title: "Welding at embeds / waterproofing",
    detail:
      "Spec references welding at embeds and waterproofing — both out of our trade.",
    sourceRef: "Spec §05 50 00",
    sourceExtractionIds: ["ex-sd-q-welding"],
    audience: "estimating",
    stage: "contextualized",
    disposition: "excluded",
    assumption: "Red-tagged — no welding, no waterproofing.",
    createdAt: "2026-06-12T17:07:00.000Z",
  },
  // ── Extracted — raw, still needs eyes ──
  {
    id: "sc-sd-rebar",
    bidId: "bid-sd-cmu",
    title: "No structural details or rebar spacing on the set",
    detail:
      "Structural sheets don't show rebar spacing or control-joint locations. Assume typical spacing and carry rebar?",
    sourceRef: "S-series (missing details)",
    sourceExtractionIds: ["ex-sd-q-rebar"],
    audience: "estimating",
    stage: "extracted",
    disposition: "undecided",
    createdAt: "2026-06-12T17:05:00.000Z",
  },

  // ── Purple Line Station 3 — scope carried into the ops handoff ──
  {
    id: "sc-pl-cip",
    bidId: "bid-purple-line",
    title: "~3,400 cy cast-in-place structural concrete",
    detail:
      "Foundation mat, below-grade station walls, columns, and the platform-level slab — the core of the structural package.",
    sourceRef: "S-200 series / concrete schedule",
    sourceExtractionIds: ["ex-pl-fact-qty"],
    audience: "estimating",
    stage: "approved",
    disposition: incl,
    quantity: "~3,400 cy",
    assumption: "Matches takeoff — carried at 3,400 cy.",
    productionRate: "Std structural placement rates by element.",
    createdAt: "2026-04-12T17:10:00.000Z",
  },
  {
    id: "sc-pl-archform",
    bidId: "bid-purple-line",
    title: "Board-form architectural concrete at headhouse",
    detail:
      "Finish-critical board-form walls with a mock-up requirement — higher formwork cost and slower placement than the structural pours.",
    sourceRef: "A-401 / Spec §03 35 00",
    sourceExtractionIds: ["ex-pl-fact-archform"],
    audience: "both",
    stage: "planned",
    disposition: incl,
    productionRate: "~40% slower than structural walls; mock-up first.",
    crewNote: "Best finish crew on the board-form; protect the mock-up.",
    createdAt: "2026-04-12T17:11:00.000Z",
  },
  {
    id: "sc-pl-rebar",
    bidId: "bid-purple-line",
    title: "Congested platform rebar — placement productivity",
    detail:
      "Platform and wall rebar is heavily congested with seismic detailing. Estimate assumes standard placement rates; tight mats historically run slower.",
    sourceExtractionIds: ["ex-pl-risk-rebar"],
    audience: "ops",
    stage: "planned",
    disposition: incl,
    productionRate: "Std rate carried → ops reviewing for congestion factor.",
    crewNote: "Add a tie crew through the congested platform lifts.",
    createdAt: "2026-06-17T17:10:00.000Z",
  },
  {
    id: "sc-pl-matpour",
    bidId: "bid-purple-line",
    title: "Continuous mat-slab pour — supply & traffic control",
    detail:
      "Large monolithic foundation mat. Sustaining truck count through a downtown LA traffic-control plan is the risk — a stall means a cold joint.",
    sourceRef: "S-201 mat slab",
    sourceExtractionIds: ["ex-pl-risk-matpour"],
    audience: "ops",
    stage: "planned",
    disposition: incl,
    crewNote: "Pressure-test supplier truck count + pour plan before commit.",
    createdAt: "2026-06-17T17:11:00.000Z",
  },
  {
    id: "sc-pl-embed",
    bidId: "bid-purple-line",
    title: "Systemwide MEP embed / blockout schedule",
    detail:
      "Plans reference an embed and blockout schedule that isn't in the structural set. Carried as an allowance pending the GC's schedule (RFI-002).",
    sourceRef: "S-501 (referenced, missing)",
    sourceExtractionIds: ["ex-pl-q-embeds"],
    audience: "estimating",
    stage: "contextualized",
    disposition: incl,
    assumption: "Allowance carried; reconcile against Addendum 3 embeds.",
    createdAt: "2026-04-12T17:12:00.000Z",
  },
  {
    id: "sc-pl-waterproof",
    bidId: "bid-purple-line",
    title: "Below-grade waterproofing & protection board",
    detail:
      "Full below-grade waterproofing system on the station box. Reads out of our trade; confirmed carried by the GC.",
    sourceRef: "Spec §07 13 00; Scope Letter p.3",
    sourceExtractionIds: ["ex-pl-q-waterproof"],
    audience: "both",
    stage: "contextualized",
    disposition: "excluded",
    assumption: "Red-tagged — waterproofing by GC per the scope sheet.",
    createdAt: "2026-04-12T17:13:00.000Z",
  },
];
