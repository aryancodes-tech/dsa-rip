import { describe, expect, it } from "vitest";
import {
  ABACUS_ACTION_GET,
  ABACUS_ACTION_HIT,
  ABACUS_NAMESPACE,
  ABACUS_ORIGIN,
  ABACUS_PAGE_VIEWS_KEY,
  ABACUS_PAGE_VIEWS_SEED,
  ABACUS_PRODUCTION_HOSTS,
} from "@/constants/abacus";
import {
  composeAbacusUrl,
  formatPageViewCount,
  formatPageViewsAria,
  formatPageViewsText,
  isAbacusProductionHost,
  parseAbacusValue,
  recordPageViews,
  totalPageViews,
} from "@/lib/abacus";

describe("abacus constants", () => {
  it("seeds the footer at the historical page-view total", () => {
    expect(ABACUS_PAGE_VIEWS_SEED).toBe(900);
    expect(ABACUS_NAMESPACE).toBe("dsa.rip");
    expect(ABACUS_PRODUCTION_HOSTS).toEqual(["www.dsa.rip", "dsa.rip"]);
  });
});

describe("composeAbacusUrl", () => {
  it("returns empty when namespace or key is empty", () => {
    expect(composeAbacusUrl(ABACUS_ACTION_HIT, "", ABACUS_PAGE_VIEWS_KEY)).toBe("");
    expect(composeAbacusUrl(ABACUS_ACTION_GET, ABACUS_NAMESPACE, "")).toBe("");
  });

  it("joins origin, action, namespace, and key", () => {
    expect(composeAbacusUrl(ABACUS_ACTION_HIT, ABACUS_NAMESPACE, ABACUS_PAGE_VIEWS_KEY)).toBe(
      `${ABACUS_ORIGIN}/${ABACUS_ACTION_HIT}/${ABACUS_NAMESPACE}/${ABACUS_PAGE_VIEWS_KEY}`,
    );
  });
});

describe("parseAbacusValue", () => {
  it("reads a non-negative integer value", () => {
    expect(parseAbacusValue({ value: 12 })).toBe(12);
    expect(parseAbacusValue({ value: 12.9 })).toBe(12);
  });

  it("rejects missing or invalid payloads", () => {
    expect(parseAbacusValue(null)).toBeNull();
    expect(parseAbacusValue({})).toBeNull();
    expect(parseAbacusValue({ value: -1 })).toBeNull();
    expect(parseAbacusValue({ error: "Key not found" })).toBeNull();
  });
});

describe("totalPageViews", () => {
  it("keeps the seed when Abacus has no remote value yet", () => {
    expect(totalPageViews(ABACUS_PAGE_VIEWS_SEED, null)).toBe(ABACUS_PAGE_VIEWS_SEED);
  });

  it("adds live hits on top of the historical seed", () => {
    expect(totalPageViews(ABACUS_PAGE_VIEWS_SEED, 1)).toBe(901);
  });
});

describe("isAbacusProductionHost", () => {
  it("treats apex and www as production and ignores empty / preview hosts", () => {
    expect(isAbacusProductionHost("")).toBe(false);
    expect(isAbacusProductionHost("www.dsa.rip")).toBe(true);
    expect(isAbacusProductionHost("dsa.rip")).toBe(true);
    expect(isAbacusProductionHost("localhost")).toBe(false);
    expect(isAbacusProductionHost("dsa-rip.vercel.app")).toBe(false);
  });
});

describe("formatPageViews", () => {
  it("formats the muted footer line and aria label", () => {
    expect(formatPageViewCount(1234)).toBe("1,234");
    expect(formatPageViewsText(900)).toBe("900 views");
    expect(formatPageViewsAria(900)).toBe("900 page views");
  });
});

describe("recordPageViews", () => {
  it("only GETs on non-production hosts and still applies the seed", async () => {
    const requested: string[] = [];
    const result = await recordPageViews({
      hostname: "localhost",
      request: async (url) => {
        requested.push(url);
        return 3;
      },
    });

    expect(requested).toEqual([
      composeAbacusUrl(ABACUS_ACTION_GET, ABACUS_NAMESPACE, ABACUS_PAGE_VIEWS_KEY),
    ]);
    expect(result).toBe(903);
  });

  it("HITs on every production load, including repeat visits", async () => {
    const requested: string[] = [];
    const result = await recordPageViews({
      hostname: "www.dsa.rip",
      request: async (url) => {
        requested.push(url);
        return 2;
      },
    });

    expect(requested).toEqual([
      composeAbacusUrl(ABACUS_ACTION_HIT, ABACUS_NAMESPACE, ABACUS_PAGE_VIEWS_KEY),
    ]);
    expect(result).toBe(902);
  });
});
