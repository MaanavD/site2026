export default function LoadingPost() {
  return (
    <article className="mx-auto max-w-3xl px-6 pt-36 pb-28" aria-busy="true">
      <div className="h-3 w-24 animate-pulse rounded-sm bg-paper/10 motion-reduce:animate-none" />
      <div className="mt-10 h-3 w-36 animate-pulse rounded-sm bg-paper/10 motion-reduce:animate-none" />
      <div className="mt-5 h-14 w-4/5 animate-pulse rounded-sm bg-paper/10 motion-reduce:animate-none" />
      <div className="mt-16 space-y-5">
        <div className="h-4 w-full animate-pulse rounded-sm bg-paper/8 motion-reduce:animate-none" />
        <div className="h-4 w-11/12 animate-pulse rounded-sm bg-paper/8 motion-reduce:animate-none" />
        <div className="h-4 w-4/5 animate-pulse rounded-sm bg-paper/8 motion-reduce:animate-none" />
      </div>
      <span className="sr-only">Loading post</span>
    </article>
  );
}
