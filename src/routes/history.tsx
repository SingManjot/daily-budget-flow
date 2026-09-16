import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Trash2, Pencil } from "lucide-react";
import { useStore } from "@/lib/store";
import { historyTrend, monthsWithData, relativeDay, summarizeMonth } from "@/lib/calc";
import { fromISODate, monthLabel, periodTypeForDate } from "@/lib/periods";
import { formatCompact, formatMoney } from "@/lib/format";
import { CategoryIcon } from "@/components/CategoryIcon";
import { AddExpenseSheet } from "@/components/AddExpenseSheet";
import type { Expense } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — Spend Tracker" },
      {
        name: "description",
        content:
          "Every expense and every past month in one place, with a clean trend of how your spending changed month to month.",
      },
      { property: "og:title", content: "History — Spend Tracker" },
      {
        property: "og:description",
        content: "Past months, recent transactions and your monthly spending trend.",
      },
    ],
  }),
  component: History,
});

function History() {
  const { data, currency, deleteExpense } = useStore();
  const [range, setRange] = useState(6);
  const [editing, setEditing] = useState<Expense | null>(null);
  const trend = historyTrend(data, range);
  const months = monthsWithData(data).filter(
    (k) => data.expenses.some((e) => e.date.startsWith(k)) || k === monthsWithData(data)[0],
  );
  const recent = [...data.expenses]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);

  return (
    <div className="px-6 pb-4 pt-8">
      <h1 className="text-[22px] font-medium">History</h1>

      <div className="mt-5 flex items-center justify-between">
        <p className="label-mono text-mut">Monthly trend</p>
        <div className="flex gap-1 rounded-full bg-card p-1 ring-1 ring-hair">
          {[3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => setRange(m)}
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-[10px] transition-colors",
                range === m ? "bg-brass/15 text-brasshi" : "text-mut",
              )}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {trend.length > 1 ? (
        <div className="mt-3 h-40 rounded-2xl bg-card p-3 ring-1 ring-hair">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <XAxis
                dataKey="monthKey"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--mut)", fontSize: 10 }}
                tickFormatter={(v: string) => monthLabel(v, false).slice(0, 3)}
              />
              <Tooltip
                cursor={{ stroke: "var(--hair)" }}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--hair)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--foreground)",
                }}
                labelFormatter={(v: string) => monthLabel(v)}
                formatter={(v: number) => [formatMoney(v, currency), "Spent"]}
              />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="var(--brasshi)"
                strokeWidth={2}
                dot={{ r: 2.5, fill: "var(--brasshi)", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="mt-3 rounded-2xl bg-card px-4 py-8 text-center ring-1 ring-hair">
          <p className="text-[14px]">Your spending history will appear here.</p>
          <p className="mt-1 text-[12px] text-mut">
            The trend shows up once you have more than one month of data.
          </p>
        </div>
      )}

      <p className="label-mono mt-8 text-mut">Past months</p>
      <div className="mt-3 space-y-2.5">
        {months.map((k) => {
          const s = summarizeMonth(data, k);
          const saved = s.result >= 0;
          return (
            <Link
              key={k}
              to="/month/$month"
              params={{ month: k }}
              className="block rounded-2xl bg-card p-4 ring-1 ring-hair transition active:bg-accent"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[14px] font-medium">{monthLabel(k)}</span>
                <span
                  className={cn(
                    "shrink-0 font-mono text-[12px]",
                    saved ? "text-brasshi" : "text-over",
                  )}
                >
                  {formatMoney(s.result, currency)} {saved ? "saved" : "over"}
                </span>
              </div>
              <p className="mt-1.5 text-[12px] text-mut">
                {formatCompact(s.spent, currency)} spent · {s.transactions}{" "}
                {s.transactions === 1 ? "transaction" : "transactions"}
              </p>
            </Link>
          );
        })}
      </div>

      <p className="label-mono mt-8 text-mut">Recent transactions</p>
      {recent.length === 0 ? (
        <div className="mt-3 rounded-2xl bg-card px-4 py-8 text-center ring-1 ring-hair">
          <p className="text-[14px]">No spending yet</p>
          <p className="mt-1 text-[12px] text-mut">
            Add your first expense to start tracking this month.
          </p>
        </div>
      ) : (
        <div className="mt-3 divide-y divide-hair rounded-2xl bg-card ring-1 ring-hair">
          {recent.map((e) => {
            const cat = data.categories.find((c) => c.id === e.categoryId);
            return (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <CategoryIcon icon={cat?.icon} className="size-4 shrink-0 text-mut" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px]">{e.note || cat?.name || "Expense"}</p>
                  <p className="truncate text-[11px] text-mut">
                    {cat?.name} ·{" "}
                    {periodTypeForDate(fromISODate(e.date)) === "weekday" ? "Weekday" : "Weekend"} ·{" "}
                    {relativeDay(e.date)}
                  </p>
                </div>
                <span className="shrink-0 text-[14px] font-medium">
                  {formatMoney(e.amount, currency)}
                </span>
                <button
                  onClick={() => setEditing(e)}
                  aria-label="Edit expense"
                  className="shrink-0 p-1 text-mut active:text-brasshi"
                >
                  <Pencil className="size-3.5" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => deleteExpense(e.id)}
                  aria-label="Delete expense"
                  className="shrink-0 p-1 text-mut active:text-over"
                >
                  <Trash2 className="size-3.5" strokeWidth={1.5} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <AddExpenseSheet
        open={editing !== null}
        onOpenChange={(v) => !v && setEditing(null)}
        editing={editing}
      />
    </div>
  );
}
