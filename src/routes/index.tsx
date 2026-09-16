import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { currentPeriods, relativeDay, summarizeMonth } from "@/lib/calc";
import { monthKeyOf, monthLabel } from "@/lib/periods";
import { formatMoney } from "@/lib/format";
import { Gauge } from "@/components/Gauge";
import { PeriodCard } from "@/components/PeriodCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Spend Tracker — Weekday & weekend budgets" },
      {
        name: "description",
        content:
          "A calm, offline personal spending tracker. Separate weekday and weekend budgets, and one clear answer: are you under or over plan this month?",
      },
      { property: "og:title", content: "Spend Tracker — Weekday & weekend budgets" },
      {
        property: "og:description",
        content: "Know what you can spend, what you spent, and whether you're ahead of plan.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data, currency } = useStore();
  const now = new Date();
  const monthKey = monthKeyOf(now);
  const month = summarizeMonth(data, monthKey);
  const { weekday, weekend, activeType } = currentPeriods(data, now);
  const recent = [...data.expenses]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const hasSpending = month.spent > 0;
  const saved = month.result >= 0;

  return (
    <div>
      <header className="flex items-center justify-between px-6 pb-4 pt-8">
        <div className="min-w-0">
          <p className="text-[13px] text-mut">{greeting()}</p>
          <p className="mt-0.5 truncate text-[15px] font-medium">{data.user?.name}</p>
        </div>
        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brass/10 ring-1 ring-brass/25">
          <span className="font-mono text-[12px] text-brasshi">
            {(data.user?.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
        </div>
      </header>

      <section className="px-6 pt-3">
        <p className="label-mono anim-rise text-mut">{monthLabel(monthKey)}</p>
        {hasSpending ? (
          <>
            <div className="anim-settle mt-2">
              <span
                className={cn("font-mono text-[26px] leading-none", saved ? "text-brasshi" : "text-over")}
              >
                {formatMoney(month.result, currency)}
              </span>
              <span
                className={cn(
                  "ml-2 font-display text-[30px] italic leading-none",
                  saved ? "text-brasshi" : "text-over",
                )}
              >
                {saved ? "saved" : "overspent"}
              </span>
            </div>
            <p className="anim-rise mt-3 text-[13px] text-mut">
              {formatMoney(month.spent, currency)} spent of {formatMoney(month.planned, currency)}{" "}
              planned
            </p>
          </>
        ) : (
          <>
            <h1 className="anim-settle mt-2 font-display text-[34px] italic leading-none text-brasshi">
              Let&apos;s see how you do this month.
            </h1>
            <p className="anim-rise mt-3 text-[13px] text-mut">
              {formatMoney(0, currency)} spent of {formatMoney(month.planned, currency)} planned
            </p>
          </>
        )}
      </section>

      <section className="mt-6 px-6">
        <Gauge ratio={month.planned > 0 ? month.spent / month.planned : 0} />
      </section>

      <section className="mt-6 space-y-3 px-6">
        <PeriodCard summary={weekday} active={activeType === "weekday"} currency={currency} />
        <PeriodCard summary={weekend} active={activeType === "weekend"} currency={currency} />
      </section>

      <section className="mt-6 px-6">
        <div className="flex items-center justify-between">
          <p className="label-mono text-mut">Recent</p>
          <Link to="/history" className="text-[12px] text-brass">
            See all
          </Link>
        </div>
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
                <div key={e.id} className="anim-rise flex items-center gap-3 px-4 py-3">
                  <CategoryIcon icon={cat?.icon} className="size-4 shrink-0 text-mut" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px]">{e.note || cat?.name || "Expense"}</p>
                    <p className="truncate text-[11px] text-mut">
                      {cat?.name} · {e.periodType === "weekday" ? "Weekday" : "Weekend"} ·{" "}
                      {relativeDay(e.date)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[14px] font-medium">
                    {formatMoney(e.amount, currency)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
