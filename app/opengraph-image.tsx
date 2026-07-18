import { dyeCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Maanav Dalal · Developer Relations Engineer at Black Forest Labs";

export default function Image() {
  return dyeCard({
    title: "Maanav Dalal",
    kicker: "Developer Relations Engineer · Black Forest Labs",
    subtitle:
      "Building demos, giving talks, and writing about AI, design, and life.",
    watermark: "tree",
  });
}
