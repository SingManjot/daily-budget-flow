import { router } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hapticTap } from "@/lib/haptics";
import { Button } from "./ui";

/** Height the native tab bar occupies above the bottom safe area. */
const TAB_BAR = Platform.select({ ios: 54, default: 80 });

/** Primary actions, floating just above the tab bar (tabs navigate; these act). */
export function FloatingActions() {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: (Platform.OS === "ios" ? insets.bottom : 0) + TAB_BAR + 12 }]}
    >
      <Button
        label="Add Expense"
        icon="add"
        style={[styles.shadow, { flex: 1 }]}
        onPress={() => {
          hapticTap();
          router.push("/add-expense");
        }}
      />
      <Button
        label="Money"
        icon="wallet"
        variant="secondary"
        style={styles.shadow}
        onPress={() => {
          hapticTap();
          router.push("/add-money");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", left: 16, right: 16, flexDirection: "row", gap: 10 },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
