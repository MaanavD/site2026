"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useInkTransition } from "@/components/ink-transition";

// Remounts on every route change, pages rise into place as the ink lifts.
// During a title morph the page must NOT move, or the landing spot the
// overlay measured would drift and the title would animate twice.
export default function Template({ children }: { children: React.ReactNode }) {
  const { morphText, turnDir } = useInkTransition();
  const reduceMotion = useReducedMotion();
  const morphing = morphText !== null;
  // latch the turn at mount: this page arrives once, from one side
  const [turn] = useState(turnDir);

  return (
    <motion.div
      initial={
        morphing || reduceMotion
          ? false
          : turn
            ? { opacity: 0, x: -turn * 90, rotate: -turn * 1.5 }
            : { opacity: 0, y: 28 }
      }
      animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : turn
            ? { duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }
            : { duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {children}
    </motion.div>
  );
}
