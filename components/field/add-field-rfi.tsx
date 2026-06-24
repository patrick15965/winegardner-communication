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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store/store-context";
import {
  RFI_PRIORITY_LABEL,
  RFI_PRIORITY_ORDER,
  RFI_DISCIPLINE_LABEL,
  RFI_DISCIPLINE_ORDER,
} from "@/lib/format";
import type { Bid, RfiDiscipline, RfiPriority } from "@/lib/store/types";

function dateInputToIso(v: string): string | undefined {
  return v ? new Date(`${v}T17:00:00.000Z`).toISOString() : undefined;
}

export function AddFieldRfi({ bid }: { bid: Bid }) {
  const { addRfi } = useAppStore();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [discipline, setDiscipline] = useState<RfiDiscipline>("architectural");
  const [priority, setPriority] = useState<RfiPriority>("normal");
  const [directedTo, setDirectedTo] = useState(bid.gc ?? "");
  const [planRef, setPlanRef] = useState("");
  const [specRef, setSpecRef] = useState("");
  const [needBy, setNeedBy] = useState("");
  const [proposed, setProposed] = useState("");
  const [costImpact, setCostImpact] = useState(true);

  function reset() {
    setSubject("");
    setQuestion("");
    setDiscipline("architectural");
    setPriority("normal");
    setDirectedTo(bid.gc ?? "");
    setPlanRef("");
    setSpecRef("");
    setNeedBy("");
    setProposed("");
    setCostImpact(true);
  }

  function submit() {
    if (!subject.trim() || !question.trim()) return;
    addRfi({
      bidId: bid.id,
      subject: subject.trim(),
      question: question.trim(),
      origin: "field",
      patch: {
        discipline,
        priority,
        directedTo: directedTo.trim() || undefined,
        planRef: planRef.trim() || undefined,
        specRef: specRef.trim() || undefined,
        responseNeededBy: dateInputToIso(needBy),
        proposedAnswer: proposed.trim() || undefined,
        costImpactLikely: costImpact,
      },
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Raise an RFI from the field</DialogTitle>
          <DialogDescription>
            Something on site doesn&apos;t match the plans. Log it with the
            sheet reference and who owes the answer — it goes out with all the
            context the PM needs.
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Discipline</Label>
              <Select
                value={discipline}
                onValueChange={(v) => setDiscipline(v as RfiDiscipline)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RFI_DISCIPLINE_ORDER.map((d) => (
                    <SelectItem key={d} value={d}>
                      {RFI_DISCIPLINE_LABEL[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as RfiPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RFI_PRIORITY_ORDER.map((p) => (
                    <SelectItem key={p} value={p}>
                      {RFI_PRIORITY_LABEL[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Directed to</Label>
              <Input
                value={directedTo}
                onChange={(e) => setDirectedTo(e.target.value)}
                placeholder="GC / design team"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Response needed by</Label>
              <Input
                type="date"
                value={needBy}
                onChange={(e) => setNeedBy(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Plan reference</Label>
              <Input
                value={planRef}
                onChange={(e) => setPlanRef(e.target.value)}
                placeholder="e.g. S-201 / A-3"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Spec reference</Label>
              <Input
                value={specRef}
                onChange={(e) => setSpecRef(e.target.value)}
                placeholder="e.g. 04 22 00"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Proposed answer (optional)</Label>
            <Textarea
              value={proposed}
              onChange={(e) => setProposed(e.target.value)}
              placeholder="Our suggested resolution, to speed the turnaround"
              rows={2}
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
