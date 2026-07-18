import type {
  BlockObjectResponse,
  PageObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { signNotionMediaBlockId } from "./media";
import type { NotionBlock, Post } from "./types";

const MAX_SLUG_LENGTH = 160;

type PageProperty = PageObjectResponse["properties"][string];
type TitleProperty = Extract<PageProperty, { type: "title" }>;

export function richTextPlainText(richText: RichTextItemResponse[]): string {
  return richText.map((item) => item.plain_text).join("");
}

export function blockPlainText(block: BlockObjectResponse): string {
  switch (block.type) {
    case "paragraph":
      return richTextPlainText(block.paragraph.rich_text);
    case "bulleted_list_item":
      return richTextPlainText(block.bulleted_list_item.rich_text);
    case "numbered_list_item":
      return richTextPlainText(block.numbered_list_item.rich_text);
    case "heading_1":
      return richTextPlainText(block.heading_1.rich_text);
    case "heading_2":
      return richTextPlainText(block.heading_2.rich_text);
    case "heading_3":
      return richTextPlainText(block.heading_3.rich_text);
    case "quote":
      return richTextPlainText(block.quote.rich_text);
    case "to_do":
      return richTextPlainText(block.to_do.rich_text);
    case "toggle":
      return richTextPlainText(block.toggle.rich_text);
    case "callout":
      return richTextPlainText(block.callout.rich_text);
    case "code":
      return richTextPlainText(block.code.rich_text);
    default:
      return "";
  }
}

function propertyOfType<T extends PageProperty["type"]>(
  properties: PageObjectResponse["properties"],
  name: string,
  type: T,
): Extract<PageProperty, { type: T }> | null {
  const property = properties[name];
  return property?.type === type
    ? (property as Extract<PageProperty, { type: T }>)
    : null;
}

function titleProperty(
  properties: PageObjectResponse["properties"],
): TitleProperty | null {
  return (
    Object.values(properties).find(
      (property): property is TitleProperty => property.type === "title",
    ) ?? null
  );
}

export function pageTitle(page: PageObjectResponse): string {
  return richTextPlainText(titleProperty(page.properties)?.title ?? []).trim();
}

export function normalizeSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, "");
}

export function isNormalizedSlug(value: string): boolean {
  return Boolean(value) && value === normalizeSlug(value);
}

function normalizeDate(value: string | null, pageId: string): string {
  if (!value) return "";

  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  if (
    Number.isNaN(parsed.getTime()) ||
    (dateOnly && parsed.toISOString().slice(0, 10) !== value)
  ) {
    throw new Error(`Invalid Notion date on page ${pageId}`);
  }

  return dateOnly ? value : parsed.toISOString();
}

function postFromPage(page: PageObjectResponse): Post | null {
  const properties = page.properties;
  const category = propertyOfType(properties, "Category", "select")?.select
    ?.name;

  if (category === "TBD") return null;

  const title = pageTitle(page);
  const manualSlug = richTextPlainText(
    propertyOfType(properties, "Slug", "rich_text")?.rich_text ?? [],
  ).trim();
  const slug = normalizeSlug(manualSlug || title);

  if (!slug) {
    throw new Error(`Invalid Notion slug on page ${page.id}`);
  }

  const date = normalizeDate(
    propertyOfType(properties, "Date", "date")?.date?.start ?? null,
    page.id,
  );

  return {
    id: page.id,
    slug,
    title: title || "Untitled",
    date,
    category: category ?? null,
  };
}

export function normalizePosts(pages: PageObjectResponse[]): Post[] {
  const posts = pages
    .map(postFromPage)
    .filter((post): post is Post => post !== null);
  const bySlug = new Map<string, Post>();

  for (const post of posts) {
    const duplicate = bySlug.get(post.slug);
    if (duplicate) {
      throw new Error(
        `Duplicate Notion slug "${post.slug}" on pages ${duplicate.id} and ${post.id}`,
      );
    }
    bySlug.set(post.slug, post);
  }

  return posts;
}

export function notionMediaPath(
  blockId: string,
  secret = process.env.NOTION_TOKEN,
): string {
  if (!secret) throw new Error("NOTION_TOKEN is required to sign media URLs");
  const token = signNotionMediaBlockId(blockId, secret);
  return `/api/notion-media/${encodeURIComponent(blockId)}?token=${token}`;
}

export function normalizeBlock(
  block: BlockObjectResponse,
  mediaSecret = process.env.NOTION_TOKEN,
): NotionBlock {
  switch (block.type) {
    case "image":
      if (block.image.type === "external") return block;
      return {
        ...block,
        image: {
          type: "external",
          external: { url: notionMediaPath(block.id, mediaSecret) },
          caption: block.image.caption,
        },
      };
    case "file":
      if (block.file.type === "external") return block;
      return {
        ...block,
        file: {
          type: "external",
          external: { url: notionMediaPath(block.id, mediaSecret) },
          caption: block.file.caption,
          name: block.file.name,
        },
      };
    case "audio":
      if (block.audio.type === "external") return block;
      return {
        ...block,
        audio: {
          type: "external",
          external: { url: notionMediaPath(block.id, mediaSecret) },
          caption: block.audio.caption,
        },
      };
    case "video":
      if (block.video.type === "external") return block;
      return {
        ...block,
        video: {
          type: "external",
          external: { url: notionMediaPath(block.id, mediaSecret) },
          caption: block.video.caption,
        },
      };
    case "pdf":
      if (block.pdf.type === "external") return block;
      return {
        ...block,
        pdf: {
          type: "external",
          external: { url: notionMediaPath(block.id, mediaSecret) },
          caption: block.pdf.caption,
        },
      };
    default:
      return block;
  }
}
