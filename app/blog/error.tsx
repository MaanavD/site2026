"use client";

import { useEffect } from "react";

export default function BlogError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl px-6 pt-36 pb-28">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-turmeric">
        Writing
      </p>
      <h1 className="mt-4 font-display text-4xl text-paper md:text-5xl">
        The river took a wrong turn.
      </h1>
      <p className="mt-5 max-w-md leading-relaxed text-paper-dim">
        This page did not load. Try it once more (rivers are allowed a second
        attempt).
      </p>
      <button
        type="button"
        onClick={unstable_retry}
        className="brush-link mt-8 font-mono text-sm text-paper-dim transition-colors hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-turmeric"
      >
        Try again
      </button>
    </div>
  );
}
