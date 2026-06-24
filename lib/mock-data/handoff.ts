import type { HandoffItem, HandoffMeeting } from "@/lib/store/types";

// Guided estimating → ops handoff checklist. Seeded for the awarded Purple Line
// bid and the Lincoln paver bid (already in handoff).
export const handoffItems: HandoffItem[] = [
  // Purple Line Station 3 (awarded, handoff not started)
  ho("ho-pl-sov", "bid-purple-line", "sov", "SOV finalized & matches awarded contract value", "pending", "PM"),
  ho("ho-pl-scope", "bid-purple-line", "scope", "Scope assumptions & exclusions carried over from bid", "pending", "EstimatorConcrete"),
  ho("ho-pl-rates", "bid-purple-line", "productionRates", "Production rates reviewed against current field actuals", "pending", "Ops"),
  ho("ho-pl-crew", "bid-purple-line", "crewPlan", "Crew plan / ratios confirmed with superintendent", "pending", "Super"),
  ho("ho-pl-foreman", "bid-purple-line", "foreman", "Foreman assigned & briefed (2 weeks out)", "pending", "Ops"),
  ho("ho-pl-rfi", "bid-purple-line", "rfi", "RFIs that must be written now identified", "pending", "PM"),
  ho("ho-pl-sched", "bid-purple-line", "schedule", "Mobilization date confirmed vs. GC schedule", "pending", "PM"),
  ho("ho-pl-risk", "bid-purple-line", "risk", "Key risks (groundwater, dewatering, deep caissons) flagged", "pending", "Ops"),

  // Lincoln paver (in handoff, partially worked)
  ho("ho-lp-sov", "bid-lincoln-paver", "sov", "SOV finalized & matches awarded contract value", "confirmed", "PM"),
  ho("ho-lp-scope", "bid-lincoln-paver", "scope", "Scope assumptions & exclusions carried over from bid", "confirmed", "EstimatorMasonry"),
  ho("ho-lp-rates", "bid-lincoln-paver", "productionRates", "Production rates reviewed against current field actuals", "confirmed", "Ops"),
  ho("ho-lp-crew", "bid-lincoln-paver", "crewPlan", "Crew plan / ratios confirmed with superintendent", "pending", "Super"),
  ho(
    "ho-lp-foreman",
    "bid-lincoln-paver",
    "foreman",
    "Foreman assigned & briefed (2 weeks out)",
    "flagged",
    "Ops",
    "Jeff wants a new brick saw — tile saw already tested & decided. Resolve tooling before mobilization.",
  ),
  ho("ho-lp-rfi", "bid-lincoln-paver", "rfi", "RFIs that must be written now identified", "confirmed", "PM"),
  ho("ho-lp-sched", "bid-lincoln-paver", "schedule", "Mobilization date confirmed vs. GC schedule", "confirmed", "PM"),
  ho("ho-lp-risk", "bid-lincoln-paver", "risk", "Key risks flagged (tight site, panel movement, containment)", "confirmed", "Ops"),
];

function ho(
  id: string,
  bidId: string,
  category: HandoffItem["category"],
  label: string,
  status: HandoffItem["status"],
  ownerRole: HandoffItem["ownerRole"],
  note?: string,
): HandoffItem {
  return { id, bidId, category, label, status, ownerRole, note };
}

export const handoffMeetings: Record<string, HandoffMeeting> = {
  "bid-lincoln-paver": {
    attendeeIds: ["p-angel", "p-tucker", "p-patrick", "p-luke"],
    notes:
      "Reviewed paver layout & saw selection. Tile saw is the call (mobility on a tight site); keep IQ saws on site as backup. Containment mud-tub approach approved.",
  },
  "bid-purple-line": {
    attendeeIds: [],
    notes: "",
  },
};
