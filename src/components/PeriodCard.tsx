import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import { formatPeriodRange } from "@/lib/periods";
import type { PeriodSummary } from "@/lib/calc";

export function PeriodCard({
  summary,
  active,
  currency = "₹",
  showRange = false,
}: {
  summary: PeriodSummary;
  active: boolean;
  currency?: string;
  showRange?: boolean;
}) {
  const { period, budget, spent, added, remaining } = summary;
  const total = budget + added;
  const pct = total > 0 ? Math.min(100, (spent / total) * 100) : 0;
  const over = remaining < 0;

  return (
    <div
      className={cn(
        "anim-rise rounded-2xl bg-card p-4 ring-1 transition-colors duration-300",
        active ? "ring-brass/40" : "ring-hair",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn("label-mono truncate", active ? "text-brasshi" : "text-mut")}
        >
          {period.type === "weekday" ? "Weekdays" : "Weekend"}
        </span>
        <span className="shrink-0 font-mono text-[10px] text-mut">
          {showRange
            ? formatPeriodRange(period)
            : active
              ? `Active · ${period.type === "weekday" ? "Mon–Fri" : "Sat–Sun"}`
              : period.type === "weekday"
                ? "Mon–Fri"
                : "Sat–Sun"}
        </span>
      </div>

      <p className={cn("mt-3 text-[17px] font-medium", !active && "text-foreground/80")}>
        {formatMoney(spent, currency)} <span className="text-mut">/ {formatMoney(budget, currency)}</span>
      </p>

      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-hair">
        <div
          className={cn("h-full rounded-full transition-[width] duration-700", over ? "bg-over" : active ? "bg-brass" : "bg-brass/55")}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[12px] text-mut">{formatMoney(added, currency)} added</span>
        <span className={cn("text-[13px]", over ? "text-over" : active ? "text-brasshi" : "text-foreground/80")}>
          {over
            ? `${formatMoney(remaining, currency)} over`
            : `${formatMoney(remaining, currency)} left`}
        </span>
      </div>
    </div>
  );
}
