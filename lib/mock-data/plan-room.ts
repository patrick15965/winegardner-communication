import type {
  Bid,
  BidDocument,
  DetectedField,
  Extraction,
  ExtractionPhase,
} from "@/lib/store/types";

// ──────────────────────────────────────────────────────────────────────────
// Plan Room seed data.
//
// Two bids are wired for the demo:
//   • San Diego CMU (bid-sd-cmu)  — the "finished" example: docs imported, the
//     intake pass already ran, likelihood is "committed", and the Phase-2
//     ops-risk pass already fired (one finding promoted into the Tension
//     Center, linking Plan Room → the existing sign-off gate).
//   • Mesa Tilt-Up (bid-mesa-tilt) — the "live" example: docs imported but
//     nothing extracted yet, so you can run the AI pass and flip likelihood
//     to watch Phase-2 ops questions fire, end-to-end.
// ──────────────────────────────────────────────────────────────────────────

export const bidDocuments: BidDocument[] = [
  // San Diego CMU
  {
    id: "doc-sd-plans",
    bidId: "bid-sd-cmu",
    name: "Architectural & Structural Plans.pdf",
    docType: "plans",
    pageCount: 142,
    uploadedById: "p-angel",
    uploadedAt: "2026-06-12T16:30:00.000Z",
  },
  {
    id: "doc-sd-spec",
    bidId: "bid-sd-cmu",
    name: "Project Manual / Spec Book.pdf",
    docType: "specBook",
    pageCount: 318,
    uploadedById: "p-angel",
    uploadedAt: "2026-06-12T16:31:00.000Z",
  },
  {
    id: "doc-sd-scope",
    bidId: "bid-sd-cmu",
    name: "GC Scope Letter — Masonry.pdf",
    docType: "scopeLetter",
    pageCount: 3,
    uploadedById: "p-angel",
    uploadedAt: "2026-06-12T16:32:00.000Z",
  },
  // Mesa Tilt-Up
  {
    id: "doc-mesa-plans",
    bidId: "bid-mesa-tilt",
    name: "Tilt-Up Panel & Slab Drawings.pdf",
    docType: "plans",
    pageCount: 96,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-06-16T16:30:00.000Z",
  },
  {
    id: "doc-mesa-spec",
    bidId: "bid-mesa-tilt",
    name: "Division 03 Concrete Spec.pdf",
    docType: "specBook",
    pageCount: 64,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-06-16T16:31:00.000Z",
  },
];

/** Findings already discovered for the showcase bid (San Diego CMU). */
export const extractions: Extraction[] = [
  // ── Intake pass — facts pulled straight from the documents ──
  {
    id: "ex-sd-fact-qty",
    bidId: "bid-sd-cmu",
    sourceDocId: "doc-sd-plans",
    phase: "intake",
    kind: "fact",
    audience: "estimating",
    title: "~1,200 sf of 8\" precision gray CMU",
    detail:
      "Wall schedule calls for 8\" precision gray block, running-bond, around two 2nd-floor electrical enclosures. ~1,200 sf across the elevated runs.",
    sourceRef: "A-201 wall schedule",
    status: "answered",
    answeredById: "p-angel",
    answer: "Matches takeoff — carried at 1,200 sf.",
    createdAt: "2026-06-12T17:00:00.000Z",
  },
  {
    id: "ex-sd-fact-pw",
    bidId: "bid-sd-cmu",
    sourceDocId: "doc-sd-spec",
    phase: "intake",
    kind: "fact",
    audience: "estimating",
    title: "DIR prevailing wage — public works",
    detail:
      "Front-end references DIR prevailing wage and the 90+ mile per-diem rule. Confirms San Diego per diem applies to the full crew.",
    sourceRef: "Front-end §00 73 00",
    status: "answered",
    answeredById: "p-angel",
    answer: "Confirmed — per diem carried for full crew, Nov–Dec.",
    createdAt: "2026-06-12T17:01:00.000Z",
  },
  {
    id: "ex-sd-fact-encl",
    bidId: "bid-sd-cmu",
    sourceDocId: "doc-sd-plans",
    phase: "intake",
    kind: "fact",
    audience: "both",
    title: "Walls ~30 ft up around two wet electrical enclosures",
    detail:
      "Elevated, cut-up work on the 2nd floor around live electrical enclosures — hoisting and scaffolding implied but not detailed.",
    sourceRef: "E-401 / A-301",
    status: "open",
    createdAt: "2026-06-12T17:02:00.000Z",
  },
  // ── Intake pass — questions that need eyes before takeoff ──
  {
    id: "ex-sd-q-rebar",
    bidId: "bid-sd-cmu",
    sourceDocId: "doc-sd-plans",
    phase: "intake",
    kind: "question",
    audience: "estimating",
    title: "No structural details or rebar spacing on the set",
    detail:
      "Structural sheets don't show rebar spacing or control-joint locations. Assume typical spacing and carry rebar as included?",
    sourceRef: "S-series (missing details)",
    status: "open",
    createdAt: "2026-06-12T17:05:00.000Z",
  },
  {
    id: "ex-sd-q-topwall",
    bidId: "bid-sd-cmu",
    sourceDocId: "doc-sd-spec",
    phase: "intake",
    kind: "question",
    audience: "both",
    title: "Top-of-wall fire-safing shown but not in GC alternate",
    detail:
      "Drawings call for top-of-wall / mid-wall fire safing, but the GC scope letter didn't take the alternate. Carry as alternate only, or include in base?",
    sourceRef: "Spec §07 84 00; Scope Letter p.2",
    status: "open",
    createdAt: "2026-06-12T17:06:00.000Z",
  },
  {
    id: "ex-sd-q-welding",
    bidId: "bid-sd-cmu",
    sourceDocId: "doc-sd-spec",
    phase: "intake",
    kind: "question",
    audience: "estimating",
    title: "Welding at embeds referenced — in our scope?",
    detail:
      "Spec references welding at embeds and waterproofing. Both look out of our trade (union welder). Confirm exclusion and red-tag.",
    sourceRef: "Spec §05 50 00",
    status: "answered",
    answeredById: "p-angel",
    answer: "Excluded — red-tagged on scope sheet. No welding, no waterproofing.",
    createdAt: "2026-06-12T17:07:00.000Z",
  },
  // ── Phase 2 — ops-risk questions fired when marked "likely/committed" ──
  {
    id: "ex-sd-risk-prod",
    bidId: "bid-sd-cmu",
    sourceDocId: "doc-sd-plans",
    phase: "preBidCommit",
    kind: "risk",
    audience: "ops",
    title: "30 ft elevated, hoisting + scaffolding — is 130/day realistic?",
    detail:
      "Estimate carries 130 units/day/mason. Cut-up elevated work around enclosures with hoisting historically runs closer to 100–110. Ops should weigh in before we commit the rate.",
    sourceRef: "A-301 elevations",
    status: "answered",
    answeredById: "p-patrick",
    answer: "Raised in the Tension Center — re-running at 105–110/day.",
    promotedToTensionId: "ti-sd-prod",
    createdAt: "2026-06-19T17:00:00.000Z",
  },
  {
    id: "ex-sd-risk-lead",
    bidId: "bid-sd-cmu",
    phase: "preBidCommit",
    kind: "risk",
    audience: "ops",
    title: "Block lead time vs. a Nov–Dec start",
    detail:
      "Precision gray has been running ~6 weeks. A Nov–Dec schedule means ordering during the holiday slowdown — confirm the yard can hit the dates before we commit.",
    status: "open",
    createdAt: "2026-06-19T17:01:00.000Z",
  },
  {
    id: "ex-sd-risk-crew",
    bidId: "bid-sd-cmu",
    phase: "preBidCommit",
    kind: "risk",
    audience: "ops",
    title: "Crew availability for Nov–Dec elevated work",
    detail:
      "Tight elevated footprint needs an experienced cut-up crew. Does ops have the right foreman + masons available in that window, or are they committed elsewhere?",
    status: "open",
    createdAt: "2026-06-19T17:02:00.000Z",
  },
];

// ──────────────────────────────────────────────────────────────────────────
// Canned AI output the reducer injects when `runExtraction` is invoked for a
// bid that hasn't run that phase yet. Keyed by `${bidId}:${phase}`. Each entry
// is the finding minus the fields the reducer stamps (id / status / createdAt).
// ──────────────────────────────────────────────────────────────────────────

type CannedFinding = Pick<
  Extraction,
  "kind" | "audience" | "title" | "detail" | "sourceRef" | "sourceDocId"
>;

const LIBRARY: Record<string, CannedFinding[]> = {
  "bid-mesa-tilt:intake": [
    {
      kind: "fact",
      audience: "estimating",
      title: "60,000 sf tilt-up panels + slab-on-grade",
      detail:
        "Drawings show tilt-up wall panels up to 32 ft tall plus a slab-on-grade pour. Roughly 60,000 sf of wall panel area.",
      sourceRef: "S-101 panel layout",
      sourceDocId: "doc-mesa-plans",
    },
    {
      kind: "fact",
      audience: "estimating",
      title: "Mesa, AZ — confirm AZ prevailing-wage applicability",
      detail:
        "Private logistics developer, but verify whether any public funding or PLA triggers prevailing wage in AZ before pricing labor.",
      sourceRef: "Front-end §00 73 00",
      sourceDocId: "doc-mesa-spec",
    },
    {
      kind: "question",
      audience: "both",
      title: "Embed / connection schedule not in the set",
      detail:
        "Panel-to-foundation and panel-to-panel connection details are referenced but the embed schedule isn't in the drawings. RFI to the GC, or carry an allowance?",
      sourceRef: "S-501 (referenced, missing)",
      sourceDocId: "doc-mesa-plans",
    },
    {
      kind: "question",
      audience: "estimating",
      title: "Concrete mix / PSI not specified for panels",
      detail:
        "Division 03 spec leaves panel mix design open. Assume 4000 psi, or wait on the GC's structural confirmation?",
      sourceRef: "Spec §03 30 00",
      sourceDocId: "doc-mesa-spec",
    },
    {
      kind: "question",
      audience: "both",
      title: "Crane for panel erection — by us or the GC?",
      detail:
        "Scope split on the erection crane isn't clear. This is a big number either way — confirm before takeoff.",
      sourceRef: "Spec §03 47 00",
      sourceDocId: "doc-mesa-spec",
    },
  ],
  "bid-mesa-tilt:preBidCommit": [
    {
      kind: "risk",
      audience: "ops",
      title: "AZ summer pour — heat / curing schedule",
      detail:
        "A July–August Mesa pour means hot-weather concreting: retarders, evaporation control, and night pours may be needed. Ops should pressure-test the schedule before we commit.",
      sourceRef: "Spec §03 30 00 (hot-weather)",
    },
    {
      kind: "risk",
      audience: "ops",
      title: "Panel erection crew + crane — concrete division capacity",
      detail:
        "Erecting 32 ft panels needs an experienced tilt crew and crane coordination. With the concrete division still ramping, does ops have the people in this window?",
    },
    {
      kind: "risk",
      audience: "ops",
      title: "Casting-bed / laydown space on a tight logistics site",
      detail:
        "60,000 sf of panels need casting beds and laydown. Confirm the site can stage them, or we're pouring off-site and trucking — a cost and schedule hit.",
    },
  ],
};

export function cannedExtractionsFor(
  bidId: string,
  phase: ExtractionPhase,
): CannedFinding[] {
  return LIBRARY[`${bidId}:${phase}`] ?? [];
}

// ──────────────────────────────────────────────────────────────────────────
// Auto-fill: project info the AI pulls off the documents during the intake
// pass and writes straight into the bid. `apply` patches the Bid fields;
// `detected` is the human-readable "pulled from documents" receipt shown in
// the overview. Keyed by bidId.
// ──────────────────────────────────────────────────────────────────────────

interface DetectedInfo {
  apply: Partial<Bid>;
  detected: DetectedField[];
}

const PROJECT_INFO: Record<string, DetectedInfo> = {
  "bid-mesa-tilt": {
    apply: { squareFootage: 60000 },
    detected: [
      { label: "Project", value: "Mesa Logistics Tilt-Up Slabs", sourceRef: "Plans — title block" },
      { label: "General Contractor", value: "Desert Ridge GC", sourceRef: "Front-end §00 11 00" },
      { label: "Location", value: "Mesa, AZ", sourceRef: "Plans — title block" },
      { label: "Trade", value: "Concrete", sourceRef: "Division 03 spec" },
      { label: "Square footage", value: "60,000 sf panel area", sourceRef: "S-101 panel layout" },
      { label: "Region / wage", value: "AZ — verify prevailing wage", sourceRef: "Front-end §00 73 00" },
      { label: "Bid due", value: "Jul 8, 2026", sourceRef: "Invitation to bid" },
    ],
  },
};

export function cannedProjectInfoFor(bidId: string): DetectedInfo | undefined {
  return PROJECT_INFO[bidId];
}
