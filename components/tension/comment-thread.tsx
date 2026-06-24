"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PersonAvatar } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import { relativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Comment, CommentKind } from "@/lib/store/types";

const KIND_STYLE: Record<CommentKind, string> = {
  challenge: "border-l-red-500/60",
  response: "border-l-sky-500/60",
  note: "border-l-muted-foreground/30",
};

const KIND_LABEL: Record<CommentKind, string> = {
  challenge: "Challenge",
  response: "Response",
  note: "Note",
};

export function CommentThread({
  tensionItemId,
  comments,
}: {
  tensionItemId: string;
  comments: Comment[];
}) {
  const { getPerson, addComment } = useAppStore();
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<CommentKind>("challenge");

  function submit() {
    const text = body.trim();
    if (!text) return;
    addComment(tensionItemId, text, kind);
    setBody("");
  }

  return (
    <div className="space-y-3">
      {comments.length > 0 && (
        <ul className="space-y-2">
          {comments.map((c) => {
            const author = getPerson(c.authorId);
            return (
              <li
                key={c.id}
                className={cn(
                  "rounded-md border-l-2 bg-muted/40 p-2.5",
                  KIND_STYLE[c.kind],
                )}
              >
                <div className="flex items-center gap-2">
                  <PersonAvatar person={author} size="sm" />
                  <span className="text-xs font-medium">{author?.name}</span>
                  <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {KIND_LABEL[c.kind]}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {relativeTime(c.createdAt)}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-snug">{c.body}</p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="space-y-2">
        <ToggleGroup
          type="single"
          size="sm"
          value={kind}
          onValueChange={(v) => v && setKind(v as CommentKind)}
          className="justify-start"
        >
          <ToggleGroupItem value="challenge">Challenge</ToggleGroupItem>
          <ToggleGroupItem value="response">Response</ToggleGroupItem>
          <ToggleGroupItem value="note">Note</ToggleGroupItem>
        </ToggleGroup>
        <div className="flex items-end gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Raise a concern, respond, or add a note…"
            className="min-h-9 resize-none"
            rows={2}
          />
          <Button size="icon" onClick={submit} disabled={!body.trim()}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
