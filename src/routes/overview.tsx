import { createFileRoute } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useStore } from "@/lib/store";
import { categoryTotals, monthTrend, summarizeMonth } from "@/lib/calc";
import { monthKeyOf, monthLabel } from "@/lib/periods";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/overview")({
  head: () => ({
    meta: [
      { title: "Monthly overview — Spend Tracker" },
      {
        name: "description",
        content:
          "See planned versus actual spending for the month, weekday and weekend split, spending trend and category breakdown.",
      },
      { property: "og:title", content: "Monthly overview — Spend Tracker" },
      {
        property: "og:description",
        content: "Planned versus actual spending, weekday/weekend split and category breakdown.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { data, currency } = useStore();
  const monthKey = monthKeyOf(new Date());
  const month = summarizeMonth(data, monthKey);
  const cats = categoryTotals(data, monthKey);
  const trend = monthTrend(data, monthKey);
  const saved = month.result >= 0;
  const maxCat = cats[0]?.total ?? 1;
  const hasData = month.spent > 0;

  return (
    <div className="px-6 pb-4 pt-8">
      <p className="label-mono text-mut">{monthLabel(monthKey)}</p>
      <div className="anim-settle mt-2">
        <span
          className={cn("font-mono text-[24px] leading-none", saved ? "text-brasshi" : "text-over")}
        >
          {formatMoney(month.result, currency)}
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

      <div className="mt-5 grid grid-cols-3 gap-2">
        <Stat label="Planned" value={formatMoney(month.planned, currency)} />
        <Stat label="Spent" value={formatMoney(month.spent, currency)} />
        <Stat
          label={saved ? "Saved" : "Over"}
          value={formatMoney(month.result, currency)}
          tone={saved ? "under" : "over"}
        />
      </div>

      {month.added > 0 && (
        <p className="mt-3 text-[12px] text-mut">
          {formatMoney(month.added, currency)} extra money added this month — kept separate from
          your plan.
        </p>
      )}

      <p className="label-mono mt-8 text-mut">Weekday vs weekend</p>
      <div className="mt-3 space-y-3">
        <SplitBar
          label="Weekdays"
          spent={month.weekday.spent}
          planned={month.weekday.planned}
          currency={currency}
        />
        <SplitBar
          label="Weekend"
          spent={month.weekend.spent}
          planned={month.weekend.planned}
          currency={currency}
        />
      </div>

      <p className="label-mono mt-8 text-mut">Spending trend</p>
      {hasData ? (
        <div className="mt-3 h-40 rounded-2xl bg-card p-3 ring-1 ring-hair">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--mut)", fontSize: 10 }}
                tickFormatter={(v: string) => v.replace("Week ", "W")}
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
                formatter={(v: number) => [formatMoney(v, currency), "Spent"]}
              />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="var(--brasshi)"
                strokeWidth={2}
                dot={{ r: 2.5, fill: "var(--brasshi)", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <Empty text="No spending yet" sub="Add your first expense to start tracking this month." />
      )}

      <p className="label-mono mt-8 text-mut">Where it went</p>
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
        <Empty text="No categories yet" sub="Category totals appear once you add expenses." />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "under" | "over";
}) {
  return (
    <div className="rounded-2xl bg-card p-3 ring-1 ring-hair">
      <p className="label-mono text-[10px] text-mut">{label}</p>
      <p
        className={cn(
          "mt-2 font-mono text-[14px]",
          tone === "under" && "text-brasshi",
          tone === "over" && "text-over",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function SplitBar({
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
  const over = spent > planned;
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
          className={cn("anim-bar h-full rounded-full", over ? "bg-over" : "bg-brass")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Empty({ text, sub }: { text: string; sub: string }) {
  return (
    <div className="mt-3 rounded-2xl bg-card px-4 py-8 text-center ring-1 ring-hair">
      <p className="text-[14px]">{text}</p>
      <p className="mt-1 text-[12px] text-mut">{sub}</p>
    </div>
  );
}
