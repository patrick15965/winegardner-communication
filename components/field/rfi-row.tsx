"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Link2,
  ArrowRightLeft,
  Send,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store/store-context";
import {
  RFI_STATUS_LABEL,
  RFI_STATUS_ACCENT,
  RFI_ORIGIN_LABEL,
  shortDate,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Rfi } from "@/lib/store/types";

export function RfiRow({ rfi }: { rfi: Rfi }) {
  const { getPerson, updateRfiStatus, answerRfi, convertRfiToCo } =
    useAppStore();
  const raisedBy = getPerson(rfi.raisedById);

  const [answerOpen, setAnswerOpen] = useState(false);
  const [answer, setAnswer] = useState("");
  const [answeredBy, setAnsweredBy] = useState("");

  function submitAnswer() {
    if (!answer.trim() || !answeredBy.trim()) return;
    answerRfi(rfi.id, answer.trim(), answeredBy.trim());
    toast.success(`${rfi.number} answered`);
    setAnswerOpen(false);
    setAnswer("");
    setAnsweredBy("");
  }

  function convert() {
    convertRfiToCo(rfi.id);
    toast.success(`${rfi.number} converted to a change order`);
  }

  return (
    <Card>
      <CardContent className="space-y-2.5 py-3.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-xs text-muted-foreground">
                {rfi.number}
              </span>
              <Link
                href={`/field/${rfi.bidId}/rfi/${rfi.id}`}
                className="text-sm font-medium hover:underline"
              >
                {rfi.subject}
              </Link>
            </div>
            <p className="text-xs text-muted-foreground">
              {RFI_ORIGIN_LABEL[rfi.origin]} · raised by{" "}
              {raisedBy?.name ?? "—"} · {shortDate(rfi.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                RFI_STATUS_ACCENT[rfi.status],
              )}
            >
              {RFI_STATUS_LABEL[rfi.status]}
            </span>
            {rfi.costImpactLikely && rfi.status !== "converted" && (
              <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                likely cost impact
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">{rfi.question}</p>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {rfi.planRef && (
            <span className="inline-flex items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Link2 className="size-3" /> {rfi.planRef}
            </span>
          )}
        </div>

        {rfi.answer && (
          <div className="rounded-md bg-muted/50 px-2.5 py-1.5 text-xs">
            <span className="font-medium">
              {rfi.answeredBy ?? "Response"}
              {rfi.answeredAt ? ` · ${shortDate(rfi.answeredAt)}` : ""}:
            </span>{" "}
            <span className="text-muted-foreground">{rfi.answer}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          {rfi.status === "draft" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => {
                updateRfiStatus(rfi.id, "submitted");
                toast.success(`${rfi.number} submitted`);
              }}
            >
              <Send className="size-3.5" /> Submit
            </Button>
          )}
          {rfi.status === "submitted" && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setAnswerOpen(true)}
            >
              <CheckCircle2 className="size-3.5" /> Record answer
            </Button>
          )}
          {rfi.status === "answered" && (
            <>
              <Button size="sm" className="gap-1.5" onClick={convert}>
                <ArrowRightLeft className="size-3.5" /> Convert to change order
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  updateRfiStatus(rfi.id, "closed");
                  toast.success(`${rfi.number} closed — no cost impact`);
                }}
              >
                Close (no cost)
              </Button>
            </>
          )}
          {rfi.status === "converted" && (
            <span className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400">
              <ArrowRightLeft className="size-3.5" /> Change order created
            </span>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto gap-1.5 text-muted-foreground"
            asChild
          >
            <Link href={`/field/${rfi.bidId}/rfi/${rfi.id}`}>
              Open <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>

      <Dialog open={answerOpen} onOpenChange={setAnswerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record the answer — {rfi.number}</DialogTitle>
            <DialogDescription>
              Log the response from the GC / design team. If it carries cost,
              you can convert it straight into a change order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Answered by</Label>
              <Input
                value={answeredBy}
                onChange={(e) => setAnsweredBy(e.target.value)}
                placeholder="e.g. Turner Pacific"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Response</Label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="What did they come back with?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnswerOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitAnswer}
              disabled={!answer.trim() || !answeredBy.trim()}
            >
              Save answer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
