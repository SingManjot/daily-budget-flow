import {
  CormorantGaramond_500Medium_Italic,
  useFonts,
} from "@expo-google-fonts/cormorant-garamond";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StoreProvider } from "@/lib/store";
import { ThemeProvider, useTheme } from "@/theme/ThemeProvider";

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Native bottom sheet: grabber, rounded top, sized to its content. */
const sheet = {
  presentation: "formSheet",
  sheetGrabberVisible: true,
  sheetCornerRadius: 28,
  sheetAllowedDetents: "fitToContents",
  headerShown: false,
} as const;

function RootStack() {
  const { colors, dark } = useTheme();
  return (
    <>
      <StatusBar style={dark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.accentStrong,
          headerTitleStyle: { color: colors.text },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        <Stack.Screen name="month/[month]" options={{ headerShown: true, title: "" }} />
        <Stack.Screen
          name="add-expense"
          options={{ ...sheet, contentStyle: { backgroundColor: colors.background } }}
        />
        <Stack.Screen
          name="add-money"
          options={{ ...sheet, contentStyle: { backgroundColor: colors.background } }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ CormorantGaramond_500Medium_Italic });
  const ready = fontsLoaded || fontError != null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StoreProvider>
          <RootStack />
        </StoreProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
