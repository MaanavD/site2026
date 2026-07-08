import { TransitionLink } from "@/components/ink-transition";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      {/* a lotus adrift on dark water */}
      <svg
        viewBox="0 0 400 320"
        aria-hidden
        className="w-72 max-w-full text-ink-700 md:w-96"
      >
        <g
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* petals */}
          <path d="M200 118 C 226 150, 229 196, 200 230 C 171 196, 174 150, 200 118 Z" />
          <path d="M138 138 C 167 159, 186 196, 194 228 C 159 215, 138 180, 138 138 Z" />
          <path d="M262 138 C 233 159, 214 196, 206 228 C 241 215, 262 180, 262 138 Z" />
          <path d="M84 184 C 118 195, 153 213, 182 233 C 139 239, 99 222, 84 184 Z" />
          <path d="M316 184 C 282 195, 247 213, 218 233 C 261 239, 301 222, 316 184 Z" />
          {/* the water it floats on */}
          <path d="M62 252 Q 200 270 338 252" strokeWidth="4" />
          <path d="M112 274 Q 200 286 288 274" strokeWidth="3" opacity="0.7" />
          <path d="M152 294 Q 200 301 248 294" strokeWidth="2.5" opacity="0.45" />
        </g>
        {/* a lamp burning at the lotus heart */}
        <circle cx="200" cy="192" r="7" fill="var(--color-turmeric)">
          <animate
            attributeName="opacity"
            values="0.5;1;0.5"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="200" cy="192" r="22" fill="var(--color-turmeric)" opacity="0.12">
          <animate
            attributeName="r"
            values="18;26;18"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* drifting river mist */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64"
      >
        <div className="fog absolute bottom-6 left-[-20%] h-32 w-[70%] rounded-full bg-paper/4 blur-3xl" />
        <div className="fog-slow absolute bottom-0 right-[-25%] h-40 w-[80%] rounded-full bg-paper/5 blur-3xl" />
      </div>

      <p className="mt-10 font-mono text-xs uppercase tracking-[0.35em] text-turmeric">
        404 · Off the path
      </p>
      <h1 className="mt-4 font-display text-4xl text-paper md:text-5xl">
        You&apos;ve wandered into the water
      </h1>
      <p className="mx-auto mt-6 max-w-sm text-paper-dim">
        This page doesn&apos;t exist, or it drifted off downstream (pages do
        that here). The lotus marks the way back.
      </p>
      <p className="mx-auto mt-3 max-w-sm text-sm text-paper-faint">
        Hanuman once leapt at the sun thinking it was a mango, so you&apos;re
        in good company.
      </p>
      <TransitionLink
        href="/"
        className="mt-10 rounded-sm bg-madder px-8 py-4 font-medium text-ink-950 transition-transform duration-300 hover:-translate-y-0.5"
      >
        Float back home
      </TransitionLink>
    </div>
  );
}
