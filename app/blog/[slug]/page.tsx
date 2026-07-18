import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostHeader } from "@/components/post-header";
import { PostShell } from "@/components/post-shell";
import { PostNavigation } from "@/components/post-navigation";
import { getPosts, getPostBySlug, getBlocksWithChildren } from "@/lib/notion";
import { formatDate } from "@/lib/format";
import { ListBlocks } from "@/components/notion/list-blocks";
import {
  absoluteUrl,
  AUTHOR_NAME,
  canonicalAlternates,
  descriptionFromBlocks,
  serializeJsonLd,
  sharedOpenGraph,
  sharedTwitter,
  SITE_URL,
} from "@/lib/seo";

export const revalidate = 3600;

function fallbackDescription(post: { title: string; category: string | null }) {
  const category = post.category ? `, filed under ${post.category}` : "";
  return `${post.title}${category}. A field note by ${AUTHOR_NAME}.`;
}

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
  const blocks = post && !post.isMock ? await getBlocksWithChildren(post.id) : [];
  const title = post?.title ?? "Post";
  const description = post
    ? descriptionFromBlocks(blocks, fallbackDescription(post))
    : `Writing by ${AUTHOR_NAME}.`;

  return {
    title,
    description,
    alternates: canonicalAlternates(`/blog/${slug}`),
    category: post?.category || undefined,
    openGraph: {
      ...sharedOpenGraph,
      title,
      description,
      url: `/blog/${slug}`,
      type: "article",
      publishedTime: post?.date || undefined,
      authors: [AUTHOR_NAME],
      tags: post?.category ? [post.category] : undefined,
    },
    twitter: {
      ...sharedTwitter,
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

  const [blocks, posts] = await Promise.all([
    post.isMock ? Promise.resolve([]) : getBlocksWithChildren(post.id),
    getPosts(),
  ]);
  const description = descriptionFromBlocks(blocks, fallbackDescription(post));
  const postIndex = posts.findIndex((candidate) => candidate.slug === post.slug);
  const postSlugsById = Object.fromEntries(
    posts.map((candidate) => [candidate.id, candidate.slug]),
  );
  const newer = postIndex > 0 ? posts[postIndex - 1] : undefined;
  const older = postIndex >= 0 ? posts[postIndex + 1] : undefined;
  const postUrl = absoluteUrl(`/blog/${post.slug}`);
  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    headline: post.title,
    description,
    url: postUrl,
    mainEntityOfPage: postUrl,
    image: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
    datePublished: post.date || undefined,
    articleSection: post.category || undefined,
    inLanguage: "en-US",
    author: {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    isPartOf: {
      "@type": "Blog",
      name: "Writing · Maanav Dalal",
      url: absoluteUrl("/blog"),
    },
  };

  return (
    <PostShell slug={post.slug}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(postJsonLd) }}
      />
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
          <ListBlocks blocks={blocks} postSlugsById={postSlugsById} />
        </div>
      )}

      <PostNavigation newer={newer} older={older} />
    </PostShell>
  );
}
