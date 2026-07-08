import { dyeCard, OG_SIZE } from "@/lib/og";
import { getPostBySlug } from "@/lib/notion";
import { formatDate } from "@/lib/format";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Blog post by Maanav Dalal";
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return dyeCard({
    title: post?.title ?? "Writing",
    kicker: [post?.category, post?.date ? formatDate(post.date) : null]
      .filter(Boolean)
      .join(" · "),
    watermark: "paisley",
  });
}
