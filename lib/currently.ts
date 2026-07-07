import { Client } from "@notionhq/client";
import { getBlocks } from "./notion";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

// shown until a Notion page titled "Currently" is shared with the integration
const FALLBACK = [
  "in San Francisco",
  "making FLUX demos",
  "training (bad) tennis",
];

// Auto-discovers a page named "Currently" in Notion and reads its bullets.
// No database, no env var: Maanav edits a plain Notion page from his phone.
export async function getCurrently(): Promise<string[]> {
  if (!process.env.NOTION_TOKEN) return FALLBACK;

  try {
    const res = await notion.search({
      query: "Currently",
      filter: { property: "object", value: "page" },
      page_size: 10,
    });
    const page = (res.results as any[]).find((r) => {
      const titleProp: any = Object.values(r.properties ?? {}).find(
        (p: any) => p?.type === "title"
      );
      const text = (titleProp?.title ?? [])
        .map((t: any) => t.plain_text ?? "")
        .join("")
        .trim()
        .toLowerCase();
      return text === "currently";
    });
    if (!page) return FALLBACK;

    const blocks = await getBlocks(page.id);
    const items = blocks
      .filter((b: any) =>
        ["bulleted_list_item", "numbered_list_item", "paragraph"].includes(
          b.type
        )
      )
      .map((b: any) =>
        (b[b.type]?.rich_text ?? [])
          .map((t: any) => t.plain_text ?? "")
          .join("")
          .trim()
      )
      .filter(Boolean)
      .slice(0, 6);

    return items.length ? items : FALLBACK;
  } catch (error) {
    console.error("Error fetching Currently page:", error);
    return FALLBACK;
  }
}
