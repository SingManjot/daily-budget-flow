import {
  Car,
  CircleDashed,
  Clapperboard,
  Receipt,
  ShoppingBag,
  Utensils,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  utensils: Utensils,
  "shopping-bag": ShoppingBag,
  car: Car,
  clapperboard: Clapperboard,
  receipt: Receipt,
  "circle-dashed": CircleDashed,
};

export function CategoryIcon({
  icon,
  className,
}: {
  icon?: string | undefined;
  className?: string | undefined;
}) {
  const Icon = MAP[icon ?? "circle-dashed"] ?? CircleDashed;
  return <Icon className={className} strokeWidth={1.5} />;
}

/** Rounded-square icon tile used at the leading edge of list rows (iOS list style). */
export function CategoryBadge({
  icon,
  className,
}: {
  icon?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <span
      className={`grid size-9 shrink-0 place-items-center rounded-[10px] bg-brass/12 text-brasshi ${className ?? ""}`}
    >
      <CategoryIcon icon={icon} className="size-[18px]" />
    </span>
  );
}
