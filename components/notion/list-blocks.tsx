import React from "react";
import type { NotionBlock } from "@/lib/notion/types";
import Block, { type PostSlugMap } from "./block";

type ListBlock = Extract<
  NotionBlock,
  { type: "bulleted_list_item" | "numbered_list_item" }
>;

export function ListBlocks({
  blocks,
  postSlugsById = {},
}: {
  blocks: NotionBlock[];
  postSlugsById?: PostSlugMap;
}) {
  const out: React.ReactNode[] = [];
  let buffer: ListBlock[] = [];
  let bufferType: ListBlock["type"] | null = null;

  const flush = () => {
    if (!buffer.length || !bufferType) return;
    const items = buffer.map((block) => (
      <Block key={block.id} block={block} postSlugsById={postSlugsById} />
    ));
    out.push(
      bufferType === "bulleted_list_item" ? (
        <ul
          key={`${buffer[0].id}-list`}
          className="my-4 list-disc space-y-2 pl-5 marker:text-madder"
        >
          {items}
        </ul>
      ) : (
        <ol
          key={`${buffer[0].id}-list`}
          className="my-4 list-decimal space-y-2 pl-5 marker:text-madder marker:font-mono marker:text-sm"
        >
          {items}
        </ol>
      ),
    );
    buffer = [];
    bufferType = null;
  };

  for (const block of blocks) {
    if (
      block.type === "bulleted_list_item" ||
      block.type === "numbered_list_item"
    ) {
      if (bufferType && block.type !== bufferType) flush();
      bufferType = block.type;
      buffer.push(block);
    } else {
      flush();
      out.push(<Block key={block.id} block={block} postSlugsById={postSlugsById} />);
    }
  }
  flush();

  return <>{out}</>;
}
