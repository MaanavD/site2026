"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

export type UnrollProject = {
  title: string;
  story: string;
  meta: string;
  link: string;
  href: string;
  images: string[];
  dye: string;
  motif: (props: { className?: string }) => React.ReactNode;
  tone: "light" | "dark";
};

const TONE = {
  // dark dye, khadi ink
  light: {
    ink: "text-paper",
    dim: "text-paper/80",
    faint: "text-paper/60",
    frame: "border-paper/35",
    line: "rgba(236,226,204,0.16)",
    print: "invert grayscale mix-blend-luminosity opacity-90",
    button: "bg-paper text-ink-950 hover:bg-paper/90",
    pattern: "text-paper",
  },
  // light dye, indigo ink
  dark: {
    ink: "text-ink-950",
    dim: "text-ink-900/85",
    faint: "text-ink-900/65",
    frame: "border-ink-950/35",
    line: "rgba(14,18,32,0.14)",
    print: "grayscale mix-blend-multiply opacity-85",
    button: "bg-ink-950 text-paper hover:bg-ink-800",
    pattern: "text-ink-950",
  },
} as const;

const COLS = 14;
const ROWS = 8;

// the bolt comes off the shelf and unrolls across the table: first it stands
// up to the cloth's full height where it was, then the roll travels right and
// the cloth follows, then the block prints walk across it and the pages stamp on
export function BoltUnroll({
  project: p,
  from,
  onClose,
}: {
  project: UnrollProject;
  from: DOMRect;
  onClose: () => void;
}) {
  const t = TONE[p.tone];
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const vw = typeof window === "undefined" ? 1280 : window.innerWidth;
  const vh = typeof window === "undefined" ? 800 : window.innerHeight;
  const Motif = p.motif;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const focus = setTimeout(() => closeRef.current?.focus(), 1200);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(focus);
    };
  }, [onClose]);

  // each page stamps down with its own press
  useEffect(() => {
    if (reduceMotion) return;
    const timers = p.images.map((_, k) =>
      setTimeout(() => {
        void import("@/lib/sound").then(({ press }) => press());
      }, 1250 + k * 320),
    );
    return () => timers.forEach(clearTimeout);
  }, [p.images, reduceMotion]);

  // the cloth spreads across the table, not the whole room
  const pad = vw < 640 ? 12 : 32;
  const W = Math.min(vw - pad * 2, 1180);
  const H = Math.min(vh - pad * 2, 740);
  const panel = { top: Math.round((vh - H) / 2), left: Math.round((vw - W) / 2) };
  const stand = { top: panel.top, height: H, left: from.left, width: from.width };
  const spread = { top: panel.top, height: H, left: panel.left, width: W };
  const rolled = {
    top: from.top,
    height: from.height,
    left: from.left,
    width: from.width,
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80]"
      role="dialog"
      aria-modal="true"
      aria-label={p.title}
    >
      <motion.button
        type="button"
        aria-label="Roll the cloth back up"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 cursor-default bg-ink-950/70"
      />

      <motion.div
        className={`absolute overflow-hidden rounded-sm ${p.dye} shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)]`}
        initial={reduceMotion ? spread : rolled}
        animate={
          reduceMotion
            ? spread
            : {
                top: [rolled.top, stand.top, spread.top],
                height: [rolled.height, stand.height, spread.height],
                left: [rolled.left, stand.left, spread.left],
                width: [rolled.width, stand.width, spread.width],
              }
        }
        exit={
          reduceMotion
            ? { opacity: 0 }
            : {
                top: [spread.top, stand.top, rolled.top],
                height: [spread.height, stand.height, rolled.height],
                left: [spread.left, stand.left, rolled.left],
                width: [spread.width, stand.width, rolled.width],
                transition: { duration: 0.9, times: [0, 0.6, 1], ease: EASE },
              }
        }
        transition={{ duration: 1.15, times: [0, 0.38, 1], ease: EASE }}
      >
        {/* the weave: warp and weft, faint, over the whole cloth */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg, ${t.line} 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, ${t.line} 0 1px, transparent 1px 3px)`,
          }}
        />

        {/* the block walks across the unrolled cloth */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${t.pattern}`}
        >
          {Array.from({ length: COLS * ROWS }).map((_, s) => {
            const c = s % COLS;
            const r = Math.floor(s / COLS);
            const tilt = ((c * 31 + r * 17) % 7) - 3;
            return (
              <motion.span
                key={s}
                className="absolute h-10 w-10 opacity-[0.13] md:h-12 md:w-12"
                style={{
                  left: `${(c / COLS) * 100}%`,
                  top: `${(r / ROWS) * 100 + (c % 2 ? 50 / ROWS : 0)}%`,
                  rotate: tilt,
                }}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 0.13, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: 0.55 + c * 0.05 + r * 0.03,
                  ease: "easeOut",
                }}
              >
                <Motif className="h-full w-full" />
              </motion.span>
            );
          })}
        </div>

        {/* the printed frame, one pass late */}
        <motion.span
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className={`pointer-events-none absolute inset-4 border sm:inset-6 ${t.frame}`}
        />

        {/* the roll itself, travelling along the leading edge */}
        {!reduceMotion && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 right-0 w-10 sm:w-14"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 30%, rgba(255,250,238,0.35) 58%, rgba(0,0,0,0.5) 100%)",
              boxShadow: "-24px 0 40px rgba(0,0,0,0.35)",
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 1, 0] }}
            transition={{ duration: 1.35, times: [0, 0.85, 1] }}
          />
        )}

        {/* the printed matter */}
        <div className="relative h-full overflow-y-auto px-6 py-7 sm:px-10 sm:py-9 md:px-14 md:py-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.5 }}
            className={`flex items-center justify-between font-mono text-xs ${t.dim}`}
          >
            <span>{p.meta}</span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className={`rounded-sm px-2 py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turmeric ${t.ink}`}
            >
              roll up ×
            </button>
          </motion.div>

          <div className="mt-8 grid gap-10 md:mt-12 md:grid-cols-[1.05fr_1fr] md:gap-14">
            <div className="min-w-0">
              <h2
                className={`font-display text-5xl leading-[0.98] text-balance sm:text-6xl md:text-7xl ${t.ink}`}
              >
                {p.title.split(" ").map((word, wi) => (
                  <span key={wi} className="inline-block whitespace-nowrap">
                    {word.split("").map((ch, i) => (
                      <motion.span
                        key={i}
                        className="inline-block"
                        initial={
                          reduceMotion
                            ? false
                            : { opacity: 0, y: "0.35em", rotate: 3 }
                        }
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        transition={{
                          duration: 0.6,
                          delay: 1.1 + (wi * 6 + i) * 0.025,
                          ease: EASE,
                        }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                    <span className="inline-block">&nbsp;</span>
                  </span>
                ))}
              </h2>
              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.7, ease: EASE }}
                className={`mt-7 max-w-xl text-lg leading-relaxed ${t.dim}`}
              >
                {p.story}
              </motion.p>
              <motion.a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={reduceMotion ? false : { opacity: 0, scale: 1.15, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: -1 }}
                transition={{ delay: 1.9, duration: 0.45, ease: EASE }}
                className={`mt-8 inline-flex items-center gap-2 rounded-sm px-6 py-3.5 text-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turmeric ${t.button}`}
              >
                Visit {p.link} ↗
              </motion.a>
            </div>

            {p.images.length > 0 && (
              <div className="relative flex flex-col gap-6 md:pt-6">
                {p.images.map((src, k) => (
                  <motion.span
                    key={src}
                    aria-hidden
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, scale: 1.14, rotate: k % 2 ? 3 : -3 }
                    }
                    animate={{ opacity: 1, scale: 1, rotate: k % 2 ? 1.4 : -1.4 }}
                    transition={{
                      delay: 1.25 + k * 0.32,
                      duration: 0.4,
                      ease: [0.34, 1.4, 0.64, 1],
                    }}
                    className={`block overflow-hidden rounded-[2px] border ${t.frame} ${
                      k % 2 ? "md:-mt-16 md:ml-16" : "md:mr-10"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      width={1200}
                      height={750}
                      sizes="(max-width: 767px) 90vw, 46vw"
                      className={`block w-full ${t.print}`}
                    />
                  </motion.span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
