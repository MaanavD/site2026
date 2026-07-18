import { TransitionLink } from "@/components/ink-transition";

type NeighborPost = {
  slug: string;
  title: string;
};

export function PostNavigation({
  newer,
  older,
}: {
  newer?: NeighborPost;
  older?: NeighborPost;
}) {
  if (!newer && !older) return null;

  return (
    <nav
      aria-label="More writing"
      className="mt-20 grid gap-px border-y border-paper/8 bg-paper/8 sm:grid-cols-2"
    >
      {newer ? (
        <TransitionLink
          href={`/blog/${newer.slug}`}
          className="group bg-ink-950 py-6 pr-5 transition-colors hover:bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-turmeric sm:pr-8"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper-faint">
            ← Newer
          </span>
          <span className="mt-2 block font-display text-xl leading-snug text-paper-dim transition-colors group-hover:text-paper group-focus-visible:text-paper">
            {newer.title}
          </span>
        </TransitionLink>
      ) : (
        <span className="hidden bg-ink-950 sm:block" />
      )}

      {older ? (
        <TransitionLink
          href={`/blog/${older.slug}`}
          className="group bg-ink-950 py-6 pl-5 text-right transition-colors hover:bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-turmeric sm:pl-8"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-paper-faint">
            Older →
          </span>
          <span className="mt-2 block font-display text-xl leading-snug text-paper-dim transition-colors group-hover:text-paper group-focus-visible:text-paper">
            {older.title}
          </span>
        </TransitionLink>
      ) : (
        <span className="hidden bg-ink-950 sm:block" />
      )}
    </nav>
  );
}
