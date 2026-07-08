import { dyeCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Writing by Maanav Dalal";

export default function Image() {
  return dyeCard({
    title: "Meanderings",
    kicker: "Writing · Maanav Dalal",
    subtitle:
      "Notes on life, AI, and everything in between. Written in Notion, printed here by hand.",
    watermark: "paisley",
  });
}
