"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CircleHelp,
  Info,
  ArrowUpRight,
  Check,
  X,
  RotateCcw,
  CornerDownRight,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { PersonAvatar } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import {
  EXTRACTION_AUDIENCE_ACCENT,
  EXTRACTION_AUDIENCE_LABEL,
  EXTRACTION_KIND_ACCENT,
  EXTRACTION_KIND_LABEL,
  relativeTime,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Extraction, ExtractionKind } from "@/lib/store/types";

const KIND_ICON: Record<ExtractionKind, React.ReactNode> = {
  fact: <Info className="size-4 text-sky-500" />,
  question: <CircleHelp className="size-4 text-amber-500" />,
  risk: <AlertTriangle className="size-4 text-red-500" />,
};

export function ExtractionRow({ item }: { item: Extraction }) {
  const {
    getPerson,
    answerExtraction,
    dismissExtraction,
    reopenExtraction,
    promoteExtraction,
  } = useAppStore();
  const [answering, setAnswering] = useState(false);
  const [answer, setAnswer] = useState("");

  const answeredBy = item.answeredById ? getPerson(item.answeredById) : undefined;
  const dimmed = item.status === "dismissed";

  function submitAnswer() {
    if (!answer.trim()) return;
    answerExtraction(item.id, answer.trim());
    setAnswer("");
    setAnswering(false);
    toast.success("Answer recorded");
  }

  function promote() {
    promoteExtraction(item.id);
    toast.success("Promoted to the Tension Center", {
      description: "It's now a bid-review item the team can sign off on.",
    });
  }

  return (
    <Card className={cn(dimmed && "opacity-60")}>
      <CardContent className="space-y-2.5 py-3.5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0">{KIND_ICON[item.kind]}</span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  EXTRACTION_KIND_ACCENT[item.kind],
                )}
              >
                {EXTRACTION_KIND_LABEL[item.kind]}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  EXTRACTION_AUDIENCE_ACCENT[item.audience],
                )}
              >
                {EXTRACTION_AUDIENCE_LABEL[item.audience]}
              </span>
              {item.status === "dismissed" && (
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Dismissed
                </span>
              )}
            </div>
            <p className="text-sm font-medium">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.detail}</p>
            {item.sourceRef && (
              <p className="text-xs text-muted-foreground/80">
                Source: {item.sourceRef}
              </p>
            )}
          </div>
        </div>

        {/* Answer / promotion outcome */}
        {item.answer && (
          <div className="flex items-start gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
            <CornerDownRight className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p>{item.answer}</p>
              {answeredBy && (
                <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <PersonAvatar person={answeredBy} size="sm" /> {answeredBy.name}
                </p>
              )}
            </div>
          </div>
        )}

        {item.promotedToTensionId && (
          <Link
            href={`/pipeline/${item.bidId}?tab=tension`}
            className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
          >
            <ArrowUpRight className="size-3.5" /> In the Tension Center
          </Link>
        )}

        {/* Inline answer box */}
        {answering && (
          <div className="space-y-2">
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Answer this so the estimator can carry it with confidence…"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setAnswering(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={submitAnswer} disabled={!answer.trim()}>
                Save answer
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!answering && (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              {relativeTime(item.createdAt)}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {item.status === "open" ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setAnswering(true)}>
                    <Check className="size-3.5" /> Answer
                  </Button>
                  {!item.promotedToTensionId && item.kind !== "fact" && (
                    <Button size="sm" onClick={promote} className="gap-1">
                      <ArrowUpRight className="size-3.5" /> Promote to Tension
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissExtraction(item.id)}
                  >
                    <X className="size-3.5" /> Dismiss
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reopenExtraction(item.id)}
                >
                  <RotateCcw className="size-3.5" /> Reopen
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
