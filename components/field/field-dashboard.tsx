"use client";

import Link from "next/link";
import { ChevronRight, Receipt, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeading } from "@/components/page-heading";
import { PersonBadge } from "@/components/person-badge";
import { useAppStore } from "@/lib/store/store-context";
import {
  changeOrderTotals,
  coAgingBuckets,
  changeOrdersByJob,
  changeOrdersByPerson,
  totalOpenRfis,
} from "@/lib/store/selectors";
import { currency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function FieldDashboard() {
  const { state } = useAppStore();
  const totals = changeOrderTotals(state);
  const aging = coAgingBuckets(state);
  const byJob = changeOrdersByJob(state);
  const byPerson = changeOrdersByPerson(state);
  const openRfis = totalOpenRfis(state);

  return (
    <div className="space-y-5">
      <PageHeading
        title="Field — Change Orders & RFIs"
        description="What's actually outstanding, finally in one place: change orders per job, company-wide, and per person — plus the RFIs that turn into them. The number that used to live in a spreadsheet on the J drive."
      />

      {/* Headline KPI strip */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Outstanding change orders"
          value={currency(totals.openValue)}
          sub={`${totals.openCount} open · oldest ${totals.oldestOpenAgeDays} days`}
          tone="amber"
          icon={<Receipt className="size-5" />}
        />
        <KpiCard
          label="Current (< 30 days)"
          value={currency(aging.current.value)}
          sub={`${aging.current.count} change order${aging.current.count === 1 ? "" : "s"}`}
          tone="slate"
        />
        <KpiCard
          label="30+ days in limbo"
          value={currency(aging.over30.value)}
          sub={`${aging.over30.count} change order${aging.over30.count === 1 ? "" : "s"}`}
          tone="amber"
        />
        <KpiCard
          label="60+ days in limbo"
          value={currency(aging.over60.value)}
          sub={`${aging.over60.count} change order${aging.over60.count === 1 ? "" : "s"}`}
          tone="red"
          icon={aging.over60.count > 0 ? <AlertTriangle className="size-5" /> : undefined}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* By job */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Receipt className="size-4" /> Outstanding by job
          </h3>
          {byJob.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No change orders yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {byJob.map((row) => (
                <Link key={row.bid.id} href={`/field/${row.bid.id}`}>
                  <Card className="group transition-colors hover:border-foreground/20">
                    <CardContent className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {row.bid.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.openCount} open
                          {row.oldestAgeDays > 0
                            ? ` · oldest ${row.oldestAgeDays} days`
                            : ""}
                          {row.total > row.openCount
                            ? ` · ${row.total - row.openCount} closed`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            row.oldestAgeDays >= 60 &&
                              "text-red-600 dark:text-red-400",
                          )}
                        >
                          {currency(row.openValue)}
                        </span>
                        <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* By person */}
        <section className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4" /> Outstanding by person
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {openRfis} open RFI{openRfis === 1 ? "" : "s"} feeding the pipeline
            </span>
          </h3>
          {byPerson.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Nothing outstanding.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {byPerson.map((row) => (
                <Card key={row.person.id}>
                  <CardContent className="flex items-center justify-between gap-3 py-3">
                    <PersonBadge person={row.person} withRole />
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {currency(row.openValue)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {row.openCount} open
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  tone,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "slate" | "amber" | "red";
  icon?: React.ReactNode;
}) {
  const toneClass = {
    slate: "text-muted-foreground",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
  }[tone];
  return (
    <Card className={cn(tone === "red" && "border-red-500/30")}>
      <CardContent className="space-y-1 py-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          {icon && <span className={toneClass}>{icon}</span>}
        </div>
        <p className={cn("text-2xl font-semibold tabular-nums", toneClass)}>
          {value}
        </p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}
