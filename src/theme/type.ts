import { Platform, type TextStyle } from "react-native";

/**
 * Type scale following the platform text styles (iOS: SF Pro sizes; Android: the same
 * sizes in Roboto). The display serif is the brand voice for hero words only.
 */
export const DISPLAY_FONT = "CormorantGaramond_500Medium_Italic";

export const type = {
  largeTitle: { fontSize: 34, fontWeight: "700", letterSpacing: Platform.OS === "ios" ? 0.4 : 0 },
  title: { fontSize: 22, fontWeight: "700" },
  headline: { fontSize: 17, fontWeight: "600" },
  body: { fontSize: 17 },
  callout: { fontSize: 16 },
  subhead: { fontSize: 15 },
  footnote: { fontSize: 13 },
  caption: { fontSize: 12 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  hero: { fontSize: 40, fontWeight: "700", letterSpacing: -0.5 },
  display: { fontFamily: DISPLAY_FONT, fontSize: 34 },
} satisfies Record<string, TextStyle>;

/** Money and counts line up in columns. */
export const tabular: TextStyle = { fontVariant: ["tabular-nums"] };

export const radius = { card: 20, control: 12, pill: 999 } as const;
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 32 } as const;
