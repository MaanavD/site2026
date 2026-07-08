"use client";

import React, { useState } from "react";
import Image from "next/image";
import Text from "./text";
import { ListBlocks } from "./list-blocks";
import { Gloss } from "../gloss";

const TodoCheckbox = ({
  id,
  initialChecked,
  children,
}: {
  id: string;
  initialChecked: boolean;
  children: React.ReactNode;
}) => {
  const [isChecked, setIsChecked] = useState(initialChecked);

  return (
    <div className="my-2 flex items-start gap-3">
      <input
        type="checkbox"
        id={id}
        checked={isChecked}
        onChange={() => setIsChecked(!isChecked)}
        className="mt-1.5 h-4 w-4 appearance-none rounded-sm border border-paper/30 bg-transparent transition-colors checked:border-madder checked:bg-madder"
      />
      <div className={isChecked ? "text-paper-faint line-through" : ""}>
        {children}
      </div>
    </div>
  );
};

const mediaUrl = (value: any) =>
  value?.type === "external"
    ? value.external?.url
    : value?.type === "file"
      ? value.file?.url
      : null;

export default function Block({ block }: { block: any }) {
  const { type, id } = block;
  const value = block[type];

  switch (type) {
    case "paragraph":
      return (
        <p className="my-5">
          <Text text={value.rich_text} />
        </p>
      );
    case "heading_1":
      return (
        <h2 className="mt-14 mb-5 border-l-2 border-madder pl-4 font-display text-3xl text-paper">
          <Text text={value.rich_text} />
        </h2>
      );
    case "heading_2":
      return (
        <h3 className="mt-10 mb-4 font-display text-2xl text-paper">
          <Text text={value.rich_text} />
        </h3>
      );
    case "heading_3":
      return (
        <h4 className="mt-8 mb-3 font-display text-xl text-paper">
          <Text text={value.rich_text} />
        </h4>
      );
    case "bulleted_list_item":
    case "numbered_list_item":
      return (
        <li className="pl-1">
          <Text text={value.rich_text} />
          {!!value.children?.length && (
            <div className="pl-4">
              <ListBlocks blocks={value.children} />
            </div>
          )}
        </li>
      );
    case "to_do":
      return (
        <TodoCheckbox id={id} initialChecked={value.checked}>
          <Text text={value.rich_text} />
          {!!value.children?.length && (
            <div className="mt-2 pl-4">
              <ListBlocks blocks={value.children} />
            </div>
          )}
        </TodoCheckbox>
      );
    case "toggle":
      return (
        <details className="group my-4 rounded-sm border border-paper/10 bg-ink-900 p-4 open:border-paper/20">
          <summary className="cursor-pointer list-none font-medium text-paper">
            <span className="mr-2 inline-block text-madder transition-transform duration-200 group-open:rotate-90">
              ▸
            </span>
            <Text text={value.rich_text} />
          </summary>
          {!!value.children && (
            <div className="mt-3 border-t border-paper/8 pt-3 pl-4">
              <ListBlocks blocks={value.children} />
            </div>
          )}
        </details>
      );
    case "child_page":
      return <p className="text-paper-faint">{value.title}</p>;
    case "image": {
      const src = mediaUrl(value);
      const caption = value.caption?.[0]?.plain_text ?? "";
      if (!src) return null;
      return (
        <figure className="my-10">
          <div className="relative overflow-hidden rounded-sm border border-paper/10">
            <Image
              src={src}
              alt={caption || "Blog image"}
              width={1200}
              height={800}
              className="w-full object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
            />
          </div>
          {caption && (
            <figcaption className="mt-3 text-center font-mono text-xs text-paper-faint">
              {caption}
            </figcaption>
          )}
        </figure>
      );
    }
    case "divider":
      return (
        <div
          aria-hidden
          className="my-12 flex items-center justify-center gap-4 text-paper-faint"
        >
          <span className="h-px w-16 bg-paper/15" />
          <Gloss gloss="ensō · the zen circle" side="top">
            <span className="font-display text-madder/70">◯</span>
          </Gloss>
          <span className="h-px w-16 bg-paper/15" />
        </div>
      );
    case "quote":
      return (
        <blockquote className="my-8 border-l-2 border-madder py-1 pl-6 font-display text-xl leading-relaxed text-paper/90 italic">
          <Text text={value.rich_text} />
        </blockquote>
      );
    case "code":
      return (
        <div className="my-8 overflow-hidden rounded-sm border border-paper/10">
          <div className="flex items-center justify-between border-b border-paper/8 bg-ink-800 px-4 py-2">
            <span className="font-mono text-xs text-paper-faint">
              {value.language ?? "code"}
            </span>
            <span className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-paper/15" />
              <span className="h-2 w-2 rounded-full bg-paper/15" />
              <span className="h-2 w-2 rounded-full bg-madder/60" />
            </span>
          </div>
          <pre className="overflow-x-auto bg-ink-900 p-5">
            <code className="font-mono text-sm leading-relaxed text-paper/85">
              <Text text={value.rich_text} />
            </code>
          </pre>
        </div>
      );
    case "file": {
      const fileUrl = mediaUrl(value);
      const fileText = value.caption?.[0]?.plain_text || "Download file";
      if (!fileUrl) return null;
      return (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="my-4 flex items-center gap-2 text-turmeric underline underline-offset-4 hover:text-paper"
        >
          {fileText} ↓
        </a>
      );
    }
    case "bookmark":
    case "link_preview":
      return (
        <a
          href={value.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group my-6 block rounded-sm border border-paper/10 bg-ink-900 p-4 transition-colors hover:border-madder/50"
        >
          <div className="truncate font-mono text-sm text-turmeric">
            {value.url}
          </div>
          {value.caption && (
            <div className="mt-1 text-sm text-paper-faint">
              <Text text={value.caption} />
            </div>
          )}
        </a>
      );
    case "callout": {
      const icon =
        value.icon?.emoji ||
        value.icon?.file?.url ||
        value.icon?.external?.url ||
        "🪔";
      return (
        <aside className="my-8 flex gap-4 rounded-sm border border-turmeric/25 bg-turmeric/5 p-5">
          <span
            aria-hidden
            className="shrink-0 font-display text-xl text-turmeric"
          >
            {typeof icon === "string" && icon.startsWith("http") ? "◦" : icon}
          </span>
          <div className="min-w-0 whitespace-pre-line text-paper/85">
            <Text text={value.rich_text} />
            {!!value.children?.length && (
              <div className="mt-3">
                <ListBlocks blocks={value.children} />
              </div>
            )}
          </div>
        </aside>
      );
    }
    case "column_list":
      return (
        <div className="my-6 flex flex-col gap-6 md:flex-row">
          {!!value.children && <ListBlocks blocks={value.children} />}
        </div>
      );
    case "column":
      return (
        <div className="min-w-0 flex-1">
          {!!value.children && <ListBlocks blocks={value.children} />}
        </div>
      );
    case "table":
      return (
        <div className="my-8 overflow-x-auto rounded-sm border border-paper/10">
          <table className="w-full border-collapse text-sm">
            {!!value.children && (
              <tbody>
                {value.children.map((row: any, rowIndex: number) => {
                  if (row.type !== "table_row") return null;
                  const cells = row.table_row?.cells || [];
                  const isHeader = rowIndex === 0 && value.has_column_header;
                  const CellTag = isHeader ? "th" : "td";
                  return (
                    <tr
                      key={row.id || rowIndex}
                      className="border-b border-paper/8 last:border-0"
                    >
                      {cells.map((cell: any[], cellIndex: number) => (
                        <CellTag
                          key={cellIndex}
                          className={`p-3 text-left ${
                            isHeader
                              ? "bg-ink-800 font-display text-paper"
                              : "text-paper/80"
                          }`}
                        >
                          <Text text={cell} />
                        </CellTag>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
      );
    case "video": {
      const videoUrl = mediaUrl(value);
      if (!videoUrl) return null;

      const youtubeMatch = videoUrl.match(
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/
      );
      if (youtubeMatch || videoUrl.includes("vimeo.com")) {
        const embedUrl = youtubeMatch
          ? `https://www.youtube.com/embed/${youtubeMatch[1]}`
          : videoUrl;
        return (
          <div className="my-10 aspect-video w-full overflow-hidden rounded-sm border border-paper/10">
            <iframe
              src={embedUrl}
              title="Embedded video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        );
      }
      return (
        <video
          controls
          className="my-10 w-full rounded-sm border border-paper/10"
        >
          <source src={videoUrl} />
        </video>
      );
    }
    case "embed":
      return (
        <div className="my-8">
          <iframe
            src={value.url}
            title="Embedded content"
            className="min-h-[300px] w-full rounded-sm border border-paper/10"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      );
    case "link_to_page": {
      const pageUrl =
        value.type === "page_id" && value.page_id
          ? `/blog/${value.page_id}`
          : "/blog";
      return (
        <a
          href={pageUrl}
          className="my-4 block text-turmeric underline underline-offset-4 hover:text-paper"
        >
          → Linked page
        </a>
      );
    }
    case "pdf": {
      const pdfUrl = mediaUrl(value);
      if (!pdfUrl) return null;
      return (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="my-4 flex items-center gap-2 text-turmeric underline underline-offset-4 hover:text-paper"
        >
          Open PDF ↗
        </a>
      );
    }
    case "audio": {
      const audioUrl = mediaUrl(value);
      if (!audioUrl) return null;
      return (
        <audio controls className="my-6 w-full">
          <source src={audioUrl} />
        </audio>
      );
    }
    case "equation":
      return (
        <div className="my-6 overflow-x-auto rounded-sm bg-ink-800 p-5 text-center font-mono text-lg text-paper/85">
          {value.expression}
        </div>
      );
    case "breadcrumb":
    case "table_of_contents":
      return null;
    default:
      return null;
  }
}
