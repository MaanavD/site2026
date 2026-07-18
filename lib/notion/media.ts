import { createHmac, timingSafeEqual } from "node:crypto";
import type { NotionMediaType } from "./types";

const MEDIA_TOKEN_BYTES = 24;

export function signNotionMediaBlockId(blockId: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(`notion-media:${blockId}`)
    .digest("hex")
    .slice(0, MEDIA_TOKEN_BYTES * 2);
}

export function verifyNotionMediaToken(
  blockId: string,
  token: string | null,
  secret: string,
): boolean {
  if (!token || token.length !== MEDIA_TOKEN_BYTES * 2) return false;
  const expected = Buffer.from(signNotionMediaBlockId(blockId, secret), "hex");
  const received = Buffer.from(token, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

const IMAGE_CONTENT_TYPES = new Set([
  "image/avif",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export function supportedMediaContentType(
  type: NotionMediaType,
  header: string | null,
): string | null {
  if (type === "file") return "application/octet-stream";
  if (!header) return null;

  const contentType = header.split(";", 1)[0].trim().toLowerCase();
  if (type === "image") {
    return IMAGE_CONTENT_TYPES.has(contentType) ? contentType : null;
  }
  if (type === "audio") {
    return contentType.startsWith("audio/") ? contentType : null;
  }
  if (type === "video") {
    return contentType.startsWith("video/") ? contentType : null;
  }
  return contentType === "application/pdf" ? contentType : null;
}

export function mediaCacheControl(status: number, ranged = false): string {
  if (ranged || status === 206) return "private, no-store";
  return "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400";
}
