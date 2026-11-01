import { format } from "date-fns";
import { Stack, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { CategoryBreakdown, ResultHero, SplitBar } from "@/components/Breakdown";
import { Icon } from "@/components/Icon";
import { Card, EmptyState, ListRow, Screen, SectionHeader, Txt } from "@/components/ui";
import { categoryTotals, expensesInMonth, monthPeriodSummaries, summarizeMonth } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { formatPeriodRange, fromISODate, monthLabel, periodContains } from "@/lib/periods";
import { useStore } from "@/lib/store";
import { useTheme } from "@/theme/ThemeProvider";
import { space, tabular, type } from "@/theme/type";

export default function MonthDetail() {
  const { month: monthKey = "" } = useLocalSearchParams<{ month: string }>();
  const { data, currency } = useStore();
  const { colors } = useTheme();
  const [open, setOpen] = useState<string | null>(null);
  const s = summarizeMonth(data, monthKey);
  const periods = monthPeriodSummaries(data, monthKey);
  const expenses = expensesInMonth(data.expenses, monthKey).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const catName = (id: string) => data.categories.find((c) => c.id === id);

  return (
    <>
      <Stack.Screen options={{ title: monthLabel(monthKey), headerBackTitle: "History" }} />
      <Screen bottomInset={space.xxl}>
        <ResultHero result={s.result} currency={currency} />
        <Txt style={[type.subhead, { marginTop: space.sm }]} muted>
          {formatMoney(s.spent, currency)} spent of {formatMoney(s.planned, currency)} planned
        </Txt>

        <View style={{ gap: space.md, marginTop: space.xl }}>
          <SplitBar
            label="Weekdays"
            spent={s.weekday.spent}
            planned={s.weekday.planned}
            currency={currency}
          />
          <SplitBar
            label="Weekend"
            spent={s.weekend.spent}
            planned={s.weekend.planned}
            currency={currency}
          />
        </View>

        <SectionHeader title="Categories" />
        <CategoryBreakdown totals={categoryTotals(data, monthKey)} currency={currency} />

        <SectionHeader title="Periods" />
        <Card padded={false}>
          {periods.map((p, i) => {
            const diff = p.budget - p.spent;
            const isOpen = open === p.period.id;
            const rows = expenses.filter((e) => periodContains(p.period, e.date));
            return (
              <View
                key={p.period.id}
                style={i > 0 ? { borderTopWidth: 0.5, borderTopColor: colors.hairline } : null}
              >
                <Pressable
                  onPress={() => setOpen(isOpen ? null : p.period.id)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isOpen }}
                  style={({ pressed }) => [
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      padding: space.lg,
                      gap: space.md,
                    },
                    pressed && { backgroundColor: colors.elevated },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Txt style={type.body}>
                      {p.period.type === "weekday" ? "Weekdays" : "Weekend"} ·{" "}
                      {formatPeriodRange(p.period)}
                    </Txt>
                    <Txt style={[type.footnote, tabular]} muted>
                      {formatMoney(p.spent, currency)} of {formatMoney(p.budget, currency)}
                    </Txt>
                  </View>
                  <Txt
                    style={[type.subhead, tabular, { fontWeight: "600" }]}
                    color={diff >= 0 ? colors.accentStrong : colors.over}
                  >
                    {formatMoney(diff, currency)} {diff >= 0 ? "under" : "over"}
                  </Txt>
                  <View style={{ transform: [{ rotate: isOpen ? "90deg" : "0deg" }] }}>
                    <Icon name="chevron" size={14} color={colors.textMuted} />
                  </View>
                </Pressable>
                {isOpen &&
                  (rows.length ? (
                    rows.map((e) => (
                      <ListRow
                        key={e.id}
                        icon={catName(e.categoryId)?.icon}
                        title={e.note || catName(e.categoryId)?.name || "Expense"}
                        subtitle={format(fromISODate(e.date), "EEE, d MMM")}
                        value={formatMoney(e.amount, currency)}
                      />
                    ))
                  ) : (
                    <Txt
                      style={[
                        type.footnote,
                        { paddingHorizontal: space.lg, paddingBottom: space.lg },
                      ]}
                      muted
                    >
                      No transactions in this period.
                    </Txt>
                  ))}
              </View>
            );
          })}
        </Card>

        <SectionHeader title="All transactions" />
        {expenses.length ? (
          <Card padded={false}>
            {expenses.map((e, i) => (
              <ListRow
                key={e.id}
                first={i === 0}
                icon={catName(e.categoryId)?.icon}
                title={e.note || catName(e.categoryId)?.name || "Expense"}
                subtitle={`${catName(e.categoryId)?.name ?? "Other"} · ${format(fromISODate(e.date), "EEE, d MMM")}`}
                value={formatMoney(e.amount, currency)}
              />
            ))}
          </Card>
        ) : (
          <EmptyState title="Nothing recorded" message="No spending in this month." />
        )}
      </Screen>
    </>
  );
}
