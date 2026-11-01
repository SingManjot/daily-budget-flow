import { View } from "react-native";
import { formatMoney } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { space, tabular, type } from "@/theme/type";
import { Card, EmptyState, ProgressBar, Txt } from "./ui";

export function SplitBar({
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
  const { colors } = useTheme();
  return (
    <Card>
      <View
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}
      >
        <Txt style={type.sectionHeader} muted>
          {label}
        </Txt>
        <Txt style={[type.subhead, tabular]}>
          {formatMoney(spent, currency)}
          <Txt style={type.subhead} muted>
            {" "}
            / {formatMoney(planned, currency)}
          </Txt>
        </Txt>
      </View>
      <View style={{ marginTop: space.md }}>
        <ProgressBar
          value={planned > 0 ? spent / planned : 0}
          color={spent > planned ? colors.over : colors.accent}
        />
      </View>
    </Card>
  );
}

export function CategoryBreakdown({
  totals,
  currency,
}: {
  totals: { categoryId: string; name: string; total: number }[];
  currency: string;
}) {
  const { colors } = useTheme();
  if (!totals.length)
    return (
      <EmptyState
        title="No categories yet"
        message="Category totals appear once you add expenses."
      />
    );
  const max = totals[0]?.total ?? 1;
  return (
    <Card style={{ gap: space.lg }}>
      {totals.map((c) => (
        <View key={c.categoryId}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Txt style={type.subhead} numberOfLines={1}>
              {c.name}
            </Txt>
            <Txt style={[type.subhead, tabular, { fontWeight: "600" }]}>
              {formatMoney(c.total, currency)}
            </Txt>
          </View>
          <View style={{ marginTop: 6 }}>
            <ProgressBar value={c.total / max} color={colors.accent} />
          </View>
        </View>
      ))}
    </Card>
  );
}

/** "₹1,200 saved" hero line used on Overview and month detail. */
export function ResultHero({ result, currency }: { result: number; currency: string }) {
  const { colors } = useTheme();
  const saved = result >= 0;
  const color = saved ? colors.accentStrong : colors.over;
  return (
    <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: space.sm }}>
      <Txt style={[type.hero, tabular]} color={color}>
        {formatMoney(result, currency)}
      </Txt>
      <Txt style={type.display} color={color}>
        {saved ? "saved" : "overspent"}
      </Txt>
    </View>
  );
}
