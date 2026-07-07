import { Reveal } from "./reveal";

export function SectionHeading({
  kanji,
  gloss,
  title,
  sub,
}: {
  kanji: string;
  gloss: string;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="relative mb-14">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-4 select-none font-display text-[10rem] leading-none text-paper/4"
      >
        {kanji}
      </span>
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-moss">
        {sub}
      </p>
      <h2 className="mt-3 font-display text-4xl text-paper md:text-5xl">
        {title}
      </h2>
      <p className="mt-3 font-mono text-[11px] text-paper-faint">
        {kanji} {gloss}
      </p>
    </Reveal>
  );
}
