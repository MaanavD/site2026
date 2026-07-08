import { dyeCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Indian Craft Minimal theme study by Maanav Dalal";

export default function Image() {
  return dyeCard({
    title: "Indian Craft Minimal",
    kicker: "Theme Study · Maanav Dalal",
    subtitle:
      "Dye instead of ink, khadi instead of washi, blockprint instead of brushwork.",
    watermark: "tree",
  });
}
