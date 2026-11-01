import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { useStore } from "@/lib/store";
import { useTheme } from "@/theme/ThemeProvider";

/** Platform tab bar: UITabBar (Liquid Glass) on iOS, Material bottom navigation on Android. */
export default function TabsLayout() {
  const { data } = useStore();
  const { colors } = useTheme();

  if (!data.user?.onboardingCompleted) return <Redirect href="/onboarding" />;

  return (
    <NativeTabs
      backgroundColor={colors.card}
      iconColor={{ default: colors.textMuted, selected: colors.accentStrong }}
      indicatorColor={colors.elevated}
      tintColor={colors.accentStrong}
      labelStyle={{
        default: { color: colors.textMuted },
        selected: { color: colors.accentStrong },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="list.bullet.rectangle" md="receipt_long" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="overview">
        <NativeTabs.Trigger.Label>Overview</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "chart.pie", selected: "chart.pie.fill" }}
          md="pie_chart"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
