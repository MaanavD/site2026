import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostHeader } from "@/components/post-header";
import { PostShell } from "@/components/post-shell";
import { getPosts, getPostBySlug, getBlocksWithChildren } from "@/lib/notion";
import { formatDate } from "@/lib/format";
import { ListBlocks } from "@/components/notion/list-blocks";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.filter((p) => !p.isMock).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const title = post?.title ?? "Post";
  const description = post
    ? [post.category, post.date ? formatDate(post.date) : null, "by Maanav Dalal"]
        .filter(Boolean)
        .join(" · ")
    : "Writing by Maanav Dalal.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/blog/${slug}`,
      type: "article",
      publishedTime: post?.date || undefined,
      authors: ["Maanav Dalal"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const blocks = post.isMock ? [] : await getBlocksWithChildren(post.id);

  return (
    <PostShell slug={post.slug}>
      <PostHeader
        title={post.title}
        date={formatDate(post.date)}
        category={post.category}
      />

      {post.isMock ? (
        <p className="rounded-sm border border-turmeric/25 bg-turmeric/5 p-4 font-mono text-xs text-turmeric">
          Preview post: set NOTION_TOKEN in .env.local to load real content.
        </p>
      ) : (
        <div className="prose-ink">
          <ListBlocks blocks={blocks} />
        </div>
      )}
    </PostShell>
  );
}
