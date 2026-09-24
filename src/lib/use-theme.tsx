import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { applyTheme, loadTheme, saveTheme, DEFAULT_THEME, type ThemeId } from "@/lib/theme";
import { syncStatusBar } from "@/lib/native";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const t = loadTheme();
    setThemeState(t);
    applyTheme(t);
    syncStatusBar(t);
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    setThemeState(id);
    applyTheme(id);
    saveTheme(id);
    syncStatusBar(id);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
