import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.dailybudgetflow.app",
  appName: "Daily Budget Flow",
  // Static prerendered build from `npm run build` (see vite.config.ts).
  webDir: "dist/client",
};

export default config;
