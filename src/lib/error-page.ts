import {
  CREATOR_TWITTER_HANDLE,
  CREATOR_TWITTER_URL,
  X_LOGO_SVG_PATH_D,
} from "@/constants/creator";
import {
  ERROR_PAGE_ACTION_RADIUS,
  ERROR_PAGE_BG,
  ERROR_PAGE_BODY,
  ERROR_PAGE_BORDER,
  ERROR_PAGE_CARD,
  ERROR_PAGE_CONTACT_LABEL,
  ERROR_PAGE_FG,
  ERROR_PAGE_MUTED,
  ERROR_PAGE_MUTED_BG,
  ERROR_PAGE_PRIMARY,
  ERROR_PAGE_PRIMARY_FG,
  ERROR_PAGE_RETRY_LABEL,
  ERROR_PAGE_TITLE,
} from "@/constants/error-page";

function renderXLogoSvg(): string {
  if (X_LOGO_SVG_PATH_D.length === 0) return "";
  return `<svg class="x-logo" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="${X_LOGO_SVG_PATH_D}"/></svg>`;
}

export function renderErrorPage(): string {
  const contactLink =
    CREATOR_TWITTER_URL.length === 0
      ? ""
      : `<a class="secondary" href="${CREATOR_TWITTER_URL}" target="_blank" rel="noreferrer" aria-label="${ERROR_PAGE_CONTACT_LABEL}: ${CREATOR_TWITTER_HANDLE}">${renderXLogoSvg()}${ERROR_PAGE_CONTACT_LABEL}</a>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${ERROR_PAGE_TITLE}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: ${ERROR_PAGE_BG}; color: ${ERROR_PAGE_FG}; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; letter-spacing: -0.02em; }
      p { color: ${ERROR_PAGE_MUTED}; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: ${ERROR_PAGE_ACTION_RADIUS}; font: inherit; font-weight: 500; cursor: pointer; text-decoration: none; border: 1px solid transparent; box-shadow: 0 1px 2px rgb(0 0 0 / 0.05); }
      .primary { background: ${ERROR_PAGE_PRIMARY}; color: ${ERROR_PAGE_PRIMARY_FG}; }
      .primary:hover { filter: brightness(0.95); }
      .secondary { display: inline-flex; align-items: center; gap: 0.5rem; background: ${ERROR_PAGE_CARD}; color: ${ERROR_PAGE_FG}; border-color: ${ERROR_PAGE_BORDER}; }
      .secondary:hover { background: ${ERROR_PAGE_MUTED_BG}; }
      .x-logo { width: 0.875rem; height: 0.875rem; flex-shrink: 0; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>${ERROR_PAGE_TITLE}</h1>
      <p>${ERROR_PAGE_BODY}</p>
      <div class="actions">
        <button class="primary" type="button" onclick="location.reload()">${ERROR_PAGE_RETRY_LABEL}</button>
        ${contactLink}
      </div>
    </div>
  </body>
</html>`;
}
