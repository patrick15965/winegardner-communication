"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ExternalLink, FileText, Receipt } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/store-context";
import {
  changeOrdersForBid,
  rfisForBid,
  openRfisForBid,
  isChangeOrderOpen,
  coAgeDays,
  isProject,
} from "@/lib/store/selectors";
import {
  STAGE_ACCENT,
  STAGE_LABEL,
  CO_STATUS_ORDER,
  currency,
} from "@/lib/format";
import { ChangeOrderRow } from "@/components/field/change-order-row";
import { RfiRow } from "@/components/field/rfi-row";
import { AddChangeOrder } from "@/components/field/add-change-order";
import { AddFieldRfi } from "@/components/field/add-field-rfi";

const VALID_TABS = ["changeorders", "rfis"];

export function ProjectFieldWorkspace({ bidId }: { bidId: string }) {
  const { state } = useAppStore();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const initialTab =
    requestedTab && VALID_TABS.includes(requestedTab)
      ? requestedTab
      : "changeorders";

  const bid = state.bids.find((b) => b.id === bidId);

  if (!bid || !isProject(bid)) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/field">
            <ArrowLeft className="size-4" /> Back to field
          </Link>
        </Button>
        <p className="text-muted-foreground">
          {bid ? "This bid isn't an awarded project yet." : "Project not found."}
        </p>
      </div>
    );
  }

  const changeOrders = changeOrdersForBid(state, bid.id);
  const rfis = rfisForBid(state, bid.id);
  const openCos = changeOrders.filter(isChangeOrderOpen);
  const openValue = openCos.reduce((s, co) => s + (co.costAmount ?? 0), 0);
  const openRfis = openRfisForBid(state, bid.id).length;

  // Outstanding first, oldest at the top — what needs chasing.
  const sortedCos = [...changeOrders].sort((a, b) => {
    const ao = Number(isChangeOrderOpen(b)) - Number(isChangeOrderOpen(a));
    if (ao !== 0) return ao;
    if (isChangeOrderOpen(a)) return coAgeDays(b) - coAgeDays(a);
    return CO_STATUS_ORDER.indexOf(a.status) - CO_STATUS_ORDER.indexOf(b.status);
  });

  // Answered & convertible RFIs first — they're the ones waiting on a decision.
  const rfiRank = (s: string) =>
    s === "answered" ? 0 : s === "submitted" ? 1 : s === "draft" ? 2 : 3;
  const sortedRfis = [...rfis].sort(
    (a, b) => rfiRank(a.status) - rfiRank(b.status),
  );

  return (
    <div className="space-y-5">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
          <Link href="/field">
            <ArrowLeft className="size-4" /> Field
          </Link>
        </Button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold tracking-tight">
                {bid.name}
              </h2>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                  STAGE_ACCENT[bid.stage],
                )}
              >
                {STAGE_LABEL[bid.stage]}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {bid.gc} · {bid.location} · {currency(bid.value)}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/projects/${bid.id}`}>
              <ExternalLink className="size-3.5" /> Project workspace
            </Link>
          </Button>
        </div>
      </div>

      {openCos.length > 0 && (
        <Card className={cn(openValue > 0 && "border-amber-500/40")}>
          <CardContent className="flex flex-wrap items-center gap-4 py-3.5">
            <Receipt className="size-5 text-amber-600 dark:text-amber-400" />
            <p className="text-sm">
              <span className="font-semibold">{currency(openValue)}</span> in{" "}
              {openCos.length} outstanding change order
              {openCos.length === 1 ? "" : "s"} on this job
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={initialTab}>
        <TabsList>
          <TabsTrigger value="changeorders" className="gap-1.5">
            <Receipt className="size-3.5" /> Change Orders
            {openCos.length > 0 && (
              <span className="rounded-full bg-amber-500/15 px-1.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                {openCos.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rfis" className="gap-1.5">
            <FileText className="size-3.5" /> RFIs
            {openRfis > 0 && (
              <span className="rounded-full bg-sky-500/15 px-1.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                {openRfis}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="changeorders" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Change order log{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({changeOrders.length})
              </span>
            </h3>
            <AddChangeOrder bid={bid} />
          </div>
          {changeOrders.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No change orders yet. Raise one, or convert an answered RFI.
              </CardContent>
            </Card>
          ) : (
            sortedCos.map((co) => <ChangeOrderRow key={co.id} co={co} />)
          )}
        </TabsContent>

        <TabsContent value="rfis" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              RFI log{" "}
              <span className="text-xs font-normal text-muted-foreground">
                ({rfis.length})
              </span>
            </h3>
            <AddFieldRfi bid={bid} />
          </div>
          {rfis.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No RFIs on this job yet.
              </CardContent>
            </Card>
          ) : (
            sortedRfis.map((rfi) => <RfiRow key={rfi.id} rfi={rfi} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
