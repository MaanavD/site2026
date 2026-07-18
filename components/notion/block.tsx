import Image from "next/image";
import type { NotionBlock } from "@/lib/notion/types";
import Text from "./text";
import { ListBlocks } from "./list-blocks";
import { TodoCheckbox } from "./todo-checkbox";
import { Gloss } from "../gloss";
import { Marigold } from "../motifs";

type MediaValue =
  | { type: "external"; external: { url: string } }
  | { type: "file"; file: { url: string } };

const mediaUrl = (value: MediaValue) =>
  value.type === "external" ? value.external.url : value.file.url;

const plainText = (text: { plain_text: string }[]) =>
  text.map((item) => item.plain_text).join("").trim();

function safeExternalUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function videoEmbedUrl(value: string): string | null {
  const safeUrl = safeExternalUrl(value);
  if (!safeUrl) return null;
  const url = new URL(safeUrl);

  if (url.hostname === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (url.hostname.endsWith("youtube.com")) {
    const id =
      url.searchParams.get("v") ??
      url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (url.hostname === "vimeo.com" || url.hostname === "www.vimeo.com") {
    const id = url.pathname.match(/^\/(\d+)/)?.[1];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }

  if (url.hostname === "player.vimeo.com") return safeUrl;
  return null;
}

export type PostSlugMap = Readonly<Record<string, string>>;

export default function Block({
  block,
  postSlugsById = {},
}: {
  block: NotionBlock;
  postSlugsById?: PostSlugMap;
}) {
  switch (block.type) {
    case "paragraph":
      if (!block.children?.length) {
        return (
          <p className="my-5">
            <Text text={block.paragraph.rich_text} />
          </p>
        );
      }
      return (
        <div className="my-5">
          <p>
            <Text text={block.paragraph.rich_text} />
          </p>
          <div className="pl-4">
            <ListBlocks blocks={block.children} postSlugsById={postSlugsById} />
          </div>
        </div>
      );
    case "heading_1":
      return (
        <h2 className="mt-14 mb-5 border-l-2 border-madder pl-4 font-display text-3xl text-paper">
          <Text text={block.heading_1.rich_text} />
        </h2>
      );
    case "heading_2":
      return (
        <h3 className="mt-10 mb-4 font-display text-2xl text-paper">
          <Text text={block.heading_2.rich_text} />
        </h3>
      );
    case "heading_3":
      return (
        <h4 className="mt-8 mb-3 font-display text-xl text-paper">
          <Text text={block.heading_3.rich_text} />
        </h4>
      );
    case "bulleted_list_item":
      return (
        <li className="pl-1">
          <Text text={block.bulleted_list_item.rich_text} />
          {!!block.children?.length && (
            <div className="pl-4">
              <ListBlocks blocks={block.children} postSlugsById={postSlugsById} />
            </div>
          )}
        </li>
      );
    case "numbered_list_item":
      return (
        <li className="pl-1">
          <Text text={block.numbered_list_item.rich_text} />
          {!!block.children?.length && (
            <div className="pl-4">
              <ListBlocks blocks={block.children} postSlugsById={postSlugsById} />
            </div>
          )}
        </li>
      );
    case "to_do":
      return (
        <TodoCheckbox
          id={block.id}
          initialChecked={block.to_do.checked}
          label={<Text text={block.to_do.rich_text} />}
        >
          {!!block.children?.length && (
            <div className="mt-2 pl-8">
              <ListBlocks blocks={block.children} postSlugsById={postSlugsById} />
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
            <Text text={block.toggle.rich_text} />
          </summary>
          {!!block.children?.length && (
            <div className="mt-3 border-t border-paper/8 pt-3 pl-4">
              <ListBlocks blocks={block.children} postSlugsById={postSlugsById} />
            </div>
          )}
        </details>
      );
    case "child_page": {
      const slug = postSlugsById[block.id];
      return slug ? (
        <a
          href={`/blog/${slug}`}
          className="my-4 block text-turmeric underline underline-offset-4 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
        >
          {block.child_page.title}
        </a>
      ) : (
        <p className="text-paper-faint">{block.child_page.title}</p>
      );
    }
    case "image": {
      const src = mediaUrl(block.image);
      const caption = plainText(block.image.caption);
      return (
        <figure className="my-12">
          <div className="relative">
            <span
              aria-hidden
              className="absolute -left-2 -top-2 h-full w-full rounded-sm border border-madder/35"
            />
            <div className="relative overflow-hidden rounded-sm border border-paper/10">
              <Image
                src={src}
                alt={caption}
                width={1200}
                height={800}
                className="w-full object-cover"
                sizes="(max-width: 768px) 100vw, 720px"
              />
              <span className="pointer-events-none absolute inset-0 bg-madder/5 mix-blend-overlay" />
            </div>
          </div>
          {caption && (
            <figcaption className="mt-4 flex items-center justify-center gap-2 font-mono text-xs text-paper-faint">
              <span aria-hidden className="h-px w-6 bg-madder/40" />
              <Text text={block.image.caption} />
              <span aria-hidden className="h-px w-6 bg-madder/40" />
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
          <Gloss gloss="a marigold, between thoughts" side="top">
            <Marigold className="h-4 w-4 text-turmeric/70" />
          </Gloss>
          <span className="h-px w-16 bg-paper/15" />
        </div>
      );
    case "quote":
      return (
        <blockquote className="relative my-10 rounded-sm border border-paper/8 border-l-2 border-l-madder bg-ink-900/70 py-5 pl-7 pr-6 font-display text-xl leading-relaxed text-paper/90 italic">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-1 left-2 font-display text-5xl not-italic leading-none text-madder/25"
          >
            &ldquo;
          </span>
          <Text text={block.quote.rich_text} />
        </blockquote>
      );
    case "code":
      return (
        <div className="my-8 overflow-hidden rounded-sm border border-paper/10">
          <div className="flex items-center justify-between border-b border-paper/8 bg-ink-800 px-4 py-2">
            <span className="font-mono text-xs text-paper-faint">
              {block.code.language ?? "code"}
            </span>
            <span className="flex gap-1.5" aria-hidden>
              <span className="h-2 w-2 rounded-full bg-peacock/70" />
              <span className="h-2 w-2 rounded-full bg-turmeric/70" />
              <span className="h-2 w-2 rounded-full bg-madder/70" />
            </span>
          </div>
          <pre className="overflow-x-auto bg-ink-900 p-5">
            <code className="font-mono text-sm leading-relaxed text-paper/85">
              <Text text={block.code.rich_text} />
            </code>
          </pre>
        </div>
      );
    case "file":
      return (
        <a
          href={mediaUrl(block.file)}
          className="my-4 flex items-center gap-2 text-turmeric underline underline-offset-4 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
        >
          {block.file.caption.length ? (
            <Text text={block.file.caption} />
          ) : (
            block.file.name || "Download file"
          )}{" "}
          ↓
        </a>
      );
    case "bookmark": {
      const url = safeExternalUrl(block.bookmark.url);
      if (!url) return null;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group my-6 block rounded-sm border border-paper/10 bg-ink-900 p-4 transition-colors hover:border-madder/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
        >
          <div className="truncate font-mono text-sm text-turmeric">{url}</div>
          {!!block.bookmark.caption.length && (
            <div className="mt-1 text-sm text-paper-faint">
              <Text text={block.bookmark.caption} />
            </div>
          )}
        </a>
      );
    }
    case "link_preview": {
      const url = safeExternalUrl(block.link_preview.url);
      if (!url) return null;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="group my-6 block rounded-sm border border-paper/10 bg-ink-900 p-4 transition-colors hover:border-madder/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
        >
          <div className="truncate font-mono text-sm text-turmeric">{url}</div>
        </a>
      );
    }
    case "callout": {
      const icon = block.callout.icon;
      const iconText =
        icon?.type === "emoji"
          ? icon.emoji
          : icon?.type === "file" || icon?.type === "external"
            ? "◦"
            : "🪔";
      return (
        <aside className="my-8 flex gap-4 rounded-sm border border-turmeric/25 bg-turmeric/5 p-5">
          <span
            aria-hidden
            className="shrink-0 font-display text-xl text-turmeric"
          >
            {iconText}
          </span>
          <div className="min-w-0 whitespace-pre-line text-paper/85">
            <Text text={block.callout.rich_text} />
            {!!block.children?.length && (
              <div className="mt-3">
                <ListBlocks blocks={block.children} postSlugsById={postSlugsById} />
              </div>
            )}
          </div>
        </aside>
      );
    }
    case "column_list":
      return (
        <div className="my-6 flex flex-col gap-6 md:flex-row">
          {!!block.children?.length && <ListBlocks blocks={block.children} postSlugsById={postSlugsById} />}
        </div>
      );
    case "column":
      return (
        <div className="min-w-0 flex-1">
          {!!block.children?.length && <ListBlocks blocks={block.children} postSlugsById={postSlugsById} />}
        </div>
      );
    case "table":
      return (
        <div className="my-8 overflow-x-auto rounded-sm border border-paper/10">
          <table className="w-full border-collapse text-sm">
            {!!block.children?.length && (
              <tbody>
                {block.children.map((row, rowIndex) => {
                  if (row.type !== "table_row") return null;
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-paper/8 last:border-0"
                    >
                      {row.table_row.cells.map((cell, cellIndex) => {
                        const isColumnHeader =
                          rowIndex === 0 && block.table.has_column_header;
                        const isRowHeader =
                          cellIndex === 0 && block.table.has_row_header;
                        const CellTag =
                          isColumnHeader || isRowHeader ? "th" : "td";
                        const scope = isColumnHeader
                          ? "col"
                          : isRowHeader
                            ? "row"
                            : undefined;

                        return (
                          <CellTag
                            key={cellIndex}
                            scope={scope}
                            className={`p-3 text-left ${
                              isColumnHeader || isRowHeader
                                ? "bg-ink-800 font-display text-paper"
                                : "text-paper/80"
                            }`}
                          >
                            <Text text={cell} />
                          </CellTag>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            )}
          </table>
        </div>
      );
    case "video": {
      const videoUrl = mediaUrl(block.video);
      const embedUrl = videoEmbedUrl(videoUrl);
      const caption = plainText(block.video.caption);
      return (
        <figure className="my-10">
          {embedUrl ? (
            <div className="aspect-video w-full overflow-hidden rounded-sm border border-paper/10">
              <iframe
                src={embedUrl}
                title={caption || "Video embedded in this article"}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : (
            <video
              controls
              preload="metadata"
              className="w-full rounded-sm border border-paper/10"
            >
              <source src={videoUrl} />
              <a href={videoUrl}>Download the video</a>
            </video>
          )}
          {block.video.caption.length > 0 && (
            <figcaption className="mt-3 text-center font-mono text-xs text-paper-faint">
              <Text text={block.video.caption} />
            </figcaption>
          )}
        </figure>
      );
    }
    case "embed": {
      const url = safeExternalUrl(block.embed.url);
      if (!url) return null;
      return (
        <div className="my-8">
          <iframe
            src={url}
            title={`Embedded content from ${new URL(url).hostname}`}
            loading="lazy"
            className="min-h-[300px] w-full rounded-sm border border-paper/10"
            sandbox="allow-forms allow-popups allow-scripts"
          />
        </div>
      );
    }
    case "link_to_page": {
      const pageId =
        block.link_to_page.type === "page_id"
          ? block.link_to_page.page_id
          : null;
      const slug = pageId ? postSlugsById[pageId] : null;
      return (
        <a
          href={slug ? `/blog/${slug}` : "/blog"}
          className="my-4 block text-turmeric underline underline-offset-4 hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
        >
          → {slug ? "Read the linked post" : "Browse the writing archive"}
        </a>
      );
    }
    case "pdf":
      return (
        <a
          href={mediaUrl(block.pdf)}
          target="_blank"
          rel="noopener noreferrer"
          className="my-4 flex items-center gap-2 text-turmeric underline underline-offset-4 hover:text-paper"
        >
          Open PDF ↗
        </a>
      );
    case "audio": {
      const audioUrl = mediaUrl(block.audio);
      return (
        <figure className="my-6">
          <audio controls preload="metadata" className="w-full">
            <source src={audioUrl} />
            <a href={audioUrl}>Download the audio</a>
          </audio>
          {block.audio.caption.length > 0 && (
            <figcaption className="mt-2 text-center font-mono text-xs text-paper-faint">
              <Text text={block.audio.caption} />
            </figcaption>
          )}
        </figure>
      );
    }
    case "equation":
      return (
        <div className="my-6 overflow-x-auto rounded-sm bg-ink-800 p-5 text-center font-mono text-lg text-paper/85">
          {block.equation.expression}
        </div>
      );
    case "synced_block":
    case "template":
      return block.children?.length ? (
        <ListBlocks blocks={block.children} postSlugsById={postSlugsById} />
      ) : null;
    case "breadcrumb":
    case "table_of_contents":
      return null;
    default:
      return null;
  }
}
