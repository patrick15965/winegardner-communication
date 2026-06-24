import type { SovLine } from "@/lib/store/types";

// ──────────────────────────────────────────────────────────────────────────
// Schedule of Values — the priced breakdown behind a bid's single awarded
// value. Seeded for the won/handoff jobs so the handoff sequence can pull the
// real SOV up while ops walks the first step. Each bid's lines sum *exactly* to
// the bid's contract value (see selectors.sovTotal) so the "matches awarded
// contract" check reads true.
// ──────────────────────────────────────────────────────────────────────────

export const sovLines: SovLine[] = [
  // ── Purple Line Station 3 — concrete · $4,250,000 ──
  {
    id: "sov-pl-mob",
    bidId: "bid-purple-line",
    description: "Mobilization & general conditions",
    scheduledValue: 212_500,
    note: "Site setup, traffic control plan, submittals.",
  },
  {
    id: "sov-pl-formwork",
    bidId: "bid-purple-line",
    description: "Formwork — caissons, walls & mat slab",
    scheduledValue: 1_120_000,
  },
  {
    id: "sov-pl-rebar",
    bidId: "bid-purple-line",
    description: "Reinforcing steel — place & tie",
    scheduledValue: 840_000,
    note: "Heavier embed plates per Addendum 3 (RFI-002).",
  },
  {
    id: "sov-pl-cip",
    bidId: "bid-purple-line",
    description: "Cast-in-place structural concrete",
    scheduledValue: 1_530_000,
    note: "~3,400 cy incl. board-form at headhouse.",
  },
  {
    id: "sov-pl-dewater",
    bidId: "bid-purple-line",
    description: "Dewatering & caisson access",
    scheduledValue: 348_000,
    note: "Pending groundwater elevation (RFI-001).",
  },
  {
    id: "sov-pl-closeout",
    bidId: "bid-purple-line",
    description: "Close-out & demobilization",
    scheduledValue: 199_500,
  },

  // ── Lincoln High School — Paver Plaza — masonry · $540,000 ──
  {
    id: "sov-lp-mob",
    bidId: "bid-lincoln-paver",
    description: "Mobilization & site protection",
    scheduledValue: 38_000,
    note: "Containment + mud-tub approach on occupied campus.",
  },
  {
    id: "sov-lp-demo",
    bidId: "bid-lincoln-paver",
    description: "Demo & subgrade preparation",
    scheduledValue: 64_000,
  },
  {
    id: "sov-lp-pavers",
    bidId: "bid-lincoln-paver",
    description: "Paver supply & installation",
    scheduledValue: 286_000,
  },
  {
    id: "sov-lp-banding",
    bidId: "bid-lincoln-paver",
    description: "Banding, borders & soldier courses",
    scheduledValue: 92_000,
  },
  {
    id: "sov-lp-seal",
    bidId: "bid-lincoln-paver",
    description: "Joint sand & sealing",
    scheduledValue: 34_000,
  },
  {
    id: "sov-lp-closeout",
    bidId: "bid-lincoln-paver",
    description: "Close-out & punch",
    scheduledValue: 26_000,
  },
];
