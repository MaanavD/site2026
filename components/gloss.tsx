const positions = {
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-3",
};

// One consistent hover treatment for every motif and mark on the site.
export function Gloss({
  gloss,
  children,
  className = "",
  side = "bottom",
}: {
  gloss: string;
  children: React.ReactNode;
  className?: string;
  side?: keyof typeof positions;
}) {
  return (
    <span className={`group/gloss relative inline-flex ${className}`}>
      {children}
      <span
        className={`pointer-events-none absolute z-20 whitespace-nowrap rounded-sm border border-paper/10 bg-ink-800/95 px-2.5 py-1 font-mono text-[10px] tracking-wide text-paper-dim opacity-0 transition-opacity duration-300 group-hover/gloss:opacity-100 group-focus-within/gloss:opacity-100 ${positions[side]}`}
      >
        {gloss}
      </span>
    </span>
  );
}
