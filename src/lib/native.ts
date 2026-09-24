import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Keyboard } from "@capacitor/keyboard";
import type { ThemeId } from "@/lib/theme";

const isNative = () => Capacitor.isNativePlatform();

/** Background color of each theme, used to tint the Android status bar. */
const STATUS_BAR_COLORS: Record<ThemeId, string> = {
  brass: "#17171a",
  carbon: "#0a0a0b",
  violet: "#14101d",
  ocean: "#0b1416",
  blush: "#faf3f4",
  sand: "#f7f4ee",
};

const LIGHT_THEMES: ThemeId[] = ["blush", "sand"];

/** Match the Android status bar to the active theme. No-op on web. */
export async function syncStatusBar(theme: ThemeId) {
  if (!isNative()) return;
  try {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: STATUS_BAR_COLORS[theme] });
    await StatusBar.setStyle({
      style: LIGHT_THEMES.includes(theme) ? Style.Light : Style.Dark,
    });
  } catch {
    /* plugin unavailable */
  }
}

/** One-time native setup: keyboard accessory bar off, resize handled by webview. */
export async function initNative() {
  if (!isNative()) return;
  try {
    await Keyboard.setAccessoryBarVisible({ isVisible: false });
  } catch {
    /* plugin unavailable */
  }
}

/** Light tap feedback for primary actions. No-op on web. */
export function hapticTap() {
  if (!isNative()) return;
  Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
}

/** Slightly stronger feedback when something is saved. No-op on web. */
export function hapticSuccess() {
  if (!isNative()) return;
  Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
}
