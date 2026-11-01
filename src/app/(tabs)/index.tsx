import { Link } from "expo-router";
import { View } from "react-native";
import { FloatingActions } from "@/components/FloatingActions";
import { MonthProgress } from "@/components/MonthProgress";
import { PeriodCard } from "@/components/PeriodCard";
import { Card, EmptyState, ListRow, Screen, SectionHeader, Txt } from "@/components/ui";
import { currentPeriods, monthProgress, relativeDay, summarizeMonth } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { fromISODate, monthKeyOf, monthLabel, periodTypeForDate } from "@/lib/periods";
import { useStore } from "@/lib/store";
import { useTheme } from "@/theme/ThemeProvider";
import { space, tabular, type } from "@/theme/type";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function Home() {
  const { data, currency } = useStore();
  const { colors } = useTheme();
  const now = new Date();
  const monthKey = monthKeyOf(now);
  const month = summarizeMonth(data, monthKey);
  const progress = monthProgress(data, monthKey, now);
  const { weekday, weekend, activeType } = currentPeriods(data, now);
  const recent = [...data.expenses]
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);
  const saved = progress.result >= 0;
  const resultColor = saved ? colors.accentStrong : colors.over;
  const name = data.user?.name ?? "";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen
        eyebrow={greeting()}
        title={name}
        trailing={
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.elevated,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <Txt style={type.headline} color={colors.accentStrong}>
              {name.slice(0, 1).toUpperCase() || "?"}
            </Txt>
          </View>
        }
      >
        <Txt style={type.sectionHeader} muted>
          {monthLabel(monthKey)}
        </Txt>
        {progress.hasSettled ? (
          <>
            <View
              style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: space.sm }}
            >
              <Txt style={[type.hero, tabular]} color={resultColor}>
                {formatMoney(progress.result, currency)}
              </Txt>
              <Txt style={type.display} color={resultColor}>
                {saved ? "saved" : "overspent"}
              </Txt>
            </View>
            <Txt style={[type.subhead, { marginTop: space.sm }]} muted>
              {formatMoney(month.spent, currency)} spent so far ·{" "}
              {formatMoney(month.planned, currency)} planned
            </Txt>
          </>
        ) : (
          <>
            <Txt
              style={[type.display, { marginTop: space.sm, lineHeight: 40 }]}
              color={colors.accentStrong}
            >
              Let&apos;s see how you do this month.
            </Txt>
            <Txt style={[type.subhead, { marginTop: space.sm }]} muted>
              {formatMoney(month.spent, currency)} spent so far · savings appear when this
              week&apos;s blocks close
            </Txt>
          </>
        )}

        <View style={{ marginTop: space.xl, gap: space.md }}>
          <MonthProgress progress={progress} currency={currency} />
          <PeriodCard summary={weekday} active={activeType === "weekday"} currency={currency} />
          <PeriodCard summary={weekend} active={activeType === "weekend"} currency={currency} />
        </View>

        <SectionHeader
          title="Recent"
          trailing={
            <Link
              href="/history"
              style={[type.subhead, { color: colors.accentStrong, padding: 4 }]}
            >
              See All
            </Link>
          }
        />
        {recent.length === 0 ? (
          <EmptyState
            title="No spending yet"
            message="Add your first expense to start tracking this month."
          />
        ) : (
          <Card padded={false}>
            {recent.map((e, i) => {
              const cat = data.categories.find((c) => c.id === e.categoryId);
              const kind =
                periodTypeForDate(fromISODate(e.date)) === "weekday" ? "Weekday" : "Weekend";
              return (
                <ListRow
                  key={e.id}
                  first={i === 0}
                  icon={cat?.icon}
                  title={e.note || cat?.name || "Expense"}
                  subtitle={`${cat?.name ?? "Other"} · ${kind} · ${relativeDay(e.date)}`}
                  value={formatMoney(e.amount, currency)}
                />
              );
            })}
          </Card>
        )}
      </Screen>
      <FloatingActions />
    </View>
  );
}
