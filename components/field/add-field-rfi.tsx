"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppStore } from "@/lib/store/store-context";
import type { Bid } from "@/lib/store/types";

export function AddFieldRfi({ bid }: { bid: Bid }) {
  const { addRfi } = useAppStore();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [planRef, setPlanRef] = useState("");
  const [costImpact, setCostImpact] = useState(true);

  function reset() {
    setSubject("");
    setQuestion("");
    setPlanRef("");
    setCostImpact(true);
  }

  function submit() {
    if (!subject.trim() || !question.trim()) return;
    addRfi({
      bidId: bid.id,
      subject: subject.trim(),
      question: question.trim(),
      origin: "field",
      planRef: planRef.trim() || undefined,
      costImpactLikely: costImpact,
    });
    toast.success("RFI raised");
    reset();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="size-4" /> Raise field RFI
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Raise an RFI from the field</DialogTitle>
          <DialogDescription>
            Something on site doesn&apos;t match the plans. Log it here with the
            sheet reference — it goes out with all the context the PM needs.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Footing depth conflict at grid C"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Question</Label>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What needs clarifying?"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Plan reference</Label>
            <Input
              value={planRef}
              onChange={(e) => setPlanRef(e.target.value)}
              placeholder="e.g. S-201 / A-3"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={costImpact}
              onCheckedChange={(v) => setCostImpact(v === true)}
            />
            Likely to carry a cost impact (flag for a change order)
          </label>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={submit}
            disabled={!subject.trim() || !question.trim()}
          >
            Raise RFI
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
