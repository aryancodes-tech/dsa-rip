// Captures the original Error out-of-band so server.ts can recover the stack
// when h3 has already swallowed the throw into a generic 500 Response.

import { isClientAbortError } from "./client-abort";

let lastCapturedError: { error: unknown; at: number } | undefined;
const TTL_MS = 5_000;

function record(error: unknown) {
  lastCapturedError = { error, at: Date.now() };
}

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (event) => {
    const error = (event as ErrorEvent).error ?? event;
    record(error);
    if (isClientAbortError(error) && typeof (event as ErrorEvent).preventDefault === "function") {
      (event as ErrorEvent).preventDefault();
    }
  });
  globalThis.addEventListener("unhandledrejection", (event) => {
    const rejection = event as PromiseRejectionEvent;
    record(rejection.reason);
    if (isClientAbortError(rejection.reason) && typeof rejection.preventDefault === "function") {
      rejection.preventDefault();
    }
  });
}

export function consumeLastCapturedError(): unknown {
  if (!lastCapturedError) return undefined;
  if (Date.now() - lastCapturedError.at > TTL_MS) {
    lastCapturedError = undefined;
    return undefined;
  }
  const { error } = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}
