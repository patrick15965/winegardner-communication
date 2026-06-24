"use client";

import { toast } from "sonner";
import { FilePlus2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/store-context";
import { extractionsForBid, rfisForBid } from "@/lib/store/selectors";
import {
  EXTRACTION_KIND_LABEL,
  EXTRACTION_KIND_ACCENT,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { RfiRow } from "@/components/field/rfi-row";
import type { Bid } from "@/lib/store/types";

export function BidRfis({ bid }: { bid: Bid }) {
  const { state, draftRfiFromExtraction } = useAppStore();
  const rfis = rfisForBid(state, bid.id);
  const draftedFrom = new Set(
    rfis.map((r) => r.sourceExtractionId).filter(Boolean),
  );

  // Open scope-gap findings (questions / risks) the AI can draft into RFIs —
  // "highlight the RFIs needed, and actually write them for you. You just review."
  const draftableGaps = extractionsForBid(state, bid.id).filter(
    (e) =>
      e.status === "open" &&
      (e.kind === "question" || e.kind === "risk") &&
      !draftedFrom.has(e.id),
  );

  return (
    <div className="space-y-5">
      <Card className="border-orange-500/30 bg-orange-500/5">
        <CardContent className="space-y-1 py-3.5">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="size-4 text-orange-600 dark:text-orange-400" />
            RFIs out of the gate
          </p>
          <p className="text-xs text-muted-foreground">
            Unquantified scope from the Plan Room becomes an RFI you can submit
            with the bid. Once it&apos;s awarded and answered, an RFI with cost
            impact converts straight into a change order — no re-keying.
          </p>
        </CardContent>
      </Card>

      {draftableGaps.length > 0 && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold">
            Suggested RFIs from plan gaps{" "}
            <span className="text-xs font-normal text-muted-foreground">
              ({draftableGaps.length})
            </span>
          </h3>
          {draftableGaps.map((ex) => (
            <Card key={ex.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 py-3.5">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        EXTRACTION_KIND_ACCENT[ex.kind],
                      )}
                    >
                      {EXTRACTION_KIND_LABEL[ex.kind]}
                    </span>
                    <span className="text-sm font-medium">{ex.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{ex.detail}</p>
                  {ex.sourceRef && (
                    <p className="text-[10px] text-muted-foreground">
                      {ex.sourceRef}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    draftRfiFromExtraction(ex.id);
                    toast.success("RFI drafted — review and submit with the bid");
                  }}
                >
                  <FilePlus2 className="size-3.5" /> Draft RFI
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">
          RFI log{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({rfis.length})
          </span>
        </h3>
        {rfis.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No RFIs yet. Draft one from a plan gap above.
            </CardContent>
          </Card>
        ) : (
          rfis.map((rfi) => <RfiRow key={rfi.id} rfi={rfi} />)
        )}
      </section>
    </div>
  );
}
