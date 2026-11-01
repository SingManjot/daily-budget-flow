import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { currentPeriods, monthProgress, relativeDay, summarizeMonth } from "@/lib/calc";
import { fromISODate, monthKeyOf, monthLabel, periodTypeForDate } from "@/lib/periods";
import { formatMoney } from "@/lib/format";
import { MonthProgress } from "@/components/MonthProgress";
import { PeriodCard } from "@/components/PeriodCard";
import { CategoryBadge } from "@/components/CategoryIcon";
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
  const progress = monthProgress(data, monthKey, now);
  const { weekday, weekend, activeType } = currentPeriods(data, now);
  const recent = [...data.expenses]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const hasSpending = progress.hasSettled;
  const saved = progress.result >= 0;

  return (
    <div>
      <header className="flex items-end justify-between px-5 pb-4 pt-8">
        <div className="min-w-0">
          <p className="text-[15px] text-mut">{greeting()}</p>
          <h1 className="title-large mt-0.5 truncate">{data.user?.name}</h1>
        </div>
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brass/15">
          <span className="text-[16px] font-semibold text-brasshi">
            {(data.user?.name ?? "?").slice(0, 1).toUpperCase()}
          </span>
        </div>
      </header>

      <section className="px-5 pt-3">
        <p className="label-section anim-rise text-mut">{monthLabel(monthKey)}</p>
        {hasSpending ? (
          <>
            <div className="anim-settle mt-2">
              <span
                className={cn(
                  "text-[34px] font-semibold leading-none tracking-tight",
                  saved ? "text-brasshi" : "text-over",
                )}
              >
                {formatMoney(progress.result, currency)}
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
            <p className="anim-rise mt-3 text-[15px] text-mut">
              {formatMoney(month.spent, currency)} spent so far ·{" "}
              {formatMoney(month.planned, currency)} planned for {monthLabel(monthKey, false)}
            </p>
          </>
        ) : (
          <>
            <h1 className="anim-settle mt-2 font-display text-[34px] italic leading-none text-brasshi">
              Let&apos;s see how you do this month.
            </h1>
            <p className="anim-rise mt-3 text-[15px] text-mut">
              {formatMoney(month.spent, currency)} spent so far · savings appear when this
              week&apos;s blocks close
            </p>
          </>
        )}
      </section>

      <section className="mt-6 px-5">
        <MonthProgress progress={progress} currency={currency} />
      </section>

      <section className="mt-6 space-y-3 px-5">
        <PeriodCard summary={weekday} active={activeType === "weekday"} currency={currency} />
        <PeriodCard summary={weekend} active={activeType === "weekend"} currency={currency} />
      </section>

      <section className="mt-8 px-5">
        <div className="flex items-center justify-between px-1">
          <p className="label-section text-mut">Recent</p>
          <Link to="/history" className="-my-2 py-2 text-[15px] text-brasshi">
            See all
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="mt-3 rounded-2xl bg-card px-4 py-8 text-center ring-1 ring-hair">
            <p className="text-[15px]">No spending yet</p>
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
                  <CategoryBadge icon={cat?.icon} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px]">{e.note || cat?.name || "Expense"}</p>
                    <p className="truncate text-[12px] text-mut">
                      {cat?.name} ·{" "}
                      {periodTypeForDate(fromISODate(e.date)) === "weekday" ? "Weekday" : "Weekend"}{" "}
                      · {relativeDay(e.date)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[15px] font-medium">
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
