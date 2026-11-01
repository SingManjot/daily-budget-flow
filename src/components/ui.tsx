import type { ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/theme/ThemeProvider";
import { radius, space, type } from "@/theme/type";
import { hapticSelect } from "@/lib/haptics";
import { Icon, categoryIcon } from "./Icon";

/** Room left under scrolling content for the floating action row and the tab bar. */
export const BOTTOM_CLEARANCE = 168;

/** Scrollable tab screen with a large title, matching the platform's large-title layout. */
export function Screen({
  title,
  eyebrow,
  trailing,
  children,
  bottomInset = BOTTOM_CLEARANCE,
}: {
  title?: string;
  eyebrow?: string;
  trailing?: ReactNode;
  children: ReactNode;
  bottomInset?: number;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingBottom: insets.bottom + bottomInset,
        paddingHorizontal: space.xl,
      }}
      contentInsetAdjustmentBehavior="never"
    >
      {(title || eyebrow) && (
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            {eyebrow ? (
              <Txt style={[type.subhead]} muted>
                {eyebrow}
              </Txt>
            ) : null}
            {title ? (
              <Txt style={type.largeTitle} numberOfLines={1}>
                {title}
              </Txt>
            ) : null}
          </View>
          {trailing}
        </View>
      )}
      {children}
    </ScrollView>
  );
}

/** Text in the current theme colour. */
export function Txt({
  children,
  style,
  muted,
  color,
  numberOfLines,
}: {
  children: ReactNode;
  style?: StyleProp<TextStyle>;
  muted?: boolean;
  color?: string;
  numberOfLines?: number;
}) {
  const { colors } = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ color: color ?? (muted ? colors.textMuted : colors.text), fontSize: 17 }, style]}
    >
      {children}
    </Text>
  );
}

export function Card({
  children,
  style,
  padded = true,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: radius.card,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: colors.hairline,
          padding: padded ? space.lg : 0,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionHeader({ title, trailing }: { title: string; trailing?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Txt style={type.sectionHeader} muted>
        {title}
      </Txt>
      {trailing}
    </View>
  );
}

/** Grouped-list row: leading icon tile, title/subtitle, trailing value. */
export function ListRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  onLongPress,
  trailing,
  first,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  trailing?: ReactNode;
  first?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={!onPress && !onLongPress}
      android_ripple={{ color: colors.hairline }}
      style={({ pressed }) => [
        styles.row,
        !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline },
        pressed && onPress ? { backgroundColor: colors.elevated } : null,
      ]}
    >
      {icon !== undefined && <CategoryBadge icon={icon} />}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Txt style={type.body} numberOfLines={1}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt style={type.footnote} muted numberOfLines={1}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {value ? <Txt style={[type.body, { fontWeight: "600" }]}>{value}</Txt> : null}
      {trailing}
    </Pressable>
  );
}

export function CategoryBadge({ icon }: { icon?: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.badge, { backgroundColor: colors.elevated }]}>
      <Icon name={categoryIcon(icon)} size={18} color={colors.accentStrong} />
    </View>
  );
}

export function ProgressBar({ value, color }: { value: number; color: string }) {
  const { colors } = useTheme();
  const pct = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  return (
    <View style={[styles.track, { backgroundColor: colors.elevated }]}>
      <View
        style={{ width: `${pct * 100}%`, height: "100%", borderRadius: 3, backgroundColor: color }}
      />
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = "primary",
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "destructive" | "plain" | "plain-destructive";
  icon?: "add" | "wallet";
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const bg =
    variant === "primary"
      ? colors.accent
      : variant === "secondary"
        ? colors.elevated
        : variant === "destructive"
          ? colors.over
          : "transparent";
  const fg =
    variant === "primary"
      ? colors.onAccent
      : variant === "destructive"
        ? "#FFFFFF"
        : variant === "plain"
          ? colors.accentStrong
          : variant === "plain-destructive"
            ? colors.over
            : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={18} color={fg} /> : null}
      <Text style={[type.headline, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/** iOS-style segmented control; also used on Android, where it reads as a toggle group. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      style={[styles.segmented, { backgroundColor: colors.elevated }]}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              if (!selected) hapticSelect();
              onChange(o.value);
            }}
            style={[
              styles.segment,
              selected && { backgroundColor: colors.card, ...styles.segmentShadow },
            ]}
          >
            <Txt
              style={[type.footnote, { fontWeight: "600" }]}
              color={selected ? colors.text : colors.textMuted}
            >
              {o.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <Card style={{ alignItems: "center", paddingVertical: space.xxl }}>
      <Txt style={type.headline}>{title}</Txt>
      <Txt style={[type.footnote, { marginTop: 4, textAlign: "center" }]} muted>
        {message}
      </Txt>
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: space.lg, gap: space.md },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: space.xxl,
    marginBottom: space.sm,
    paddingHorizontal: space.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.md,
    paddingHorizontal: space.lg,
    minHeight: 56,
    paddingVertical: space.sm,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  track: { height: 6, borderRadius: 3, overflow: "hidden" },
  button: {
    minHeight: 50,
    borderRadius: radius.pill,
    paddingHorizontal: space.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: space.sm,
  },
  segmented: { flexDirection: "row", borderRadius: 10, padding: 2, gap: 2 },
  segment: {
    flex: 1,
    minHeight: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: space.md,
  },
  segmentShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
});
