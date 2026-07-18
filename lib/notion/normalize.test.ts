import { describe, expect, test } from "bun:test";
import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { signNotionMediaBlockId } from "./media";
import {
  normalizeBlock,
  normalizePosts,
  normalizeSlug,
} from "./normalize";

function page(
  id: string,
  title: string,
  slug = "",
  date = "2026-07-18",
): PageObjectResponse {
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
      Slug: {
        id: "slug",
        type: "rich_text",
        rich_text: slug
          ? [
              {
                type: "text",
                plain_text: slug,
                href: null,
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
                text: { content: slug, link: null },
              },
            ]
          : [],
      },
      Date: {
        id: "date",
        type: "date",
        date: { start: date, end: null, time_zone: null },
      },
      Category: {
        id: "category",
        type: "select",
        select: { id: "notes", name: "Notes", color: "default" },
      },
    },
  } as unknown as PageObjectResponse;
}

describe("Notion post normalization", () => {
  test("normalizes manual and generated slugs", () => {
    expect(normalizeSlug("  Café & Notes / 2026  ")).toBe("cafe-notes-2026");
    expect(normalizePosts([page("one", "Generated Slug!")])[0].slug).toBe(
      "generated-slug",
    );
    expect(
      normalizePosts([page("two", "Ignored", " Manual Slug / Here ")])[0]
        .slug,
    ).toBe("manual-slug-here");
  });

  test("normalizes date-only and timestamp values", () => {
    expect(normalizePosts([page("date", "Date")])[0].date).toBe("2026-07-18");
    expect(
      normalizePosts([
        page("timestamp", "Timestamp", "", "2026-07-18T08:30:00-07:00"),
      ])[0].date,
    ).toBe("2026-07-18T15:30:00.000Z");
  });

  test("rejects invalid calendar dates", () => {
    expect(() =>
      normalizePosts([page("invalid-date", "Invalid", "", "2026-02-30")]),
    ).toThrow("Invalid Notion date on page invalid-date");
  });

  test("rejects duplicate normalized slugs", () => {
    expect(() =>
      normalizePosts([
        page("one", "Same slug"),
        page("two", "Other", "same--slug"),
      ]),
    ).toThrow('Duplicate Notion slug "same-slug"');
  });
});

describe("Notion block normalization", () => {
  test("replaces signed file URLs with a stable block route", () => {
    const block = {
      object: "block",
      id: "11111111-1111-1111-1111-111111111111",
      type: "image",
      has_children: false,
      image: {
        type: "file",
        file: {
          url: "https://signed.example/image?expires=soon",
          expiry_time: "2026-07-18T01:00:00.000Z",
        },
        caption: [],
      },
    } as unknown as BlockObjectResponse;

    const normalized = normalizeBlock(block, "test-secret");
    expect(normalized.type).toBe("image");
    if (normalized.type !== "image") throw new Error("Expected image block");
    expect(normalized.image).toEqual({
      type: "external",
      external: {
        url: `/api/notion-media/11111111-1111-1111-1111-111111111111?token=${signNotionMediaBlockId(
          "11111111-1111-1111-1111-111111111111",
          "test-secret",
        )}`,
      },
      caption: [],
    });
    expect(JSON.stringify(normalized)).not.toContain("signed.example");
    expect(JSON.stringify(normalized)).not.toContain("expiry_time");
  });

  test("preserves external media URLs", () => {
    const block = {
      object: "block",
      id: "external",
      type: "video",
      has_children: false,
      video: {
        type: "external",
        external: { url: "https://www.youtube.com/watch?v=abc" },
        caption: [],
      },
    } as unknown as BlockObjectResponse;

    expect(normalizeBlock(block)).toBe(block);
  });
});
