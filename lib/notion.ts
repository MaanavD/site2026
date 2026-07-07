import { Client } from "@notionhq/client";
import { generateSlug, getPropertyValue, isPageObjectResponse } from "./type-guards";
import { mockPosts } from "./mock-posts";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export const databaseId = process.env.NOTION_DATABASE_ID;

export type Post = {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string | null;
  isMock?: boolean;
};

export const hasNotionConfig = () =>
  Boolean(process.env.NOTION_TOKEN && databaseId);

export const getDatabase = async () => {
  try {
    if (!hasNotionConfig()) return [];
    const response = await notion.databases.query({
      database_id: databaseId as string,
      sorts: [{ property: "Date", direction: "descending" }],
    });
    return response.results;
  } catch (error) {
    console.error("Error fetching Notion database:", error);
    return [];
  }
};

export const getPosts = async (): Promise<Post[]> => {
  const pages = await getDatabase();
  if (pages.length === 0 && !hasNotionConfig()) return mockPosts;

  return pages
    .filter(isPageObjectResponse)
    .filter(
      // Category "TBD" marks drafts in the Notion database
      (page: any) =>
        getPropertyValue(page.properties, "Category", "select")?.name !== "TBD"
    )
    .map((page: any) => {
    const props = page.properties;
    const titleProp: any =
      Object.values(props).find((p: any) => p?.type === "title") ?? null;
    const title = titleProp?.title
      ? titleProp.title.map((t: any) => t.plain_text ?? "").join("")
      : "Untitled";
    const slugRich = getPropertyValue(props, "Slug", "rich_text");
    const slug =
      (slugRich?.map((t: any) => t.plain_text ?? "").join("") ||
        generateSlug(titleProp?.title ?? [])) ??
      page.id;
    const date = getPropertyValue(props, "Date", "date")?.start ?? "";
    const category = getPropertyValue(props, "Category", "select")?.name ?? null;

    return { id: page.id, slug, title, date, category };
  });
};

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
};

export const getBlocksWithChildren = async (blockId: string): Promise<any[]> => {
  const blocks = await getBlocks(blockId);

  return Promise.all(
    blocks.map(async (block: any) => {
      if (!("has_children" in block) || !block.has_children || !("type" in block)) {
        return block;
      }
      const blockDetails = block[block.type];
      if (!blockDetails) return block;

      const children = await getBlocksWithChildren(block.id);
      return { ...block, [block.type]: { ...blockDetails, children } };
    })
  );
};

export const getBlocks = async (blockId: string) => {
  try {
    const blocks = [];
    let cursor;
    while (true) {
      const { results, next_cursor }: any = await notion.blocks.children.list({
        start_cursor: cursor,
        block_id: blockId,
        page_size: 100,
      });
      blocks.push(...results);
      if (!next_cursor) break;
      cursor = next_cursor;
    }
    return blocks;
  } catch (error) {
    console.error("Error fetching Notion blocks:", error);
    return [];
  }
};
