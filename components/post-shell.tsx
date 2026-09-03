"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll } from "motion/react";
import { Gloss } from "./gloss";
import { LotusSeal } from "./motifs";
import { RangoliRail } from "./rangoli-rail";
import { markPostRead, useReadStatus } from "./use-local-storage-boolean";

// a sheet of khadi laid on the indigo table: the article prints on the cloth,
// the rangoli runs down the table beside it
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

  return (
    <article
      ref={ref}
      className="relative mx-auto max-w-[52rem] pt-28 pb-24 sm:px-6 sm:pt-32"
    >
      <RangoliRail progress={scrollYProgress} slug={slug} />
      <div className="sheet px-6 py-14 sm:rounded-[2px] sm:px-12 sm:py-16 md:px-16 md:py-20">
        {/* the measure: about 65 characters of Newsreader, centred on the cloth */}
        <div className="mx-auto max-w-[40rem]">
          {children}
          {/* below lg there is no rail, so the seal stays on the cloth */}
          <EndHanko slug={slug} />
        </div>
      </div>
    </article>
  );
}

function EndHanko({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduceMotion = useReducedMotion();
  const already = useReadStatus(slug);
  const stamped = useRef(false);

  useEffect(() => {
    if (inView && !stamped.current) {
      stamped.current = true;
      if (!already) {
        void import("@/lib/sound").then(({ stamp }) => stamp());
      }
      markPostRead(slug);
    }
  }, [inView, slug, already]);

  return (
    <div ref={ref} className="mt-20 flex flex-col items-center gap-3 lg:hidden">
      <Gloss gloss="you made it to the end" side="top">
        <motion.span
          initial={
            already
              ? { scale: 1, opacity: 0.85, rotate: 3 }
              : { scale: 2.4, opacity: 0, rotate: -10 }
          }
          animate={
            inView ? { scale: 1, opacity: already ? 0.85 : 1, rotate: 3 } : {}
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 320, damping: 19 }
          }
          className="flex h-14 w-14 items-center justify-center rounded-sm bg-madder text-[#ece2cc] shadow-[0_0_30px_rgba(143,59,46,0.35)]"
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
