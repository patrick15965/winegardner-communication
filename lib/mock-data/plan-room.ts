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
  // Purple Line Station 3 — awarded public-transit CIP concrete package.
  {
    id: "doc-pl-plans",
    bidId: "bid-purple-line",
    name: "Civil, Structural & Architectural Plans.pdf",
    docType: "plans",
    pageCount: 214,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-04-11T16:30:00.000Z",
  },
  {
    id: "doc-pl-spec",
    bidId: "bid-purple-line",
    name: "Metro Project Manual / Spec Book.pdf",
    docType: "specBook",
    pageCount: 542,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-04-11T16:31:00.000Z",
  },
  {
    id: "doc-pl-scope",
    bidId: "bid-purple-line",
    name: "GC Scope Letter — Cast-in-Place Concrete.pdf",
    docType: "scopeLetter",
    pageCount: 4,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-04-11T16:33:00.000Z",
  },
  {
    id: "doc-pl-geotech",
    bidId: "bid-purple-line",
    name: "Geotechnical Investigation Report.pdf",
    docType: "geotech",
    pageCount: 88,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-04-11T16:34:00.000Z",
  },
  {
    id: "doc-pl-add3",
    bidId: "bid-purple-line",
    name: "Addendum 03 — Structural Revisions.pdf",
    docType: "addendum",
    pageCount: 12,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-05-02T16:00:00.000Z",
  },
  {
    id: "doc-pl-bidform",
    bidId: "bid-purple-line",
    name: "Bid Form & Schedule of Values.pdf",
    docType: "bidForm",
    pageCount: 6,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-04-11T16:35:00.000Z",
  },

  // ── Ontario Sports Empire (awarded masonry) ─────────────────────────────
  {
    id: "doc-ont-plans",
    bidId: "bid-ontario",
    name: "Architectural & Structural Plans.pdf",
    docType: "plans",
    pageCount: 284,
    uploadedById: "p-casey",
    uploadedAt: "2026-01-05T16:30:00.000Z",
  },
  {
    id: "doc-ont-spec",
    bidId: "bid-ontario",
    name: "Project Manual / Spec Book.pdf",
    docType: "specBook",
    pageCount: 412,
    uploadedById: "p-casey",
    uploadedAt: "2026-01-05T16:31:00.000Z",
  },
  {
    id: "doc-ont-scope",
    bidId: "bid-ontario",
    name: "GC Scope Letter — Masonry.pdf",
    docType: "scopeLetter",
    pageCount: 4,
    uploadedById: "p-casey",
    uploadedAt: "2026-01-05T16:32:00.000Z",
  },
  {
    id: "doc-ont-geotech",
    bidId: "bid-ontario",
    name: "Geotechnical Investigation Report.pdf",
    docType: "geotech",
    pageCount: 72,
    uploadedById: "p-casey",
    uploadedAt: "2026-01-05T16:33:00.000Z",
  },
  {
    id: "doc-ont-add2",
    bidId: "bid-ontario",
    name: "Addendum 02 — Masonry & Storefront Revisions.pdf",
    docType: "addendum",
    pageCount: 9,
    uploadedById: "p-casey",
    uploadedAt: "2026-01-22T16:00:00.000Z",
  },
  {
    id: "doc-ont-bidform",
    bidId: "bid-ontario",
    name: "Bid Form & Schedule of Values.pdf",
    docType: "bidForm",
    pageCount: 6,
    uploadedById: "p-casey",
    uploadedAt: "2026-01-05T16:34:00.000Z",
  },

  // ── Jordan High School — Phase 4 (awarded DSA masonry) ───────────────────
  {
    id: "doc-jhs-plans",
    bidId: "bid-jordan-hs",
    name: "Architectural & Structural Plans.pdf",
    docType: "plans",
    pageCount: 178,
    uploadedById: "p-angel",
    uploadedAt: "2026-02-01T16:30:00.000Z",
  },
  {
    id: "doc-jhs-spec",
    bidId: "bid-jordan-hs",
    name: "DSA Project Manual / Spec Book.pdf",
    docType: "specBook",
    pageCount: 296,
    uploadedById: "p-angel",
    uploadedAt: "2026-02-01T16:31:00.000Z",
  },
  {
    id: "doc-jhs-scope",
    bidId: "bid-jordan-hs",
    name: "GC Scope Letter — Masonry.pdf",
    docType: "scopeLetter",
    pageCount: 3,
    uploadedById: "p-angel",
    uploadedAt: "2026-02-01T16:32:00.000Z",
  },
  {
    id: "doc-jhs-add1",
    bidId: "bid-jordan-hs",
    name: "Addendum 01 — DSA Backcheck Revisions.pdf",
    docType: "addendum",
    pageCount: 7,
    uploadedById: "p-angel",
    uploadedAt: "2026-02-12T16:00:00.000Z",
  },
  {
    id: "doc-jhs-bidform",
    bidId: "bid-jordan-hs",
    name: "Bid Form.pdf",
    docType: "bidForm",
    pageCount: 4,
    uploadedById: "p-angel",
    uploadedAt: "2026-02-01T16:33:00.000Z",
  },

  // ── Lincoln High School — Paver Plaza (handoff, site masonry) ────────────
  {
    id: "doc-lin-plans",
    bidId: "bid-lincoln-paver",
    name: "Hardscape & Site Plans.pdf",
    docType: "plans",
    pageCount: 64,
    uploadedById: "p-angel",
    uploadedAt: "2026-05-01T16:30:00.000Z",
  },
  {
    id: "doc-lin-spec",
    bidId: "bid-lincoln-paver",
    name: "Project Manual / Spec Book.pdf",
    docType: "specBook",
    pageCount: 138,
    uploadedById: "p-angel",
    uploadedAt: "2026-05-01T16:31:00.000Z",
  },
  {
    id: "doc-lin-scope",
    bidId: "bid-lincoln-paver",
    name: "GC Scope Letter — Site Masonry & Pavers.pdf",
    docType: "scopeLetter",
    pageCount: 3,
    uploadedById: "p-angel",
    uploadedAt: "2026-05-01T16:32:00.000Z",
  },

  // ── Henderson Retail — Screen Walls (estimating, NV masonry) ─────────────
  {
    id: "doc-hen-plans",
    bidId: "bid-henderson-walls",
    name: "Architectural & Site Plans.pdf",
    docType: "plans",
    pageCount: 48,
    uploadedById: "p-angel",
    uploadedAt: "2026-06-18T16:30:00.000Z",
  },
  {
    id: "doc-hen-spec",
    bidId: "bid-henderson-walls",
    name: "Outline Spec — Masonry.pdf",
    docType: "specBook",
    pageCount: 34,
    uploadedById: "p-angel",
    uploadedAt: "2026-06-18T16:31:00.000Z",
  },
  {
    id: "doc-hen-scope",
    bidId: "bid-henderson-walls",
    name: "GC Scope Letter — Screen Walls.pdf",
    docType: "scopeLetter",
    pageCount: 2,
    uploadedById: "p-angel",
    uploadedAt: "2026-06-18T16:32:00.000Z",
  },

  // ── Riverside USD — Site Walls (invited, masonry) ────────────────────────
  {
    id: "doc-riv-plans",
    bidId: "bid-riverside-fce",
    name: "Site & Wall Plans.pdf",
    docType: "plans",
    pageCount: 52,
    uploadedById: "p-angel",
    uploadedAt: "2026-06-20T16:30:00.000Z",
  },
  {
    id: "doc-riv-spec",
    bidId: "bid-riverside-fce",
    name: "Project Manual / Spec Book.pdf",
    docType: "specBook",
    pageCount: 118,
    uploadedById: "p-angel",
    uploadedAt: "2026-06-20T16:31:00.000Z",
  },
  {
    id: "doc-riv-scope",
    bidId: "bid-riverside-fce",
    name: "Invitation to Bid — Site Masonry.pdf",
    docType: "scopeLetter",
    pageCount: 2,
    uploadedById: "p-angel",
    uploadedAt: "2026-06-20T16:32:00.000Z",
  },

  // ── Fontana Data Center — Underground (invited, concrete) ────────────────
  {
    id: "doc-fon-plans",
    bidId: "bid-fontana-ug",
    name: "Civil & Structural Plans.pdf",
    docType: "plans",
    pageCount: 162,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-06-21T16:30:00.000Z",
  },
  {
    id: "doc-fon-spec",
    bidId: "bid-fontana-ug",
    name: "Division 03 Concrete Spec.pdf",
    docType: "specBook",
    pageCount: 88,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-06-21T16:31:00.000Z",
  },
  {
    id: "doc-fon-scope",
    bidId: "bid-fontana-ug",
    name: "GC Scope Letter — Underground Concrete.pdf",
    docType: "scopeLetter",
    pageCount: 4,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-06-21T16:32:00.000Z",
  },
  {
    id: "doc-fon-geotech",
    bidId: "bid-fontana-ug",
    name: "Geotechnical Investigation Report.pdf",
    docType: "geotech",
    pageCount: 76,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-06-21T16:33:00.000Z",
  },

  // ── Chino Hills Civic — CMU & Site (submitted, public-works masonry) ──────
  {
    id: "doc-chino-plans",
    bidId: "bid-chino-bond",
    name: "Architectural & Structural Plans.pdf",
    docType: "plans",
    pageCount: 156,
    uploadedById: "p-casey",
    uploadedAt: "2026-05-20T16:30:00.000Z",
  },
  {
    id: "doc-chino-spec",
    bidId: "bid-chino-bond",
    name: "Project Manual / Spec Book.pdf",
    docType: "specBook",
    pageCount: 338,
    uploadedById: "p-casey",
    uploadedAt: "2026-05-20T16:31:00.000Z",
  },
  {
    id: "doc-chino-scope",
    bidId: "bid-chino-bond",
    name: "GC Scope Letter — CMU & Site Masonry.pdf",
    docType: "scopeLetter",
    pageCount: 3,
    uploadedById: "p-casey",
    uploadedAt: "2026-05-20T16:32:00.000Z",
  },
  {
    id: "doc-chino-geotech",
    bidId: "bid-chino-bond",
    name: "Geotechnical Report.pdf",
    docType: "geotech",
    pageCount: 64,
    uploadedById: "p-casey",
    uploadedAt: "2026-05-20T16:33:00.000Z",
  },
  {
    id: "doc-chino-add2",
    bidId: "bid-chino-bond",
    name: "Addendum 02 — CMU & Site Revisions.pdf",
    docType: "addendum",
    pageCount: 11,
    uploadedById: "p-casey",
    uploadedAt: "2026-06-02T16:00:00.000Z",
  },
  {
    id: "doc-chino-bidform",
    bidId: "bid-chino-bond",
    name: "Bid Form & Schedule of Values.pdf",
    docType: "bidForm",
    pageCount: 6,
    uploadedById: "p-casey",
    uploadedAt: "2026-05-20T16:34:00.000Z",
  },

  // ── Rialto Distribution Center — Tilt-Up (submitted, concrete) ───────────
  {
    id: "doc-rial-plans",
    bidId: "bid-rialto-tilt",
    name: "Tilt-Up Panel & Slab Drawings.pdf",
    docType: "plans",
    pageCount: 112,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-05-28T16:30:00.000Z",
  },
  {
    id: "doc-rial-spec",
    bidId: "bid-rialto-tilt",
    name: "Division 03 Concrete Spec.pdf",
    docType: "specBook",
    pageCount: 72,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-05-28T16:31:00.000Z",
  },
  {
    id: "doc-rial-scope",
    bidId: "bid-rialto-tilt",
    name: "GC Scope Letter — Tilt-Up Concrete.pdf",
    docType: "scopeLetter",
    pageCount: 4,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-05-28T16:32:00.000Z",
  },
  {
    id: "doc-rial-geotech",
    bidId: "bid-rialto-tilt",
    name: "Geotechnical Investigation Report.pdf",
    docType: "geotech",
    pageCount: 58,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-05-28T16:33:00.000Z",
  },

  // ── Pomona Transit Plaza — CMU (submitted, masonry) ──────────────────────
  {
    id: "doc-pom-plans",
    bidId: "bid-pomona-plaza",
    name: "Architectural & Site Plans.pdf",
    docType: "plans",
    pageCount: 88,
    uploadedById: "p-angel",
    uploadedAt: "2026-05-24T16:30:00.000Z",
  },
  {
    id: "doc-pom-spec",
    bidId: "bid-pomona-plaza",
    name: "Project Manual / Spec Book.pdf",
    docType: "specBook",
    pageCount: 208,
    uploadedById: "p-angel",
    uploadedAt: "2026-05-24T16:31:00.000Z",
  },
  {
    id: "doc-pom-scope",
    bidId: "bid-pomona-plaza",
    name: "GC Scope Letter — CMU.pdf",
    docType: "scopeLetter",
    pageCount: 3,
    uploadedById: "p-angel",
    uploadedAt: "2026-05-24T16:32:00.000Z",
  },
  {
    id: "doc-pom-bidform",
    bidId: "bid-pomona-plaza",
    name: "Bid Form.pdf",
    docType: "bidForm",
    pageCount: 5,
    uploadedById: "p-angel",
    uploadedAt: "2026-05-24T16:33:00.000Z",
  },

  // ── Victorville Logistics — Slabs (submitted, concrete) ──────────────────
  {
    id: "doc-vic-plans",
    bidId: "bid-victorville-slabs",
    name: "Slab & Foundation Drawings.pdf",
    docType: "plans",
    pageCount: 74,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-05-15T16:30:00.000Z",
  },
  {
    id: "doc-vic-spec",
    bidId: "bid-victorville-slabs",
    name: "Division 03 Concrete Spec.pdf",
    docType: "specBook",
    pageCount: 60,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-05-15T16:31:00.000Z",
  },
  {
    id: "doc-vic-scope",
    bidId: "bid-victorville-slabs",
    name: "GC Scope Letter — Slabs-on-Grade.pdf",
    docType: "scopeLetter",
    pageCount: 3,
    uploadedById: "p-rohilio",
    uploadedAt: "2026-05-15T16:32:00.000Z",
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
  // ── Purple Line Station 3 — intake facts pulled from the documents ──
  {
    id: "ex-pl-fact-qty",
    bidId: "bid-purple-line",
    sourceDocId: "doc-pl-plans",
    phase: "intake",
    kind: "fact",
    audience: "estimating",
    title: "~3,400 cy cast-in-place structural concrete",
    detail:
      "Foundation mat slab, below-grade station walls, columns, and the platform-level slab. Roughly 3,400 cy of CIP across the structural package per the structural sheets.",
    sourceRef: "S-200 series / concrete schedule",
    status: "answered",
    answeredById: "p-rohilio",
    answer: "Matches takeoff — carried at 3,400 cy.",
    createdAt: "2026-04-12T17:00:00.000Z",
  },
  {
    id: "ex-pl-fact-pw",
    bidId: "bid-purple-line",
    sourceDocId: "doc-pl-spec",
    phase: "intake",
    kind: "fact",
    audience: "estimating",
    title: "DIR prevailing wage + Metro PLA",
    detail:
      "Public transit work under a Metro Project Labor Agreement. Front-end confirms DIR prevailing wage, certified payroll, and PLA dispatch — labor rates and reporting carry accordingly.",
    sourceRef: "Front-end §00 73 00 / PLA exhibit",
    status: "answered",
    answeredById: "p-rohilio",
    answer: "Confirmed — PLA rates and certified payroll carried.",
    createdAt: "2026-04-12T17:01:00.000Z",
  },
  {
    id: "ex-pl-fact-archform",
    bidId: "bid-purple-line",
    sourceDocId: "doc-pl-plans",
    phase: "intake",
    kind: "fact",
    audience: "both",
    title: "Board-form architectural concrete at headhouse",
    detail:
      "Headhouse entry walls call for finish-critical board-form architectural concrete with a mock-up requirement. Higher formwork cost and slower placement than the structural pours.",
    sourceRef: "A-401 / Spec §03 35 00",
    status: "open",
    createdAt: "2026-04-12T17:02:00.000Z",
  },
  // ── Purple Line — intake questions that need eyes before takeoff ──
  {
    id: "ex-pl-q-embeds",
    bidId: "bid-purple-line",
    sourceDocId: "doc-pl-plans",
    phase: "intake",
    kind: "question",
    audience: "estimating",
    title: "Systemwide MEP embed / blockout schedule not in the set",
    detail:
      "Plans reference a systemwide embed and blockout schedule for trackwork and MEP, but the schedule isn't in the structural drawings. Carry an allowance for embeds, or RFI the GC?",
    sourceRef: "S-501 (referenced, missing)",
    status: "open",
    createdAt: "2026-04-12T17:05:00.000Z",
  },
  {
    id: "ex-pl-q-waterproof",
    bidId: "bid-purple-line",
    sourceDocId: "doc-pl-spec",
    phase: "intake",
    kind: "question",
    audience: "both",
    title: "Below-grade waterproofing — our scope or GC's?",
    detail:
      "Spec calls for a full below-grade waterproofing and protection-board system on the station box. Reads out of our trade, but the scope letter is silent. Confirm exclusion before pricing.",
    sourceRef: "Spec §07 13 00; Scope Letter p.3",
    status: "answered",
    answeredById: "p-rohilio",
    answer: "Excluded — red-tagged. Waterproofing carried by GC per the scope sheet.",
    createdAt: "2026-04-12T17:06:00.000Z",
  },
  {
    id: "ex-pl-q-night",
    bidId: "bid-purple-line",
    sourceDocId: "doc-pl-spec",
    phase: "intake",
    kind: "question",
    audience: "both",
    title: "Night / weekend pour windows near active tracks",
    detail:
      "Front-end limits work adjacent to the operating line to night and weekend windows with flagging. Affects shift premiums and pour sequencing — confirm the allowed windows before we set the rate.",
    sourceRef: "Front-end §01 14 00 (work restrictions)",
    status: "open",
    createdAt: "2026-04-12T17:07:00.000Z",
  },
  // ── Purple Line — Phase 2 ops-risk questions ──
  {
    id: "ex-pl-risk-matpour",
    bidId: "bid-purple-line",
    sourceDocId: "doc-pl-plans",
    phase: "preBidCommit",
    kind: "risk",
    audience: "ops",
    title: "Continuous mat-slab pour — supply + downtown traffic control",
    detail:
      "The foundation mat is a large monolithic pour. Sustaining the truck count through a downtown LA traffic-control plan is the real risk — a stall mid-pour means a cold joint. Ops should pressure-test the supplier and the pour plan before we commit.",
    sourceRef: "S-201 mat slab",
    status: "open",
    createdAt: "2026-06-17T17:00:00.000Z",
  },
  {
    id: "ex-pl-risk-rebar",
    bidId: "bid-purple-line",
    phase: "preBidCommit",
    kind: "risk",
    audience: "ops",
    title: "Congested platform rebar — placement productivity",
    detail:
      "Platform and wall rebar is heavily congested with seismic detailing. Estimate assumes standard placement rates; in tight, mat-style mats that historically runs slower. Ops should weigh in before we lock the labor.",
    status: "open",
    createdAt: "2026-06-17T17:01:00.000Z",
  },
  {
    id: "ex-pl-risk-access",
    bidId: "bid-purple-line",
    phase: "preBidCommit",
    kind: "risk",
    audience: "ops",
    title: "Constrained urban site — laydown & crane access",
    detail:
      "The station box sits on a tight downtown footprint with an active street alongside. Laydown, pump siting, and crane access are all limited. Confirm the logistics plan works before committing the schedule and crew size.",
    status: "open",
    createdAt: "2026-06-17T17:02:00.000Z",
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
