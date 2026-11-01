/**
 * Colour palettes, converted from the original web app's oklch tokens.
 * Components read colours through useTheme(); never hard-code a colour in a component.
 */
export type ThemeId = "brass" | "carbon" | "violet" | "ocean" | "blush" | "sand";

export interface Palette {
  background: string;
  card: string;
  /** Raised controls on a card: segmented tracks, chips, input fills. */
  elevated: string;
  text: string;
  textMuted: string;
  hairline: string;
  /** Brand colour for primary actions and positive figures. */
  accent: string;
  accentStrong: string;
  /** Text/icon colour on top of `accent`. */
  onAccent: string;
  under: string;
  over: string;
}

export interface Theme {
  id: ThemeId;
  label: string;
  hint: string;
  dark: boolean;
  colors: Palette;
}

export const THEMES: Record<ThemeId, Theme> = {
  brass: {
    id: "brass",
    label: "Brass",
    hint: "Dark, warm metal",
    dark: true,
    colors: {
      background: "#0A0A0C",
      card: "#151517",
      elevated: "#1F1F22",
      text: "#F2F0EC",
      textMuted: "#8A8783",
      hairline: "#28282D",
      accent: "#A78967",
      accentStrong: "#CCAB7F",
      onAccent: "#0A0A0C",
      under: "#82AE8B",
      over: "#C26F5B",
    },
  },
  carbon: {
    id: "carbon",
    label: "Carbon",
    hint: "Pure near-black",
    dark: true,
    colors: {
      background: "#040405",
      card: "#0D0D0F",
      elevated: "#18181A",
      text: "#EFEEED",
      textMuted: "#81807D",
      hairline: "#212124",
      accent: "#A6A4A1",
      accentStrong: "#CFCECB",
      onAccent: "#040405",
      under: "#82AE8B",
      over: "#C26F5B",
    },
  },
  violet: {
    id: "violet",
    label: "Violet",
    hint: "Deep plum night",
    dark: true,
    colors: {
      background: "#0D0A13",
      card: "#181320",
      elevated: "#241E2E",
      text: "#F1EFF6",
      textMuted: "#958EA2",
      hairline: "#2E273A",
      accent: "#AC89E8",
      accentStrong: "#CAACFF",
      onAccent: "#0D0A13",
      under: "#82AE8B",
      over: "#C26F5B",
    },
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    hint: "Midnight teal",
    dark: true,
    colors: {
      background: "#040D0F",
      card: "#09171A",
      elevated: "#152326",
      text: "#E9F0F0",
      textMuted: "#7F9091",
      hairline: "#1B2E31",
      accent: "#60BFC4",
      accentStrong: "#8ADBDB",
      onAccent: "#040D0F",
      under: "#82AE8B",
      over: "#C26F5B",
    },
  },
  blush: {
    id: "blush",
    label: "Blush",
    hint: "Light pink paper",
    dark: false,
    colors: {
      background: "#FAF1F2",
      card: "#FFFAFB",
      elevated: "#F2E4E5",
      text: "#271B21",
      textMuted: "#715C66",
      hairline: "#E9D9E0",
      accent: "#934F71",
      accentStrong: "#81385E",
      onAccent: "#FFFAFB",
      under: "#42815A",
      over: "#B94642",
    },
  },
  sand: {
    id: "sand",
    label: "Sand",
    hint: "Light warm paper",
    dark: false,
    colors: {
      background: "#F5F2E9",
      card: "#FCFAF4",
      elevated: "#E8E4DA",
      text: "#1F1913",
      textMuted: "#645C51",
      hairline: "#E1DACC",
      accent: "#815B1F",
      accentStrong: "#6B4300",
      onAccent: "#FCFAF4",
      under: "#42815A",
      over: "#B94642",
    },
  },
};

export const THEME_ORDER: ThemeId[] = ["brass", "carbon", "violet", "ocean", "blush", "sand"];
export const DEFAULT_THEME: ThemeId = "brass";

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && v in THEMES;
}
