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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store/store-context";
import { TENSION_TYPE_LABEL } from "@/lib/format";
import type { Bid, TensionItemType } from "@/lib/store/types";

const TYPES = Object.keys(TENSION_TYPE_LABEL) as TensionItemType[];

export function AddTensionItem({ bid }: { bid: Bid }) {
  const { addTensionItem } = useAppStore();
  const [open, setOpen] = useState(false);
  const [itemType, setItemType] = useState<TensionItemType>("assumption");
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  function submit() {
    if (!title.trim()) return;
    addTensionItem({
      bidId: bid.id,
      itemType,
      title: title.trim(),
      detail: detail.trim(),
    });
    toast.success("Bid review item added");
    setTitle("");
    setDetail("");
    setItemType("assumption");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="size-4" /> Add item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a bid-review item</DialogTitle>
          <DialogDescription>
            Surface an assumption, risk, exclusion, or scope gap so the team can
            weigh in before submission.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={itemType}
              onValueChange={(v) => setItemType(v as TensionItemType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TENSION_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rebar spacing assumed — no structural details"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Detail</Label>
            <Textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="What's the assumption / risk and why does it matter?"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={!title.trim()}>
            Add item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
