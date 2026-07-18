"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Gloss } from "./gloss";
import { LotusSeal } from "./motifs";
import { markPostRead, useReadStatus } from "./use-local-storage-boolean";
import { isRead } from "@/lib/read-marks";

// A temple-border rangoli laid down the margin: the stepped teeth that
// run along a Kanjivaram's edge and up every gopuram, drawn in powder.
// The dot grid is marked out the whole way; the reader's scroll lays
// the powder, and the lotus seal signs the border at its foot.

const W = 80;
const CX = 40;

const fract = (n: number) => n - Math.floor(n);
const rnd = (i: number, s: number) =>
  fract(Math.sin(i * 127.1 + s * 311.7) * 43758.5453);

const POWDER = {
  rice: "var(--color-paper)",
  turmeric: "var(--color-turmeric)",
  madder: "var(--color-madder-powder)",
  peacock: "var(--color-peacock-powder)",
};

const STEPS = 3;
const REACH = 12; // how far each tooth steps in from its rail

// a whole rail of teeth as one unbroken crenellated band, packed the
// way they run along a sari's edge: out in right-angle steps to the
// tip, back to the rail, again and again
function bandPath(h: number, P: number, rounds: number, side: number) {
  const rail = CX + side * 23;
  const sw = (REACH / STEPS) * -side;
  const sh = P / 2 / STEPS;
  let d = `M${rail} 0`;
  for (let k = 0; k < rounds; k++) {
    for (let s = 0; s < STEPS; s++) d += `h${sw.toFixed(2)}v${sh.toFixed(2)}`;
    for (let s = 0; s < STEPS; s++) d += `v${sh.toFixed(2)}h${(-sw).toFixed(2)}`;
  }
  return d + "Z";
}

export function RangoliRail({
  progress,
  slug,
}: {
  progress: MotionValue<number>;
  slug: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  const hRef = useRef(0);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const measure = () => {
      hRef.current = el.offsetHeight;
      setH(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const geo = useMemo(() => {
    if (!h) return null;
    // whole repeats only: the border ends on a finished unit
    const rounds = Math.max(8, Math.round(h / 36));
    const P = h / rounds;

    // tips face each other at each level; a stud threads every other
    const tips = Array.from({ length: rounds }, (_, k) => (k + 0.5) * P);
    const studs = tips
      .filter((_, k) => k % 2 === 0)
      .map((y, i) => ({ y, color: i % 2 ? POWDER.peacock : POWDER.turmeric }));

    const specks = Array.from({ length: Math.ceil(h / 260) }, (_, i) => ({
      x: CX + (rnd(i, 41) - 0.5) * 30,
      y: rnd(i, 42) * h,
      r: 0.35 + rnd(i, 43) * 0.45,
    }));

    return {
      P,
      left: bandPath(h, P, rounds, -1),
      right: bandPath(h, P, rounds, 1),
      tips,
      studs,
      specks,
    };
  }, [h]);

  const solidH = useTransform(progress, (v) =>
    Math.max(0, v * hRef.current - 28)
  );
  const frontY = useTransform(progress, (v) =>
    Math.max(0, v * hRef.current - 28)
  );

  // the seal at the foot: pressed when the border is finished
  const reduceMotion = useReducedMotion();
  const already = useReadStatus(slug);
  const [stamped, setStamped] = useState(false);
  useMotionValueEvent(progress, "change", (v) => {
    // hRef is 0 when the rail is display:none (below lg); the seal in
    // the column owns the moment there
    if (v >= 0.985 && !stamped && hRef.current > 0) {
      setStamped(true);
      if (!isRead(slug)) {
        void import("@/lib/sound").then(({ stamp }) => stamp());
      }
      markPostRead(slug);
    }
  });

  return (
    <div
      ref={railRef}
      aria-hidden
      className="absolute -left-20 top-40 bottom-40 hidden w-20 lg:block xl:-left-24"
    >
      {geo && (
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox={`0 0 ${W} ${h}`}
          preserveAspectRatio="none"
          fill="none"
        >
          <defs>
            <linearGradient id="front-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </linearGradient>
            {/* powder never lands in a perfect line; the dots scatter
                more than the drawn edges */}
            <filter id="powder" x="-25%" y="-2%" width="150%" height="104%">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.05 0.07"
                numOctaves="2"
                seed="11"
                result="n"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="n"
                scale="2.6"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <filter id="powder-line" x="-25%" y="-2%" width="150%" height="104%">
              <feTurbulence
                type="turbulence"
                baseFrequency="0.05 0.07"
                numOctaves="2"
                seed="11"
                result="n"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="n"
                scale="1.5"
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
            <mask id="laid-powder" maskUnits="userSpaceOnUse">
              <motion.rect
                x="0"
                width={W}
                y="0"
                style={{ height: reduceMotion ? h : solidH }}
                fill="#fff"
              />
              {!reduceMotion && (
                <motion.rect
                  x="0"
                  width={W}
                  style={{ y: frontY }}
                  height="72"
                  fill="url(#front-fade)"
                />
              )}
            </mask>
          </defs>

          {/* the grid marked out ahead: every facing pair of tips,
              waiting for powder */}
          <g fill="rgba(236,226,204,0.13)">
            {geo.tips.map((y, i) => (
              <g key={i}>
                <circle cx={CX - 23 + REACH} cy={y} r="1.1" />
                <circle cx={CX + 23 - REACH} cy={y} r="1.1" />
                {i % 2 === 0 && <circle cx={CX} cy={y} r="1" />}
              </g>
            ))}
          </g>

          {/* the laid powder, as far as the reader has come */}
          <g mask="url(#laid-powder)">
            <g filter="url(#powder-line)">
              {/* the two dyed bands, teeth facing: madder bank, peacock
                  bank, the ganga-jamuna border */}
              <path d={geo.left} fill={POWDER.madder} fillOpacity="0.82" />
              <path
                d={geo.left}
                stroke={POWDER.rice}
                strokeOpacity="0.25"
                strokeWidth="0.8"
              />
              <path d={geo.right} fill={POWDER.peacock} fillOpacity="0.82" />
              <path
                d={geo.right}
                stroke={POWDER.rice}
                strokeOpacity="0.25"
                strokeWidth="0.8"
              />
            </g>
            <g filter="url(#powder)">
              {/* studs threading the channel between the tips */}
              {geo.studs.map((s, i) => (
                <g key={i}>
                  <path
                    d={`M${CX} ${s.y - 3.8} L${CX + 3} ${s.y} L${CX} ${s.y + 3.8} L${CX - 3} ${s.y} Z`}
                    fill={s.color}
                    fillOpacity="0.9"
                  />
                  <circle cx={CX} cy={s.y} r="0.9" fill={POWDER.rice} />
                </g>
              ))}
              {/* stray grains beside the work */}
              {geo.specks.map((s, i) => (
                <circle
                  key={i}
                  cx={s.x}
                  cy={s.y}
                  r={s.r}
                  fill={POWDER.rice}
                  opacity="0.5"
                />
              ))}
            </g>
          </g>
        </svg>
      )}

      {/* the border signed at its foot */}
      <div
        className="pointer-events-auto absolute top-full mt-6 flex -translate-x-1/2 flex-col items-center gap-2"
        style={{ left: CX }}
      >
        <Gloss gloss="stamped. you finished it." side="top">
          <motion.span
            initial={
              already
                ? { scale: 1, opacity: 0.85, rotate: 3 }
                : { scale: 2.4, opacity: 0, rotate: -10 }
            }
            animate={
              stamped || already
                ? { scale: 1, opacity: already && !stamped ? 0.85 : 1, rotate: 3 }
                : {}
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 320, damping: 19 }
            }
            className="flex h-12 w-12 items-center justify-center rounded-sm bg-madder text-paper shadow-[0_0_26px_rgba(143,59,46,0.35)]"
          >
            <LotusSeal className="h-8 w-8" />
          </motion.span>
        </Gloss>
        <span className="font-mono text-[10px] tracking-widest text-paper-faint">
          READ
        </span>
      </div>
    </div>
  );
}
