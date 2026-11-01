import { View } from "react-native";
import type { MonthProgress as MonthProgressData } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { space, tabular, type } from "@/theme/type";
import { Card, Txt } from "./ui";

/**
 * One column per weekday/weekend block this month: height is the block's planned budget,
 * fill is what was spent. Accent when under, red when over, faded while upcoming.
 */
export function MonthProgress({
  progress,
  currency,
}: {
  progress: MonthProgressData;
  currency: string;
}) {
  const { colors } = useTheme();
  const { cells } = progress;
  const max = Math.max(1, ...cells.map((c) => Math.max(c.planned, c.spent)));
  const closed = cells.filter((c) => c.state === "past").length;

  return (
    <Card>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Txt style={type.sectionHeader} muted>
          Month so far
        </Txt>
        <Txt style={[type.footnote, tabular]} muted>
          {closed} of {cells.length} closed
        </Txt>
      </View>

      <View
        style={{
          height: 96,
          flexDirection: "row",
          alignItems: "flex-end",
          gap: 6,
          marginTop: space.lg,
        }}
      >
        {cells.map((c) => {
          const over = c.spent > c.planned;
          const h = Math.max(c.planned, c.spent, max * 0.08) / max;
          const fill = h > 0 ? Math.min(1, c.spent / (h * max)) : 0;
          const current = c.state === "current";
          return (
            <View key={c.id} style={{ flex: 1, height: "100%", justifyContent: "flex-end" }}>
              <View
                style={{
                  height: `${h * 100}%`,
                  borderRadius: 6,
                  overflow: "hidden",
                  justifyContent: "flex-end",
                  backgroundColor: colors.elevated,
                  opacity: c.state === "future" ? 0.45 : 1,
                  borderWidth: current ? 1 : 0,
                  borderColor: colors.accent,
                }}
              >
                <View
                  style={{
                    height: `${fill * 100}%`,
                    backgroundColor: over
                      ? colors.over
                      : current
                        ? colors.accentStrong
                        : colors.accent,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: "row", gap: 6, marginTop: 6 }}>
        {cells.map((c) => (
          <Txt
            key={c.id}
            style={[type.caption, { flex: 1, textAlign: "center" }]}
            color={c.state === "current" ? colors.accentStrong : colors.textMuted}
          >
            {c.type === "weekday" ? "WD" : "WE"}
          </Txt>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: space.md,
          paddingTop: space.md,
          borderTopWidth: 0.5,
          borderTopColor: colors.hairline,
        }}
      >
        <Txt style={[type.footnote, tabular]} muted>
          {formatMoney(progress.settledSpent, currency)} of{" "}
          {formatMoney(progress.settledPlanned, currency)} closed
        </Txt>
        <Txt
          style={[type.footnote, tabular, { fontWeight: "600" }]}
          color={progress.result >= 0 ? colors.accentStrong : colors.over}
        >
          {progress.result >= 0 ? "+" : "−"}
          {formatMoney(progress.result, currency)} banked
        </Txt>
      </View>
    </Card>
  );
}
