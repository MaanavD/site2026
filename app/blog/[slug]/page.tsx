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
  return { title: post?.title ?? "Post" };
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
        <p className="rounded-sm border border-celadon/25 bg-celadon/5 p-4 font-mono text-xs text-celadon">
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
