"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { useInkTransition } from "./ink-transition";

type Pt = { x: number; y: number; t: number };

const TAU = Math.PI * 2;

// Invisible: watches the native cursor for a *deliberately drawn* circle —
// one continuous, round, closed loop. Ambient arcs from reading or moving
// around the page are ignored. A recognized circle blooms a rangoli and
// opens the courtyard.
export function EnsoListener() {
  const { navigate } = useInkTransition();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [burst, setBurst] = useState<{ x: number; y: number; k: number } | null>(
    null
  );

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;

    let stroke: Pt[] = [];
    let lastMove = 0;
    let cooldownUntil = 0;

    const onMove = (e: PointerEvent) => {
      const now = performance.now();

      // A pause ends the current gesture — a drawn circle is one continuous
      // motion, so we start fresh after any noticeable hitch. This drops the
      // path taken *to* the circle so it can't skew the center.
      if (now - lastMove > 200) stroke = [];
      lastMove = now;

      stroke.push({ x: e.clientX, y: e.clientY, t: now });
      while (stroke.length && now - stroke[0].t > 3000) stroke.shift();
      if (stroke.length > 260) stroke.shift();

      if (now < cooldownUntil || pathname === "/garden") return;
      if (stroke.length < 20) return;

      // Rough center of the whole stroke — good enough to find where the last
      // revolution began by winding backwards from the newest point.
      let gx = 0,
        gy = 0;
      for (const p of stroke) {
        gx += p.x;
        gy += p.y;
      }
      gx /= stroke.length;
      gy /= stroke.length;

      let wound = 0;
      let prev = Math.atan2(
        stroke[stroke.length - 1].y - gy,
        stroke[stroke.length - 1].x - gx
      );
      let start = 0;
      for (let i = stroke.length - 2; i >= 0; i--) {
        const a = Math.atan2(stroke[i].y - gy, stroke[i].x - gx);
        let d = prev - a;
        if (d > Math.PI) d -= TAU;
        if (d < -Math.PI) d += TAU;
        wound += d;
        prev = a;
        if (Math.abs(wound) >= TAU - 0.35) {
          start = i;
          break;
        }
      }
      // Never came close to a full turn — not a circle.
      if (Math.abs(wound) < TAU - 0.35) return;

      const loop = stroke.slice(start);
      if (loop.length < 16) return;

      // Validate roundness and closure on the isolated revolution only.
      let cx = 0,
        cy = 0;
      for (const p of loop) {
        cx += p.x;
        cy += p.y;
      }
      cx /= loop.length;
      cy /= loop.length;

      const radii = loop.map((p) => Math.hypot(p.x - cx, p.y - cy));
      const mean = radii.reduce((a, b) => a + b, 0) / radii.length;
      const maxR = Math.min(
        480,
        0.45 * Math.min(window.innerWidth, window.innerHeight)
      );
      if (mean < 34 || mean > maxR) return;

      const sd = Math.sqrt(
        radii.reduce((a, r) => a + (r - mean) ** 2, 0) / radii.length
      );
      if (sd / mean > 0.3) return;

      // The loop must return near where it began.
      const a0 = loop[0];
      const aN = loop[loop.length - 1];
      if (Math.hypot(aN.x - a0.x, aN.y - a0.y) > 0.6 * mean) return;

      cooldownUntil = now + 1500;
      stroke = [];
      setBurst({ x: cx, y: cy, k: now });
      setTimeout(() => navigate("/garden"), 550);
    };

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [navigate, pathname, reduceMotion]);

  if (!burst) return null;
  return (
    <span
      key={burst.k}
      aria-hidden
      className="rangoli-burst pointer-events-none fixed z-[150] rounded-full border-2 border-turmeric"
      style={{ left: burst.x, top: burst.y }}
      onAnimationEnd={() => setBurst(null)}
    >
      <span className="absolute inset-[12%] rounded-full border-2 border-dotted border-madder" />
      <span className="absolute inset-[30%] rounded-full border border-turmeric/70" />
    </span>
  );
}
