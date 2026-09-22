import { Check } from "lucide-react";
import { THEMES } from "@/lib/theme";
import { useTheme } from "@/lib/use-theme";

export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {THEMES.map((t) => {
        const active = t.id === theme;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            aria-label={`${t.label} theme`}
            className={`rounded-xl p-2.5 text-left ring-1 transition ${
              active ? "bg-accent ring-brass" : "bg-card ring-hair active:bg-accent"
            }`}
          >
            <span className="relative flex h-9 items-center justify-center gap-1 rounded-lg" style={{ background: t.swatch[0] }}>
              <span className="size-3.5 rounded-full" style={{ background: t.swatch[1] }} />
              <span className="size-2.5 rounded-full" style={{ background: t.swatch[2] }} />
              {active && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-brass">
                  <Check className="size-2.5 text-background" strokeWidth={3} />
                </span>
              )}
            </span>
            <span className="mt-2 block text-[12px] font-medium">{t.label}</span>
            <span className="block text-[10px] leading-tight text-mut">{t.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
