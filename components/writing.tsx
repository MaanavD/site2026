import { TransitionLink } from "@/components/ink-transition";
import { getPosts } from "@/lib/notion";
import { formatDate } from "@/lib/format";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { ReadStamp } from "./read-stamp";

export async function Writing() {
  const posts = (await getPosts()).slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-6 py-28">
      <SectionHeading
        kanji="筆"
        gloss='fude · "the brush"'
        sub="Writing"
        title="Recent meanderings"
      />
      <div className="divide-y divide-paper/8 border-y border-paper/8">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.08}>
            <TransitionLink
              href={`/blog/${post.slug}`}
              morph
              className="group flex items-baseline justify-between gap-6 py-7"
            >
              <div className="min-w-0">
                <p className="font-mono text-xs text-paper-faint">
                  {formatDate(post.date)}
                  {post.category && (
                    <span className="ml-3 text-moss">{post.category}</span>
                  )}
                </p>
                <h3 className="mt-2 truncate font-display text-2xl text-paper-dim transition-colors group-hover:text-paper md:text-3xl">
                  <span data-morph={post.title}>{post.title}</span>
                  <ReadStamp slug={post.slug} />
                </h3>
              </div>
              <span className="shrink-0 text-moss opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                →
              </span>
            </TransitionLink>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2} className="mt-10">
        <TransitionLink href="/blog" className="brush-link text-sm text-paper-dim hover:text-paper">
          All writing →
        </TransitionLink>
      </Reveal>
    </section>
  );
}
