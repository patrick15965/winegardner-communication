"use client";

import { useState } from "react";
import {
  Paperclip,
  Image as ImageIcon,
  FileText,
  File,
  Plus,
} from "lucide-react";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { shortDate } from "@/lib/format";
import type { Attachment, AttachmentKind } from "@/lib/store/types";

const KIND_ICON: Record<AttachmentKind, typeof File> = {
  photo: ImageIcon,
  pdf: FileText,
  doc: FileText,
  other: File,
};

const KIND_LABEL: Record<AttachmentKind, string> = {
  photo: "Photo",
  pdf: "PDF",
  doc: "Document",
  other: "File",
};

export function AttachmentPanel({
  attachments,
  onAdd,
}: {
  attachments: Attachment[];
  onAdd: (input: { name: string; kind: AttachmentKind; note?: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<AttachmentKind>("photo");
  const [note, setNote] = useState("");

  function reset() {
    setName("");
    setKind("photo");
    setNote("");
  }

  function submit() {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), kind, note: note.trim() || undefined });
    reset();
    setOpen(false);
  }

  return (
    <div className="space-y-2.5">
      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No attachments yet — add a field photo, a marked-up sheet, or a T&amp;M
          ticket scan.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {attachments.map((a) => {
            const Icon = KIND_ICON[a.kind];
            return (
              <li
                key={a.id}
                className="flex items-start gap-2.5 rounded-md border bg-muted/30 px-3 py-2"
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  {a.note && (
                    <p className="text-xs text-muted-foreground">{a.note}</p>
                  )}
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {KIND_LABEL[a.kind]}
                    {a.addedAt ? ` · ${shortDate(a.addedAt)}` : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="gap-1.5">
            <Paperclip className="size-3.5" /> Attach file
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach a file</DialogTitle>
            <DialogDescription>
              Mock attachment — the name and caption are enough to carry the
              paper trail.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>File name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. east-footing-obstruction.jpg"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={kind}
                onValueChange={(v) => setKind(v as AttachmentKind)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(KIND_LABEL) as AttachmentKind[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {KIND_LABEL[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Caption (optional)</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What it shows"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={submit} disabled={!name.trim()} className="gap-1.5">
              <Plus className="size-3.5" /> Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
