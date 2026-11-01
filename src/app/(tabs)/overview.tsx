import { View } from "react-native";
import { CategoryBreakdown, ResultHero, SplitBar } from "@/components/Breakdown";
import { FloatingActions } from "@/components/FloatingActions";
import { LineChart } from "@/components/LineChart";
import { Card, EmptyState, Screen, SectionHeader, Txt } from "@/components/ui";
import { categoryTotals, monthTrend, summarizeMonth } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { monthKeyOf, monthLabel } from "@/lib/periods";
import { useStore } from "@/lib/store";
import { useTheme } from "@/theme/ThemeProvider";
import { space, tabular, type } from "@/theme/type";

export default function Overview() {
  const { data, currency } = useStore();
  const { colors } = useTheme();
  const monthKey = monthKeyOf(new Date());
  const month = summarizeMonth(data, monthKey);
  const saved = month.result >= 0;

  const stats = [
    { label: "Planned", value: month.planned, color: colors.text },
    { label: "Spent", value: month.spent, color: colors.text },
    {
      label: saved ? "Saved" : "Over",
      value: month.result,
      color: saved ? colors.accentStrong : colors.over,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen title="Overview">
        <Txt style={type.sectionHeader} muted>
          {monthLabel(monthKey)}
        </Txt>
        <ResultHero result={month.result} currency={currency} />

        <View style={{ flexDirection: "row", gap: space.sm, marginTop: space.xl }}>
          {stats.map((s) => (
            <Card key={s.label} style={{ flex: 1, padding: space.md }}>
              <Txt style={type.caption} muted>
                {s.label}
              </Txt>
              <Txt
                style={[type.headline, tabular, { marginTop: 4 }]}
                color={s.color}
                numberOfLines={1}
              >
                {formatMoney(s.value, currency)}
              </Txt>
            </Card>
          ))}
        </View>
        {month.added > 0 && (
          <Txt style={[type.footnote, { marginTop: space.md }]} muted>
            {formatMoney(month.added, currency)} extra money added this month, kept separate from
            your plan.
          </Txt>
        )}

        <SectionHeader title="Weekday vs weekend" />
        <View style={{ gap: space.md }}>
          <SplitBar
            label="Weekdays"
            spent={month.weekday.spent}
            planned={month.weekday.planned}
            currency={currency}
          />
          <SplitBar
            label="Weekend"
            spent={month.weekend.spent}
            planned={month.weekend.planned}
            currency={currency}
          />
        </View>

        <SectionHeader title="Spending by week" />
        {month.spent > 0 ? (
          <Card>
            <LineChart
              points={monthTrend(data, monthKey).map((w) => ({
                label: w.label.replace("Week ", "W"),
                value: w.spent,
              }))}
            />
          </Card>
        ) : (
          <EmptyState
            title="No spending yet"
            message="Add your first expense to start tracking this month."
          />
        )}

        <SectionHeader title="Where it went" />
        <CategoryBreakdown totals={categoryTotals(data, monthKey)} currency={currency} />
      </Screen>
      <FloatingActions />
    </View>
  );
}
