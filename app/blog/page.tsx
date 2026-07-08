import type { Metadata } from "next";
import { TransitionLink } from "@/components/ink-transition";
import { getPosts } from "@/lib/notion";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { ReadStamp } from "@/components/read-stamp";
import { Paisley } from "@/components/motifs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Writing",
  description: "Meanderings, reviews, and lists by Maanav Dalal.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  const byYear = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const year = post.date?.slice(0, 4) || "Undated";
    (acc[year] ??= []).push(post);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="relative mx-auto max-w-4xl px-6 pt-36 pb-28">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 right-0 w-52 select-none text-paper/5"
      >
        <Paisley className="w-full" />
      </span>
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-turmeric">
          Writing
        </p>
        <h1 className="mt-4 font-display text-5xl text-paper md:text-6xl">
          Meanderings
        </h1>
        <p className="mt-5 max-w-md text-paper-dim">
          Notes on life, AI, and everything in between. Written in Notion,
          printed here by hand (well, by shader).
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
              {byYear[year].map((post, i) => (
                <Reveal key={post.id} delay={i * 0.05}>
                  <TransitionLink
                    href={`/blog/${post.slug}`}
                    morph
                    className="group flex items-baseline justify-between gap-6 py-5"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-xl text-paper-dim transition-colors group-hover:text-paper md:text-2xl">
                        <span data-morph={post.title}>{post.title}</span>
                        <ReadStamp slug={post.slug} />
                      </h3>
                      <p className="mt-1 font-mono text-xs text-paper-faint">
                        {formatDate(post.date)}
                        {post.category && (
                          <span className="ml-3 text-turmeric">
                            {post.category}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="shrink-0 text-madder opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                      →
                    </span>
                  </TransitionLink>
                </Reveal>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
