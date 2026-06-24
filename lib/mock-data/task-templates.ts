import type { TaskTemplate } from "@/lib/store/types";

// Pre-defined, pre-coordinated tasks that auto-instantiate when a bid enters a
// stage. Assigned by ROLE (resolved to a person at instantiation time).
export const taskTemplates: TaskTemplate[] = [
  // --- Estimating stage ---
  {
    id: "tpl-est-download",
    stage: "estimating",
    title: "Download full plan set & create estimating folder",
    assigneeRole: "EstimatorMasonry",
    priority: "high",
    dueOffsetDays: 1,
  },
  {
    id: "tpl-est-scope",
    stage: "estimating",
    title: "Scope-sheet review & red-tag exclusions",
    assigneeRole: "EstimatorMasonry",
    priority: "high",
    dueOffsetDays: 3,
  },
  {
    id: "tpl-est-capacity",
    stage: "estimating",
    title: "Check crew capacity / schedule window with Ops",
    assigneeRole: "Ops",
    priority: "medium",
    dueOffsetDays: 2,
  },
  {
    id: "tpl-est-takeoff",
    stage: "estimating",
    title: "Complete takeoff in Bluebeam",
    assigneeRole: "EstimatorMasonry",
    priority: "high",
    dueOffsetDays: 5,
  },
  {
    id: "tpl-est-tension",
    stage: "estimating",
    title: "Populate Pre-Bid Tension Center (assumptions, risks, exclusions)",
    assigneeRole: "EstimatorMasonry",
    priority: "medium",
    dueOffsetDays: 5,
  },

  // --- Handoff stage ---
  {
    id: "tpl-ho-sov",
    stage: "handoff",
    title: "Finalize SOV & confirm against awarded contract",
    assigneeRole: "PM",
    priority: "high",
    dueOffsetDays: 2,
  },
  {
    id: "tpl-ho-foreman",
    stage: "handoff",
    title: "Assign & brief foreman (2 weeks out)",
    assigneeRole: "Ops",
    priority: "high",
    dueOffsetDays: 3,
  },
  {
    id: "tpl-ho-crew",
    stage: "handoff",
    title: "Confirm crew plan & ratios with superintendent",
    assigneeRole: "Super",
    priority: "medium",
    dueOffsetDays: 3,
  },
  {
    id: "tpl-ho-rfi",
    stage: "handoff",
    title: "Write RFIs that must go out now",
    assigneeRole: "PM",
    priority: "high",
    dueOffsetDays: 2,
  },
  {
    id: "tpl-ho-meeting",
    stage: "handoff",
    title: "Run estimating → ops handoff meeting",
    assigneeRole: "PM",
    priority: "high",
    dueOffsetDays: 4,
  },
];
