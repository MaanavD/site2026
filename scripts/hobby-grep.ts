import { getPosts, getBlocks } from "../lib/notion";

const words =
  /coffee|espresso|cafe|gym|lift|climb|boulder|ski|snow|jiu|bjj|grappl|tennis/i;

const posts = await getPosts();
console.log(`${posts.length} posts`);
for (const post of posts) {
  const blocks = await getBlocks(post.id);
  const lines = blocks
    .map(
      (b: any) =>
        b[b.type]?.rich_text?.map((t: any) => t.plain_text).join("") ?? ""
    )
    .filter((l: string) => words.test(l));
  if (lines.length) {
    console.log(`\n===== ${post.title} (${post.date}) =====`);
    for (const l of lines) console.log("· " + l.slice(0, 400));
  }
}
