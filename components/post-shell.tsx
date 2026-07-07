"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { Gloss } from "./gloss";
import { stamp } from "@/lib/sound";
import { isRead, markRead } from "@/lib/read-marks";

// a calligraphic vertical stroke, used as a CSS mask on the progress rail:
// pressed head, steady body, taper, and a dry-brush flick at the tail
const BRUSH_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 600' preserveAspectRatio='none'><filter id='r' x='-50%' y='-2%' width='200%' height='104%'><feTurbulence type='fractalNoise' baseFrequency='0.7 0.02' numOctaves='3' seed='7'/><feDisplacementMap in='SourceGraphic' scale='9'/></filter><g filter='url(#r)'><ellipse cx='12' cy='12' rx='6.5' ry='14' fill='white'/><path d='M12 10 C 15 90, 9 170, 12 260 C 15 350, 9 420, 12 478' stroke='white' stroke-width='9' fill='none' stroke-linecap='round'/><path d='M12 470 C 13.5 505, 10.5 535, 12 562' stroke='white' stroke-width='4.5' fill='none' stroke-linecap='round'/><path d='M12 552 C 12.6 572, 11.4 586, 12 598' stroke='white' stroke-width='1.8' fill='none' stroke-linecap='round'/><path d='M9.5 546 C 9 566, 8.6 578, 9 590' stroke='white' stroke-width='1' fill='none' opacity='0.8'/><path d='M15 300 C 14.4 360, 15.4 420, 14.8 470' stroke='white' stroke-width='0.8' fill='none' opacity='0.5'/></g></svg>`
)}")`;

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
      {/* reading progress: one brush stroke, painted as you read */}
      <div
        aria-hidden
        className="absolute -left-10 top-40 bottom-40 hidden w-6 lg:block xl:-left-20"
      >
        <div
          className="absolute inset-0"
          style={{
            maskImage: BRUSH_MASK,
            maskSize: "100% 100%",
            WebkitMaskImage: BRUSH_MASK,
            WebkitMaskSize: "100% 100%",
          }}
        >
          <div className="absolute inset-0 bg-paper/10" />
          <motion.div
            className="absolute inset-0 origin-top bg-gradient-to-b from-pine via-moss to-celadon"
            style={{ scaleY: scrollYProgress }}
          />
        </div>
        {/* the brush tip, wet where it currently touches the paper */}
        <motion.div
          className="absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-celadon blur-[1px] shadow-[0_0_14px_rgba(163,191,168,0.8)]"
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
      <Gloss gloss='dokuryō · "finished reading"' side="top">
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
          className="flex h-14 w-14 items-center justify-center rounded-sm bg-moss font-display text-2xl font-bold text-ink-950 shadow-[0_0_30px_rgba(111,143,118,0.35)]"
        >
          真
        </motion.span>
      </Gloss>
      <span className="font-mono text-[10px] tracking-widest text-paper-faint">
        読了 · READ
      </span>
    </div>
  );
}
