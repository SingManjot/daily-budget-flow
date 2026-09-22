import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/format";
import type { MonthProgress as MonthProgressData } from "@/lib/calc";

/**
 * Week-by-week strip for the current month. Each weekday/weekend block is a
 * column: filled to the share of its budget used, brass when under, red when
 * over, faint while still upcoming.
 */
export function MonthProgress({
  progress,
  currency,
}: {
  progress: MonthProgressData;
  currency: string;
}) {
  const { cells } = progress;
  const max = Math.max(
    1,
    ...cells.map((c) => Math.max(c.planned, c.spent)),
  );

  return (
    <div className="rounded-2xl bg-card p-4 ring-1 ring-hair">
      <div className="flex items-baseline justify-between">
        <p className="label-mono text-mut">Month so far</p>
        <p className="font-mono text-[11px] text-mut">
          {formatMoney(progress.settledSpent, currency)} /{" "}
          {formatMoney(progress.settledPlanned, currency)} closed
        </p>
      </div>

      <div className="mt-4 flex h-24 items-end gap-1.5">
        {cells.map((c, i) => {
          const over = c.spent > c.planned;
          const fill = Math.min(100, (c.spent / max) * 100);
          const plan = Math.min(100, (c.planned / max) * 100);
          return (
            <div key={c.id} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-md ring-1 transition-colors",
                  c.state === "current" ? "ring-brass/45" : "ring-hair",
                  c.state === "future" ? "opacity-40" : "",
                )}
                style={{ height: `${Math.max(plan, fill, 8)}%` }}
              >
                {/* planned capacity */}
                <div className="absolute inset-0 bg-hair/60" />
                {/* actual spend */}
                <div
                  className={cn(
                    "anim-bar absolute inset-x-0 bottom-0",
                    over ? "bg-over/80" : c.state === "current" ? "bg-brasshi/80" : "bg-brass/60",
                  )}
                  style={{
                    height: `${
                      Math.max(plan, fill, 8) > 0
                        ? (fill / Math.max(plan, fill, 8)) * 100
                        : 0
                    }%`,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              </div>
              <span
                className={cn(
                  "mt-1.5 text-center font-mono text-[9px]",
                  c.state === "current" ? "text-brasshi" : "text-mut",
                )}
              >
                {c.type === "weekday" ? "WD" : "WE"}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-hair pt-3">
        <span className="text-[11px] text-mut">
          {cells.filter((c) => c.state === "past").length} of {cells.length} blocks closed
        </span>
        <span
          className={cn(
            "text-[12px]",
            progress.result >= 0 ? "text-brasshi" : "text-over",
          )}
        >
          {progress.result >= 0 ? "+" : ""}
          {formatMoney(progress.result, currency)} banked
        </span>
      </div>
    </div>
  );
}
