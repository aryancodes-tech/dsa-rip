// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { nitro } from "nitro/vite";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Cloudflare deploys use wrangler + `src/server.ts`. Vercel sets `VERCEL=1` during build;
 * we disable the Cloudflare Vite plugin and enable Nitro’s `vercel` preset per
 * https://vercel.com/docs/frameworks/full-stack/tanstack-start
 */
const deployTargetVercel = process.env.VERCEL === "1";

export default defineConfig({
  cloudflare: deployTargetVercel ? false : undefined,
  tanstackStart: deployTargetVercel
    ? {}
    : {
        /** SSR error wrapper for Cloudflare Worker entry (`wrangler.jsonc` `main`). */
        server: { entry: "server" },
      },
  vite: deployTargetVercel
    ? {
        plugins: [nitro({ preset: "vercel" })],
      }
    : {},
});
