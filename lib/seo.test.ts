import { describe, expect, test } from "bun:test";
import type { NotionBlock } from "./notion/types";
import {
  absoluteUrl,
  descriptionFromBlocks,
  escapeXml,
  serializeJsonLd,
} from "./seo";

describe("SEO helpers", () => {
  test("builds absolute site URLs", () => {
    expect(absoluteUrl()).toBe("https://www.maanavdalal.com/");
    expect(absoluteUrl("/blog/a-post")).toBe(
      "https://www.maanavdalal.com/blog/a-post",
    );
  });

  test("escapes XML text and attributes", () => {
    expect(escapeXml(`AI & design <notes> "today's"`)).toBe(
      "AI &amp; design &lt;notes&gt; &quot;today&apos;s&quot;",
    );
  });

  test("derives a trimmed description from post blocks", () => {
    const blocks = [
      {
        type: "heading_1",
        heading_1: { rich_text: [{ plain_text: "A heading" }] },
        children: [
          {
            type: "paragraph",
            paragraph: {
              rich_text: [
                {
                  plain_text:
                    "The first useful paragraph has enough detail to describe the post without another Notion property.",
                },
              ],
            },
          },
        ],
      },
    ] as unknown as NotionBlock[];

    expect(descriptionFromBlocks(blocks, "Fallback", 72)).toBe(
      "The first useful paragraph has enough detail to describe the post…",
    );
    expect(descriptionFromBlocks([], "Fallback")).toBe("Fallback");
  });

  test("scrubs opening angle brackets from JSON-LD", () => {
    expect(serializeJsonLd({ description: "</script><script>" })).toBe(
      '{"description":"\\u003c/script>\\u003cscript>"}',
    );
  });
});
