"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PersonAvatar } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import { STANDARD_CATEGORY_LABEL } from "@/lib/format";
import type {
  Region,
  StandardCategory,
  Trade,
} from "@/lib/store/types";

const CATEGORIES = Object.keys(STANDARD_CATEGORY_LABEL) as StandardCategory[];
const TRADES: Trade[] = ["masonry", "concrete"];
const REGIONS: Region[] = ["CA", "AZ", "NV", "other"];

export function PostStandard({ defaultBidId }: { defaultBidId?: string }) {
  const { currentUser, postStandard } = useAppStore();
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<StandardCategory>("general");
  const [trades, setTrades] = useState<string[]>(["masonry"]);
  const [regions, setRegions] = useState<string[]>(["CA"]);

  function submit() {
    if (!body.trim()) return;
    postStandard({
      body: body.trim(),
      category,
      trades: trades as Trade[],
      regions: regions as Region[],
      linkedBidId: defaultBidId,
    });
    toast.success("Standard posted to the shared feed");
    setBody("");
    setCategory("general");
    setTrades(["masonry"]);
    setRegions(["CA"]);
  }

  return (
    <Card>
      <CardContent className="space-y-3 py-4">
        <div className="flex items-center gap-2">
          <PersonAvatar person={currentUser} size="sm" />
          <span className="text-sm font-medium">
            Post a standard or a change to consider
          </span>
        </div>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="e.g. Slump-block is running ~100/day in the field, not 140 — don't estimate ideal-state on heavy-cut scope."
          rows={3}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as StandardCategory)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {STANDARD_CATEGORY_LABEL[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Trades</Label>
            <ToggleGroup
              type="multiple"
              size="sm"
              value={trades}
              onValueChange={setTrades}
              className="justify-start"
            >
              {TRADES.map((t) => (
                <ToggleGroupItem key={t} value={t} className="capitalize">
                  {t}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Regions</Label>
            <ToggleGroup
              type="multiple"
              size="sm"
              value={regions}
              onValueChange={setRegions}
              className="justify-start"
            >
              {REGIONS.map((r) => (
                <ToggleGroupItem key={r} value={r}>
                  {r}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={submit} disabled={!body.trim()} className="gap-1.5">
            <Send className="size-4" /> Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
