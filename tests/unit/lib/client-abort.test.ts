import { describe, expect, it } from "vitest";
import {
  CLIENT_CLOSED_REQUEST_STATUS,
  clientClosedRequestResponse,
  isClientAbortError,
} from "@/lib/client-abort";

describe("isClientAbortError", () => {
  it("detects ECONNRESET and aborted messages", () => {
    expect(isClientAbortError({ code: "ECONNRESET", message: "aborted" })).toBe(true);
    expect(isClientAbortError(Object.assign(new Error("aborted"), { code: "ECONNRESET" }))).toBe(
      true,
    );
    expect(isClientAbortError({ name: "AbortError", message: "The operation was aborted" })).toBe(
      true,
    );
  });

  it("walks the cause chain", () => {
    const nested = {
      message: "HTTPError",
      status: 500,
      cause: { code: "ECONNRESET", message: "aborted" },
    };
    expect(isClientAbortError(nested)).toBe(true);
  });

  it("returns false for real SSR failures", () => {
    expect(isClientAbortError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isClientAbortError(null)).toBe(false);
    expect(isClientAbortError("")).toBe(false);
  });
});

describe("clientClosedRequestResponse", () => {
  it("returns an empty 499", () => {
    const response = clientClosedRequestResponse();
    expect(response.status).toBe(CLIENT_CLOSED_REQUEST_STATUS);
  });
});
