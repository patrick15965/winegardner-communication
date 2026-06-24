"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  KanbanSquare,
  MessagesSquare,
  ListChecks,
  HardHat,
  Sparkles,
  Building2,
  CalendarRange,
  Receipt,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/store/store-context";
import {
  totalOpenConcerns,
  totalOpenExtractions,
  totalProcurementAtRisk,
  totalOpenChangeOrders,
  tasksForUser,
} from "@/lib/store/selectors";

const NAV = [
  { href: "/board", label: "Board", icon: KanbanSquare },
  { href: "/plan-room", label: "Plan Room", icon: Sparkles },
  { href: "/projects", label: "Projects", icon: Building2 },
  { href: "/field", label: "Field", icon: Receipt },
  { href: "/schedule", label: "Schedule", icon: CalendarRange },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/standards", label: "Standards", icon: MessagesSquare },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { state, currentUser } = useAppStore();

  const openConcerns = totalOpenConcerns(state);
  const openFindings = totalOpenExtractions(state);
  const atRiskOrders = totalProcurementAtRisk(state);
  const openChangeOrders = totalOpenChangeOrders(state);
  const myOpenTasks = tasksForUser(state, currentUser.id).filter(
    (t) => t.status !== "done",
  ).length;

  const badgeFor = (href: string) => {
    if (href === "/board" && openConcerns) return openConcerns;
    if (href === "/plan-room" && openFindings) return openFindings;
    if (href === "/projects" && atRiskOrders) return atRiskOrders;
    if (href === "/field" && openChangeOrders) return openChangeOrders;
    if (href === "/tasks" && myOpenTasks) return myOpenTasks;
    return null;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <HardHat className="size-5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">Weingartner Ops</span>
            <span className="text-xs text-muted-foreground">
              Estimating ↔ Operations
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                const badge = badgeFor(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {badge != null && (
                      <SidebarMenuBadge>{badge}</SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <p className="px-2 py-1 text-[11px] leading-snug text-muted-foreground">
          Prototype · mock data. Discovery context in{" "}
          <code className="text-[10px]">CONTEXT/</code>.
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
