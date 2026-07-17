"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { SectionHeading } from "./section-heading";
import {
  Buti,
  Flame,
  LotusOutline,
  Marigold,
  RiverLines,
  TreeOfLife,
} from "./motifs";
import { pluck } from "@/lib/sound";

// one quiet ascending note per bolt, Sa Ga Pa Sa' Ga'
const BOLT_NOTES = [0, 2, 3, 5, 7];

const EASE = [0.22, 1, 0.36, 1] as const;

// two inks: bolts dyed dark print in khadi, bolts dyed light print in indigo
const FG = {
  light: {
    title: "",
    body: "group-data-[on=true]:text-paper/85",
    meta: "group-data-[on=true]:text-paper/75",
    link: "group-data-[on=true]:text-paper",
    chip: "group-data-[on=true]:bg-paper",
    pattern: "text-paper",
  },
  dark: {
    title: "group-data-[on=true]:text-ink-950",
    body: "group-data-[on=true]:text-ink-800",
    meta: "group-data-[on=true]:text-ink-800",
    link: "group-data-[on=true]:text-ink-950",
    chip: "group-data-[on=true]:bg-ink-950",
    pattern: "text-ink-950",
  },
} as const;

// each project is a carved block and a bolt of cloth dyed in its own vat,
// shelved side by side; pulling one out prints its block across the cloth
const projects = [
  {
    motif: LotusOutline,
    title: "Hush",
    short: "Hush",
    description:
      "Private, fully offline voice-to-text for the desktop. Open source, no cloud, no compromise.",
    meta: "OSS · Desktop · Local AI",
    link: "github",
    href: "https://github.com/MaanavD/Hush",
    dye: "bg-paper",
    chip: "bg-paper",
    fg: FG.dark,
  },
  {
    motif: Flame,
    title: "Foundry Local",
    short: "Foundry Local",
    description:
      "Built foundrylocal.ai from scratch as the home for Microsoft's local AI runtime. 20K+ monthly views.",
    meta: "Product · Web · 20K/mo",
    link: "foundrylocal.ai",
    href: "https://foundrylocal.ai",
    dye: "bg-turmeric",
    chip: "bg-turmeric",
    fg: FG.dark,
  },
  {
    motif: RiverLines,
    title: "ONNX Runtime",
    short: "ONNX Runtime",
    description:
      "Complete redesign of onnxruntime.ai, the site for Microsoft's cross-platform inference engine. 250K+ monthly views.",
    meta: "Design · Web · 250K/mo",
    link: "onnxruntime.ai",
    href: "https://onnxruntime.ai",
    dye: "bg-peacock",
    chip: "bg-peacock",
    fg: FG.light,
  },
  {
    motif: Marigold,
    title: "Merwaha Group",
    short: "Merwaha Group",
    description:
      "Designed and built the site for a Houston real estate developer: duplexes, townhomes, and the case for investing in them.",
    meta: "Client · Web · 2025",
    link: "merwahagroup.com",
    href: "https://www.merwahagroup.com/",
    dye: "bg-madder",
    chip: "bg-madder",
    fg: FG.light,
  },
  {
    motif: TreeOfLife,
    title: "FLUX at Black Forest Labs",
    short: "FLUX",
    description:
      "Launch kits, live demos, and developer tooling for FLUX.2. The job is making frontier image models feel like tools you already know.",
    meta: "DevRel · FLUX.2 · 2026",
    link: "launch kit",
    href: "https://bfl-launch-kit.vercel.app",
    dye: "bg-ink-600",
    chip: "bg-ink-600",
    fg: FG.light,
  },
];

// a half-drop blockprint repeat, pressed one column at a time; every stamp
// lands with its own slight tilt, the way a hand never quite squares the block
const COLS = 8;
const ROWS = 5;

function PrintLayer({
  Motif,
  ink,
}: {
  Motif: (typeof projects)[number]["motif"];
  ink: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${ink}`}
    >
      {Array.from({ length: COLS * ROWS }).map((_, s) => {
        const c = s % COLS;
        const r = Math.floor(s / COLS);
        const tilt = ((c * 31 + r * 17) % 7) - 3;
        return (
          <span
            key={s}
            className="absolute h-8 w-8 scale-50 opacity-0 transition-[opacity,scale] duration-300 ease-out [transition-delay:var(--d)] group-data-[on=true]:scale-100 group-data-[on=true]:opacity-15 md:h-10 md:w-10"
            style={
              {
                left: `${(c / COLS) * 100}%`,
                top: `${(r / ROWS) * 100 + (c % 2 ? 50 / ROWS : 0)}%`,
                rotate: `${tilt}deg`,
                "--d": `${c * 70 + r * 40}ms`,
              } as React.CSSProperties
            }
          >
            <Motif className="h-full w-full" />
          </span>
        );
      })}
    </div>
  );
}

export function Work() {
  const [active, setActive] = useState(0);
  const shelfRef = useRef<HTMLDivElement>(null);

  const activate = (i: number) => {
    setActive((prev) => {
      if (prev !== i) pluck(BOLT_NOTES[i % BOLT_NOTES.length], 0.035);
      return i;
    });
  };

  // no hover on touch: the bolt snapped to centre prints itself instead
  useEffect(() => {
    if (window.matchMedia("(hover: hover)").matches) return;
    const shelf = shelfRef.current;
    const bolts = shelf?.querySelectorAll<HTMLElement>("[data-idx]");
    if (!bolts?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.idx));
        }
      },
      { root: shelf, threshold: 0.6 }
    );
    bolts.forEach((b) => io.observe(b));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="work"
      className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-28"
    >
      <SectionHeading
        motif={<Buti className="w-full" />}
        sub="Selected Work"
        title="Things I've built"
      />

      <div
        ref={shelfRef}
        className="-mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:h-[26rem] md:snap-none md:overflow-hidden md:px-0 md:pb-0"
      >
        {projects.map((p, i) => (
          <motion.a
            key={p.title}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            data-idx={i}
            data-on={active === i}
            onMouseEnter={() => activate(i)}
            onFocus={() => activate(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE, delay: i * 0.07 }}
            className="group relative block h-[24rem] max-w-sm flex-[0_0_84vw] snap-center overflow-hidden rounded-sm border border-paper/8 bg-ink-900 transition-[flex-grow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-turmeric md:h-full md:max-w-none md:flex-[1_1_0%] md:data-[on=true]:flex-[5.5_1_0%]"
          >
            {/* the vat tips: dye floods the cloth from the left */}
            <span
              aria-hidden
              className={`absolute inset-0 origin-left scale-x-0 transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[on=true]:scale-x-100 ${p.dye}`}
            />
            <PrintLayer Motif={p.motif} ink={p.fg.pattern} />

            {/* the bolt's spine, read on the shelf */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden flex-col items-center justify-between py-6 opacity-100 transition-opacity duration-300 md:flex md:group-data-[on=true]:opacity-0"
            >
              <span className="font-mono text-[10px] text-paper-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="font-display text-xl text-paper [writing-mode:vertical-rl]">
                {p.short}
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-[1px] ${p.chip}`}
              />
            </span>

            {/* the cloth unrolled */}
            <div className="relative flex h-full flex-col p-6 sm:p-7 md:opacity-0 md:transition-opacity md:delay-200 md:duration-500 md:group-data-[on=true]:opacity-100">
              <span
                className={`flex items-center gap-2.5 font-mono text-xs text-paper-faint transition-colors duration-500 ${p.fg.meta}`}
              >
                <span
                  aria-hidden
                  className={`h-2.5 w-2.5 rounded-[1px] transition-colors duration-500 ${p.chip} ${p.fg.chip}`}
                />
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-auto">
                <h3
                  className={`font-display text-3xl leading-[1.1] text-balance text-paper transition-colors duration-500 sm:text-4xl lg:text-5xl ${p.fg.title}`}
                >
                  {p.title}
                </h3>
                <p
                  className={`mt-3 max-w-md text-sm leading-relaxed text-paper-dim transition-colors duration-500 ${p.fg.body}`}
                >
                  {p.description}
                </p>
                <div
                  className={`mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 font-mono text-[11px] tracking-wide text-paper-faint transition-colors duration-500 ${p.fg.meta}`}
                >
                  <span>{p.meta}</span>
                  <span
                    className={`text-turmeric transition-colors duration-500 ${p.fg.link}`}
                  >
                    {p.link} ↗
                  </span>
                </div>
              </div>
            </div>
          </motion.a>
        ))}
      </div>

    </section>
  );
}
