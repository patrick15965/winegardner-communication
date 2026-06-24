"use client";

import { Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersonBadge } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import {
  currency,
  shortDate,
  STAGE_LABEL,
  TRADE_LABEL,
} from "@/lib/format";
import type { Bid } from "@/lib/store/types";

function Fact({
  label,
  value,
  sourced,
}: {
  label: string;
  value: React.ReactNode;
  sourced?: boolean;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
        {label}
        {sourced && (
          <Sparkles
            className="size-3 text-violet-500"
            aria-label="Pulled from documents"
          />
        )}
      </dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}

export function BidOverview({ bid }: { bid: Bid }) {
  const { state, getPerson } = useAppStore();
  const detected = bid.detected ?? [];
  const sourcedLabels = new Set(detected.map((d) => d.label));

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Project details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Fact label="General Contractor" value={bid.gc} sourced={sourcedLabels.has("General Contractor")} />
            <Fact label="Location" value={bid.location} sourced={sourcedLabels.has("Location")} />
            <Fact label="Region" value={bid.region} sourced={sourcedLabels.has("Region / wage")} />
            <Fact label="Trade" value={TRADE_LABEL[bid.trade]} sourced={sourcedLabels.has("Trade")} />
            <Fact label="Stage" value={STAGE_LABEL[bid.stage]} />
            <Fact
              label="Estimator"
              value={<PersonBadge person={getPerson(bid.estimatorId)} />}
            />
            <Fact label="Bid value" value={currency(bid.value)} />
            <Fact
              label="Square footage"
              sourced={sourcedLabels.has("Square footage")}
              value={
                bid.squareFootage
                  ? `${bid.squareFootage.toLocaleString()} sf`
                  : "—"
              }
            />
            <Fact label="Due date" value={shortDate(bid.dueDate)} sourced={sourcedLabels.has("Bid due")} />
            {bid.awardedAt && (
              <Fact label="Awarded" value={shortDate(bid.awardedAt)} />
            )}
          </dl>

          {detected.length > 0 && (
            <div className="mt-4 rounded-lg border border-violet-500/25 bg-violet-500/5 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                <Sparkles className="size-3.5" /> Pulled from documents
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                The AI intake pass auto-filled this project info from the plans
                and scope letter.
              </p>
              <ul className="mt-2 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                {detected.map((d) => (
                  <li key={d.label} className="text-xs">
                    <span className="font-medium">{d.label}:</span>{" "}
                    {d.value}
                    <span className="text-muted-foreground">
                      {" "}
                      · {d.sourceRef}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
