import { getNotionClient, getNotionDatabaseId } from "../lib/notion/client-core";
import { fetchBlockTree, fetchPosts } from "../lib/notion/data";
import { blockPlainText } from "../lib/notion/normalize";
import type { NotionBlock } from "../lib/notion/types";

const flatten = (blocks: NotionBlock[]): NotionBlock[] =>
  blocks.flatMap((block) => [block, ...flatten(block.children ?? [])]);

const notion = getNotionClient();
const posts = (await fetchPosts(notion, getNotionDatabaseId())).slice(0, 4);
for (const post of posts) {
  const blocks = await fetchBlockTree(notion, post.id);
  const text = flatten(blocks)
    .map(blockPlainText)
    .filter(Boolean)
    .join("\n")
    .slice(0, 2200);
  console.log(`\n===== ${post.title} =====\n${text}`);
}
