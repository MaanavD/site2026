import { getNotionClient, getNotionDatabaseId } from "../lib/notion/client-core";
import { fetchBlockTree, fetchPosts } from "../lib/notion/data";
import { blockPlainText } from "../lib/notion/normalize";
import type { NotionBlock } from "../lib/notion/types";

const flatten = (blocks: NotionBlock[]): NotionBlock[] =>
  blocks.flatMap((block) => [block, ...flatten(block.children ?? [])]);

const words =
  /coffee|espresso|cafe|gym|lift|climb|boulder|ski|snow|jiu|bjj|grappl|tennis/i;

const notion = getNotionClient();
const posts = await fetchPosts(notion, getNotionDatabaseId());
console.log(`${posts.length} posts`);
for (const post of posts) {
  const blocks = await fetchBlockTree(notion, post.id);
  const lines = flatten(blocks)
    .map(blockPlainText)
    .filter((line) => words.test(line));
  if (lines.length) {
    console.log(`\n===== ${post.title} (${post.date}) =====`);
    for (const line of lines) console.log(`· ${line.slice(0, 400)}`);
  }
}
