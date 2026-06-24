"use client";

import Link from "next/link";
import { ThumbsUp, Link2, ArrowRight, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PersonAvatar, PersonBadge } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import {
  standardAudience,
  standardPendingAcks,
  standardAppliesToBids,
  userNeedsToAck,
} from "@/lib/store/selectors";
import {
  STANDARD_CATEGORY_LABEL,
  TRADE_LABEL,
  relativeTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StandardNote } from "@/lib/store/types";

const OPS_ROLES = ["Ops", "Super", "QC", "PM", "Accounting", "Coordinator"];

export function StandardCard({ note }: { note: StandardNote }) {
  const { state, getPerson, currentUser, acknowledgeStandard } = useAppStore();
  const author = getPerson(note.authorId);
  const acked = note.acks.includes(currentUser.id);
  const youNeedToAck = userNeedsToAck(state, note, currentUser.id);

  const audience = standardAudience(state, note);
  const pending = standardPendingAcks(state, note);
  const ackedPeople = audience.filter((p) => note.acks.includes(p.id));
  const appliesTo = standardAppliesToBids(state, note);

  const fromSide =
    author && OPS_ROLES.includes(author.role) ? "Ops / field" : "Estimating";

  const trades = note.trades.map((t) => TRADE_LABEL[t]).join(" · ");
  const regions = note.regions.join(" · ");

  return (
    <Card className={cn(youNeedToAck && "border-amber-500/40")}>
      <CardContent className="space-y-3 py-4">
        {/* direction / audience */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{fromSide}</span>
          <ArrowRight className="size-3" />
          <span>
            estimators bidding {trades || "all trades"}
            {regions ? ` · ${regions}` : ""}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <PersonBadge person={author} withRole />
          <span className="text-xs text-muted-foreground">
            {relativeTime(note.createdAt)}
          </span>
        </div>

        <p className="text-sm leading-snug">{note.body}</p>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">
            {STANDARD_CATEGORY_LABEL[note.category]}
          </Badge>
          {note.trades.map((t) => (
            <Badge key={t} variant="outline" className="capitalize">
              {TRADE_LABEL[t]}
            </Badge>
          ))}
          {note.regions.map((r) => (
            <Badge key={r} variant="outline">
              {r}
            </Badge>
          ))}
        </div>

        {/* applied during bidding */}
        {appliesTo.length > 0 && (
          <div className="rounded-md bg-muted/50 p-2.5">
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              In play on {appliesTo.length} open bid
              {appliesTo.length === 1 ? "" : "s"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {appliesTo.map((b) => (
                <Link key={b.id} href={`/pipeline/${b.id}`}>
                  <Badge variant="outline" className="gap-1 hover:bg-background">
                    <Link2 className="size-3" />
                    {b.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* acknowledgement roster + action */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Acknowledged</span>
              {ackedPeople.length > 0 ? (
                <span className="flex -space-x-1.5">
                  {ackedPeople.map((p) => (
                    <PersonAvatar
                      key={p.id}
                      person={p}
                      size="sm"
                      className="ring-2 ring-background"
                    />
                  ))}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </span>
            {pending.length > 0 && (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span>Waiting on</span>
                <span className="flex -space-x-1.5 opacity-60">
                  {pending.map((p) => (
                    <PersonAvatar
                      key={p.id}
                      person={p}
                      size="sm"
                      className="ring-2 ring-background grayscale"
                    />
                  ))}
                </span>
              </span>
            )}
          </div>

          <Button
            variant={acked ? "secondary" : youNeedToAck ? "default" : "ghost"}
            size="sm"
            className={cn(
              "gap-1.5",
              acked && "text-emerald-700 dark:text-emerald-300",
            )}
            onClick={() => acknowledgeStandard(note.id)}
          >
            {acked ? <Check className="size-3.5" /> : <ThumbsUp className="size-3.5" />}
            {acked
              ? "Acknowledged"
              : youNeedToAck
                ? "Acknowledge — I'll apply this"
                : "Acknowledge"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
