import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  categoryTotals,
  expensesInMonth,
  monthPeriodSummaries,
  summarizeMonth,
} from "@/lib/calc";
import { formatPeriodRange, fromISODate, monthLabel, periodContains } from "@/lib/periods";
import { format } from "date-fns";
import { formatMoney } from "@/lib/format";
import { CategoryIcon } from "@/components/CategoryIcon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/month/$month")({
  head: () => ({
    meta: [
      { title: "Month detail — Spend Tracker" },
      {
        name: "description",
        content:
          "A full snapshot of one month: planned versus spent, weekday and weekend split, period history and every transaction.",
      },
      { property: "og:title", content: "Month detail — Spend Tracker" },
      {
        property: "og:description",
        content: "Exactly how this month's saved or overspent result was calculated.",
      },
    ],
  }),
  component: MonthDetail,
});

function MonthDetail() {
  const { month: monthKey } = Route.useParams();
  const { data, currency } = useStore();
  const [openPeriod, setOpenPeriod] = useState<string | null>(null);
  const s = summarizeMonth(data, monthKey);
  const saved = s.result >= 0;
  const cats = categoryTotals(data, monthKey);
  const maxCat = cats[0]?.total ?? 1;
  const periods = monthPeriodSummaries(data, monthKey);
  const expenses = expensesInMonth(data.expenses, monthKey).sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div className="px-6 pb-4 pt-8">
      <Link to="/history" className="inline-flex items-center gap-1 text-[13px] text-mut">
        <ChevronLeft className="size-4" strokeWidth={1.5} /> History
      </Link>

      <p className="label-mono mt-5 text-mut">{monthLabel(monthKey)}</p>
      <div className="anim-settle mt-2">
        <span
          className={cn("font-mono text-[24px] leading-none", saved ? "text-brasshi" : "text-over")}
        >
          {formatMoney(s.result, currency)}
        </span>
        <span
          className={cn(
            "ml-2 font-display text-[28px] italic leading-none",
            saved ? "text-brasshi" : "text-over",
          )}
        >
          {saved ? "saved" : "overspent"}
        </span>
      </div>
      <p className="mt-3 text-[13px] text-mut">
        {formatMoney(s.spent, currency)} spent of {formatMoney(s.planned, currency)} planned
      </p>

      <div className="mt-6 space-y-3">
        <Split label="Weekdays" spent={s.weekday.spent} planned={s.weekday.planned} currency={currency} />
        <Split label="Weekend" spent={s.weekend.spent} planned={s.weekend.planned} currency={currency} />
      </div>

      <p className="label-mono mt-8 text-mut">Categories</p>
      {cats.length ? (
        <div className="mt-3 space-y-3 rounded-2xl bg-card p-4 ring-1 ring-hair">
          {cats.map((c) => (
            <div key={c.categoryId}>
              <div className="flex items-center justify-between text-[13px]">
                <span className="truncate">{c.name}</span>
                <span className="shrink-0 font-mono text-[12px]">
                  {formatMoney(c.total, currency)}
                </span>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-hair">
                <div
                  className="anim-bar h-full rounded-full bg-brass"
                  style={{ width: `${(c.total / maxCat) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-mut">No spending recorded in this month.</p>
      )}

      <p className="label-mono mt-8 text-mut">Periods</p>
      <div className="mt-3 space-y-2">
        {periods.map((p) => {
          const diff = p.budget - p.spent;
          const isOpen = openPeriod === p.period.id;
          const rows = expenses.filter(
            (e) => periodContains(p.period, e.date),
          );
          return (
            <div key={p.period.id} className="rounded-2xl bg-card ring-1 ring-hair">
              <button
                onClick={() => setOpenPeriod(isOpen ? null : p.period.id)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <p className="label-mono text-mut">
                    {p.period.type === "weekday" ? "Weekday" : "Weekend"}
                  </p>
                  <p className="mt-1 text-[13px]">
                    {formatPeriodRange(p.period)} ·{" "}
                    <span className="font-mono text-[12px]">
                      {formatMoney(p.spent, currency)} / {formatMoney(p.budget, currency)}
                    </span>
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 font-mono text-[11px]",
                    diff >= 0 ? "text-brasshi" : "text-over",
                  )}
                >
                  {formatMoney(diff, currency)} {diff >= 0 ? "under" : "over"}
                </span>
              </button>
              {isOpen && (
                <div className="border-t border-hair px-4 py-2">
                  {rows.length ? (
                    rows.map((e) => {
                      const cat = data.categories.find((c) => c.id === e.categoryId);
                      return (
                        <div key={e.id} className="flex items-center gap-3 py-2">
                          <CategoryIcon icon={cat?.icon} className="size-3.5 shrink-0 text-mut" />
                          <span className="min-w-0 flex-1 truncate text-[13px]">
                            {e.note || cat?.name}
                          </span>
                          <span className="shrink-0 font-mono text-[12px]">
                            {formatMoney(e.amount, currency)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="py-2 text-[12px] text-mut">No transactions in this period.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="label-mono mt-8 text-mut">All transactions</p>
      {expenses.length ? (
        <div className="mt-3 divide-y divide-hair rounded-2xl bg-card ring-1 ring-hair">
          {expenses.map((e) => {
            const cat = data.categories.find((c) => c.id === e.categoryId);
            return (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <CategoryIcon icon={cat?.icon} className="size-4 shrink-0 text-mut" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px]">{e.note || cat?.name}</p>
                  <p className="text-[11px] text-mut">
                    {cat?.name} · {format(fromISODate(e.date), "EEE, d MMM")}
                  </p>
                </div>
                <span className="shrink-0 text-[14px] font-medium">
                  {formatMoney(e.amount, currency)}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-mut">Nothing recorded yet.</p>
      )}
    </div>
  );
}

function Split({
  label,
  spent,
  planned,
  currency,
}: {
  label: string;
  spent: number;
  planned: number;
  currency: string;
}) {
  const pct = planned > 0 ? Math.min(100, (spent / planned) * 100) : 0;
  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-hair">
      <div className="flex items-center justify-between">
        <span className="label-mono text-mut">{label}</span>
        <span className="font-mono text-[12px]">
          {formatMoney(spent, currency)}{" "}
          <span className="text-mut">/ {formatMoney(planned, currency)}</span>
        </span>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-hair">
        <div
          className={cn("anim-bar h-full rounded-full", spent > planned ? "bg-over" : "bg-brass")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
