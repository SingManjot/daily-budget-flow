import { useState } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useTheme } from "@/theme/ThemeProvider";
import { type } from "@/theme/type";
import { Txt } from "./ui";

/** Minimal line chart: one series, x labels underneath, no axes. */
export function LineChart({
  points,
  height = 120,
}: {
  points: { label: string; value: number }[];
  height?: number;
}) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const max = Math.max(1, ...points.map((p) => p.value));
  const pad = 8;
  const xs = points.map((_, i) =>
    points.length === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (points.length - 1),
  );
  const ys = points.map((p) => pad + (1 - p.value / max) * (height - pad * 2));
  const d = xs
    .map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${(ys[i] ?? 0).toFixed(1)}`)
    .join(" ");

  return (
    <View onLayout={onLayout}>
      {width > 0 && (
        <Svg width={width} height={height}>
          <Path
            d={d}
            stroke={colors.accentStrong}
            strokeWidth={2.5}
            fill="none"
            strokeLinejoin="round"
          />
          {xs.map((x, i) => (
            <Circle key={i} cx={x} cy={ys[i] ?? 0} r={3.5} fill={colors.accentStrong} />
          ))}
        </Svg>
      )}
      <View style={{ flexDirection: "row", marginTop: 6 }}>
        {points.map((p, i) => (
          <Txt key={i} style={[type.caption, { flex: 1, textAlign: "center" }]} muted>
            {p.label}
          </Txt>
        ))}
      </View>
    </View>
  );
}
