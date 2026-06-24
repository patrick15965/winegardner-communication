"use client";

import { useState } from "react";
import { FileText, Upload, Download } from "lucide-react";
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
import { documentsForBid } from "@/lib/store/selectors";
import { DOC_TYPE_LABEL, relativeTime } from "@/lib/format";
import type { Bid, DocType } from "@/lib/store/types";

const DOC_TYPES = Object.keys(DOC_TYPE_LABEL) as DocType[];

function ImportDialog({ bid }: { bid: Bid }) {
  const { importDocument } = useAppStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [docType, setDocType] = useState<DocType>("plans");

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    importDocument({
      bidId: bid.id,
      name: trimmed.endsWith(".pdf") ? trimmed : `${trimmed}.pdf`,
      docType,
    });
    toast.success("Document imported", {
      description: "Run the AI extraction to break it down.",
    });
    setName("");
    setDocType("plans");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Upload className="size-4" /> Import document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import a document</DialogTitle>
          <DialogDescription>
            Mock upload — drop a plan set, spec book, or scope letter into the
            Plan Room for this bid.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>File name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Addendum 02.pdf"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={docType} onValueChange={(v) => setDocType(v as DocType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {DOC_TYPE_LABEL[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={!name.trim()}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function downloadDoc(name: string) {
  toast.success("Downloading", { description: name });
}

export function DocumentList({ bid }: { bid: Bid }) {
  const { state, getPerson } = useAppStore();
  const docs = documentsForBid(state, bid.id);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="size-4" /> Documents
          <span className="text-xs font-normal text-muted-foreground">
            ({docs.length})
          </span>
        </h3>
        <div className="flex items-center gap-2">
          {docs.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5"
              onClick={() =>
                toast.success("Downloading all documents", {
                  description: `${docs.length} file${docs.length === 1 ? "" : "s"} · zipped`,
                })
              }
            >
              <Download className="size-4" /> Download all
            </Button>
          )}
          <ImportDialog bid={bid} />
        </div>
      </div>

      {docs.length === 0 ? (
        <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">
          No documents yet. Import the plans and spec book to begin.
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {docs.map((doc) => {
            const by = getPerson(doc.uploadedById);
            return (
              <li
                key={doc.id}
                className="group flex items-center gap-3 px-3 py-2.5 text-sm"
              >
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {DOC_TYPE_LABEL[doc.docType]}
                    {doc.pageCount ? ` · ${doc.pageCount} pp` : ""} ·{" "}
                    {by?.name ?? "Someone"} · {relativeTime(doc.uploadedAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 gap-1.5 text-muted-foreground opacity-70 hover:opacity-100"
                  onClick={() => downloadDoc(doc.name)}
                >
                  <Download className="size-4" /> Download
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
