import { createFileRoute } from "@tanstack/react-router";
import { SheetPage } from "@/features/sheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DSA Tracker - A2Z sheet progress" },
      {
        name: "description",
        content:
          "Local DSA sheet tracker: mark solved, revise, take notes, and jump to practice links. Progress stays in your browser.",
      },
      { property: "og:title", content: "DSA Tracker" },
      {
        property: "og:description",
        content: "Track the A2Z DSA sheet locally - solved, revision, notes, and practice links.",
      },
    ],
  }),
  component: SheetPage,
});
