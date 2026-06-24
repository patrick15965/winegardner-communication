"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, RotateCcw, Plus } from "lucide-react";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { NewTaskDialog } from "@/components/tasks/new-task-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RoleSwitcher } from "@/components/role-switcher";
import { useAppStore } from "@/lib/store/store-context";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  schedule: "Revenue & Schedule",
  pipeline: "Bid Pipeline",
  standards: "Estimating ↔ Ops Standards",
  tasks: "Tasks",
  handoff: "Handoffs",
};

function useTitle() {
  const pathname = usePathname();
  const seg = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  return TITLES[seg] ?? "Weingartner Ops";
}

export function AppHeader() {
  const title = useTitle();
  const { setTheme, resolvedTheme } = useTheme();
  const { resetDemo } = useAppStore();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <h1 className="text-sm font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <NewTaskDialog
          trigger={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              <span className="hidden sm:inline">New task</span>
            </Button>
          }
        />

        <Separator orientation="vertical" className="h-5" />

        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          <Sun className="size-4 dark:hidden" />
          <Moon className="hidden size-4 dark:block" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <RotateCcw className="size-4" />
              <span className="hidden sm:inline">Reset demo</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset the demo?</AlertDialogTitle>
              <AlertDialogDescription>
                This restores all bids, tasks, comments, sign-offs and standards
                to the original seed data. Any changes made during this session
                will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  resetDemo();
                  toast.success("Demo reset to seed data");
                }}
              >
                Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Separator orientation="vertical" className="h-5" />
        <RoleSwitcher />
      </div>
    </header>
  );
}
