"use client";

import { PostStandard } from "@/components/standards/post-standard";
import { StandardCard } from "@/components/standards/standard-card";
import { useAppStore } from "@/lib/store/store-context";
import { standardsForBid } from "@/lib/store/selectors";
import { TRADE_LABEL } from "@/lib/format";
import type { Bid } from "@/lib/store/types";

export function BidStandards({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const linked = standardsForBid(state, bid.id);

  // Also surface standards relevant by trade/region even if not linked.
  const relevant = state.standards.filter(
    (s) =>
      !s.linkedBidId &&
      (s.trades.includes(bid.trade) || s.regions.includes(bid.region)),
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">
            Linked to this bid ({linked.length})
          </h3>
          {linked.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No standards linked yet. Post one below to flag a constraint
              specific to {bid.name}.
            </p>
          ) : (
            linked.map((n) => <StandardCard key={n.id} note={n} />)
          )}
        </div>

        {relevant.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">
              Relevant for {TRADE_LABEL[bid.trade]} / {bid.region} ({relevant.length})
            </h3>
            {relevant.map((n) => (
              <StandardCard key={n.id} note={n} />
            ))}
          </div>
        )}
      </div>

      <aside>
        <PostStandard defaultBidId={bid.id} />
      </aside>
    </div>
  );
}
