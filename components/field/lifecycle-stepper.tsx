import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LifecycleStep {
  key: string;
  label: string;
  /** Optional sub-label shown under the step, e.g. a date. */
  hint?: string;
}

/**
 * A horizontal status stepper for an RFI / Change Order. Steps before the
 * active one read as done, the active one is ringed, the rest are muted. A
 * terminal "off-track" state (rejected RFI answer with no cost, CO rejected)
 * is shown as a red marker on the active step instead of a forward dot.
 */
export function LifecycleStepper({
  steps,
  activeKey,
  tone = "sky",
  terminal,
}: {
  steps: LifecycleStep[];
  activeKey: string;
  tone?: "sky" | "violet" | "emerald" | "amber";
  /** When set, the active step is rendered as a terminal/branch state. */
  terminal?: { label: string; variant: "stop" | "done" };
}) {
  const activeIndex = steps.findIndex((s) => s.key === activeKey);

  const toneRing: Record<string, string> = {
    sky: "border-sky-500 text-sky-600 dark:text-sky-400 ring-sky-500/20",
    violet:
      "border-violet-500 text-violet-600 dark:text-violet-400 ring-violet-500/20",
    emerald:
      "border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20",
    amber:
      "border-amber-500 text-amber-600 dark:text-amber-400 ring-amber-500/20",
  };
  const toneFill: Record<string, string> = {
    sky: "bg-sky-500 border-sky-500",
    violet: "bg-violet-500 border-violet-500",
    emerald: "bg-emerald-500 border-emerald-500",
    amber: "bg-amber-500 border-amber-500",
  };

  return (
    <div className="flex items-start">
      {steps.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        const isStop = active && terminal?.variant === "stop";
        const isTerminalDone = active && terminal?.variant === "done";
        return (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {/* left connector */}
              <div
                className={cn(
                  "h-0.5 flex-1",
                  i === 0
                    ? "opacity-0"
                    : i <= activeIndex
                      ? toneFill[tone]
                      : "bg-border",
                )}
              />
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-semibold",
                  done && cn(toneFill[tone], "text-white"),
                  isStop && "border-red-500 bg-red-500 text-white",
                  isTerminalDone && cn(toneFill[tone], "text-white"),
                  active &&
                    !terminal &&
                    cn("bg-background ring-4", toneRing[tone]),
                  !done && !active && "border-border bg-background text-muted-foreground",
                )}
              >
                {done || isTerminalDone ? (
                  <Check className="size-3.5" />
                ) : isStop ? (
                  <X className="size-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              {/* right connector */}
              <div
                className={cn(
                  "h-0.5 flex-1",
                  i === steps.length - 1
                    ? "opacity-0"
                    : i < activeIndex
                      ? toneFill[tone]
                      : "bg-border",
                )}
              />
            </div>
            <div className="mt-1.5 px-1 text-center">
              <p
                className={cn(
                  "text-[11px] font-medium leading-tight",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {isStop || isTerminalDone ? terminal.label : step.label}
              </p>
              {step.hint && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {step.hint}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
