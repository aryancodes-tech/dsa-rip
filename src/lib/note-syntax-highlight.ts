/**
 * Language-aware HTML highlighting for note code blocks (highlight.js, subset of langs).
 */
import hljs from "highlight.js/lib/core";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import go from "highlight.js/lib/languages/go";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import kotlin from "highlight.js/lib/languages/kotlin";
import python from "highlight.js/lib/languages/python";
import rust from "highlight.js/lib/languages/rust";
import typescript from "highlight.js/lib/languages/typescript";
import plaintext from "highlight.js/lib/languages/plaintext";
import type { DsaNoteLanguageId } from "@/constants/notes";

let registered = false;

function ensureLanguagesRegistered(): void {
  if (registered) return;
  hljs.registerLanguage("c", c);
  hljs.registerLanguage("cpp", cpp);
  hljs.registerLanguage("go", go);
  hljs.registerLanguage("java", java);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("kotlin", kotlin);
  hljs.registerLanguage("python", python);
  hljs.registerLanguage("rust", rust);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("plaintext", plaintext);
  registered = true;
}

/** highlight.js language id for a notes language slug. */
function hljsLanguageId(language: DsaNoteLanguageId): string {
  if (language === "text") return "plaintext";
  return language;
}

/**
 * Escapes plain text for safe HTML when not highlighting.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Returns highlighted HTML for a code block. Empty input yields a non-breaking space
 * so the overlay keeps one line of height aligned with the textarea.
 */
export function highlightNoteCode(code: string, language: DsaNoteLanguageId): string {
  if (code.length === 0) return "&nbsp;";
  ensureLanguagesRegistered();
  if (language === "text") {
    return escapeHtml(code);
  }
  try {
    return hljs.highlight(code, { language: hljsLanguageId(language), ignoreIllegals: true }).value;
  } catch {
    return escapeHtml(code);
  }
}
