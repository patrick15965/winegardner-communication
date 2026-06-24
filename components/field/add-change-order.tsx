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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store/store-context";
import { CO_ORIGIN_LABEL } from "@/lib/format";
import type { Bid, CoOrigin } from "@/lib/store/types";

// Field-raised COs come from a T&M ticket or a manual entry; "from RFI" is
// created by converting an RFI, not here.
const ORIGINS: CoOrigin[] = ["fieldTM", "manual"];

export function AddChangeOrder({ bid }: { bid: Bid }) {
  const { addChangeOrder } = useAppStore();
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState<CoOrigin>("fieldTM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [tmTicketRef, setTmTicketRef] = useState("");

  function reset() {
    setOrigin("fieldTM");
    setTitle("");
    setDescription("");
    setCost("");
    setTmTicketRef("");
  }

  function submit() {
    if (!title.trim()) return;
    addChangeOrder({
      bidId: bid.id,
      title: title.trim(),
      description: description.trim(),
      origin,
      ownerRole: "PM",
      costAmount: cost ? Number(cost) : undefined,
      tmTicketRef:
        origin === "fieldTM" && tmTicketRef.trim()
          ? tmTicketRef.trim()
          : undefined,
    });
    toast.success("Change order created");
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
          <Plus className="size-4" /> New change order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New change order</DialogTitle>
          <DialogDescription>
            Pull a field T&amp;M ticket into a client-facing change order, or
            enter one manually. It lands as a draft for the PM to cost and send.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Origin</Label>
            <Select
              value={origin}
              onValueChange={(v) => setOrigin(v as CoOrigin)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORIGINS.map((o) => (
                  <SelectItem key={o} value={o}>
                    {CO_ORIGIN_LABEL[o]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {origin === "fieldTM" && (
            <div className="space-y-1.5">
              <Label>T&amp;M ticket #</Label>
              <Input
                value={tmTicketRef}
                onChange={(e) => setTmTicketRef(e.target.value)}
                placeholder="e.g. TM-1042"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Unforeseen footing obstruction"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What changed and why it's extra to contract."
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Estimated cost ($)</Label>
            <Input
              type="number"
              min={0}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="Optional — PM can tune later"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={!title.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
