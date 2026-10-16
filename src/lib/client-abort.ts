/**
 * Detects client-disconnect / aborted-request errors from Node HTTP and fetch.
 * Vite HMR and browser navigations often cancel in-flight SSR; those are not app bugs.
 */

/** HTTP status for “client closed the request” (nginx convention). */
export const CLIENT_CLOSED_REQUEST_STATUS = 499;

/**
 * True when `error` (or its cause chain) is a client abort / connection reset,
 * not a real SSR failure.
 */
export function isClientAbortError(error: unknown): boolean {
  return isClientAbortErrorInner(error, 0);
}

function isClientAbortErrorInner(error: unknown, depth: number): boolean {
  if (depth > 5) return false;
  if (error === null || error === undefined) return false;
  if (typeof error !== "object") return false;

  const err = error as {
    name?: unknown;
    message?: unknown;
    code?: unknown;
    cause?: unknown;
  };

  if (err.name === "AbortError") return true;
  if (err.code === "ECONNRESET" || err.code === "ECONNABORTED" || err.code === "ERR_STREAM_PREMATURE_CLOSE") {
    return true;
  }

  if (typeof err.message === "string") {
    const message = err.message.toLowerCase();
    if (message === "aborted" || message === "abort" || message.includes("aborted")) {
      return true;
    }
  }

  if (err.cause !== undefined && err.cause !== error) {
    return isClientAbortErrorInner(err.cause, depth + 1);
  }
  return false;
}

/** Empty response when the browser already hung up. */
export function clientClosedRequestResponse(): Response {
  return new Response(null, { status: CLIENT_CLOSED_REQUEST_STATUS });
}
