import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import { FloatingActions } from "@/components/FloatingActions";
import { Icon } from "@/components/Icon";
import { LineChart } from "@/components/LineChart";
import { Card, EmptyState, ListRow, Screen, SectionHeader, Segmented, Txt } from "@/components/ui";
import { historyTrend, monthsWithData, relativeDay, summarizeMonth } from "@/lib/calc";
import { formatCompact, formatMoney } from "@/lib/format";
import { hapticSuccess } from "@/lib/haptics";
import { fromISODate, monthLabel, periodTypeForDate } from "@/lib/periods";
import { useStore } from "@/lib/store";
import type { Expense } from "@/lib/types";
import { useTheme } from "@/theme/ThemeProvider";
import { type } from "@/theme/type";

export default function History() {
  const { data, currency, deleteExpense } = useStore();
  const { colors } = useTheme();
  const [range, setRange] = useState(6);
  const trend = historyTrend(data, range);
  const allMonths = monthsWithData(data);
  const months = allMonths.filter(
    (k) => k === allMonths[0] || data.expenses.some((e) => e.date.startsWith(k)),
  );
  const recent = [...data.expenses]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);

  const confirmDelete = (e: Expense, label: string) =>
    Alert.alert("Delete Expense?", `${label} · ${formatMoney(e.amount, currency)}`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteExpense(e.id);
          hapticSuccess();
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen title="History">
        <SectionHeader title="Monthly trend" />
        <View style={{ marginBottom: 12 }}>
          <Segmented
            value={range}
            onChange={setRange}
            options={[3, 6, 12].map((m) => ({ value: m, label: `${m} months` }))}
          />
        </View>
        {trend.length > 1 ? (
          <Card>
            <LineChart
              points={trend.map((t) => ({
                label: monthLabel(t.monthKey, false).slice(0, 3),
                value: t.spent,
              }))}
            />
          </Card>
        ) : (
          <EmptyState
            title="Your trend will appear here"
            message="It shows up once you have more than one month of spending."
          />
        )}

        <SectionHeader title="Past months" />
        <Card padded={false}>
          {months.map((k, i) => {
            const s = summarizeMonth(data, k);
            const saved = s.result >= 0;
            return (
              <ListRow
                key={k}
                first={i === 0}
                title={monthLabel(k)}
                subtitle={`${formatCompact(s.spent, currency)} spent · ${s.transactions} ${
                  s.transactions === 1 ? "transaction" : "transactions"
                }`}
                onPress={() => router.push({ pathname: "/month/[month]", params: { month: k } })}
                trailing={
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Txt
                      style={[type.subhead, { fontWeight: "600" }]}
                      color={saved ? colors.accentStrong : colors.over}
                    >
                      {formatMoney(s.result, currency)} {saved ? "saved" : "over"}
                    </Txt>
                    <Icon name="chevron" size={14} color={colors.textMuted} />
                  </View>
                }
              />
            );
          })}
        </Card>

        <SectionHeader title="Recent transactions" />
        {recent.length === 0 ? (
          <EmptyState
            title="No spending yet"
            message="Add your first expense to start tracking this month."
          />
        ) : (
          <>
            <Card padded={false}>
              {recent.map((e, i) => {
                const cat = data.categories.find((c) => c.id === e.categoryId);
                const label = e.note || cat?.name || "Expense";
                const kind =
                  periodTypeForDate(fromISODate(e.date)) === "weekday" ? "Weekday" : "Weekend";
                return (
                  <ListRow
                    key={e.id}
                    first={i === 0}
                    icon={cat?.icon}
                    title={label}
                    subtitle={`${cat?.name ?? "Other"} · ${kind} · ${relativeDay(e.date)}`}
                    value={formatMoney(e.amount, currency)}
                    onPress={() => router.push({ pathname: "/add-expense", params: { id: e.id } })}
                    onLongPress={() => confirmDelete(e, label)}
                  />
                );
              })}
            </Card>
            <Txt style={[type.footnote, { marginTop: 8, paddingHorizontal: 4 }]} muted>
              Tap to edit · Long-press to delete
            </Txt>
          </>
        )}
      </Screen>
      <FloatingActions />
    </View>
  );
}
