"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Barbell,
  CoffeeCup,
  Fist,
  Mountains,
  Skier,
  TennisBall,
} from "./motifs";

// each pursuit is a hand-carved printing block; the captions are lifted
// from the blog, where these already have their stories
const pursuits = [
  {
    label: "Coffee",
    icon: CoffeeCup,
    line: "sit down alone, leave thirty minutes of conversation later",
  },
  {
    label: "Gym",
    icon: Barbell,
    line: "130 to 150 to 120. I know what this body can do",
  },
  {
    label: "Climbing",
    icon: Mountains,
    line: "everyone finds their people somewhere. mine hang off a bouldering wall",
  },
  {
    label: "Skiing",
    icon: Skier,
    line: "pointing the skis at the fear, one double black at a time",
  },
  {
    label: "Jiu-Jitsu",
    icon: Fist,
    line: "tap a higher belt: technique over strength",
  },
  {
    label: "Tennis",
    icon: TennisBall,
    line: "still failing to rally. still showing up",
  },
];

export function PursuitBlocks() {
  const [active, setActive] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  return (
    <div onPointerLeave={() => setActive(null)}>
      <ul className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {pursuits.map((p, i) => (
          <li key={p.label}>
            <motion.button
              type="button"
              onPointerEnter={() => {
                if (active !== i) {
                  void import("@/lib/sound").then(({ press }) => press());
                }
                setActive(i);
              }}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              whileHover={reduceMotion ? undefined : { y: 2, scale: 0.96 }}
              whileTap={reduceMotion ? undefined : { y: 3, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
              className="group relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-sm border border-paper/12 bg-ink-900 shadow-[0_3px_0_rgba(0,0,0,0.35)] transition-shadow duration-300 hover:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turmeric"
              aria-describedby="pursuit-description"
            >
              {/* madder ink flooding up from the pad */}
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-madder transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100"
              />
              {/* the carve line inside the block's edge */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-[5px] rounded-[1px] border border-paper/10 transition-colors duration-300 group-hover:border-paper/35 group-focus-visible:border-paper/35"
              />
              <p.icon className="relative h-6 w-6 text-paper-dim transition-colors duration-300 group-hover:text-paper group-focus-visible:text-paper sm:h-7 sm:w-7" />
              <span className="relative text-[10px] font-mono tracking-wide text-paper-faint transition-colors duration-300 group-hover:text-paper group-focus-visible:text-paper">
                {p.label}
              </span>
            </motion.button>
          </li>
        ))}
      </ul>
      <div className="mt-4 min-h-5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            id="pursuit-description"
            aria-live="polite"
            key={active ?? "rest"}
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className={`font-mono text-[11px] tracking-wide ${
              active === null ? "text-paper-faint" : "text-turmeric"
            }`}
          >
            {active === null
              ? "strength and play, in equal measure"
              : pursuits[active].line}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
