"use client";

import { ChevronsUpDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { PersonAvatar } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import { ROLE_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

export function RoleSwitcher() {
  const { state, currentUser, setCurrentUser } = useAppStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-9 gap-2 pl-1.5 pr-2">
          <PersonAvatar person={currentUser} size="sm" />
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-sm font-medium">{currentUser.name}</span>
            <span className="text-[10px] text-muted-foreground">
              {ROLE_LABEL[currentUser.role]}
            </span>
          </span>
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>View as…</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {state.people.map((p) => (
          <DropdownMenuItem
            key={p.id}
            onClick={() => setCurrentUser(p.id)}
            className="gap-2"
          >
            <PersonAvatar person={p} size="sm" />
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-medium">{p.name}</span>
              <span className="text-xs text-muted-foreground">
                {ROLE_LABEL[p.role]}
              </span>
            </span>
            <Check
              className={cn(
                "ml-auto size-4",
                p.id === currentUser.id ? "opacity-100" : "opacity-0",
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
