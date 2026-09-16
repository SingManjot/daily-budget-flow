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
  "utensils": Utensils,
  "shopping-bag": ShoppingBag,
  "car": Car,
  "clapperboard": Clapperboard,
  "receipt": Receipt,
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
