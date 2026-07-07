import React from "react";
import Block from "./block";

// Groups consecutive list items into ul/ol so Notion's flat block
// stream renders as proper lists.
export function ListBlocks({ blocks }: { blocks: any[] }) {
  const out: React.ReactNode[] = [];
  let buffer: any[] = [];
  let bufferType: "bulleted_list_item" | "numbered_list_item" | null = null;

  const flush = () => {
    if (!buffer.length || !bufferType) return;
    const items = buffer.map((b) => <Block key={b.id} block={b} />);
    out.push(
      bufferType === "bulleted_list_item" ? (
        <ul
          key={buffer[0].id + "-list"}
          className="my-4 list-disc space-y-2 pl-5 marker:text-moss"
        >
          {items}
        </ul>
      ) : (
        <ol
          key={buffer[0].id + "-list"}
          className="my-4 list-decimal space-y-2 pl-5 marker:text-moss marker:font-mono marker:text-sm"
        >
          {items}
        </ol>
      )
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
      out.push(<Block key={block.id} block={block} />);
    }
  }
  flush();

  return <>{out}</>;
}
