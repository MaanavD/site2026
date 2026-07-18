import { describe, expect, test } from "bun:test";
import {
  mediaCacheControl,
  signNotionMediaBlockId,
  supportedMediaContentType,
  verifyNotionMediaToken,
} from "./media";

describe("Notion media responses", () => {
  test("requires a valid block-scoped media token", () => {
    const token = signNotionMediaBlockId("block-a", "secret");
    expect(verifyNotionMediaToken("block-a", token, "secret")).toBe(true);
    expect(verifyNotionMediaToken("block-b", token, "secret")).toBe(false);
    expect(verifyNotionMediaToken("block-a", token, "other-secret")).toBe(false);
    expect(verifyNotionMediaToken("block-a", null, "secret")).toBe(false);
  });

  test("accepts supported browser media and rejects active image content", () => {
    expect(supportedMediaContentType("image", "image/webp; charset=binary")).toBe(
      "image/webp",
    );
    expect(supportedMediaContentType("audio", "audio/mpeg")).toBe("audio/mpeg");
    expect(supportedMediaContentType("video", "video/mp4")).toBe("video/mp4");
    expect(supportedMediaContentType("pdf", "application/pdf")).toBe(
      "application/pdf",
    );
    expect(supportedMediaContentType("image", "image/svg+xml")).toBeNull();
    expect(supportedMediaContentType("image", "text/html")).toBeNull();
  });

  test("forces generic files to download as opaque bytes", () => {
    expect(supportedMediaContentType("file", "text/html")).toBe(
      "application/octet-stream",
    );
    expect(supportedMediaContentType("file", null)).toBe(
      "application/octet-stream",
    );
  });

  test("does not publicly cache ranged responses", () => {
    expect(mediaCacheControl(200)).toContain("public");
    expect(mediaCacheControl(206)).toBe("private, no-store");
    expect(mediaCacheControl(200, true)).toBe("private, no-store");
  });
});
