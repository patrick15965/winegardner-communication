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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store/store-context";
import {
  PROCUREMENT_CATEGORY_LABEL,
  ROLE_LABEL,
} from "@/lib/format";
import type {
  Bid,
  ProcurementCategory,
  Role,
} from "@/lib/store/types";

const CATEGORIES = Object.keys(
  PROCUREMENT_CATEGORY_LABEL,
) as ProcurementCategory[];
const OWNER_ROLES: Role[] = ["Ops", "PM", "Super", "Accounting"];

export function AddProcurementItem({ bid }: { bid: Bid }) {
  const { addProcurementItem } = useAppStore();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<ProcurementCategory>("accessories");
  const [vendor, setVendor] = useState("");
  const [leadTime, setLeadTime] = useState("3");
  const [ownerRole, setOwnerRole] = useState<Role>("Ops");

  function submit() {
    if (!label.trim()) return;
    addProcurementItem({
      bidId: bid.id,
      category,
      label: label.trim(),
      vendor: vendor.trim() || undefined,
      leadTimeWeeks: Number(leadTime) || 0,
      ownerRole,
    });
    toast.success("Procurement item added");
    setLabel("");
    setVendor("");
    setLeadTime("3");
    setCategory("accessories");
    setOwnerRole("Ops");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="size-4" /> Add item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a procurement item</DialogTitle>
          <DialogDescription>
            Track another material, sub-quote, or rental against the
            mobilization date.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Item</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Cast stone caps"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ProcurementCategory)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {PROCUREMENT_CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Lead time (weeks)</Label>
              <Input
                type="number"
                min={0}
                value={leadTime}
                onChange={(e) => setLeadTime(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Input
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Owner</Label>
              <Select
                value={ownerRole}
                onValueChange={(v) => setOwnerRole(v as Role)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OWNER_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {ROLE_LABEL[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={!label.trim()}>
            Add item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
