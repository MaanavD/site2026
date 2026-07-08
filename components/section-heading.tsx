import { Reveal } from "./reveal";

export function SectionHeading({
  motif,
  title,
  sub,
}: {
  motif?: React.ReactNode;
  title: string;
  sub?: string;
}) {
  return (
    <Reveal className="relative mb-14">
      {motif && (
        <span
          aria-hidden
          className="pointer-events-none absolute -top-14 -left-6 w-36 select-none text-paper/6"
        >
          {motif}
        </span>
      )}
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-turmeric">
        {sub}
      </p>
      <h2 className="mt-3 font-display text-4xl text-paper md:text-5xl">
        {title}
      </h2>
    </Reveal>
  );
}
