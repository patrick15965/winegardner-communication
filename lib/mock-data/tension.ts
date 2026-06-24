import type { SignOff, TensionItem } from "@/lib/store/types";

// Pre-loaded Pre-Bid "Tension Center" for the San Diego CMU bid — the showcase.
// Structured bid review the estimator surfaces so ops/PM/field can challenge
// anything BEFORE submission, making it a team decision.
export const tensionItems: TensionItem[] = [
  {
    id: "ti-sd-prod",
    bidId: "bid-sd-cmu",
    type: "productionRate",
    title: "8\" precision gray @ 130 units/day/mason",
    detail:
      "Estimated at 130/day. ~1,200 sf, walls ~30 ft up around two wet electrical enclosures on the 2nd floor — hoisting + scaffolding will slow runs.",
    raisedById: "p-angel",
    createdAt: "2026-06-20T18:00:00.000Z",
    status: "open",
    comments: [
      {
        id: "c-sd-prod-1",
        authorId: "p-patrick",
        body: "30 ft up with hoisting and a tight footprint, 130 is optimistic. We've been closer to 100/day on cut-up elevated work. Can we re-run at 105–110?",
        createdAt: "2026-06-20T19:10:00.000Z",
        kind: "challenge",
        resolved: false,
      },
    ],
  },
  {
    id: "ti-sd-perdiem",
    bidId: "bid-sd-cmu",
    type: "assumption",
    title: "Full-crew $100/day per diem allocated Nov–Dec",
    detail:
      "Assumed San Diego per diem for the full crew across the Nov–Dec 2026 schedule (90+ mile DIR rule).",
    raisedById: "p-angel",
    createdAt: "2026-06-20T18:05:00.000Z",
    status: "resolved",
    resolution:
      "Carry full-crew $100/day per diem for the Nov–Dec 2026 schedule. If the schedule slips into 2027, re-price the per diem at the bumped rate.",
    agreedByIds: ["p-angel", "p-luke"],
    comments: [
      {
        id: "c-sd-pd-1",
        authorId: "p-luke",
        body: "Confirmed — full crew gets it, and remember the rate bumps in 2027 if this slips.",
        createdAt: "2026-06-20T20:00:00.000Z",
        kind: "response",
        resolved: true,
      },
    ],
  },
  {
    id: "ti-sd-topwall",
    bidId: "bid-sd-cmu",
    type: "scopeGap",
    title: "Top-of-wall fire-safing carried as alternate only",
    detail:
      "Drawings call for top-of-wall / mid-wall fire safety but GC didn't take the alternate. Left out of base price as an alternate. Structural details for bottom/top of wall are missing — went by the 13'-0\" floor elevation tag.",
    raisedById: "p-angel",
    createdAt: "2026-06-20T18:10:00.000Z",
    status: "open",
    comments: [
      {
        id: "c-sd-tw-1",
        authorId: "p-tucker",
        body: "If they add it back mid-job with no detail, that's a change-order fight. Make sure the exclusion is red-tagged clearly in the proposal.",
        createdAt: "2026-06-20T21:30:00.000Z",
        kind: "challenge",
        resolved: false,
      },
    ],
  },
  {
    id: "ti-sd-rebar",
    bidId: "bid-sd-cmu",
    type: "assumption",
    title: "Rebar included; spacing assumed (no structural details)",
    detail:
      "No structural details / rebar spacing on the set. Carried rebar as included at typical spacing. Control-joint locations not shown.",
    raisedById: "p-angel",
    createdAt: "2026-06-20T18:15:00.000Z",
    status: "open",
    comments: [],
  },
  {
    id: "ti-sd-exclusion",
    bidId: "bid-sd-cmu",
    type: "exclusion",
    title: "No welding / no waterproofing in scope",
    detail:
      "Spec references welding at embeds and waterproofing — both excluded (out of our trade / would require union welder). Red-tagged on scope sheet.",
    raisedById: "p-angel",
    createdAt: "2026-06-20T18:20:00.000Z",
    status: "resolved",
    resolution:
      "Welding and waterproofing stay excluded and red-tagged on the scope sheet so the GC can't assume they're ours.",
    agreedByIds: ["p-angel", "p-casey"],
    comments: [
      {
        id: "c-sd-ex-1",
        authorId: "p-casey",
        body: "Good — keep it explicit so the GC can't assume it's ours.",
        createdAt: "2026-06-20T22:00:00.000Z",
        kind: "note",
        resolved: true,
      },
    ],
  },
  {
    id: "ti-sd-discount",
    bidId: "bid-sd-cmu",
    type: "contingency",
    title: "Price dropped $99K → $95K to match competitor",
    detail:
      "GC said we were ~$10K over the other PC (Conco). Casey gave a $4K courtesy reduction to stay competitive. Margin is now tighter than standard 23% O&P.",
    raisedById: "p-casey",
    createdAt: "2026-06-21T15:00:00.000Z",
    status: "open",
    comments: [
      {
        id: "c-sd-disc-1",
        authorId: "p-patrick",
        body: "If production also drops to ~105/day, the $4K cut plus the slower rate could erase the margin. Want to see the re-run before we commit.",
        createdAt: "2026-06-21T16:20:00.000Z",
        kind: "challenge",
        resolved: false,
      },
    ],
  },
];

export const signOffs: SignOff[] = [
  {
    id: "so-sd-luke",
    bidId: "bid-sd-cmu",
    personId: "p-luke",
    decision: "approve",
    note: "Per diem + crew plan look right.",
    updatedAt: "2026-06-20T20:05:00.000Z",
  },
  {
    id: "so-sd-tucker",
    bidId: "bid-sd-cmu",
    personId: "p-tucker",
    decision: "approveWithNotes",
    note: "OK to submit if the top-of-wall exclusion is red-tagged in the proposal.",
    updatedAt: "2026-06-20T21:35:00.000Z",
  },
];

/** Stakeholders expected to sign off before a bid leaves Pre-Bid Review. */
export const REQUIRED_SIGNOFF_ROLES = ["CEO", "PM", "Ops", "Super"] as const;
