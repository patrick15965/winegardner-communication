"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
  Handshake,
  CircleCheck,
  CircleDot,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { CommentThread } from "@/components/tension/comment-thread";
import { PersonAvatar } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import { tensionAgreement } from "@/lib/store/selectors";
import {
  TENSION_TYPE_ACCENT,
  TENSION_TYPE_LABEL,
  relativeTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TensionItem } from "@/lib/store/types";

/**
 * One-at-a-time concern resolver. The team walks each concern, lands on an
 * agreed resolution, and resolves it only by mutual agreement — the person who
 * raised it plus at least one reviewer. Resolution is the gate for sign-off.
 */
export function ConcernResolver({ items }: { items: TensionItem[] }) {
  const firstOpen = items.findIndex((i) => i.status !== "resolved");
  const [idx, setIdx] = useState(firstOpen === -1 ? 0 : firstOpen);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          No concerns to review yet. Add the bid&apos;s assumptions, production
          rates, risks and exclusions so the team can challenge them.
        </CardContent>
      </Card>
    );
  }

  const safeIdx = Math.min(idx, items.length - 1);
  const item = items[safeIdx];
  const resolvedCount = items.filter((i) => i.status === "resolved").length;

  function goTo(next: number) {
    setIdx(Math.max(0, Math.min(items.length - 1, next)));
  }

  function jumpToNextOpen() {
    const after = items.findIndex(
      (i, n) => n > safeIdx && i.status !== "resolved",
    );
    if (after !== -1) return goTo(after);
    const any = items.findIndex((i) => i.status !== "resolved");
    if (any !== -1) goTo(any);
  }

  return (
    <div className="space-y-3">
      {/* Progress rail */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">
            Concern {safeIdx + 1} of {items.length}
          </p>
          <p className="text-xs text-muted-foreground">
            {resolvedCount} resolved · {items.length - resolvedCount} to go
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {items.map((i, n) => (
            <button
              key={i.id}
              type="button"
              title={i.title}
              onClick={() => goTo(n)}
              className={cn(
                "size-2.5 rounded-full transition-all",
                n === safeIdx && "ring-2 ring-foreground/40 ring-offset-1 ring-offset-background",
                i.status === "resolved"
                  ? "bg-emerald-500"
                  : "bg-amber-500/70",
              )}
            />
          ))}
        </div>
      </div>

      <ConcernCard key={item.id} item={item} onNext={jumpToNextOpen} />

      {/* Step navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          disabled={safeIdx === 0}
          onClick={() => goTo(safeIdx - 1)}
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={safeIdx === items.length - 1}
          onClick={() => goTo(safeIdx + 1)}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function ConcernCard({
  item,
  onNext,
}: {
  item: TensionItem;
  onNext: () => void;
}) {
  const { currentUser, getPerson, setTensionResolution, toggleTensionAgreement } =
    useAppStore();
  const [resolution, setResolution] = useState(item.resolution ?? "");

  const agreement = tensionAgreement(item);
  const raiser = getPerson(item.raisedById);
  const iAgreed = agreement.agreedIds.includes(currentUser.id);
  const otherAgreers = agreement.agreedIds
    .filter((id) => id !== item.raisedById)
    .map((id) => getPerson(id))
    .filter(Boolean);

  const hasResolution = Boolean(resolution.trim());

  const checklist = [
    { label: "Agreed resolution written", done: hasResolution },
    {
      label: `${raiser?.name ?? "Whoever raised it"} agrees`,
      done: agreement.raiserAgreed,
    },
    { label: "A reviewer agrees", done: agreement.otherAgreed },
  ];

  return (
    <Card
      className={cn(
        item.status === "resolved" && "border-emerald-500/40 bg-emerald-500/[0.03]",
      )}
    >
      <CardContent className="space-y-4 py-5">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                TENSION_TYPE_ACCENT[item.type],
              )}
            >
              {TENSION_TYPE_LABEL[item.type]}
            </span>
            {item.status === "resolved" ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <CircleCheck className="size-3.5" /> Resolved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <CircleDot className="size-3.5" /> Needs agreement
              </span>
            )}
          </div>
          <h3 className="text-base font-semibold leading-tight">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.detail}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <PersonAvatar person={raiser} size="sm" />
            Raised by {raiser?.name} · {relativeTime(item.createdAt)}
          </div>
        </div>

        {/* Discussion — open while live, tucked away once resolved */}
        <Collapsible
          defaultOpen={item.status !== "resolved"}
          className="rounded-lg border bg-muted/30 p-3"
        >
          <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Discussion
              {item.comments.length > 0 && (
                <span className="rounded-full bg-background px-1.5 text-[10px] font-semibold text-muted-foreground">
                  {item.comments.length}
                </span>
              )}
            </span>
            <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <CommentThread tensionItemId={item.id} comments={item.comments} />
          </CollapsibleContent>
        </Collapsible>

        {/* Agreed resolution */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Agreed resolution</label>
          <p className="text-xs text-muted-foreground">
            What did the team land on? Both sides confirm this end result below.
          </p>
          <Textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            onBlur={() => setTensionResolution(item.id, resolution)}
            placeholder="e.g. Re-run at 110/day and carry the difference in the price…"
            rows={2}
          />
        </div>

        {/* Mutual agreement */}
        <div className="space-y-3 rounded-lg border p-3">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <Handshake className="size-4 text-muted-foreground" /> Mutual
            agreement
          </p>
          <ul className="space-y-1.5">
            {checklist.map((c) => (
              <li
                key={c.label}
                className={cn(
                  "flex items-center gap-2 text-sm",
                  c.done ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border",
                    c.done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-muted-foreground/40",
                  )}
                >
                  {c.done && <Check className="size-3" />}
                </span>
                {c.label}
              </li>
            ))}
          </ul>

          {/* Who has agreed */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Agreed:</span>
            {agreement.agreedIds.length === 0 ? (
              <span className="text-xs text-muted-foreground">No one yet</span>
            ) : (
              <div className="flex -space-x-1.5">
                {agreement.agreedIds.map((id) => {
                  const p = getPerson(id);
                  return (
                    <span
                      key={id}
                      title={p?.name}
                      className="ring-2 ring-background rounded-full"
                    >
                      <PersonAvatar person={p} size="sm" />
                    </span>
                  );
                })}
              </div>
            )}
            {otherAgreers.length === 0 && agreement.raiserAgreed && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                · waiting on a reviewer
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant={iAgreed ? "outline" : "default"}
              size="sm"
              className="gap-1.5"
              disabled={!hasResolution && !iAgreed}
              onClick={() => toggleTensionAgreement(item.id)}
            >
              {iAgreed ? (
                <>
                  <RotateCcw className="size-3.5" /> Undo my agreement
                </>
              ) : (
                <>
                  <Handshake className="size-3.5" /> Agree as {currentUser.name}
                </>
              )}
            </Button>

            {item.status === "resolved" && (
              <Button size="sm" className="gap-1.5" onClick={onNext}>
                Next concern <ChevronRight className="size-4" />
              </Button>
            )}
          </div>

          {!hasResolution && (
            <p className="text-xs text-muted-foreground">
              Write the agreed resolution first — then both sides can agree.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
