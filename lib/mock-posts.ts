import type { Post } from "./notion/types";

// Shown only when NOTION_TOKEN is missing so the design is previewable.
export const mockPosts: Post[] = [
  {
    id: "mock-1",
    slug: "33-of-the-year-is-over",
    title: "33% Of the year is over",
    date: "2026-05-04",
    category: "Meandering",
    isMock: true,
  },
  {
    id: "mock-2",
    slug: "things-that-make-me-me",
    title: "Things that make me me",
    date: "2026-04-18",
    category: "Meandering",
    isMock: true,
  },
  {
    id: "mock-3",
    slug: "2026-bingo-card-ai-edition",
    title: "2026 Bingo Card – AI Edition",
    date: "2026-01-06",
    category: "Meandering",
    isMock: true,
  },
];
