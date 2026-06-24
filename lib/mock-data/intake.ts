import type {
  Bid,
  IntakeStepDef,
  IntakeStepKey,
  IntakeStepRun,
} from "@/lib/store/types";

// ──────────────────────────────────────────────────────────────────────────
// Intake pipeline definition.
//
// When plans are pulled into the Plan Room, the bid runs through these steps in
// order. The first four are automated — the system fires them in sequence. The
// last four are teed up for the estimator and stay locked until the automation
// ahead of them finishes. This mirrors Angel's real intake: organize the docs,
// screen compliance, break the plans down, draft the exclusions — then hand a
// clean starting point to the estimator for scope, questions, takeoff, and SOV.
// ──────────────────────────────────────────────────────────────────────────

export const INTAKE_STEPS: IntakeStepDef[] = [
  {
    key: "organize",
    title: "Organize & file documents",
    detail:
      "Classifies every upload — plans, spec book, scope letter, addenda — and files them in the estimating folder (year → month → project).",
    owner: "auto",
  },
  {
    key: "compliance",
    title: "Compliance screen",
    detail:
      "Reads the front-end for prevailing-wage / DIR triggers and confirms the job is union-signatory before any time goes into it.",
    owner: "auto",
  },
  {
    key: "facts",
    title: "Extract project facts",
    detail:
      "Pulls quantities, wage rules, and scope facts off the drawings, auto-fills the project info, and surfaces the questions that need eyes.",
    owner: "auto",
  },
  {
    key: "draftExclusions",
    title: "Draft scope exclusions",
    detail:
      "Red-tags the usual out-of-trade items as a first draft for the estimator to confirm against the GC scope letter.",
    owner: "auto",
  },
  {
    key: "confirmScope",
    title: "Confirm scope & exclusions",
    detail:
      "Estimator reviews the drafted red-tags against the GC scope letter and locks the inclusions and exclusions.",
    owner: "estimator",
    cta: "Confirm scope",
  },
  {
    key: "resolveQuestions",
    title: "Resolve open questions",
    detail:
      "Estimator answers — or routes to ops — the questions the breakdown surfaced below, so nothing is carried on a guess.",
    owner: "estimator",
    cta: "Mark questions worked",
  },
  {
    key: "takeoff",
    title: "Quantity takeoff",
    detail:
      "Estimator runs the takeoff in Bluebeam against the confirmed scope and carries the assumptions the plans leave open.",
    owner: "estimator",
    cta: "Mark takeoff complete",
  },
  {
    key: "proposal",
    title: "Assemble proposal (SOV)",
    detail:
      "Estimator builds the schedule of values and routes it into pre-bid review for the team to challenge before it goes out.",
    owner: "estimator",
    cta: "Mark proposal ready",
  },
];

/** The automated steps, in order — the system fires these as a batch. */
export const AUTO_STEP_KEYS: IntakeStepKey[] = INTAKE_STEPS.filter(
  (s) => s.owner === "auto",
).map((s) => s.key);

/** Bid-aware one-liner describing what an auto step produced. */
export function autoStepResult(bid: Bid, step: IntakeStepKey): string {
  switch (step) {
    case "organize":
      return "Filed under 2026 → bid folder — plans, spec book & scope letter sorted.";
    case "compliance":
      return bid.region === "CA"
        ? "Union-signatory ✓ · DIR prevailing wage applies — flagged for labor pricing."
        : `Union-signatory ✓ · ${bid.region} — verify the prevailing-wage trigger before pricing.`;
    case "facts":
      return "Project info auto-filled · facts pulled and questions surfaced below.";
    case "draftExclusions":
      return bid.trade === "masonry"
        ? "Drafted red-tags: welding at embeds, waterproofing, top-of-wall fire-safing."
        : "Drafted red-tags: excavation, rebar supply, embed welding — confirm against scope.";
    default:
      return "";
  }
}

/** Canned outcome stamped when the estimator completes a teed-up step. */
export function estimatorStepResult(step: IntakeStepKey): string {
  switch (step) {
    case "confirmScope":
      return "Scope confirmed against the GC letter — inclusions and exclusions locked.";
    case "resolveQuestions":
      return "Open questions answered or promoted to the Tension Center.";
    case "takeoff":
      return "Takeoff complete — quantities and assumptions carried.";
    case "proposal":
      return "Proposal (SOV) assembled — ready for pre-bid review.";
    default:
      return "";
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Seed runs. Two bids drive the demo, matching the Plan Room seed:
//   • San Diego CMU  — automation finished and the estimator is mid-way: scope
//     confirmed and questions resolved, takeoff is the next teed-up step.
//   • Mesa Tilt-Up   — nothing run yet, so you can fire the automation live and
//     watch the estimator steps unlock.
// Auto-step results are left undefined here — they derive from autoStepResult.
// ──────────────────────────────────────────────────────────────────────────

function mkRun(
  bidId: string,
  step: IntakeStepKey,
  completedById: string,
  completedAt: string,
  result?: string,
): IntakeStepRun {
  return { bidId, step, completedById, completedAt, result };
}

export const intakeStepRuns: IntakeStepRun[] = [
  mkRun("bid-sd-cmu", "organize", "p-angel", "2026-06-12T16:35:00.000Z"),
  mkRun("bid-sd-cmu", "compliance", "p-angel", "2026-06-12T16:36:00.000Z"),
  mkRun("bid-sd-cmu", "facts", "p-angel", "2026-06-12T17:00:00.000Z"),
  mkRun("bid-sd-cmu", "draftExclusions", "p-angel", "2026-06-12T17:05:00.000Z"),
  mkRun(
    "bid-sd-cmu",
    "confirmScope",
    "p-angel",
    "2026-06-13T15:00:00.000Z",
    "Welding & waterproofing excluded; fire-safing carried as a priced alternate.",
  ),
  mkRun(
    "bid-sd-cmu",
    "resolveQuestions",
    "p-angel",
    "2026-06-19T18:00:00.000Z",
    "Rebar carried as included; production-rate risk promoted to the Tension Center.",
  ),
];
