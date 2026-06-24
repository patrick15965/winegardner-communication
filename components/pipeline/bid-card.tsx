"use client";

import Link from "next/link";
import { MapPin, Calendar, MoreVertical, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/person-badge";
import { StageMoveMenu } from "@/components/pipeline/stage-move-menu";
import { useAppStore } from "@/lib/store/store-context";
import {
  bidReadiness,
  openConcernsForBid,
} from "@/lib/store/selectors";
import { currency, shortDate, TRADE_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bid } from "@/lib/store/types";

export function BidCard({ bid }: { bid: Bid }) {
  const { state, getPerson } = useAppStore();
  const estimator = getPerson(bid.estimatorId);
  const openConcerns = openConcernsForBid(state, bid.id);
  const readiness = bidReadiness(state, bid.id);
  const showReadiness = bid.stage === "preBidReview";

  return (
    <div className="group rounded-lg border bg-card p-3 shadow-xs transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/pipeline/${bid.id}`}
          className="text-sm font-medium leading-snug hover:underline"
        >
          {bid.name}
        </Link>
        <StageMoveMenu
          bid={bid}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0 opacity-60 group-hover:opacity-100"
            >
              <MoreVertical className="size-4" />
            </Button>
          }
        />
      </div>

      <p className="mt-0.5 text-xs text-muted-foreground">{bid.gc}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <Badge variant="outline" className="capitalize">
          {TRADE_LABEL[bid.trade]}
        </Badge>
        <Badge variant="outline">{bid.region}</Badge>
        <span className="ml-auto text-sm font-semibold tabular-nums">
          {currency(bid.value)}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <MapPin className="size-3" />
          {bid.location}
        </span>
        <span className="inline-flex items-center gap-1">
          <Calendar className="size-3" />
          {shortDate(bid.dueDate)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5">
          <PersonAvatar person={estimator} size="sm" />
          <span className="text-xs text-muted-foreground">
            {estimator?.name}
          </span>
        </span>

        {showReadiness &&
          (readiness.ready ? (
            <Badge className="gap-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-3" /> Ready
            </Badge>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs font-medium",
                openConcerns ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400",
              )}
            >
              <AlertTriangle className="size-3" />
              {openConcerns > 0
                ? `${openConcerns} open`
                : `${readiness.collected}/${readiness.required} signed`}
            </span>
          ))}
      </div>
    </div>
  );
}
