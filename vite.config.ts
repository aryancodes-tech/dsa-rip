/**
 * Vite config for TanStack Start (Cloudflare Worker or Vercel via Nitro).
 */
import path from "node:path";
import { defineConfig, loadEnv, mergeConfig, type PluginOption, type UserConfig } from "vite";
import { nitro } from "nitro/vite";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";

/**
 * Cloudflare deploys use wrangler + `src/server.ts`. Vercel sets `VERCEL=1` during build;
 * we disable the Cloudflare Vite plugin and enable Nitro’s `vercel` preset per
 * https://vercel.com/docs/frameworks/full-stack/tanstack-start
 */
const deployTargetVercel = process.env.VERCEL === "1";

export default defineConfig(async ({ command, mode }) => {
  const plugins: PluginOption[] = [
    tailwindcss(),
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
  ];

  if (!deployTargetVercel && command === "build") {
    const { cloudflare } = await import("@cloudflare/vite-plugin");
    plugins.push(cloudflare({ viteEnvironment: { name: "ssr" } }));
  }

  plugins.push(
    tanstackStart(
      deployTargetVercel
        ? {}
        : {
            /** SSR error wrapper for Cloudflare Worker entry (`wrangler.jsonc` `main`). */
            server: { entry: "server" },
            importProtection: {
              behavior: "error",
              client: {
                files: ["**/server/**"],
                specifiers: ["server-only"],
              },
            },
          },
    ),
    viteReact(),
  );

  if (deployTargetVercel) {
    plugins.push(nitro({ preset: "vercel" }));
  }

  const envDefine: Record<string, string> = {};
  const loadedEnv = loadEnv(mode, process.cwd(), "VITE_");
  for (const [key, value] of Object.entries(loadedEnv)) {
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  const config: UserConfig = {
    define: envDefine,
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    server: { host: "127.0.0.1", port: 8080, strictPort: true },
    plugins,
  };

  return mergeConfig(config, {});
});
