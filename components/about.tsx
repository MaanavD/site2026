import Image from "next/image";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";
import { Gloss } from "./gloss";
import { LotusSeal } from "./motifs";
import { PursuitBlocks } from "./pursuit-blocks";

export function About() {
  return (
    <section id="about" className="relative scroll-mt-24 border-y border-paper/8 bg-ink-900/60">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 py-28 md:grid-cols-[1fr_1.2fr] md:items-center">
        <Reveal className="mx-auto w-full max-w-sm">
          <div className="relative">
            <span className="absolute -left-3 -top-3 h-full w-full rounded-sm border border-madder/40" />
            <div className="relative overflow-hidden rounded-sm">
              <Image
                src="/maanav.jpg"
                alt="Maanav Dalal"
                width={750}
                height={500}
                className="w-full object-cover grayscale-100 sepia-25 contrast-105"
                priority={false}
              />
              <span className="pointer-events-none absolute inset-0 bg-madder/10 mix-blend-overlay" />
            </div>
            <Gloss
              gloss="hand stamped, like everything here"
              side="top"
              className="absolute -bottom-4 -right-4"
            >
              <span className="flex h-12 w-12 rotate-3 items-center justify-center rounded-sm bg-madder text-paper">
                <LotusSeal className="h-8 w-8" />
              </span>
            </Gloss>
          </div>
          <p className="mt-10 flex justify-center gap-6 font-mono text-[11px] text-paper-faint">
            <a
              className="brush-link hover:text-paper focus-visible:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
              href="https://x.com/maanavdalal"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              className="brush-link hover:text-paper focus-visible:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
              href="https://www.linkedin.com/in/maanavdalal/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </p>
        </Reveal>

        <div>
          <SectionHeading sub="About" title="Hey, I'm Maanav" />
          <div className="space-y-5 text-base leading-relaxed text-paper-dim">
            <p>
              By day I&apos;m a Developer Relations Engineer at{" "}
              <a
                className="brush-link text-paper"
                href="https://bfl.ai"
                target="_blank"
                rel="noopener noreferrer"
              >
                Black Forest Labs
              </a>
              , which is a fancy way of saying I build demos, give talks, and
              write code that helps developers ship with FLUX. Before this I
              was an AI Product Manager at Microsoft, where I built the Foundry
              Local site and rebuilt the ONNX Runtime site.
            </p>
            <p>
              By night: designer, developer, and serial website rebuilder
              (you&apos;re looking at version seven). I write a quarterly
              newsletter for friends, and I meander in the blog whenever a
              train ride gets long enough.
            </p>
          </div>
          <PursuitBlocks />
        </div>
      </div>
    </section>
  );
}
