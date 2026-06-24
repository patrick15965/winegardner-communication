"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Clock, Link2, Ticket, Pencil, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store/store-context";
import { coAgeDays, isChangeOrderOpen } from "@/lib/store/selectors";
import {
  CO_STATUS_LABEL,
  CO_STATUS_ACCENT,
  CO_STATUS_ORDER,
  CO_ORIGIN_LABEL,
  currency,
  shortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChangeOrder, CoStatus } from "@/lib/store/types";

export function ChangeOrderRow({ co }: { co: ChangeOrder }) {
  const { getPerson, updateChangeOrder } = useAppStore();
  const raisedBy = getPerson(co.raisedById);
  const open = isChangeOrderOpen(co);
  const age = coAgeDays(co);
  const aging = open && age >= 30;

  const [editOpen, setEditOpen] = useState(false);
  const [cost, setCost] = useState(co.costAmount ? String(co.costAmount) : "");

  function saveCost() {
    updateChangeOrder(co.id, { costAmount: Number(cost) || 0 });
    toast.success(`${co.number} cost updated`);
    setEditOpen(false);
  }

  return (
    <Card className={cn(aging && age >= 60 && "border-red-500/40")}>
      <CardContent className="space-y-2.5 py-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-xs text-muted-foreground">
                {co.number}
              </span>
              <Link
                href={`/field/${co.bidId}/co/${co.id}`}
                className="text-sm font-medium hover:underline"
              >
                {co.title}
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              {CO_ORIGIN_LABEL[co.origin]} · raised by {raisedBy?.name ?? "—"} ·{" "}
              {shortDate(co.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm font-semibold tabular-nums">
              {co.costAmount != null ? currency(co.costAmount) : "—"}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                CO_STATUS_ACCENT[co.status],
              )}
            >
              {CO_STATUS_LABEL[co.status]}
            </span>
          </div>
        </div>

        <p className="whitespace-pre-line text-xs text-muted-foreground">
          {co.description}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {co.tmTicketRef && (
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Ticket className="size-3" /> {co.tmTicketRef}
            </span>
          )}
          {co.planRef && (
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Link2 className="size-3" /> {co.planRef}
            </span>
          )}
          {co.sourceRfiId && (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-600 dark:text-violet-400">
              from RFI
            </span>
          )}
          {open && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                age >= 60
                  ? "text-red-600 dark:text-red-400"
                  : age >= 30
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground",
              )}
            >
              <Clock className="size-3.5" /> {age} days outstanding
            </span>
          )}
          {co.approvedBy && (
            <span className="text-muted-foreground">
              {co.status === "billed" ? "Billed" : "Approved"} ·{" "}
              {co.approvedBy}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <Select
            value={co.status}
            onValueChange={(v) => {
              updateChangeOrder(co.id, { status: v as CoStatus });
              toast.success(`${co.number} → ${CO_STATUS_LABEL[v as CoStatus]}`);
            }}
          >
            <SelectTrigger size="sm" className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CO_STATUS_ORDER.map((s) => (
                <SelectItem key={s} value={s}>
                  {CO_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="size-3.5" /> Edit cost
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto gap-1.5 text-muted-foreground"
            asChild
          >
            <Link href={`/field/${co.bidId}/co/${co.id}`}>
              Open <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit cost — {co.number}</DialogTitle>
            <DialogDescription>
              Tune the value before this goes out to the GC.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Cost amount ($)</Label>
            <Input
              type="number"
              min={0}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveCost}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
