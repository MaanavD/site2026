"use client";

import { useEffect, type RefObject } from "react";
import { useReducedMotion } from "motion/react";

// soft wind through the trees as the pointer stirs the ink.
// listens on the given element only, so it stays inside the hero.
export function useWind(ref: RefObject<HTMLElement | null>) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;

    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let throttle = 0;

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (lastT) {
        const dt = now - lastT;
        const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        const speed = dist / Math.max(dt, 1);
        if (now - throttle > 60) {
          throttle = now;
          void import("@/lib/sound").then(({ windPulse }) =>
            windPulse(Math.min(1, speed * 0.5)),
          );
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };

    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [ref, reduceMotion]);
}
