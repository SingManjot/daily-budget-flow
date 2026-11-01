import { SymbolView } from "expo-symbols";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";

type SymbolName = ComponentProps<typeof SymbolView>["name"];

/**
 * Platform icons: SF Symbols on iOS, Material Symbols on Android.
 * Add a pair here rather than using SymbolView directly, so both platforms stay covered.
 */
export const ICONS = {
  add: { ios: "plus", android: "add" },
  wallet: { ios: "wallet.pass", android: "account_balance_wallet" },
  chevron: { ios: "chevron.right", android: "chevron_right" },
  delete: { ios: "trash", android: "delete" },
  edit: { ios: "pencil", android: "edit" },
  calendar: { ios: "calendar", android: "calendar_today" },
  check: { ios: "checkmark", android: "check" },
  // categories (keys match Category.icon values stored in user data)
  utensils: { ios: "fork.knife", android: "restaurant" },
  "shopping-bag": { ios: "bag", android: "shopping_bag" },
  car: { ios: "car", android: "directions_car" },
  clapperboard: { ios: "film", android: "movie" },
  receipt: { ios: "doc.text", android: "receipt_long" },
  "circle-dashed": { ios: "circle.dashed", android: "radio_button_unchecked" },
} satisfies Record<string, SymbolName>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 20,
  color,
}: {
  name: IconName;
  size?: number;
  color: ColorValue;
}) {
  return <SymbolView name={ICONS[name]} size={size} tintColor={color} />;
}

/** Category icon by stored name, falling back to the dashed circle for unknown values. */
export function categoryIcon(icon: string | undefined): IconName {
  return icon && icon in ICONS ? (icon as IconName) : "circle-dashed";
}
