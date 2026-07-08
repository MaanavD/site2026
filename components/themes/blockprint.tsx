"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Buti } from "@/components/motifs";
import { stamp as stampSound } from "@/lib/sound";

type Stamp = { x: number; rot: number; ink: number; id: number };

// click along the cloth strip to hand-stamp motifs: every press lands
// slightly crooked with uneven ink, like real blockprinting
export function BlockprintStrip() {
  const [stamps, setStamps] = useState<Stamp[]>(() =>
    Array.from({ length: 7 }, (_, i) => ({
      x: 40 + i * 130,
      rot: (i * 37) % 9 - 4,
      ink: 0.75 + ((i * 53) % 25) / 100,
      id: i,
    }))
  );

  return (
    <button
      type="button"
      aria-label="Stamp a blockprint motif"
      className="relative block h-28 w-full cursor-pointer overflow-hidden rounded-sm border border-[#8f3b2e]/25 text-left"
      style={{ background: "#ece2cc" }}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        stampSound();
        setStamps((s) => [
          ...s.slice(-24),
          {
            x: e.clientX - rect.left - 24,
            rot: Math.random() * 10 - 5,
            ink: 0.6 + Math.random() * 0.4,
            id: Date.now(),
          },
        ]);
      }}
    >
      {stamps.map((s) => (
        <motion.span
          key={s.id}
          initial={{ opacity: 0, scale: 1.25 }}
          animate={{ opacity: s.ink, scale: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className="absolute top-1/2 h-16 w-12 -translate-y-1/2 text-[#8f3b2e]"
          style={{ left: s.x, rotate: s.rot }}
        >
          <Buti className="h-full w-full" />
        </motion.span>
      ))}
      <span className="absolute right-3 bottom-2 font-mono text-[10px] tracking-widest text-[#8f3b2e]/50">
        CLICK TO STAMP
      </span>
    </button>
  );
}
