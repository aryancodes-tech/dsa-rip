import { createFileRoute } from "@tanstack/react-router";
import { SheetPage } from "@/features/sheet";
import {
  DSA_CANONICAL_URL,
  DSA_OG_DESCRIPTION,
  DSA_OG_IMAGE_URL,
  DSA_SEO_DESCRIPTION,
  DSA_SEO_TITLE,
} from "@/constants/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: DSA_SEO_TITLE },
      { name: "description", content: DSA_SEO_DESCRIPTION },
      { property: "og:title", content: DSA_SEO_TITLE },
      { property: "og:description", content: DSA_OG_DESCRIPTION },
      { property: "og:url", content: DSA_CANONICAL_URL },
      { property: "og:image", content: DSA_OG_IMAGE_URL },
      { name: "twitter:title", content: DSA_SEO_TITLE },
      { name: "twitter:description", content: DSA_OG_DESCRIPTION },
      { name: "twitter:image", content: DSA_OG_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: DSA_CANONICAL_URL }],
  }),
  component: SheetPage,
});
