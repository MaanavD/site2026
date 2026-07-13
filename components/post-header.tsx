"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { TransitionLink, useInkTransition } from "./ink-transition";
import { Gloss } from "./gloss";
import { RiverLines } from "./motifs";

const ease = [0.22, 1, 0.36, 1] as const;

export function PostHeader({
  title,
  date,
  category,
}: {
  title: string;
  date: string;
  category: string | null;
}) {
  const { morphText, morphDone, registerMorphTarget } = useInkTransition();
  // latch at mount: once a morph landing, always a morph landing, when the
  // morph settles and morphText clears, the title must NOT replay the whisk
  const [isMorph] = useState(() => morphText === title);
  const h1 = useRef<HTMLHeadingElement>(null);
  let charIndex = 0;

  // hand the morphing overlay its landing spot, measured via offsets so
  // the template's entrance transform can't skew the coordinates
  useEffect(() => {
    if (!isMorph || !h1.current) return;
    let cancelled = false;
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        if (cancelled || !h1.current) return;
        let x = 0;
        let y = 0;
        let node: HTMLElement | null = h1.current;
        while (node) {
          x += node.offsetLeft;
          y += node.offsetTop;
          node = node.offsetParent as HTMLElement | null;
        }
        registerMorphTarget({
          x,
          y: y - window.scrollY,
          fontSize: parseFloat(getComputedStyle(h1.current).fontSize),
        });
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMorph]);

  return (
    <header className="mb-14">
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease }}
      >
        <TransitionLink
          href="/blog"
          className="brush-link font-mono text-xs text-paper-faint hover:text-paper"
        >
          ← All writing
        </TransitionLink>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-8 font-mono text-xs text-paper-faint"
      >
        {date}
        {category && <span className="ml-3 text-turmeric">{category}</span>}
      </motion.p>

      {isMorph ? (
        // no transition: the overlay clears in the same commit, so an
        // instant swap between identical pixels is invisible
        <h1
          ref={h1}
          className={`mt-4 font-display text-4xl leading-tight text-paper md:text-5xl ${
            morphDone ? "opacity-100" : "opacity-0"
          }`}
        >
          {title}
        </h1>
      ) : (
        <h1
          ref={h1}
          className="mt-4 font-display text-4xl leading-tight text-paper md:text-5xl"
        >
          {title.split(" ").map((word, wi) => (
            <span key={wi} className="inline-block whitespace-nowrap">
              {word.split("").map((ch, i) => {
                const d = 0.45 + charIndex++ * 0.018;
                return (
                  <motion.span
                    key={i}
                    className="inline-block"
                    initial={{ opacity: 0, y: "0.5em", rotate: 3 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ duration: 0.7, delay: d, ease }}
                  >
                    {ch}
                  </motion.span>
                );
              })}
              <span className="inline-block">&nbsp;</span>
            </span>
          ))}
        </h1>
      )}

      <div
        aria-hidden
        className="mt-8 flex items-center gap-4 text-paper-faint"
      >
        <motion.span
          className="h-px w-16 origin-left bg-madder/60"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.9, ease }}
        />
        <Gloss gloss="writing meanders. rivers agree." side="top">
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1.1, ease }}
          >
            <RiverLines className="h-5 w-5" />
          </motion.span>
        </Gloss>
      </div>
    </header>
  );
}
