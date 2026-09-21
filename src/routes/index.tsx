import { createFileRoute } from "@tanstack/react-router";
import { SheetPage } from "@/features/sheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "dsa.rip - A2Z sheet progress" },
      {
        name: "description",
        content:
          "Local DSA sheet tracker: mark solved, revise, take notes, and jump to practice links. Progress stays in your browser.",
      },
      { property: "og:title", content: "dsa.rip" },
      {
        property: "og:description",
        content: "Track the A2Z DSA sheet locally - solved, revision, notes, and practice links.",
      },
    ],
  }),
  component: SheetPage,
});
