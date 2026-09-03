"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BoltUnroll } from "./bolt-unroll";
import { SectionHeading } from "./section-heading";
import {
  Buti,
  Flame,
  LotusOutline,
  Marigold,
  RiverLines,
  TreeOfLife,
} from "./motifs";

// one quiet ascending note per bolt, Sa Ga Pa Sa' Ga'
const BOLT_NOTES = [0, 2, 3, 5, 7];

const EASE = [0.22, 1, 0.36, 1] as const;

// two inks: bolts dyed dark print in khadi, bolts dyed light print in indigo.
// screenshots are printed the same way: a light dye takes the page as a
// multiply print, a dark dye takes it inverted, as pale ink on the cloth
const FG = {
  light: {
    title: "",
    body: "group-data-[on=true]:text-paper/85",
    meta: "group-data-[on=true]:text-paper",
    link: "group-data-[on=true]:text-paper",
    chip: "group-data-[on=true]:bg-paper",
    pattern: "text-paper",
    print: "invert grayscale mix-blend-luminosity opacity-90",
    frame: "border-paper/30",
    button: "bg-paper text-ink-950 hover:bg-paper/90",
    close: "text-paper/70 hover:text-paper",
    tone: "light",
  },
  dark: {
    title: "group-data-[on=true]:text-ink-950",
    body: "group-data-[on=true]:text-ink-800",
    meta: "group-data-[on=true]:text-ink-800",
    link: "group-data-[on=true]:text-ink-950",
    chip: "group-data-[on=true]:bg-ink-950",
    pattern: "text-ink-950",
    print: "grayscale mix-blend-multiply opacity-85",
    frame: "border-ink-950/30",
    button: "bg-ink-950 text-paper hover:bg-ink-800",
    close: "text-ink-950/60 hover:text-ink-950",
    tone: "dark",
  },
} as const;

// each project is a carved block and a bolt of cloth dyed in its own vat,
// shelved side by side. hovering pulls a bolt out; pressing unrolls it
const projects = [
  {
    motif: LotusOutline,
    title: "Hush",
    short: "Hush",
    description:
      "Voice-to-text that never leaves your laptop. Open source, no account, no cloud.",
    story:
      "Dictation for people who would rather their voice never touched a server. Whisper-class models run on the machine through Foundry Local: hold a key, talk, and the text lands in whatever app has focus. Windows, macOS, and Linux, MIT licensed.",
    meta: "OSS · Desktop · Local AI",
    link: "github",
    href: "https://github.com/MaanavD/Hush",
    images: [] as string[],
    dye: "bg-paper",
    chip: "bg-paper",
    fg: FG.dark,
  },
  {
    motif: Flame,
    title: "Foundry Local",
    short: "Foundry Local",
    description:
      "Built foundrylocal.ai from scratch: the front door to Microsoft's local AI runtime. 20K visitors a month.",
    story:
      "Microsoft's runtime for running language models on your own hardware. I was its founding PM and built the site from nothing: one install command above the fold, SDK first, the hardware handled for you. 25,000 downloads in the first two weeks, and 20,000 readers a month since.",
    meta: "Product · Web · 20K/mo",
    link: "foundrylocal.ai",
    href: "https://foundrylocal.ai",
    images: ["/work/foundry.jpg", "/work/foundry-2.jpg"],
    dye: "bg-turmeric",
    chip: "bg-turmeric",
    fg: FG.dark,
  },
  {
    motif: RiverLines,
    title: "ONNX Runtime",
    short: "ONNX Runtime",
    description:
      "Redesigned onnxruntime.ai top to bottom, the site for Microsoft's inference engine. 250K visitors a month.",
    story:
      "The site for Microsoft's cross-platform inference engine, rebuilt in Svelte from the ground up: get started in one command, tutorials per language, generative AI front and centre instead of buried in the docs. A quarter of a million people a month read it.",
    meta: "Design · Web · 250K/mo",
    link: "onnxruntime.ai",
    href: "https://onnxruntime.ai",
    images: ["/work/onnx.jpg", "/work/onnx-2.jpg"],
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
    story:
      "A Houston developer building duplexes and townhomes wanted a site that felt like the homes: quiet, well proportioned, nothing shouting. Projects, the investment thesis, the people behind it. Designed and built end to end, deployed and maintained.",
    meta: "Client · Web · 2025",
    link: "merwahagroup.com",
    href: "https://www.merwahagroup.com/",
    images: ["/work/merwaha.jpg", "/work/merwaha-3.jpg"],
    dye: "bg-madder",
    chip: "bg-madder",
    fg: FG.light,
  },
  {
    motif: TreeOfLife,
    title: "FLUX at Black Forest Labs",
    short: "FLUX",
    description:
      "Launch kits, live demos, and tooling for FLUX.2. The job is getting a developer from sign-up to first image before they lose interest.",
    story:
      "Black Forest Labs can get attention; the hard part is turning sign-ups into developers who ship. The launch kit is the plan for that: a blog, a tutorial, a video, and a 48-hour challenge, each aimed at one number, sign-up to first API call.",
    meta: "DevRel · FLUX.2 · 2026",
    link: "launch kit",
    href: "https://bfl-launch-kit.vercel.app",
    images: ["/work/flux.jpg", "/work/flux-3.jpg"],
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

// a screenshot printed onto the cloth, tilted the way a hand lays a block
function Print({
  src,
  fg,
  className = "",
}: {
  src: string;
  fg: (typeof FG)[keyof typeof FG];
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`block overflow-hidden rounded-[2px] border ${fg.frame} ${className}`}
    >
      <Image
        src={src}
        alt=""
        width={1200}
        height={750}
        sizes="(max-width: 767px) 80vw, 420px"
        className={`block w-full ${fg.print}`}
      />
    </span>
  );
}

export function Work() {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<{ i: number; from: DOMRect } | null>(null);
  const shelfRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const activate = (i: number) => {
    setActive((prev) => {
      if (prev !== i) {
        void import("@/lib/sound").then(({ pluck }) =>
          pluck(BOLT_NOTES[i % BOLT_NOTES.length], 0.035),
        );
      }
      return i;
    });
  };

  const unroll = (i: number, el: HTMLElement) => {
    setActive(i);
    setOpen({ i, from: el.getBoundingClientRect() });
    void import("@/lib/sound").then(({ pluck }) => pluck(BOLT_NOTES[i], 0.06));
  };

  const rollUp = () => setOpen(null);

  // no hover on touch: the bolt snapped to centre prints itself instead
  useEffect(() => {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
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
        title="Things I've built"
      />

      <div
        ref={shelfRef}
        aria-label="Selected work"
        data-open={open !== null}
        className="-mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:h-[26rem] md:snap-none md:overflow-hidden md:px-0 md:pb-0"
      >
        {projects.map((p, i) => {
          return (
            <motion.div
              key={p.title}
              role="button"
              tabIndex={0}
              aria-haspopup="dialog"
              aria-label={`Unroll ${p.title}`}
              data-idx={i}
              data-on={active === i}
              onMouseEnter={() => activate(i)}
              onFocus={() => activate(i)}
              onClick={(e) => unroll(i, e.currentTarget)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  unroll(i, e.currentTarget);
                }
              }}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.7, ease: EASE, delay: i * 0.07 }
              }
              className={`group relative block max-w-sm flex-[0_0_84vw] snap-center overflow-hidden rounded-sm border border-paper/8 bg-ink-900 transition-[flex-grow,height] duration-[var(--dur-cloth)] ease-[var(--ease-cloth)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turmeric md:h-full md:max-w-none md:flex-[1_1_0%] md:data-[on=true]:flex-[5.5_1_0%] h-[24rem] cursor-pointer`}
            >
              {/* the vat tips: dye floods the cloth from the left */}
              <span
                aria-hidden
                className={`absolute inset-0 origin-left scale-x-0 transition-transform duration-[650ms] ease-[var(--ease-cloth)] group-data-[on=true]:scale-x-100 ${p.dye}`}
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
                <span className={`h-2.5 w-2.5 rounded-[1px] ${p.chip}`} />
              </span>

              {/* the cloth pulled out: a glimpse */}
              <div className="relative flex h-full min-h-[24rem] flex-col p-6 sm:p-7 md:opacity-0 md:transition-opacity md:delay-200 md:duration-500 md:group-data-[on=true]:opacity-100">
                  <span
                    className={`flex items-center gap-2.5 font-mono text-xs text-paper-faint transition-colors duration-500 ${p.fg.meta}`}
                  >
                    <span
                      aria-hidden
                      className={`h-2.5 w-2.5 rounded-[1px] transition-colors duration-500 ${p.chip} ${p.fg.chip}`}
                    />
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {p.images[0] && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute right-5 top-14 w-[52%] translate-y-3 rotate-[-1.5deg] opacity-0 transition-[opacity,translate] delay-500 duration-700 ease-out group-data-[on=true]:translate-y-0 group-data-[on=true]:opacity-100 md:right-7 md:top-auto md:bottom-7 md:w-[38%]"
                    >
                      <Print src={p.images[0]} fg={p.fg} />
                    </span>
                  )}

                  <div className="mt-auto md:max-w-[56%]">
                    <h3
                      className={`font-display text-3xl leading-[1.1] text-balance text-paper transition-colors duration-500 sm:text-4xl lg:text-5xl ${p.fg.title}`}
                    >
                      {p.title}
                    </h3>
                    <p
                      className={`mt-3 max-w-md text-base leading-snug text-paper-dim transition-colors duration-500 ${p.fg.body}`}
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
                        unroll →
                      </span>
                    </div>
                  </div>
                </div>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-4 font-mono text-[11px] text-paper-faint">
        press a bolt to unroll it
      </p>

      <AnimatePresence>
        {open !== null && (
          <BoltUnroll
            key={open.i}
            project={{ ...projects[open.i], tone: projects[open.i].fg.tone }}
            from={open.from}
            onClose={rollUp}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
