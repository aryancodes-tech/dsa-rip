import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";

import appCss from "../styles.css?url";

import {
  LOGO_DSA_RIP_PATH,
  LOGO_DSA_RIP_SPLASH_PATH,
  POPPINS_GOOGLE_FONTS_STYLESHEET_HREF,
} from "@/constants/branding";
import { CREATOR_DISPLAY_NAME } from "@/constants/creator";
import {
  DSA_APP_NAME,
  DSA_CANONICAL_URL,
  DSA_OG_DESCRIPTION,
  DSA_OG_IMAGE_ALT,
  DSA_OG_IMAGE_HEIGHT,
  DSA_OG_IMAGE_URL,
  DSA_OG_IMAGE_WIDTH,
  DSA_SEO_DESCRIPTION,
  DSA_SEO_KEYWORDS,
  DSA_SEO_TITLE_SHORT,
  DSA_THEME_COLOR,
  DSA_TWITTER_SITE,
  buildDsaBreadcrumbJsonLd,
  buildDsaFaqPageJsonLd,
  buildDsaTopicListJsonLd,
  buildDsaWebApplicationJsonLd,
} from "@/constants/seo";
import { useHydratePersistedTracker } from "@/lib/tracker-store";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: DSA_SEO_TITLE_SHORT },
      { name: "description", content: DSA_SEO_DESCRIPTION },
      { name: "keywords", content: DSA_SEO_KEYWORDS },
      { name: "author", content: CREATOR_DISPLAY_NAME },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "googlebot", content: "index, follow" },
      { name: "application-name", content: DSA_APP_NAME },
      { name: "apple-mobile-web-app-title", content: DSA_APP_NAME },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "theme-color", content: DSA_THEME_COLOR },
      { name: "color-scheme", content: "light dark" },
      { property: "og:site_name", content: DSA_APP_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: DSA_CANONICAL_URL },
      { property: "og:title", content: DSA_SEO_TITLE_SHORT },
      { property: "og:description", content: DSA_OG_DESCRIPTION },
      { property: "og:image", content: DSA_OG_IMAGE_URL },
      { property: "og:image:secure_url", content: DSA_OG_IMAGE_URL },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: String(DSA_OG_IMAGE_WIDTH) },
      { property: "og:image:height", content: String(DSA_OG_IMAGE_HEIGHT) },
      { property: "og:image:alt", content: DSA_OG_IMAGE_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: DSA_TWITTER_SITE },
      { name: "twitter:creator", content: DSA_TWITTER_SITE },
      { name: "twitter:title", content: DSA_SEO_TITLE_SHORT },
      { name: "twitter:description", content: DSA_OG_DESCRIPTION },
      { name: "twitter:image", content: DSA_OG_IMAGE_URL },
      { name: "twitter:image:alt", content: DSA_OG_IMAGE_ALT },
      { "script:ld+json": buildDsaWebApplicationJsonLd() },
      { "script:ld+json": buildDsaFaqPageJsonLd() },
      { "script:ld+json": buildDsaTopicListJsonLd() },
      { "script:ld+json": buildDsaBreadcrumbJsonLd() },
    ],
    links: [
      { rel: "canonical", href: DSA_CANONICAL_URL },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
      {
        rel: "stylesheet",
        href: POPPINS_GOOGLE_FONTS_STYLESHEET_HREF,
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: LOGO_DSA_RIP_SPLASH_PATH, type: "image/png", sizes: "any" },
      { rel: "icon", href: LOGO_DSA_RIP_PATH, type: "image/jpeg", sizes: "2400x2400" },
      { rel: "apple-touch-icon", href: LOGO_DSA_RIP_SPLASH_PATH },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useHydratePersistedTracker();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Analytics />
    </QueryClientProvider>
  );
}
