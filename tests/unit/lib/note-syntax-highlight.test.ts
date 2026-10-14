import { describe, expect, it } from "vitest";
import { highlightNoteCode } from "@/lib/note-syntax-highlight";

describe("highlightNoteCode", () => {
  it("color-codes keywords for the selected language", () => {
    const html = highlightNoteCode("int main() { return 0; }", "cpp");
    expect(html).toContain("hljs-keyword");
    expect(html).toContain("return");
  });

  it("escapes plain text without token classes", () => {
    const html = highlightNoteCode("<script>", "text");
    expect(html).toBe("&lt;script&gt;");
    expect(html).not.toContain("hljs-");
  });
});
