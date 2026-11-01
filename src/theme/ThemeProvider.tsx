import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { kv } from "@/lib/kv";
import { DEFAULT_THEME, THEMES, isThemeId, type Theme, type ThemeId } from "./palettes";

const KEY = "spend-tracker:theme";

interface ThemeContextValue extends Theme {
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadTheme(): ThemeId {
  try {
    const v = kv.get(KEY);
    return isThemeId(v) ? v : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<ThemeId>(loadTheme);

  const setTheme = useCallback((next: ThemeId) => {
    setId(next);
    try {
      kv.set(KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ ...THEMES[id], setTheme }), [id, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
