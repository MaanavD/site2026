export default function LoadingPost() {
  return (
    <article
      className="relative mx-auto max-w-[52rem] pt-28 pb-24 sm:px-6 sm:pt-32"
      aria-busy="true"
    >
      <div className="sheet px-6 py-14 sm:rounded-[2px] sm:px-12 sm:py-16 md:px-16 md:py-20">
        <div className="h-3 w-24 animate-pulse rounded-sm bg-paper/10 motion-reduce:animate-none" />
        <div className="mt-10 h-3 w-36 animate-pulse rounded-sm bg-paper/10 motion-reduce:animate-none" />
        <div className="mt-5 h-14 w-4/5 animate-pulse rounded-sm bg-paper/10 motion-reduce:animate-none" />
        <div className="mt-16 space-y-5">
          <div className="h-4 w-full animate-pulse rounded-sm bg-paper/8 motion-reduce:animate-none" />
          <div className="h-4 w-11/12 animate-pulse rounded-sm bg-paper/8 motion-reduce:animate-none" />
          <div className="h-4 w-4/5 animate-pulse rounded-sm bg-paper/8 motion-reduce:animate-none" />
        </div>
        <span className="sr-only">Loading post</span>
      </div>
    </article>
  );
}
