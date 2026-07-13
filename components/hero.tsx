"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "motion/react";
import { Gloss } from "./gloss";
import { useWind } from "./use-wind";

const StepwellCanvas = dynamic(() => import("./stepwell-canvas"), {
  ssr: false,
});

const name = "Maanav Dalal";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  useWind(sectionRef);

  // the descent rides the normal scroll: as the hero leaves the viewport,
  // the stepwell's tiers rise past, no extra scroll length
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const cueOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-svh min-h-[640px] items-center overflow-hidden"
    >
      <StepwellCanvas descend={scrollYProgress} />

        <Gloss
          gloss="where I work, printed where I live"
          side="left"
          className="absolute right-8 top-1/2 hidden -translate-y-1/2 md:flex"
        >
          <span className="select-none font-mono text-[10px] uppercase tracking-[0.35em] text-paper-faint transition-colors duration-300 hover:text-madder [writing-mode:vertical-rl]">
            a black forest, block printed
          </span>
        </Gloss>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-mono text-xs uppercase tracking-[0.4em] text-turmeric"
          >
            Developer Relations · Black Forest Labs
          </motion.p>

          <h1 className="mt-6 font-display text-6xl leading-[1.05] text-paper sm:text-7xl md:text-8xl lg:text-9xl">
            {name.split(" ").map((word, wi) => (
              <span key={wi} className="inline-block whitespace-nowrap">
                {word.split("").map((ch, i) => (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ opacity: 0, y: "0.6em", rotate: 4 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.35 + (wi * 7 + i) * 0.045,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
                {wi === 0 && <span className="inline-block">&nbsp;</span>}
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 max-w-lg text-lg leading-relaxed text-paper-dim"
          >
            I help developers build with FLUX at Black Forest Labs. Demos,
            talks, tools, and the occasional rabbit hole. Designer by night,
            meanderer in writing.
          </motion.p>
        </div>

      <motion.div
        style={{ opacity: cueOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="h-14 w-px overflow-hidden bg-paper/15"
        >
          <motion.div
            className="h-1/2 w-full bg-madder"
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
