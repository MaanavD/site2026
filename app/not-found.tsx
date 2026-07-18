import { TransitionLink } from "@/components/ink-transition";
import { LotusOutline, RiverLines } from "@/components/motifs";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div
        aria-hidden
        className="relative h-64 w-72 max-w-full text-ink-700 md:h-72 md:w-96"
      >
        <LotusOutline className="absolute left-1/2 top-8 h-44 w-44 -translate-x-1/2 md:h-52 md:w-52" />
        <RiverLines className="absolute inset-x-0 bottom-0 h-24 w-full opacity-70" />
        <span className="absolute left-1/2 top-[47%] h-4 w-4 -translate-x-1/2 rounded-full bg-turmeric" />
        <span className="absolute left-1/2 top-[47%] h-12 w-12 -translate-x-1/2 -translate-y-4 animate-pulse rounded-full bg-turmeric/10" />
      </div>

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
        className="mt-10 rounded-sm bg-madder px-8 py-4 font-medium text-paper transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
      >
        Float back home
      </TransitionLink>
    </div>
  );
}
