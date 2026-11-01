import { cn } from "@/lib/utils";

/**
 * iOS-style segmented control: equal-width segments on a muted track, the
 * selected one raised on a card-coloured thumb. Single choice only.
 */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  /** Accessible name for the group. */
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "grid auto-cols-fr grid-flow-col gap-0.5 rounded-[10px] bg-muted p-0.5",
        className,
      )}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-8 rounded-[8px] px-3 text-[13px] font-medium transition-all duration-200",
              selected ? "bg-card text-foreground shadow-sm shadow-black/20" : "text-mut",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
