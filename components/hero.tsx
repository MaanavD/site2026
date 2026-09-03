"use client";

import { useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionStyle,
} from "motion/react";
import { Gloss } from "./gloss";
import { useWind } from "./use-wind";
import { describeWell } from "./well-clock";

const StepwellCanvas = dynamic(() => import("./stepwell-canvas"), {
  ssr: false,
  loading: () => <Still />,
});

function Still() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(31,95,91,0.25),transparent_38%),linear-gradient(180deg,var(--ink-800),var(--ink-950))]"
    />
  );
}

const name = "Maanav Dalal";
const EASE = [0.22, 1, 0.36, 1] as const;
const subscribeNever = () => () => {};


// the well: the name stands over the water at the bottom of a stepwell, the
// pool holds it upside down, and a short scroll walks you down the stairs
export function Hero() {
  const stageRef = useRef<HTMLElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();
  useWind(viewRef);

  const well = useSyncExternalStore(
    subscribeNever,
    () => describeWell(new Date()),
    () => null,
  );

  // 0 at the rim, 1 at the water: the pinned stretch is the staircase
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });
  const titleY = useTransform(scrollYProgress, [0, 0.6], ["0vh", "-14vh"]);
  const titleOpacity = useTransform(scrollYProgress, [0.1, 0.6], [1, 0]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  // the fade rides a custom property: a plain opacity motion value on this
  // element was being overridden by the letter animations underneath it
  const titleStyle = { y: titleY, "--fade": titleOpacity } as unknown as MotionStyle;

  // the pinned stretch only exists once the client has a viewport to pin in
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const pinned = mounted && !reduceMotion;

  const enter = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: reduceMotion
      ? { duration: 0 }
      : { duration: 1, delay, ease: EASE },
  });

  return (
    <>
      <section
        ref={stageRef}
        className={`relative ${pinned ? "h-[175svh]" : "h-svh min-h-[640px]"}`}
      >
        <div
          ref={viewRef}
          className={`${pinned ? "sticky top-0" : "relative"} h-svh min-h-[640px] overflow-hidden`}
        >
          {reduceMotion ? (
            <Still />
          ) : (
            <StepwellCanvas descend={scrollYProgress} textRef={nameRef} />
          )}

          <Gloss
            gloss="Black Forest Labs, as a block print"
            side="left"
            className="absolute right-8 top-1/2 hidden -translate-y-1/2 md:flex"
          >
            <span className="select-none font-mono text-[10px] uppercase tracking-[0.35em] text-paper-faint transition-colors duration-300 hover:text-madder [writing-mode:vertical-rl]">
              a black forest, block printed
            </span>
          </Gloss>

          <motion.div
            style={pinned ? titleStyle : undefined}
            className="relative z-10 mx-auto flex h-full max-w-6xl flex-col items-center px-6 pt-[16svh] text-center [opacity:var(--fade,1)]"
          >
            <h1
              ref={nameRef}
              className="font-display text-[clamp(3.4rem,10.5vw,9.25rem)] leading-[0.98] text-paper [text-shadow:0_2px_40px_rgba(14,18,32,0.55)]"
            >
              {name.split(" ").map((word, wi) => (
                <span key={wi} className="inline-block whitespace-nowrap">
                  {word.split("").map((ch, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, y: "0.5em", rotate: 3 }
                      }
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : {
                              duration: 0.9,
                              delay: 0.3 + (wi * 7 + i) * 0.04,
                              ease: EASE,
                            }
                      }
                    >
                      {ch}
                    </motion.span>
                  ))}
                  {wi === 0 && <span className="inline-block">&nbsp;</span>}
                </span>
              ))}
            </h1>

            <motion.p
              {...enter(1.1)}
              className="mt-6 font-sans text-xl italic text-paper-dim md:text-2xl"
            >
              Developer Relations Engineer at Black Forest Labs
            </motion.p>
            <motion.p
              {...enter(1.4)}
              className="mt-3 hidden max-w-md text-base leading-relaxed text-paper-faint sm:block md:text-lg"
            >
              Demos, talks, and code for people building with FLUX. A blog that
              takes the scenic route.
            </motion.p>
          </motion.div>

          {/* the shader's clock and calendar, spelled out so the visitor knows it is live */}
          <motion.p
            {...enter(2)}
            className="absolute bottom-6 left-6 z-10 min-h-4 font-mono text-[11px] tracking-wide text-paper-faint sm:left-8"
          >
            {well && (
              <Gloss gloss="the well runs on your clock and calendar" side="top">
                <span className="cursor-default">{well}</span>
              </Gloss>
            )}
          </motion.p>

          {pinned && (
            <motion.p
              {...enter(2.3)}
              style={{ opacity: cueOpacity }}
              className="absolute bottom-6 right-6 z-10 font-mono text-[11px] tracking-wide text-paper-faint sm:right-8"
            >
              walk down ↓
            </motion.p>
          )}
        </div>
      </section>
    </>
  );
}
