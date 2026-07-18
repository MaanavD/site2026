import { describe, expect, test } from "bun:test";
import type { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
  PageObjectResponse,
  QueryDatabaseParameters,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { fetchBlockChildren, fetchBlockTree, fetchPosts } from "./data";

function page(id: string): PageObjectResponse {
  const title = `Post ${id}`;
  return {
    object: "page",
    id,
    url: `https://notion.so/${id}`,
    properties: {
      Name: {
        id: "title",
        type: "title",
        title: [
          {
            type: "text",
            plain_text: title,
            href: null,
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            text: { content: title, link: null },
          },
        ],
      },
      Date: {
        id: "date",
        type: "date",
        date: { start: "2026-07-18", end: null, time_zone: null },
      },
    },
  } as unknown as PageObjectResponse;
}

function paragraph(id: string, hasChildren = false): BlockObjectResponse {
  return {
    object: "block",
    id,
    type: "paragraph",
    has_children: hasChildren,
    paragraph: { rich_text: [], color: "default" },
  } as unknown as BlockObjectResponse;
}

describe("Notion pagination", () => {
  test("collects every database page", async () => {
    const cursors: Array<string | undefined> = [];
    const query = async (
      args: QueryDatabaseParameters,
    ): Promise<QueryDatabaseResponse> => {
      cursors.push(args.start_cursor);
      const first = !args.start_cursor;
      return {
        object: "list",
        type: "page_or_database",
        page_or_database: {},
        results: [page(first ? "one" : "two")],
        has_more: first,
        next_cursor: first ? "next" : null,
      };
    };
    const notion = { databases: { query } } as unknown as Client;

    const posts = await fetchPosts(notion, "database");

    expect(posts.map((post) => post.id)).toEqual(["one", "two"]);
    expect(cursors).toEqual([undefined, "next"]);
  });

  test("collects every block page", async () => {
    const cursors: Array<string | undefined> = [];
    const list = async (
      args: ListBlockChildrenParameters,
    ): Promise<ListBlockChildrenResponse> => {
      cursors.push(args.start_cursor);
      const first = !args.start_cursor;
      return {
        object: "list",
        type: "block",
        block: {},
        results: [paragraph(first ? "one" : "two")],
        has_more: first,
        next_cursor: first ? "next" : null,
      };
    };
    const notion = {
      blocks: { children: { list } },
    } as unknown as Client;

    const blocks = await fetchBlockChildren(notion, "parent");

    expect(blocks.map((block) => block.id)).toEqual(["one", "two"]);
    expect(cursors).toEqual([undefined, "next"]);
  });

  test("bounds concurrent child requests", async () => {
    let active = 0;
    let peak = 0;
    const list = async (
      args: ListBlockChildrenParameters,
    ): Promise<ListBlockChildrenResponse> => {
      active += 1;
      peak = Math.max(peak, active);
      await Bun.sleep(5);
      active -= 1;

      const isRoot = args.block_id === "root";
      return {
        object: "list",
        type: "block",
        block: {},
        results: isRoot
          ? Array.from({ length: 8 }, (_, index) =>
              paragraph(`child-${index}`, true),
            )
          : [],
        has_more: false,
        next_cursor: null,
      };
    };
    const notion = {
      blocks: { children: { list } },
    } as unknown as Client;

    const blocks = await fetchBlockTree(notion, "root");

    expect(peak).toBe(4);
    expect(blocks).toHaveLength(8);
    expect(blocks.every((block) => block.children?.length === 0)).toBe(true);
  });
});

describe("Notion failure semantics", () => {
  test("propagates configured database failures", async () => {
    const failure = new Error("Notion unavailable");
    const notion = {
      databases: {
        query: async () => {
          throw failure;
        },
      },
    } as unknown as Client;

    await expect(fetchPosts(notion, "database")).rejects.toBe(failure);
  });
});
