"use client";

import { useState } from "react";
import {
  Megaphone,
  HandMetal,
  Hammer,
  ArrowRight,
  BellRing,
  ChevronDown,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeading } from "@/components/page-heading";
import { PostStandard } from "@/components/standards/post-standard";
import { StandardCard } from "@/components/standards/standard-card";
import { useAppStore } from "@/lib/store/store-context";
import { userNeedsToAck } from "@/lib/store/selectors";
import { ROLE_LABEL, STANDARD_CATEGORY_LABEL } from "@/lib/format";
import type { Region, StandardCategory, Trade } from "@/lib/store/types";

const STEPS = [
  {
    icon: Megaphone,
    title: "1 · Ops or field captures it",
    body: "A lead time, a capacity crunch, a real production rate, a regional wage rule — posted once, here, instead of living in someone's head.",
  },
  {
    icon: HandMetal,
    title: "2 · Estimators acknowledge",
    body: "The estimators who bid that trade & region confirm they've got it and will factor it in. Visible to everyone — no more “you didn't tell me.”",
  },
  {
    icon: Hammer,
    title: "3 · Applied during bidding",
    body: "The standard rides along on every open bid it touches and shows up in that bid's Tension Center while it's still being priced.",
  },
];

function HowItWorks() {
  return (
    <Collapsible className="rounded-lg border bg-muted/30 p-4">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 text-left">
        <p className="text-sm font-semibold">
          How a standard moves from the field into a bid
        </p>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="relative flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-foreground shadow-xs">
              <s.icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{s.title}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">
                {s.body}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight className="absolute -right-2.5 top-2 hidden size-4 text-muted-foreground/50 md:block" />
            )}
          </div>
        ))}
      </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function StandardsFeed() {
  const { state, currentUser } = useAppStore();
  const [category, setCategory] = useState<StandardCategory | "all">("all");
  const [trade, setTrade] = useState<Trade | "all">("all");
  const [region, setRegion] = useState<Region | "all">("all");

  const sorted = [...state.standards].sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );

  const needsMyAck = sorted.filter((n) =>
    userNeedsToAck(state, n, currentUser.id),
  );

  const notes = sorted
    .filter((n) => category === "all" || n.category === category)
    .filter((n) => trade === "all" || n.trades.includes(trade))
    .filter((n) => region === "all" || n.regions.includes(region));

  return (
    <div className="space-y-5">
      <PageHeading
        title="Estimating ↔ Ops Standards"
        description="The one shared place where ops and estimating agree on the real-world constraints — so nobody bids in a vacuum."
      />

      <HowItWorks />

      {/* Action lane: what the current user still owes */}
      {needsMyAck.length > 0 && (
        <div className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex items-center gap-2">
            <BellRing className="size-4 text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-semibold">
              {needsMyAck.length} standard{needsMyAck.length === 1 ? "" : "s"} need
              your acknowledgement
            </p>
            <span className="text-xs text-muted-foreground">
              as {currentUser.name} · {ROLE_LABEL[currentUser.role]}
            </span>
          </div>
          <div className="space-y-3">
            {needsMyAck.map((n) => (
              <StandardCard key={n.id} note={n} />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          <PostStandard />
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-sm font-semibold">
              All standards ({notes.length})
            </h3>
          </div>
          <div className="space-y-3">
            {notes.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No standards match these filters.
              </p>
            ) : (
              notes.map((n) => <StandardCard key={n.id} note={n} />)
            )}
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-lg border p-4">
            <p className="mb-3 text-sm font-medium">Filter the feed</p>
            <div className="space-y-3">
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as StandardCategory | "all")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {(Object.keys(STANDARD_CATEGORY_LABEL) as StandardCategory[]).map(
                    (c) => (
                      <SelectItem key={c} value={c}>
                        {STANDARD_CATEGORY_LABEL[c]}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
              <Select
                value={trade}
                onValueChange={(v) => setTrade(v as Trade | "all")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All trades</SelectItem>
                  <SelectItem value="masonry">Masonry</SelectItem>
                  <SelectItem value="concrete">Concrete</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={region}
                onValueChange={(v) => setRegion(v as Region | "all")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All regions</SelectItem>
                  <SelectItem value="CA">CA</SelectItem>
                  <SelectItem value="AZ">AZ</SelectItem>
                  <SelectItem value="NV">NV</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
