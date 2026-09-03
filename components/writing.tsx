import { TransitionLink } from "@/components/ink-transition";
import { getExcerpt, getPosts } from "@/lib/notion";
import { clip, formatDate, mostCommon } from "@/lib/format";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { ReadStamp } from "./read-stamp";
import { RiverLines } from "./motifs";

export async function Writing() {
  const all = await getPosts();
  const usual = mostCommon(all.map((p) => p.category));
  const posts = all.slice(0, 3);
  const excerpts = await Promise.all(posts.map(getExcerpt));

  return (
    <section className="mx-auto max-w-6xl px-0 py-28 sm:px-6">
      {/* three recent pieces, printed on a smaller sheet: a sampler of the blog */}
      <div className="sheet mx-auto max-w-[52rem] px-6 py-14 sm:rounded-[2px] sm:px-12 sm:py-16 md:px-16">
      <SectionHeading
        motif={<RiverLines className="w-full" />}
        title="Recent meanderings"
      />
      <div className="divide-y divide-paper/8 border-y border-paper/8">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.08}>
            <TransitionLink
              href={`/blog/${post.slug}`}
              morph
              className="group flex items-baseline justify-between gap-6 py-7 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
            >
              <div className="min-w-0 max-w-2xl">
                <h3 className="line-clamp-2 font-display text-2xl text-paper-dim transition-colors group-hover:text-paper group-focus-visible:text-paper md:text-3xl">
                  <span data-morph={post.title}>{post.title}</span>
                  <ReadStamp slug={post.slug} />
                </h3>
                {excerpts[i] && (
                  <p className="mt-2 line-clamp-2 text-lg leading-snug text-paper-faint transition-colors group-hover:text-paper-dim">
                    {clip(excerpts[i])}
                  </p>
                )}
                <p className="mt-3 font-mono text-xs text-paper-faint">
                  {formatDate(post.date)}
                  {post.category && post.category !== usual && (
                    <span className="ml-3 text-turmeric">{post.category}</span>
                  )}
                </p>
              </div>
              <span className="shrink-0 text-madder opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:opacity-100">
                →
              </span>
            </TransitionLink>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2} className="mt-10">
        <TransitionLink href="/blog" className="brush-link text-lg text-paper-dim hover:text-paper focus-visible:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric">
          All writing →
        </TransitionLink>
      </Reveal>
      </div>
    </section>
  );
}
