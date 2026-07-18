import { getBlocksWithChildren, getPosts } from "@/lib/notion";
import { createConcurrencyLimit } from "@/lib/notion/retry";
import {
  absoluteUrl,
  AUTHOR_NAME,
  BLOG_DESCRIPTION,
  descriptionFromBlocks,
  escapeXml,
  SITE_NAME,
} from "@/lib/seo";

export const dynamic = "force-static";
export const revalidate = 3600;

function fallbackDescription(post: { title: string; category: string | null }) {
  const category = post.category ? `, filed under ${post.category}` : "";
  return `${post.title}${category}. A field note by ${AUTHOR_NAME}.`;
}

function rssDate(date: string) {
  if (!date) return null;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toUTCString();
}

export async function GET() {
  const posts = (await getPosts()).filter((post) => !post.isMock);
  const limit = createConcurrencyLimit(3);
  const items = await Promise.all(
    posts.map((post) =>
      limit(async () => {
        const blocks = await getBlocksWithChildren(post.id);
        const description = descriptionFromBlocks(
          blocks,
          fallbackDescription(post),
        );
        const url = absoluteUrl(`/blog/${post.slug}`);
        const pubDate = rssDate(post.date);

        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <description>${escapeXml(description)}</description>
      <dc:creator>${escapeXml(AUTHOR_NAME)}</dc:creator>${
        post.category
          ? `\n      <category>${escapeXml(post.category)}</category>`
          : ""
      }${pubDate ? `\n      <pubDate>${pubDate}</pubDate>` : ""}
    </item>`;
      }),
    ),
  );

  const feedUrl = absoluteUrl("/blog/rss.xml");
  const blogUrl = absoluteUrl("/blog");
  const lastBuildDate = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${SITE_NAME} · Writing`)}</title>
    <link>${escapeXml(blogUrl)}</link>
    <description>${escapeXml(BLOG_DESCRIPTION)}</description>
    <language>en-us</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
