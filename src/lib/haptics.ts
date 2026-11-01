import * as Haptics from "expo-haptics";

/** Light tap for primary actions. */
export function hapticTap() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Confirmation when something is saved. */
export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Selection change (segmented controls, chips). */
export function hapticSelect() {
  Haptics.selectionAsync().catch(() => {});
}
