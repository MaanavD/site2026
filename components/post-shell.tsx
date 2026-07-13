"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll } from "motion/react";
import { Gloss } from "./gloss";
import { LotusSeal } from "./motifs";
import { RangoliRail } from "./rangoli-rail";
import { stamp } from "@/lib/sound";
import { isRead, markRead } from "@/lib/read-marks";

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
    <article ref={ref} className="relative mx-auto max-w-3xl px-6 pt-36 pb-28">
      {/* reading progress: a temple-border rangoli laid down the margin.
          the dot grid is marked the whole way; the powder follows the
          reader, and the rail signs itself with the lotus at the foot */}
      <RangoliRail progress={scrollYProgress} slug={slug} />
      {children}
      {/* below lg there is no rail, so the seal stays in the column */}
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
    <div ref={ref} className="mt-20 flex flex-col items-center gap-3 lg:hidden">
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
