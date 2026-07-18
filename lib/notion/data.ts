import type { Client } from "@notionhq/client";
import {
  collectPaginatedAPI,
  isFullBlock,
  isFullPage,
} from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import {
  blockPlainText,
  normalizeBlock,
  normalizePosts,
  pageTitle,
} from "./normalize";
import { createConcurrencyLimit, withNotionRetry } from "./retry";
import type { NotionBlock, NotionMedia, Post } from "./types";

function requireFullPages(
  results: Awaited<ReturnType<Client["databases"]["query"]>>["results"],
): PageObjectResponse[] {
  return results.map((result) => {
    if (!isFullPage(result)) {
      throw new Error(`Notion returned a partial page for ${result.id}`);
    }
    return result;
  });
}

function requireFullBlocks(
  results: Awaited<
    ReturnType<Client["blocks"]["children"]["list"]>
  >["results"],
): BlockObjectResponse[] {
  return results.map((result) => {
    if (!isFullBlock(result)) {
      throw new Error(`Notion returned a partial block for ${result.id}`);
    }
    return result;
  });
}

export async function fetchPosts(
  notion: Client,
  databaseId: string,
): Promise<Post[]> {
  const results = await withNotionRetry(() =>
    collectPaginatedAPI(notion.databases.query, {
      database_id: databaseId,
      page_size: 100,
      sorts: [{ property: "Date", direction: "descending" }],
    }),
  );

  return normalizePosts(requireFullPages(results));
}

export async function fetchBlockChildren(
  notion: Client,
  blockId: string,
): Promise<BlockObjectResponse[]> {
  const results = await withNotionRetry(() =>
    collectPaginatedAPI(notion.blocks.children.list, {
      block_id: blockId,
      page_size: 100,
    }),
  );

  return requireFullBlocks(results);
}

export async function fetchBlockTree(
  notion: Client,
  blockId: string,
): Promise<NotionBlock[]> {
  const limit = createConcurrencyLimit(4);

  const visit = async (parentId: string): Promise<NotionBlock[]> => {
    const blocks = await limit(() => fetchBlockChildren(notion, parentId));

    return Promise.all(
      blocks.map(async (block): Promise<NotionBlock> => {
        const normalized = normalizeBlock(block);
        if (!block.has_children) return normalized;
        return { ...normalized, children: await visit(block.id) };
      }),
    );
  };

  return visit(blockId);
}

export async function fetchCurrently(notion: Client): Promise<string[]> {
  const results = await withNotionRetry(() =>
    collectPaginatedAPI(notion.search, {
      query: "Currently",
      filter: { property: "object", value: "page" },
      page_size: 100,
    }),
  );

  const page = results.find((result) => {
    if (result.object !== "page") return false;
    if (!isFullPage(result)) {
      throw new Error(`Notion returned a partial page for ${result.id}`);
    }
    return pageTitle(result).toLowerCase() === "currently";
  });

  if (!page || !isFullPage(page)) return [];

  const blocks = await fetchBlockChildren(notion, page.id);
  return blocks
    .filter((block) =>
      ["paragraph", "bulleted_list_item", "numbered_list_item"].includes(
        block.type,
      ),
    )
    .map(blockPlainText)
    .map((text) => text.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export async function fetchNotionMedia(
  notion: Client,
  blockId: string,
): Promise<NotionMedia | null> {
  const response = await withNotionRetry(() =>
    notion.blocks.retrieve({ block_id: blockId }),
  );
  if (!isFullBlock(response)) return null;

  switch (response.type) {
    case "image":
      return response.image.type === "file"
        ? { url: response.image.file.url, type: "image", name: null }
        : null;
    case "file":
      return response.file.type === "file"
        ? {
            url: response.file.file.url,
            type: "file",
            name: response.file.name || null,
          }
        : null;
    case "audio":
      return response.audio.type === "file"
        ? { url: response.audio.file.url, type: "audio", name: null }
        : null;
    case "video":
      return response.video.type === "file"
        ? { url: response.video.file.url, type: "video", name: null }
        : null;
    case "pdf":
      return response.pdf.type === "file"
        ? { url: response.pdf.file.url, type: "pdf", name: null }
        : null;
    default:
      return null;
  }
}
