import React, { Fragment } from "react";
import type { NotionRichText } from "@/lib/notion/types";

const notionColors: Record<string, string> = {
  red: "#dc8066",
  orange: "#d9a05b",
  yellow: "#d9c05b",
  green: "#7a8b6f",
  blue: "#86a3b8",
  purple: "#b894b3",
  pink: "#b0707f",
  brown: "#a08b6f",
  gray: "#a9a294",
};

function safeLink(value: string): { href: string; external: boolean } | null {
  if (value.startsWith("/") || value.startsWith("#")) {
    return { href: value, external: false };
  }

  try {
    const url = new URL(value);
    if (!["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) {
      return null;
    }
    return {
      href: url.toString(),
      external: url.protocol === "http:" || url.protocol === "https:",
    };
  } catch {
    return null;
  }
}

export default function Text({ text }: { text: NotionRichText }) {
  return text.map((value, index) => {
    const { bold, code, color, italic, strikethrough, underline } =
      value.annotations;
    const content = value.plain_text;
    const className = [
      bold ? "font-semibold text-paper" : "",
      code
        ? "font-mono text-[0.9em] bg-ink-800 text-turmeric px-1.5 py-0.5 rounded-sm"
        : "",
      italic ? "italic" : "",
      strikethrough ? "line-through" : "",
      underline ? "underline" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const style =
      color !== "default" && notionColors[color]
        ? { color: notionColors[color] }
        : {};
    const link = value.href ? safeLink(value.href) : null;
    const renderLine = (line: string) =>
      link ? (
        <a
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turmeric"
        >
          {line}
        </a>
      ) : (
        line
      );

    const normalizedContent = content
      .replace(/\r\n?/g, "\n")
      .replaceAll(String.fromCharCode(0x2028), "\n")
      .replaceAll(String.fromCharCode(0x2029), "\n");

    if (normalizedContent.includes("\n")) {
      const lines = normalizedContent.split("\n");
      return (
        <span key={index} className={className} style={style}>
          {lines.map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex > 0 && <br />}
              {renderLine(line)}
            </Fragment>
          ))}
        </span>
      );
    }

    return (
      <span key={index} className={className} style={style}>
        {renderLine(content)}
      </span>
    );
  });
}
