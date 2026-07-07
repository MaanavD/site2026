import { TransitionLink } from "@/components/ink-transition";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* torii gate on a foggy path */}
      <svg
        viewBox="0 0 400 320"
        aria-hidden
        className="w-72 max-w-full text-ink-700 md:w-96"
      >
        {/* kasagi (top lintel, gentle upward curve) */}
        <path
          d="M20 62 Q200 34 380 62 L374 82 Q200 56 26 82 Z"
          fill="currentColor"
        />
        {/* nuki (second beam) */}
        <rect x="52" y="108" width="296" height="16" fill="currentColor" />
        {/* gakuzuka (center strut) */}
        <rect x="192" y="78" width="16" height="30" fill="currentColor" />
        {/* pillars, slightly splayed */}
        <path d="M72 74 L102 74 L112 300 L82 300 Z" fill="currentColor" />
        <path d="M298 74 L328 74 L318 300 L288 300 Z" fill="currentColor" />
        {/* lantern glow between the pillars */}
        <circle cx="200" cy="210" r="7" fill="var(--color-celadon)">
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="200" cy="210" r="22" fill="var(--color-celadon)" opacity="0.12">
          <animate
            attributeName="r"
            values="18;26;18"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* drifting fog banks */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
      >
        <div className="fog absolute bottom-6 left-[-20%] h-32 w-[70%] rounded-full bg-paper/4 blur-3xl" />
        <div className="fog-slow absolute bottom-0 right-[-25%] h-40 w-[80%] rounded-full bg-paper/5 blur-3xl" />
      </div>

      <p className="mt-10 font-mono text-xs uppercase tracking-[0.35em] text-moss">
        404 · Off the path
      </p>
      <h1 className="mt-4 font-display text-4xl text-paper md:text-5xl">
        道に迷いました
      </h1>
      <p className="mt-3 font-mono text-[11px] text-paper-faint">
        michi ni mayoimashita · you have lost your way
      </p>
      <p className="mx-auto mt-6 max-w-sm text-paper-dim">
        This page doesn&apos;t exist, or wandered off into the trees. The
        lantern knows the way back.
      </p>
      <TransitionLink
        href="/"
        className="mt-10 rounded-sm bg-moss px-8 py-4 font-medium text-ink-950 transition-transform duration-300 hover:-translate-y-0.5"
      >
        Follow the lantern home
      </TransitionLink>
    </div>
  );
}
