"use client";

import { LotusSeal } from "./motifs";
import { useReadStatus } from "./use-local-storage-boolean";

// tiny lotus seal beside posts the visitor has finished
export function ReadStamp({ slug }: { slug: string }) {
  const read = useReadStatus(slug);
  if (!read) return null;

  return (
    <span
      title="you've read this one"
      className="ml-3 inline-flex rotate-6 rounded-[2px] border border-madder/50 p-1 text-madder"
    >
      <LotusSeal className="h-3 w-3" />
    </span>
  );
}
