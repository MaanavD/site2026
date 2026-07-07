import { Reveal } from "./reveal";

export function ContactCta() {
  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden border-t border-paper/8">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[22rem] leading-none text-paper/3"
      >
        話
      </span>
      <div className="relative mx-auto max-w-6xl px-6 py-36 text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-moss">
            Contact <span className="ml-2 normal-case tracking-normal text-paper-faint">話 wa · &ldquo;conversation&rdquo;</span>
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-tight text-paper md:text-7xl">
            Let&apos;s make something worth staring at.
          </h2>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <a
              href="mailto:maanav@blackforestlabs.ai"
              className="rounded-sm bg-moss px-8 py-4 font-medium text-ink-950 transition-transform duration-300 hover:-translate-y-0.5"
            >
              Say hello
            </a>
            <a
              href="https://calendar.notion.so/meet/maanavdalal/n0b83mh4"
              target="_blank"
              rel="noopener noreferrer"
              className="brush-link text-sm text-paper-dim hover:text-paper"
            >
              Or book a time →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
