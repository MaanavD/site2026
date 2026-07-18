import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";
import { mockPosts } from "./mock-posts";
import {
  getNotionClient,
  getNotionDatabaseId,
  hasNotionToken,
} from "./notion/client";
import {
  fetchBlockTree,
  fetchPosts as fetchPostsFromNotion,
} from "./notion/data";
import { isNormalizedSlug } from "./notion/normalize";
import type { NotionBlock, Post } from "./notion/types";

const CACHE_SECONDS = 3600;

const getCachedPosts = unstable_cache(
  async () =>
    fetchPostsFromNotion(getNotionClient(), getNotionDatabaseId()),
  ["notion-posts-v2"],
  {
    revalidate: CACHE_SECONDS,
    tags: ["notion", "notion-posts"],
  },
);

const getCachedBlockTree = unstable_cache(
  async (blockId: string) => fetchBlockTree(getNotionClient(), blockId),
  ["notion-block-tree-v2"],
  {
    revalidate: CACHE_SECONDS,
    tags: ["notion", "notion-blocks"],
  },
);

export const hasNotionConfig = () =>
  hasNotionToken() && Boolean(process.env.NOTION_DATABASE_ID?.trim());

export const getPosts = cache(async (): Promise<Post[]> => {
  if (!hasNotionConfig()) return mockPosts;
  return getCachedPosts();
});

export const getPostBySlug = cache(
  async (slug: string): Promise<Post | null> => {
    if (!isNormalizedSlug(slug)) return null;
    const posts = await getPosts();
    return posts.find((post) => post.slug === slug) ?? null;
  },
);

export const getBlocksWithChildren = cache(
  async (blockId: string): Promise<NotionBlock[]> => {
    if (!hasNotionToken()) return [];
    return getCachedBlockTree(blockId);
  },
);

export const getBlocks = getBlocksWithChildren;
export type { NotionBlock, Post } from "./notion/types";
