import { dyeCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "The Rangoli Courtyard by Maanav Dalal";

export default function Image() {
  return dyeCard({
    title: "The Rangoli Courtyard",
    kicker: "Secret Found · Maanav Dalal",
    subtitle: "A hidden courtyard where every piece of writing draws its own rangoli.",
    watermark: "lotus",
  });
}
