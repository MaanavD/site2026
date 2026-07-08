"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Gloss } from "./gloss";
import { LotusSeal, Marigold } from "./motifs";
import { stamp } from "@/lib/sound";
import { isRead, markRead } from "@/lib/read-marks";

// where the marigolds sit along the garland (fractions of the read)
const BLOOMS = [0.12, 0.3, 0.48, 0.66, 0.84, 1];

// one marigold on the string: dim bud until the reader's thread reaches
// it, then it blooms
function GarlandBloom({
  at,
  index,
  progress,
}: {
  at: number;
  index: number;
  progress: MotionValue<number>;
}) {
  const grow = useTransform(progress, [Math.max(0, at - 0.05), at], [0, 1]);
  const opacity = useTransform(grow, [0, 1], [0.18, 1]);
  const scale = useTransform(grow, [0, 1], [0.45, 1]);
  const last = at === 1;

  return (
    <motion.span
      className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 ${
        last ? "text-madder" : "text-turmeric"
      }`}
      style={{
        top: `${at * 100}%`,
        opacity,
        scale,
        rotate: index % 2 ? 15 : -12,
      }}
    >
      <Marigold className={last ? "h-5 w-5" : "h-3.5 w-3.5"} />
    </motion.span>
  );
}

export function PostShell({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.15", "end 0.85"],
  });
  const tipTop = useTransform(scrollYProgress, (v) => `calc(${v * 100}% - 5px)`);
  const tipOpacity = useTransform(scrollYProgress, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);

  return (
    <article ref={ref} className="relative mx-auto max-w-3xl px-6 pt-36 pb-28">
      {/* reading progress: a garland strung down the margin, one marigold
          blooming at a time as the reader's thread reaches it */}
      <div
        aria-hidden
        className="absolute -left-10 top-40 bottom-40 hidden w-6 lg:block xl:-left-20"
      >
        {/* the bare string */}
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-paper/10" />
        {/* the threaded part, dyed as it goes */}
        <motion.div
          className="absolute inset-y-0 left-1/2 w-[2px] origin-top -translate-x-1/2 bg-gradient-to-b from-peacock via-madder to-turmeric"
          style={{ scaleY: scrollYProgress }}
        />
        {/* the knot at the top */}
        <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-peacock" />
        {BLOOMS.map((at, i) => (
          <GarlandBloom
            key={at}
            at={at}
            index={i}
            progress={scrollYProgress}
          />
        ))}
        {/* the needle, glinting where the thread currently is */}
        <motion.div
          className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-turmeric blur-[1px] shadow-[0_0_14px_rgba(217,164,65,0.8)]"
          style={{ top: tipTop, opacity: tipOpacity }}
        />
      </div>

      {children}
      <EndHanko slug={slug} />
    </article>
  );
}

function EndHanko({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const [already, setAlready] = useState(false);
  const stamped = useRef(false);

  useEffect(() => setAlready(isRead(slug)), [slug]);

  useEffect(() => {
    if (inView && !stamped.current) {
      stamped.current = true;
      if (!already) stamp();
      markRead(slug);
    }
  }, [inView, slug, already]);

  return (
    <div ref={ref} className="mt-20 flex flex-col items-center gap-3">
      <Gloss gloss="stamped. you finished it." side="top">
        <motion.span
          initial={
            already
              ? { scale: 1, opacity: 0.85, rotate: 3 }
              : { scale: 2.4, opacity: 0, rotate: -10 }
          }
          animate={
            inView ? { scale: 1, opacity: already ? 0.85 : 1, rotate: 3 } : {}
          }
          transition={{ type: "spring", stiffness: 320, damping: 19 }}
          className="flex h-14 w-14 items-center justify-center rounded-sm bg-madder text-ink-950 shadow-[0_0_30px_rgba(143,59,46,0.35)]"
        >
          <LotusSeal className="h-9 w-9" />
        </motion.span>
      </Gloss>
      <span className="font-mono text-[10px] tracking-widest text-paper-faint">
        READ
      </span>
    </div>
  );
}
