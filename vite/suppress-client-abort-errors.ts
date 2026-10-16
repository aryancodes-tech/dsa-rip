/**
 * TanStack Start’s Vite middleware `console.error`s when `sendNodeResponse`
 * fails because the browser already closed the socket (HMR / navigation).
 * Filter those client-abort errors so the terminal stays useful.
 */
import type { Plugin } from "vite";
import { isClientAbortError } from "../src/lib/client-abort";

/** Vite plugin: silence `console.error` for client disconnects during `vite dev`. */
export function suppressClientAbortConsoleErrors(): Plugin {
  return {
    name: "dsa-rip:suppress-client-abort-console-errors",
    apply: "serve",
    configureServer() {
      const originalError = console.error.bind(console);
      console.error = (...args: unknown[]) => {
        if (args.some((arg) => isClientAbortError(arg))) return;
        originalError(...args);
      };
    },
  };
}
