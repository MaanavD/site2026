import { Reveal } from "./reveal";

export function SectionHeading({
  motif,
  title,
}: {
  motif?: React.ReactNode;
  title: string;
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
      <h2 className="font-display text-4xl text-paper md:text-5xl">{title}</h2>
    </Reveal>
  );
}
