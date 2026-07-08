"use client";

import { useEffect, useState } from "react";
import { isRead } from "@/lib/read-marks";
import { LotusSeal } from "./motifs";

// tiny lotus seal beside posts the visitor has finished
export function ReadStamp({ slug }: { slug: string }) {
  const [read, setRead] = useState(false);

  useEffect(() => setRead(isRead(slug)), [slug]);
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
