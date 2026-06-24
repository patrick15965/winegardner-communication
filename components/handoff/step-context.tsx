"use client";

import {
  FileSpreadsheet,
  ListTree,
  Gauge,
  HardHat,
  UserCheck,
  HelpCircle,
  CalendarClock,
  TriangleAlert,
  Check,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PersonBadge } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import {
  sovLinesForBid,
  sovTotal,
  scopeItemsForBid,
  projectPlanForBid,
  milestonesForBid,
  procurementForBid,
  openRfisForBid,
  rfisForBid,
  extractionsForBid,
} from "@/lib/store/selectors";
import {
  currency,
  shortDate,
  dayLabel,
  SCOPE_DISPOSITION_LABEL,
  SCOPE_DISPOSITION_ACCENT,
  SCOPE_DISPOSITION_ORDER,
  RFI_STATUS_LABEL,
  RFI_STATUS_ACCENT,
  RFI_PRIORITY_ACCENT,
  RFI_PRIORITY_LABEL,
  BALL_IN_COURT_LABEL,
  MILESTONE_STATUS_LABEL,
  MILESTONE_STATUS_ACCENT,
  PROCUREMENT_CATEGORY_LABEL,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Bid, HandoffCategory, ScopeDisposition } from "@/lib/store/types";

/**
 * The live artifact for a handoff step — pulled up inline so the context being
 * reviewed (the SOV, the scope items, the RFIs, the schedule…) is on screen
 * while ops walks the step, not buried a tab away.
 */
export function StepContext({
  bid,
  stepKey,
}: {
  bid: Bid;
  stepKey: HandoffCategory;
}) {
  switch (stepKey) {
    case "sov":
      return <SovPanel bid={bid} />;
    case "scope":
      return <ScopePanel bid={bid} />;
    case "productionRates":
      return <RatesPanel bid={bid} />;
    case "crewPlan":
      return <CrewPanel bid={bid} />;
    case "foreman":
      return <ForemanPanel bid={bid} />;
    case "rfi":
      return <RfiPanel bid={bid} />;
    case "schedule":
      return <SchedulePanel bid={bid} />;
    case "risk":
      return <RiskPanel bid={bid} />;
    default:
      return null;
  }
}

// ── Shared shells ──────────────────────────────────────────────────────────

function Panel({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" />
        {title}
      </p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

// ── SOV ──────────────────────────────────────────────────────────────────

function SovPanel({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const lines = sovLinesForBid(state, bid.id);
  const total = sovTotal(lines);
  const matches = total === bid.value;

  return (
    <Panel icon={FileSpreadsheet} title="Schedule of Values">
      {lines.length === 0 ? (
        <Empty>No SOV breakdown on file yet — confirm against the awarded contract.</Empty>
      ) : (
        <div className="overflow-hidden rounded-md border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 text-left font-medium">Description</th>
                <th className="px-3 py-2 text-right font-medium">Scheduled value</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr key={l.id} className="border-b last:border-0 align-top">
                  <td className="px-3 py-2">
                    <p className="font-medium">{l.description}</p>
                    {l.note && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{l.note}</p>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {currency(l.scheduledValue)}
                  </td>
                </tr>
              ))}
              <tr className="border-t bg-muted/40 font-semibold">
                <td className="px-3 py-2">Total scheduled value</td>
                <td className="px-3 py-2 text-right tabular-nums">{currency(total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div
        className={cn(
          "mt-2.5 flex items-center gap-2 rounded-md border p-2 text-xs",
          matches
            ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300"
            : "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300",
        )}
      >
        {matches ? (
          <Check className="size-4 shrink-0" />
        ) : (
          <AlertCircle className="size-4 shrink-0" />
        )}
        {matches
          ? `Matches the awarded contract value of ${currency(bid.value)}.`
          : `SOV totals ${currency(total)} vs. an awarded ${currency(bid.value)} — reconcile before sign-off.`}
      </div>
    </Panel>
  );
}

// ── Scope ──────────────────────────────────────────────────────────────────

function ScopePanel({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const items = scopeItemsForBid(state, bid.id);
  if (items.length === 0)
    return (
      <Panel icon={ListTree} title="Scope assumptions & exclusions">
        <Empty>No scope items carried from the bid.</Empty>
      </Panel>
    );

  const groups = SCOPE_DISPOSITION_ORDER.map((d) => ({
    disposition: d as ScopeDisposition,
    items: items.filter((i) => i.disposition === d),
  })).filter((g) => g.items.length > 0);

  return (
    <Panel icon={ListTree} title="Scope assumptions & exclusions">
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.disposition} className="space-y-1.5">
            <Badge
              variant="outline"
              className={cn("text-[10px]", SCOPE_DISPOSITION_ACCENT[g.disposition])}
            >
              {SCOPE_DISPOSITION_LABEL[g.disposition]} · {g.items.length}
            </Badge>
            {g.items.map((i) => (
              <div key={i.id} className="rounded-md border bg-background p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{i.title}</p>
                  {i.quantity && (
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {i.quantity}
                    </span>
                  )}
                </div>
                {i.assumption && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">Assumption: </span>
                    {i.assumption}
                  </p>
                )}
                {i.sourceRef && (
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{i.sourceRef}</p>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </Panel>
  );
}

// ── Production rates ─────────────────────────────────────────────────────────

function RatesPanel({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const items = scopeItemsForBid(state, bid.id).filter((i) => i.productionRate);

  return (
    <Panel icon={Gauge} title="Priced production rates">
      {items.length === 0 ? (
        <Empty>No production rates were attached to scope on this bid.</Empty>
      ) : (
        <div className="space-y-1.5">
          {items.map((i) => (
            <div key={i.id} className="rounded-md border bg-background p-2.5">
              <p className="text-sm font-medium">{i.title}</p>
              <p className="mt-1 text-xs">
                <span className="font-medium text-muted-foreground">Rate: </span>
                {i.productionRate}
              </p>
              {i.crewNote && (
                <p className="mt-0.5 text-xs text-muted-foreground">{i.crewNote}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ── Crew plan ────────────────────────────────────────────────────────────────

function CrewPanel({ bid }: { bid: Bid }) {
  const { state, getPerson } = useAppStore();
  const plan = projectPlanForBid(state, bid.id);
  const sup = plan?.superId ? getPerson(plan.superId) : undefined;
  const crewNotes = scopeItemsForBid(state, bid.id).filter((i) => i.crewNote);

  return (
    <Panel icon={HardHat} title="Crew plan">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Crew size
          </p>
          <p className="text-lg font-semibold tabular-nums">
            {plan?.crewSize ?? "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Superintendent
          </p>
          {sup ? (
            <PersonBadge person={sup} />
          ) : (
            <p className="text-sm text-muted-foreground">Not yet assigned</p>
          )}
        </div>
      </div>
      {crewNotes.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Crew notes from scope
          </p>
          {crewNotes.map((i) => (
            <div key={i.id} className="rounded-md border bg-background p-2.5 text-xs">
              <span className="font-medium">{i.title}: </span>
              <span className="text-muted-foreground">{i.crewNote}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ── Foreman ──────────────────────────────────────────────────────────────────

function ForemanPanel({ bid }: { bid: Bid }) {
  const { state, getPerson } = useAppStore();
  const plan = projectPlanForBid(state, bid.id);
  const foreman = plan?.foremanId ? getPerson(plan.foremanId) : undefined;
  const sup = plan?.superId ? getPerson(plan.superId) : undefined;

  return (
    <Panel icon={UserCheck} title="Assignment">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border bg-background p-2.5">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Foreman
          </p>
          {foreman ? (
            <div className="mt-1">
              <PersonBadge person={foreman} />
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Not yet named — assign & brief two weeks out.
            </p>
          )}
        </div>
        <div className="rounded-md border bg-background p-2.5">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Superintendent
          </p>
          {sup ? (
            <div className="mt-1">
              <PersonBadge person={sup} />
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">Not yet assigned</p>
          )}
        </div>
      </div>
    </Panel>
  );
}

// ── RFIs ─────────────────────────────────────────────────────────────────────

function RfiPanel({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const open = openRfisForBid(state, bid.id);
  const rfis = open.length > 0 ? open : rfisForBid(state, bid.id);

  return (
    <Panel icon={HelpCircle} title="Open RFIs">
      {rfis.length === 0 ? (
        <Empty>No RFIs on this bid yet.</Empty>
      ) : (
        <div className="space-y-1.5">
          {rfis.map((r) => (
            <div key={r.id} className="rounded-md border bg-background p-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold tabular-nums">{r.number}</span>
                <Badge
                  variant="outline"
                  className={cn("text-[10px]", RFI_STATUS_ACCENT[r.status])}
                >
                  {RFI_STATUS_LABEL[r.status]}
                </Badge>
                {r.priority && (
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", RFI_PRIORITY_ACCENT[r.priority])}
                  >
                    {RFI_PRIORITY_LABEL[r.priority]}
                  </Badge>
                )}
                {r.ballInCourt && (
                  <span className="text-[11px] text-muted-foreground">
                    ball: {BALL_IN_COURT_LABEL[r.ballInCourt]}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium">{r.subject}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                {r.responseNeededBy && <span>needs answer by {shortDate(r.responseNeededBy)}</span>}
                {typeof r.costImpactEstimate === "number" && (
                  <span>~{currency(r.costImpactEstimate)} impact</span>
                )}
                {typeof r.scheduleImpactDays === "number" && (
                  <span>+{r.scheduleImpactDays}d schedule</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ── Schedule ─────────────────────────────────────────────────────────────────

function SchedulePanel({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const plan = projectPlanForBid(state, bid.id);
  const milestones = milestonesForBid(state, bid.id);
  const procurement = procurementForBid(state, bid.id);

  return (
    <Panel icon={CalendarClock} title="Schedule & lead times">
      <div className="rounded-md border bg-background p-2.5">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          Mobilization
        </p>
        <p className="text-sm font-semibold">{shortDate(plan?.mobilizationDate)}</p>
      </div>

      {milestones.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Milestones
          </p>
          {milestones.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-1.5 text-sm"
            >
              <span className="min-w-0 truncate">{m.label}</span>
              <span className="flex shrink-0 items-center gap-2">
                <span className="text-xs tabular-nums text-muted-foreground">
                  {dayLabel(m.targetDate)}
                </span>
                <Badge
                  variant="outline"
                  className={cn("text-[10px]", MILESTONE_STATUS_ACCENT[m.status])}
                >
                  {MILESTONE_STATUS_LABEL[m.status]}
                </Badge>
              </span>
            </div>
          ))}
        </div>
      )}

      {procurement.length > 0 && (
        <div className="mt-3 space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Procurement lead times
          </p>
          {procurement.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-1.5 text-sm"
            >
              <span className="min-w-0 truncate">
                {p.label}
                <span className="ml-1.5 text-[11px] text-muted-foreground">
                  {PROCUREMENT_CATEGORY_LABEL[p.category]}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-muted-foreground">
                <span>{p.leadTimeWeeks}w lead</span>
                {p.needBy && <span>need {dayLabel(p.needBy)}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

// ── Risk ─────────────────────────────────────────────────────────────────────

function RiskPanel({ bid }: { bid: Bid }) {
  const { state } = useAppStore();
  const plan = projectPlanForBid(state, bid.id);
  const risks = extractionsForBid(state, bid.id).filter((e) => e.kind === "risk");

  return (
    <Panel icon={TriangleAlert} title="Key risks">
      {plan?.summary && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-2.5 text-xs">
          {plan.summary}
        </div>
      )}
      {risks.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          No risk findings flagged on the plans.
        </p>
      ) : (
        <div className={cn("space-y-1.5", plan?.summary && "mt-3")}>
          {risks.map((r) => (
            <div key={r.id} className="rounded-md border bg-background p-2.5">
              <p className="text-sm font-medium">{r.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{r.detail}</p>
              {r.sourceRef && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{r.sourceRef}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
