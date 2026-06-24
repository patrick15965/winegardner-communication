"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Handshake,
  ListChecks,
  MessagesSquare,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Truck,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { PageHeading } from "@/components/page-heading";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";
import { useAppStore } from "@/lib/store/store-context";
import { inboxForUser, type InboxItem } from "@/lib/store/selectors";
import { cn } from "@/lib/utils";
import type { Trade } from "@/lib/store/types";

const KIND_META: Record<
  InboxItem["kind"],
  { icon: React.ElementType; tone: string }
> = {
  signoff: { icon: ShieldCheck, tone: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
  concern: { icon: AlertTriangle, tone: "bg-red-500/15 text-red-600 dark:text-red-400" },
  handoff: { icon: Handshake, tone: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  task: { icon: ListChecks, tone: "bg-muted text-foreground" },
  ack: { icon: MessagesSquare, tone: "bg-sky-500/15 text-sky-600 dark:text-sky-400" },
  planroom: { icon: Sparkles, tone: "bg-violet-500/15 text-violet-600 dark:text-violet-400" },
  procurement: { icon: Truck, tone: "bg-orange-500/15 text-orange-600 dark:text-orange-400" },
};

function NeedsYou() {
  const { state, currentUser } = useAppStore();
  const items = inboxForUser(state, currentUser.id);
  const urgentCount = items.filter((i) => i.urgent).length;

  // Nothing waiting — a slim one-line note keeps the pipeline as the focus.
  if (items.length === 0) {
    return (
      <div className="mb-6 flex items-center gap-2 rounded-lg border bg-emerald-500/5 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="size-4" />
        You&apos;re clear — nothing waiting on you right now.
      </div>
    );
  }

  // Open by default only when there's a real queue; otherwise stay tucked away.
  const defaultOpen = items.length > 2;

  return (
    <Collapsible defaultOpen={defaultOpen} className="mb-6">
      <section className="rounded-xl border bg-card p-4">
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Needs you now</h2>
            <span
              className={cn(
                "rounded-full px-1.5 text-[11px] font-semibold",
                urgentCount
                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {items.length}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {currentUser.name.split(" ")[0]}&apos;s view
            <ChevronDown className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {items.slice(0, 6).map((item) => {
              const meta = KIND_META[item.kind];
              const Icon = meta.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50",
                    item.urgent && "border-red-500/30",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-lg",
                      meta.tone,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

export function BoardHome() {
  const { state } = useAppStore();
  const [trade, setTrade] = useState<Trade | "all">("all");

  const bids =
    trade === "all" ? state.bids : state.bids.filter((b) => b.trade === trade);

  return (
    <div>
      <PageHeading
        title="From invite to jobsite"
        description="One board across Estimating and Operations. Two handshakes hold it together: challenge a bid before it goes out, and hand a clean win to the field."
      />

      <NeedsYou />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">The board</h2>
        <Select value={trade} onValueChange={(v) => setTrade(v as Trade | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Trade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All trades</SelectItem>
            <SelectItem value="masonry">Masonry</SelectItem>
            <SelectItem value="concrete">Concrete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PipelineBoard bids={bids} />
    </div>
  );
}
