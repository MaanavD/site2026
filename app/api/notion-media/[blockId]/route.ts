import "server-only";

import { APIErrorCode, isNotionClientError } from "@notionhq/client";
import { getNotionClient } from "@/lib/notion/client";
import { fetchNotionMedia } from "@/lib/notion/data";
import {
  mediaCacheControl,
  supportedMediaContentType,
  verifyNotionMediaToken,
} from "@/lib/notion/media";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BLOCK_ID = /^(?:[0-9a-f]{32}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;

function copyHeader(source: Headers, target: Headers, name: string) {
  const value = source.get(name);
  if (value) target.set(name, value);
}

function errorResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function encodeFilename(name: string) {
  return encodeURIComponent(name).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ blockId: string }> },
) {
  const { blockId } = await params;
  if (!BLOCK_ID.test(blockId)) {
    return errorResponse("Invalid Notion block ID", 400);
  }

  const secret = process.env.NOTION_TOKEN?.trim();
  const token = new URL(request.url).searchParams.get("token");
  if (!secret || !verifyNotionMediaToken(blockId, token, secret)) {
    return errorResponse("Notion media not found", 404);
  }

  try {
    const media = await fetchNotionMedia(getNotionClient(), blockId);
    if (!media) return errorResponse("Notion media not found", 404);

    const signedUrl = new URL(media.url);
    if (signedUrl.protocol !== "https:") {
      return errorResponse("Unsupported Notion media URL", 502);
    }

    const range = request.headers.get("range");
    const upstream = await fetch(signedUrl, {
      cache: "no-store",
      headers: range ? { range } : undefined,
      redirect: "error",
    });

    if (upstream.status !== 200 && upstream.status !== 206) {
      return errorResponse("Unable to load Notion media", 502);
    }

    const contentType = supportedMediaContentType(
      media.type,
      upstream.headers.get("content-type"),
    );
    if (!contentType) {
      await upstream.body?.cancel();
      return errorResponse("Unsupported Notion media type", 415);
    }

    const headers = new Headers({
      "Cache-Control": mediaCacheControl(upstream.status, Boolean(range)),
      "Content-Type": contentType,
      "Cross-Origin-Resource-Policy": "same-origin",
      "X-Content-Type-Options": "nosniff",
    });

    for (const name of [
      "accept-ranges",
      "content-length",
      "content-range",
      "etag",
      "last-modified",
    ]) {
      copyHeader(upstream.headers, headers, name);
    }

    if (range) headers.set("Vary", "Range");

    const contentDisposition = upstream.headers.get("content-disposition");
    if (media.type === "file") {
      headers.set(
        "Content-Disposition",
        media.name
          ? `attachment; filename*=UTF-8''${encodeFilename(media.name)}`
          : "attachment",
      );
    } else if (contentDisposition) {
      headers.set("Content-Disposition", contentDisposition);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    if (
      isNotionClientError(error) &&
      error.code === APIErrorCode.ObjectNotFound
    ) {
      return errorResponse("Notion media not found", 404);
    }
    console.error("Unable to serve Notion media", error);
    return errorResponse("Unable to load Notion media", 502);
  }
}
