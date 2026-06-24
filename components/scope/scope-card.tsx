"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Ruler,
  HardHat,
  ArrowUpRight,
  FileSearch,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store/store-context";
import {
  EXTRACTION_AUDIENCE_ACCENT,
  EXTRACTION_AUDIENCE_LABEL,
  SCOPE_DISPOSITION_ACCENT,
  SCOPE_DISPOSITION_LABEL,
  SCOPE_DISPOSITION_ORDER,
  SCOPE_STAGE_LABEL,
  SCOPE_STAGE_ORDER,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ScopeDisposition, ScopeItem, ScopeStage } from "@/lib/store/types";

export function ScopeCard({ item }: { item: ScopeItem }) {
  const { setScopeStage, updateScopeItem, promoteScopeToTension } = useAppStore();
  const [open, setOpen] = useState(false);

  const idx = SCOPE_STAGE_ORDER.indexOf(item.stage);
  const prevStage = idx > 0 ? SCOPE_STAGE_ORDER[idx - 1] : undefined;
  const nextStage =
    idx < SCOPE_STAGE_ORDER.length - 1 ? SCOPE_STAGE_ORDER[idx + 1] : undefined;

  // The context the team has attached so far — drives the at-a-glance summary.
  const context: { icon: React.ReactNode; label: string; value: string }[] = [];
  if (item.quantity)
    context.push({ icon: <Ruler className="size-3" />, label: "Qty", value: item.quantity });
  if (item.assumption)
    context.push({ icon: <Ruler className="size-3" />, label: "Assume", value: item.assumption });
  if (item.productionRate)
    context.push({ icon: <HardHat className="size-3" />, label: "Rate", value: item.productionRate });
  if (item.crewNote)
    context.push({ icon: <HardHat className="size-3" />, label: "Crew", value: item.crewNote });

  function challenge() {
    promoteScopeToTension(item.id);
    setOpen(false);
    toast.warning("Challenged in the Tension Center", {
      description: "It's now a pre-bid review item the team can resolve and sign off.",
    });
  }

  return (
    <>
      <Card
        className="cursor-pointer transition-colors hover:border-ring/50"
        onClick={() => setOpen(true)}
      >
        <CardContent className="space-y-2 p-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                SCOPE_DISPOSITION_ACCENT[item.disposition],
              )}
            >
              {SCOPE_DISPOSITION_LABEL[item.disposition]}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium",
                EXTRACTION_AUDIENCE_ACCENT[item.audience],
              )}
            >
              {EXTRACTION_AUDIENCE_LABEL[item.audience]}
            </span>
          </div>

          <p className="text-sm font-medium leading-snug">{item.title}</p>
          {item.sourceRef && (
            <p className="text-[11px] text-muted-foreground/80">{item.sourceRef}</p>
          )}

          {context.length > 0 && (
            <div className="space-y-1 border-t pt-1.5">
              {context.map((c, i) => (
                <p
                  key={i}
                  className="flex items-start gap-1.5 text-[11px] text-muted-foreground"
                >
                  <span className="mt-0.5 shrink-0 text-muted-foreground/70">
                    {c.icon}
                  </span>
                  <span>
                    <span className="font-medium text-foreground/80">{c.label}:</span>{" "}
                    {c.value}
                  </span>
                </p>
              ))}
            </div>
          )}

          {/* Quick stage move — the board's drag substitute. */}
          <div
            className="flex items-center justify-between pt-0.5"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              disabled={!prevStage}
              title={prevStage ? `Move to ${SCOPE_STAGE_LABEL[prevStage]}` : undefined}
              onClick={() => prevStage && setScopeStage(item.id, prevStage)}
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            {item.tensionItemId ? (
              <Link
                href={`/pipeline/${item.bidId}?tab=tension`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-600 hover:underline dark:text-orange-400"
              >
                <ArrowUpRight className="size-3" /> In review
              </Link>
            ) : (
              <span className="text-[10px] text-muted-foreground">Tap to open</span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              disabled={!nextStage}
              title={nextStage ? `Move to ${SCOPE_STAGE_LABEL[nextStage]}` : undefined}
              onClick={() => nextStage && setScopeStage(item.id, nextStage)}
            >
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <ScopeEditor
        item={item}
        open={open}
        onOpenChange={setOpen}
        onChallenge={challenge}
        setScopeStage={setScopeStage}
        updateScopeItem={updateScopeItem}
      />
    </>
  );
}

function ScopeEditor({
  item,
  open,
  onOpenChange,
  onChallenge,
  setScopeStage,
  updateScopeItem,
}: {
  item: ScopeItem;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChallenge: () => void;
  setScopeStage: (id: string, stage: ScopeStage) => void;
  updateScopeItem: (
    id: string,
    patch: Partial<
      Pick<
        ScopeItem,
        "disposition" | "quantity" | "assumption" | "productionRate" | "crewNote"
      >
    >,
  ) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item.title}</DialogTitle>
          <DialogDescription>
            {item.detail}
            {item.sourceRef && (
              <span className="mt-1 block text-xs text-muted-foreground/80">
                <FileSearch className="mr-1 inline size-3" /> Source: {item.sourceRef}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-2 gap-3">
            <Labeled label="Stage">
              <Select
                value={item.stage}
                onValueChange={(v) => setScopeStage(item.id, v as ScopeStage)}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPE_STAGE_ORDER.map((s) => (
                    <SelectItem key={s} value={s}>
                      {SCOPE_STAGE_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Labeled>
            <Labeled label="Disposition">
              <Select
                value={item.disposition}
                onValueChange={(v) =>
                  updateScopeItem(item.id, { disposition: v as ScopeDisposition })
                }
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCOPE_DISPOSITION_ORDER.map((d) => (
                    <SelectItem key={d} value={d}>
                      {SCOPE_DISPOSITION_LABEL[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Labeled>
          </div>

          <div className="space-y-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Ruler className="size-3.5" /> Estimating context
            </p>
            <Labeled label="Quantity">
              <Input
                defaultValue={item.quantity ?? ""}
                placeholder="e.g. ~1,200 sf"
                onBlur={(e) =>
                  updateScopeItem(item.id, { quantity: e.target.value.trim() })
                }
              />
            </Labeled>
            <Labeled label="Assumptions / disposition note">
              <Textarea
                defaultValue={item.assumption ?? ""}
                placeholder="What are we assuming? Why included / excluded / alternate?"
                rows={2}
                onBlur={(e) =>
                  updateScopeItem(item.id, { assumption: e.target.value.trim() })
                }
              />
            </Labeled>
          </div>

          <div className="space-y-3 rounded-lg border border-sky-500/20 bg-sky-500/5 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300">
              <HardHat className="size-3.5" /> Ops plan
            </p>
            <Labeled label="Production method / rate">
              <Input
                defaultValue={item.productionRate ?? ""}
                placeholder="e.g. 105–110/day, scaffold + hoist"
                onBlur={(e) =>
                  updateScopeItem(item.id, { productionRate: e.target.value.trim() })
                }
              />
            </Labeled>
            <Labeled label="Crew / lead-time note">
              <Textarea
                defaultValue={item.crewNote ?? ""}
                placeholder="Crew availability, foreman, long-lead material…"
                rows={2}
                onBlur={(e) =>
                  updateScopeItem(item.id, { crewNote: e.target.value.trim() })
                }
              />
            </Labeled>
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
          {item.tensionItemId ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/pipeline/${item.bidId}?tab=tension`}>
                <ArrowUpRight className="size-3.5" /> Open in Tension Center
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onChallenge}>
              <ArrowUpRight className="size-3.5" /> Challenge in review
            </Button>
          )}
          <Button size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
