"use client";

import { useEffect, useState } from "react";
import { isRead } from "@/lib/read-marks";

// tiny 真 seal beside posts the visitor has finished
export function ReadStamp({ slug }: { slug: string }) {
  const [read, setRead] = useState(false);

  useEffect(() => setRead(isRead(slug)), [slug]);
  if (!read) return null;

  return (
    <span
      title="読了 · you've read this"
      className="ml-3 inline-flex rotate-6 rounded-[2px] border border-moss/50 px-1 font-display text-[11px] leading-relaxed text-moss"
    >
      真
    </span>
  );
}
