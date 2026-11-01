import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";

/**
 * The app is fully client-side (data lives in localStorage), so the build is static:
 * TanStack Start prerenders the routes into dist/client, which is both the web deploy
 * folder and Capacitor's webDir. There is no runtime server.
 */
export default defineConfig({
  server: { port: 8080 },
  resolve: {
    // "@/..." imports, read from tsconfig.json "paths".
    tsconfigPaths: true,
    dedupe: ["react", "react-dom"],
  },
  plugins: [
    tailwindcss(),
    tanstackStart({
      prerender: { enabled: true, crawlLinks: true },
      // Nothing under a server/ folder may end up in the client bundle.
      importProtection: {
        behavior: "error",
        client: { files: ["**/server/**"], specifiers: ["server-only"] },
      },
    }),
    viteReact(),
  ],
});
