import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { getNotionClient, hasNotionToken } from "./notion/client";
import { fetchCurrently } from "./notion/data";

const FALLBACK = [
  "in San Francisco",
  "making FLUX demos",
  "training (bad) tennis",
];

const getCachedCurrently = unstable_cache(
  async () => fetchCurrently(getNotionClient()),
  ["notion-currently-v2"],
  {
    revalidate: 3600,
    tags: ["notion", "notion-currently"],
  },
);

export const getCurrently = cache(async (): Promise<string[]> => {
  if (!hasNotionToken()) return FALLBACK;

  try {
    const items = await getCachedCurrently();
    return items.length ? items : FALLBACK;
  } catch (error) {
    console.error("Unable to load Currently from Notion", error);
    return FALLBACK;
  }
});
