export default function LoadingBlog() {
  return (
    <div
      className="relative mx-auto max-w-[52rem] pt-28 pb-24 sm:px-6 sm:pt-32"
      aria-busy="true"
    >
      <div className="sheet px-6 py-14 sm:rounded-[2px] sm:px-12 sm:py-16 md:px-16 md:py-20">
        <div className="h-14 w-2/3 animate-pulse rounded-sm bg-paper/10 motion-reduce:animate-none" />
        <div className="mt-6 h-4 w-3/5 animate-pulse rounded-sm bg-paper/8 motion-reduce:animate-none" />
        <div className="mt-16 space-y-8">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-7 w-1/2 animate-pulse rounded-sm bg-paper/10 motion-reduce:animate-none" />
              <div className="h-4 w-11/12 animate-pulse rounded-sm bg-paper/8 motion-reduce:animate-none" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading writing</span>
      </div>
    </div>
  );
}
