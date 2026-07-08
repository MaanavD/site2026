"use client";

import { motion } from "motion/react";
import { useInkTransition } from "@/components/ink-transition";

// Remounts on every route change, pages rise into place as the ink lifts.
// During a title morph the page must NOT move, or the landing spot the
// overlay measured would drift and the title would animate twice.
export default function Template({ children }: { children: React.ReactNode }) {
  const { morphText } = useInkTransition();
  const morphing = morphText !== null;

  return (
    <motion.div
      initial={morphing ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
