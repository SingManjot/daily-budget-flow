export type ThemeId = "brass" | "carbon" | "violet" | "ocean" | "blush" | "sand";

export const THEMES: { id: ThemeId; label: string; hint: string; swatch: string[] }[] = [
  { id: "brass", label: "Brass", hint: "Dark, warm metal", swatch: ["#17171a", "#c8a24a", "#e8c56a"] },
  { id: "carbon", label: "Carbon", hint: "Pure near-black", swatch: ["#0a0a0b", "#9aa0a6", "#e8eaed"] },
  { id: "violet", label: "Violet", hint: "Deep plum night", swatch: ["#14101d", "#a78bfa", "#c4b5fd"] },
  { id: "ocean", label: "Ocean", hint: "Midnight teal", swatch: ["#0b1416", "#3ec6c6", "#7de0e0"] },
  { id: "blush", label: "Blush", hint: "Light pink paper", swatch: ["#faf3f4", "#b3547a", "#2b1d24"] },
  { id: "sand", label: "Sand", hint: "Light warm paper", swatch: ["#f7f4ee", "#a97e2f", "#241f18"] },
];

export const DEFAULT_THEME: ThemeId = "brass";

const STORAGE_KEY = "spend-tracker:theme";

export function isThemeId(v: unknown): v is ThemeId {
  return typeof v === "string" && THEMES.some((t) => t.id === v);
}

export function loadTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isThemeId(v) ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function applyTheme(id: ThemeId) {
  const root = document.documentElement;
  if (id === DEFAULT_THEME) root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", id);
  root.classList.toggle("light", id === "blush" || id === "sand");
}

export function saveTheme(id: ThemeId) {
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}
