import { getPosts, getBlocks } from "../lib/notion";

const posts = (await getPosts()).slice(0, 4);
for (const post of posts) {
  const blocks = await getBlocks(post.id);
  const text = blocks
    .map((b: any) => b[b.type]?.rich_text?.map((t: any) => t.plain_text).join("") ?? "")
    .filter(Boolean)
    .join("\n")
    .slice(0, 2200);
  console.log(`\n===== ${post.title} =====\n${text}`);
}
