import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/format";
import type { Person } from "@/lib/store/types";

export function PersonAvatar({
  person,
  size = "default",
  className,
}: {
  person?: Person;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} className={className}>
      <AvatarFallback
        className={cn("text-white font-medium", person?.avatarColor ?? "bg-muted")}
      >
        {person?.initials ?? "?"}
      </AvatarFallback>
    </Avatar>
  );
}

export function PersonBadge({
  person,
  withRole = false,
  size = "sm",
  className,
}: {
  person?: Person;
  withRole?: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  if (!person) {
    return <span className="text-muted-foreground text-sm">Unassigned</span>;
  }
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <PersonAvatar person={person} size={size} />
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-medium">{person.name}</span>
        {withRole && (
          <span className="text-xs text-muted-foreground">
            {ROLE_LABEL[person.role]}
          </span>
        )}
      </span>
    </span>
  );
}
