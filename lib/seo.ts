import type { Metadata } from "next";
import { blockPlainText } from "@/lib/notion/normalize";
import type { NotionBlock } from "@/lib/notion/types";

export const SITE_URL = "https://www.maanavdalal.com";
export const SITE_NAME = "Maanav Dalal";
export const AUTHOR_NAME = "Maanav Dalal";
export const RSS_PATH = "/blog/rss.xml";
export const SITE_DESCRIPTION =
  "Developer Relations Engineer at Black Forest Labs. Building demos, giving talks, and writing about AI, design, and life.";
export const BLOG_DESCRIPTION =
  "Notes on life, AI, and everything in between (they wander a bit on the way).";
export const HOME_TITLE =
  "Maanav Dalal · Developer Relations Engineer at Black Forest Labs";

export const sharedOpenGraph = {
  siteName: SITE_NAME,
  locale: "en_US",
} as const;

export const sharedTwitter = {
  card: "summary_large_image",
} as const satisfies NonNullable<Metadata["twitter"]>;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function canonicalAlternates(path: string): Metadata["alternates"] {
  return {
    canonical: path,
    types: {
      "application/rss+xml": RSS_PATH,
    },
  };
}

const DESCRIPTION_BLOCK_TYPES = new Set([
  "paragraph",
  "quote",
  "callout",
  "bulleted_list_item",
  "numbered_list_item",
]);

function firstBlockText(blocks: NotionBlock[]): string {
  for (const block of blocks) {
    if (DESCRIPTION_BLOCK_TYPES.has(block.type)) {
      const text = blockPlainText(block).replace(/\s+/g, " ").trim();
      if (text) return text;
    }

    if (block.children?.length) {
      const text = firstBlockText(block.children);
      if (text) return text;
    }
  }

  return "";
}

export function descriptionFromBlocks(
  blocks: NotionBlock[],
  fallback: string,
  maxLength = 180,
) {
  const text = firstBlockText(blocks);
  if (!text) return fallback;
  if (text.length <= maxLength) return text;

  const excerpt = text.slice(0, maxLength + 1);
  const wordBoundary = excerpt.lastIndexOf(" ");
  return `${excerpt.slice(0, wordBoundary > 0 ? wordBoundary : maxLength).trim()}…`;
}

export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => {
    switch (character) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });
}
