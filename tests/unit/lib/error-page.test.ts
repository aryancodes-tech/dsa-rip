import { describe, expect, it } from "vitest";
import { CREATOR_TWITTER_HANDLE, CREATOR_TWITTER_URL } from "@/constants/creator";
import {
  ERROR_PAGE_BODY,
  ERROR_PAGE_CONTACT_LABEL,
  ERROR_PAGE_PRIMARY,
  ERROR_PAGE_RETRY_LABEL,
  ERROR_PAGE_TITLE,
} from "@/constants/error-page";
import { renderErrorPage } from "@/lib/error-page";

describe("renderErrorPage", () => {
  it("offers retry and an X contact link", () => {
    const html = renderErrorPage();

    expect(html).toContain(ERROR_PAGE_TITLE);
    expect(html).toContain(ERROR_PAGE_BODY);
    expect(html).toContain(ERROR_PAGE_RETRY_LABEL);
    expect(html).toContain("location.reload()");
    expect(html).toContain(ERROR_PAGE_CONTACT_LABEL);
    expect(html).toContain(CREATOR_TWITTER_URL);
    expect(html).toContain(CREATOR_TWITTER_HANDLE);
    expect(html).toContain('target="_blank"');
    expect(html).toContain(ERROR_PAGE_PRIMARY);
    expect(html).toContain("x-logo");
    expect(html).not.toContain("#111");
    expect(html).not.toContain("Go home");
  });
});
