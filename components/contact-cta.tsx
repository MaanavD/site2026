import { Reveal } from "./reveal";

export function ContactCta() {
  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden border-t border-paper/8">
      <div className="relative mx-auto max-w-6xl px-6 py-36 text-center">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-turmeric">
            Contact
          </p>
          <h2 className="mx-auto mt-6 max-w-3xl font-display text-5xl leading-tight text-paper md:text-7xl">
            Got something weird worth building?
          </h2>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
            <a
              href="mailto:maanav@blackforestlabs.ai"
              className="rounded-sm bg-madder px-8 py-4 font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
            >
              Send me a note
            </a>
            <a
              href="https://calendar.notion.so/meet/maanavdalal/n0b83mh4"
              target="_blank"
              rel="noopener noreferrer"
              className="brush-link text-sm text-paper-dim hover:text-paper focus-visible:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
            >
              Book 30 minutes →
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
