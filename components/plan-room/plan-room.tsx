"use client";

import {
  Sparkles,
  ShieldQuestion,
  Hammer,
  HardHat,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentList } from "@/components/plan-room/document-list";
import { ExtractionRow } from "@/components/plan-room/extraction-row";
import { IntakePipeline } from "@/components/plan-room/intake-pipeline";
import { LikelihoodControl } from "@/components/plan-room/likelihood-control";
import { useAppStore } from "@/lib/store/store-context";
import {
  documentsForBid,
  extractionsForBid,
  extractionPhaseRan,
} from "@/lib/store/selectors";
import { cn } from "@/lib/utils";
import type { Bid, Extraction, ExtractionKind } from "@/lib/store/types";

const KIND_ORDER: Record<ExtractionKind, number> = {
  risk: 0,
  question: 1,
  fact: 2,
};

function sortFindings(a: Extraction, b: Extraction) {
  return KIND_ORDER[a.kind] - KIND_ORDER[b.kind];
}

export function PlanRoom({ bid }: { bid: Bid }) {
  const { state } = useAppStore();

  const docs = documentsForBid(state, bid.id);
  const findings = extractionsForBid(state, bid.id);
  const intakeRan = extractionPhaseRan(state, bid.id, "intake");
  const commitRan = extractionPhaseRan(state, bid.id, "preBidCommit");
  const likely =
    bid.submitLikelihood === "likely" || bid.submitLikelihood === "committed";

  const open = findings.filter((f) => f.status === "open").sort(sortFindings);
  const triaged = findings
    .filter((f) => f.status !== "open")
    .sort(sortFindings);

  return (
    <div className="space-y-5">
      {/* Header / state banner */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 py-4">
          <div className="flex size-11 items-center justify-center rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400">
            <Sparkles className="size-6" />
          </div>
          <div className="min-w-44 flex-1">
            <p className="text-sm font-semibold">AI plan breakdown</p>
            <p className="text-xs text-muted-foreground">
              {docs.length} document{docs.length === 1 ? "" : "s"} ·{" "}
              {intakeRan ? `${findings.length} findings` : "not yet extracted"}
              {commitRan ? " · ops-risk pass fired" : ""}
            </p>
          </div>
          <LikelihoodControl bid={bid} />
        </CardContent>
      </Card>

      <DocumentList bid={bid} />

      <IntakePipeline bid={bid} />

      {/* Findings — the output of the "Extract project facts" step (+ Phase 2) */}
      {intakeRan && (
        <div className="space-y-4">
          {/* Phase-2 nudge */}
          {!likely && (
            <div className="flex items-start gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 px-4 py-3">
              <ShieldQuestion className="mt-0.5 size-5 shrink-0 text-orange-600 dark:text-orange-400" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Leaning toward bidding?
                </span>{" "}
                Set the likelihood to{" "}
                <span className="font-medium">Likely</span> to fire the Phase-2
                pass — ops-facing risk questions surface so Operations can weigh
                in before you commit.
              </p>
            </div>
          )}

          {open.length > 0 && (
            <Section
              icon={<Hammer className="size-4" />}
              title="Needs eyes"
              count={open.length}
            >
              {open.map((f) => (
                <ExtractionRow key={f.id} item={f} />
              ))}
            </Section>
          )}

          {triaged.length > 0 && (
            <Section
              icon={<HardHat className="size-4" />}
              title="Triaged"
              count={triaged.length}
              muted
            >
              {triaged.map((f) => (
                <ExtractionRow key={f.id} item={f} />
              ))}
            </Section>
          )}

          {open.length === 0 && triaged.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Extraction ran but surfaced nothing for this bid.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  count,
  muted,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3
        className={cn(
          "flex items-center gap-2 text-sm font-semibold",
          muted && "text-muted-foreground",
        )}
      >
        {icon} {title}
        <span className="text-xs font-normal text-muted-foreground">
          ({count})
        </span>
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
