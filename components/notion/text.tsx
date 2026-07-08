import React, { Fragment } from "react";

const notionColors: Record<string, string> = {
  red: "#c75b39",
  orange: "#d9a05b",
  yellow: "#d9c05b",
  green: "#7a8b6f",
  blue: "#6f7f8b",
  purple: "#8b6f85",
  pink: "#b0707f",
  brown: "#a08b6f",
  gray: "#a9a294",
};

export default function Text({ text }: { text: any[] }) {
  if (!text) return null;

  return text.map((value, index) => {
    const {
      annotations: { bold, code, color, italic, strikethrough, underline },
      text,
    } = value;

    if (!text) return null;

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

    const renderLine = (content: string) =>
      text.link ? (
        <a href={text.link.url} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        content
      );

    if (
      typeof text.content === "string" &&
      /[\r\n\u2028\u2029]/.test(text.content)
    ) {
      const lines = text.content
        .replace(/\r\n?/g, "\n")
        .replace(/[\u2028\u2029]/g, "\n")
        .split("\n");
      return (
        <span key={index} className={className} style={style}>
          {lines.map((line: string, li: number) => (
            <Fragment key={li}>
              {li > 0 && <br />}
              {renderLine(line)}
            </Fragment>
          ))}
        </span>
      );
    }

    return (
      <span key={index} className={className} style={style}>
        {renderLine(text.content)}
      </span>
    );
  });
}
