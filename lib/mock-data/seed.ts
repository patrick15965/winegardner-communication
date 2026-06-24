import type { AppState } from "@/lib/store/types";
import { people, DEFAULT_USER_ID } from "./people";
import { bids } from "./bids";
import { standards } from "./standards";
import { tensionItems, signOffs } from "./tension";
import { handoffItems, handoffMeetings } from "./handoff";
import { tasks } from "./tasks";
import { taskTemplates } from "./task-templates";
import { bidDocuments, extractions } from "./plan-room";
import { intakeStepRuns } from "./intake";
import { seedProjectData } from "./projects";
import { rfis, changeOrders } from "./change-orders";

/** Deterministic seed state — also the SSR snapshot. */
export function createSeedState(): AppState {
  const { procurementItems, projectMilestones, projectPlans } =
    seedProjectData(bids);

  return {
    people,
    bids,
    standards,
    tensionItems,
    signOffs,
    handoffItems,
    handoffMeetings,
    tasks,
    taskTemplates,
    bidDocuments,
    extractions,
    intakeSteps: intakeStepRuns,
    reviewMeetings: {},
    procurementItems,
    projectMilestones,
    projectPlans,
    rfis,
    changeOrders,
    currentUserId: DEFAULT_USER_ID,
  };
}
