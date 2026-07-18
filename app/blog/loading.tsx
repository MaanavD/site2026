export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-36 pb-28" role="status">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-turmeric">
        Writing
      </p>
      <div className="mt-4 h-14 w-64 animate-pulse rounded-sm motion-reduce:animate-none bg-paper/8" />
      <div className="mt-16 space-y-14" aria-hidden>
        {[0, 1].map((year) => (
          <div key={year}>
            <div className="mb-4 h-3 w-10 rounded-sm bg-paper/8" />
            <div className="divide-y divide-paper/8 border-y border-paper/8">
              {[0, 1, 2].map((post) => (
                <div key={post} className="py-5">
                  <div className="h-7 w-3/4 animate-pulse rounded-sm motion-reduce:animate-none bg-paper/8" />
                  <div className="mt-2 h-3 w-32 animate-pulse rounded-sm motion-reduce:animate-none bg-paper/5" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading writing…</span>
    </div>
  );
}
