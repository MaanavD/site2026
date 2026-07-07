import Link from "next/link";
import { Gloss } from "./gloss";
import { getCurrently } from "@/lib/currently";

export async function Footer() {
  const currently = await getCurrently();

  return (
    <footer className="relative border-t border-paper/8 bg-ink-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-12 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-paper/8 pb-8">
          <Gloss gloss='genzai · "right now"' side="top">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-moss">
              現在 Currently
            </span>
          </Gloss>
          {currently.map((item, i) => (
            <span key={i} className="text-sm text-paper-dim">
              {i > 0 && <span className="mr-3 text-paper-faint">·</span>}
              {item}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-3xl text-paper md:text-4xl">
              <Gloss gloss="ma · the pause that gives everything else meaning" side="top">
                <span>間</span>
              </Gloss>{" "}
              <span className="text-paper-faint">·</span> the space between
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-paper-dim">
              Demos and talks at Black Forest Labs. Meandering everywhere
              else.
            </p>
          </div>
          <ul className="flex gap-6 text-sm text-paper-dim">
            <li>
              <a
                className="brush-link hover:text-paper"
                href="https://github.com/MaanavD"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                className="brush-link hover:text-paper"
                href="https://linkedin.com/in/maanavdalal"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <Link className="brush-link hover:text-paper" href="/blog/rss.xml">
                RSS
              </Link>
            </li>
          </ul>
        </div>
        <div className="mt-12 flex items-center justify-between text-xs text-paper-faint">
          <p>© 2026 Maanav Dalal</p>
          <p>Set in Shippori Mincho · Ink rendered live in WebGL</p>
        </div>
      </div>
    </footer>
  );
}
