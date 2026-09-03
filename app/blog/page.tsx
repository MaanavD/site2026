import type { Metadata } from "next";
import { TransitionLink } from "@/components/ink-transition";
import { getExcerpt, getPosts } from "@/lib/notion";
import { clip, formatDate, mostCommon } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { ReadStamp } from "@/components/read-stamp";
import { RiverLines } from "@/components/motifs";
import {
  BLOG_DESCRIPTION,
  canonicalAlternates,
  sharedOpenGraph,
  sharedTwitter,
} from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Writing",
  description: BLOG_DESCRIPTION,
  alternates: canonicalAlternates("/blog"),
  openGraph: {
    ...sharedOpenGraph,
    title: "Writing · Maanav Dalal",
    description: BLOG_DESCRIPTION,
    url: "/blog",
    type: "website",
  },
  twitter: {
    ...sharedTwitter,
    title: "Writing · Maanav Dalal",
    description: BLOG_DESCRIPTION,
  },
};

export default async function BlogPage() {
  const posts = await getPosts();
  const usual = mostCommon(posts.map((p) => p.category));
  const excerpts = new Map(
    await Promise.all(
      posts.map(async (p) => [p.id, await getExcerpt(p)] as const),
    ),
  );
  const byYear = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const year = post.date?.slice(0, 4) || "Undated";
    (acc[year] ??= []).push(post);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="relative mx-auto max-w-[52rem] pt-28 pb-24 sm:px-6 sm:pt-32">
      <div className="sheet relative px-6 py-14 sm:rounded-[2px] sm:px-12 sm:py-16 md:px-16 md:py-20">
      <span
        aria-hidden
        className="pointer-events-none absolute top-10 right-10 w-40 select-none text-paper/8"
      >
        <RiverLines className="w-full" />
      </span>
      <Reveal>
        <h1 className="font-display text-5xl text-paper md:text-6xl">
          Meanderings
        </h1>
        <p className="mt-5 max-w-md text-lg text-paper-dim">
          Mostly life, sometimes AI, written on planes and long train rides.
          They take the scenic route.
        </p>
      </Reveal>

      {posts[0]?.isMock && (
        <p className="mt-8 rounded-sm border border-turmeric/25 bg-turmeric/5 p-4 font-mono text-xs text-turmeric">
          Preview data: set NOTION_TOKEN in .env.local to load real posts.
        </p>
      )}

      <div className="mt-16 space-y-14">
        {years.map((year) => (
          <section key={year}>
            <h2 className="mb-4 font-mono text-sm text-paper-faint">{year}</h2>
            <div className="divide-y divide-paper/8 border-y border-paper/8">
              {byYear[year].map((post, i) => {
                const excerpt = excerpts.get(post.id);
                return (
                  <Reveal key={post.id} delay={i * 0.05}>
                    <TransitionLink
                      href={`/blog/${post.slug}`}
                      morph
                      className="group flex items-baseline justify-between gap-6 py-6 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
                    >
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-display text-2xl text-paper-dim transition-colors group-hover:text-paper group-focus-visible:text-paper md:text-3xl">
                          <span data-morph={post.title}>{post.title}</span>
                          <ReadStamp slug={post.slug} />
                        </h3>
                        {excerpt && (
                          <p className="mt-2 line-clamp-2 text-lg leading-snug text-paper-faint transition-colors group-hover:text-paper-dim">
                            {clip(excerpt)}
                          </p>
                        )}
                        <p className="mt-3 font-mono text-xs text-paper-faint">
                          {formatDate(post.date)}
                          {post.category && post.category !== usual && (
                            <span className="ml-3 text-turmeric">
                              {post.category}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className="shrink-0 text-madder opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:opacity-100">
                        →
                      </span>
                    </TransitionLink>
                  </Reveal>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      </div>
    </div>
  );
}
