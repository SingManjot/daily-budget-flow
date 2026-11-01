import { View } from "react-native";
import type { PeriodSummary } from "@/lib/calc";
import { formatMoney } from "@/lib/format";
import { formatPeriodRange } from "@/lib/periods";
import { useTheme } from "@/theme/ThemeProvider";
import { space, tabular, type } from "@/theme/type";
import { Card, ProgressBar, Txt } from "./ui";

export function PeriodCard({
  summary,
  active,
  currency,
  showRange = false,
}: {
  summary: PeriodSummary;
  active: boolean;
  currency: string;
  showRange?: boolean;
}) {
  const { colors } = useTheme();
  const { period, budget, spent, added, remaining } = summary;
  const total = budget + added;
  const over = remaining < 0;
  const days = period.type === "weekday" ? "Mon–Fri" : "Sat–Sun";

  return (
    <Card style={active ? { borderColor: colors.accent, borderWidth: 1 } : null}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Txt style={type.sectionHeader} color={active ? colors.accentStrong : colors.textMuted}>
          {period.type === "weekday" ? "Weekdays" : "Weekend"}
        </Txt>
        <Txt style={type.footnote} muted>
          {showRange ? formatPeriodRange(period) : active ? `Now · ${days}` : days}
        </Txt>
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: space.sm, gap: 6 }}>
        <Txt style={[type.title, tabular]}>{formatMoney(spent, currency)}</Txt>
        <Txt style={[type.subhead, tabular]} muted>
          / {formatMoney(budget, currency)}
        </Txt>
      </View>
      <View style={{ marginTop: space.md }}>
        <ProgressBar
          value={total > 0 ? spent / total : 0}
          color={over ? colors.over : colors.accent}
        />
      </View>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: space.md }}>
        <Txt style={type.footnote} muted>
          {formatMoney(added, currency)} added
        </Txt>
        <Txt
          style={[type.subhead, tabular, { fontWeight: "600" }]}
          color={over ? colors.over : active ? colors.accentStrong : colors.text}
        >
          {formatMoney(remaining, currency)} {over ? "over" : "left"}
        </Txt>
      </View>
    </Card>
  );
}
