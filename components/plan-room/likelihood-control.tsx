"use client";

import { toast } from "sonner";
import { Gauge } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store/store-context";
import { extractionPhaseRan } from "@/lib/store/selectors";
import { LIKELIHOOD_LABEL } from "@/lib/format";
import type { Bid, BidLikelihood } from "@/lib/store/types";

const OPTIONS: BidLikelihood[] = ["unset", "watching", "likely", "committed"];

export function LikelihoodControl({ bid }: { bid: Bid }) {
  const { state, setBidLikelihood } = useAppStore();
  const current = bid.submitLikelihood ?? "unset";

  function change(next: BidLikelihood) {
    const willFire =
      (next === "likely" || next === "committed") &&
      current !== "likely" &&
      current !== "committed" &&
      !extractionPhaseRan(state, bid.id, "preBidCommit");

    setBidLikelihood(bid.id, next);

    if (willFire) {
      toast.warning("Ops-risk questions surfaced", {
        description:
          "Marking this likely triggered the Phase-2 pass — ops can weigh in before we commit.",
      });
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Gauge className="size-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Bid likelihood</span>
      <Select value={current} onValueChange={(v) => change(v as BidLikelihood)}>
        <SelectTrigger size="sm" className="w-[160px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {OPTIONS.map((o) => (
            <SelectItem key={o} value={o}>
              {LIKELIHOOD_LABEL[o]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
