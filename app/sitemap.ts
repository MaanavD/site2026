import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/notion";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = (await getPosts()).filter((post) => !post.isMock);
  const latestPostDate = posts.find((post) => post.date)?.date;

  return [
    {
      url: absoluteUrl("/"),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/blog"),
      lastModified: latestPostDate || undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.date || undefined,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
