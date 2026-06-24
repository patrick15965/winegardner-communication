import type { Person } from "@/lib/store/types";

// Real people from the discovery interviews (see CONTEXT/distilled-context.md).
export const people: Person[] = [
  {
    id: "p-casey",
    name: "Casey",
    role: "CEO",
    initials: "CA",
    avatarColor: "bg-violet-600",
  },
  {
    id: "p-angel",
    name: "Angel",
    role: "EstimatorMasonry",
    trade: "masonry",
    initials: "AN",
    avatarColor: "bg-amber-600",
  },
  {
    id: "p-rohilio",
    name: "Rohilio",
    role: "EstimatorConcrete",
    trade: "concrete",
    initials: "RO",
    avatarColor: "bg-orange-600",
  },
  {
    id: "p-tucker",
    name: "Tucker",
    role: "PM",
    initials: "TU",
    avatarColor: "bg-sky-600",
  },
  {
    id: "p-patrick",
    name: "Patrick",
    role: "Ops",
    initials: "PA",
    avatarColor: "bg-emerald-600",
  },
  {
    id: "p-jackie",
    name: "Jackie",
    role: "Accounting",
    initials: "JA",
    avatarColor: "bg-rose-600",
  },
  {
    id: "p-luke",
    name: "Luke",
    role: "Super",
    initials: "LU",
    avatarColor: "bg-blue-600",
  },
  {
    id: "p-oscar",
    name: "Oscar",
    role: "QC",
    initials: "OS",
    avatarColor: "bg-teal-600",
  },
  {
    id: "p-abby",
    name: "Abby",
    role: "Coordinator",
    initials: "AB",
    avatarColor: "bg-fuchsia-600",
  },
];

export const DEFAULT_USER_ID = "p-casey";
