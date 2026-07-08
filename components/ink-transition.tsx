"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { transitionMotif } from "@/lib/sound";
import { Buti, LotusSeal, Paisley, TreeOfLife } from "./motifs";

type Phase = "idle" | "covering" | "revealing";

type MorphFrom = { text: string; x: number; y: number; fontSize: number };
type MorphTarget = { x: number; y: number; fontSize: number };

type TransitionApi = {
  navigate: (href: string, morph?: MorphFrom) => void;
  morphText: string | null;
  morphDone: boolean;
  registerMorphTarget: (t: MorphTarget) => void;
};

const TransitionContext = createContext<TransitionApi>({
  navigate: () => {},
  morphText: null,
  morphDone: true,
  registerMorphTarget: () => {},
});

export const useInkTransition = () => useContext(TransitionContext);

// each destination gets its own block pressed mid-wipe
const MOTIFS = {
  paisley: Paisley,
  tree: TreeOfLife,
  lotus: LotusSeal,
  buti: Buti,
} as const;

type MotifKey = keyof typeof MOTIFS;

const motifFor = (href: string): MotifKey =>
  href.startsWith("/blog")
    ? "paisley"
    : href === "/"
      ? "tree"
      : href.startsWith("/garden")
        ? "lotus"
        : "buti";

// the stamp-pad kiss of madder first, then the dye takes the page
const layers = [
  { color: "var(--color-madder)", delay: 0 },
  { color: "var(--color-ink-800)", delay: 0.07 },
  { color: "var(--color-ink-950)", delay: 0.14 },
];

export function InkTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [glyph, setGlyph] = useState<MotifKey>("buti");
  const [morph, setMorph] = useState<MorphFrom | null>(null);
  const [morphTarget, setMorphTarget] = useState<MorphTarget | null>(null);
  const [morphDone, setMorphDone] = useState(true);
  const target = useRef<string | null>(null);

  const navigate = (href: string, morphFrom?: MorphFrom) => {
    if (phase !== "idle") return;
    if (href === pathname) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    target.current = href;
    setGlyph(motifFor(href));
    if (morphFrom) {
      setMorph(morphFrom);
      setMorphDone(false);
    }
    setPhase("covering");
    transitionMotif();
  };

  useEffect(() => {
    if (phase === "covering" && target.current === null && pathname) {
      const t = setTimeout(() => setPhase("revealing"), 120);
      return () => clearTimeout(t);
    }
  }, [pathname, phase]);

  const settleMorph = () => {
    setMorphDone(true);
    setMorph(null);
    setMorphTarget(null);
  };

  return (
    <TransitionContext.Provider
      value={{
        navigate,
        morphText: morph?.text ?? null,
        morphDone,
        registerMorphTarget: setMorphTarget,
      }}
    >
      {children}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
        {layers.map((l, i) => (
          <motion.div
            key={i}
            className="absolute inset-0"
            style={{ background: l.color }}
            initial={{ y: "102%" }}
            animate={{
              y:
                phase === "covering"
                  ? "0%"
                  : phase === "revealing"
                    ? "-102%"
                    : "102%",
            }}
            transition={
              phase === "idle"
                ? { duration: 0 }
                : { duration: 0.65, delay: l.delay, ease: [0.76, 0, 0.24, 1] }
            }
            onAnimationComplete={() => {
              if (i !== layers.length - 1) return;
              if (phase === "covering" && target.current) {
                const href = target.current;
                target.current = null;
                router.push(href);
              } else if (phase === "revealing") {
                setPhase("idle");
                if (morph && !morphTarget) settleMorph();
              }
            }}
          />
        ))}

        {/* seal motif, hidden while a title is morphing through */}
        {!morph &&
          (() => {
            const Motif = MOTIFS[glyph];
            return (
              <motion.span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-paper/80"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: phase === "covering" ? 1 : 0,
                  scale: phase === "covering" ? 1 : 1.15,
                }}
                transition={
                  phase === "idle"
                    ? { duration: 0 }
                    : { duration: 0.45, delay: phase === "covering" ? 0.35 : 0 }
                }
              >
                <Motif className="h-[72px] w-[72px]" />
              </motion.span>
            );
          })()}

        {/* the clicked title rides the wipe and settles into the post header */}
        {morph && phase !== "idle" && (
          <motion.span
            className="absolute z-10 origin-top-left whitespace-nowrap font-display leading-tight text-paper"
            style={{ fontSize: morph.fontSize }}
            initial={{ x: morph.x, y: morph.y, scale: 1 }}
            animate={
              morphTarget
                ? {
                    x: morphTarget.x,
                    y: morphTarget.y,
                    scale: morphTarget.fontSize / morph.fontSize,
                  }
                : { x: morph.x, y: morph.y - 20, scale: 1.02 }
            }
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => {
              if (morphTarget) settleMorph();
            }}
          >
            {morph.text}
          </motion.span>
        )}
      </div>
    </TransitionContext.Provider>
  );
}

export function TransitionLink({
  href,
  children,
  onClick,
  morph = false,
  ...rest
}: React.ComponentProps<typeof Link> & { morph?: boolean }) {
  const { navigate } = useInkTransition();

  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        const h = typeof href === "string" ? href : (href.pathname ?? "/");
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || h.includes("#"))
          return;
        e.preventDefault();

        let morphFrom: MorphFrom | undefined;
        if (morph) {
          const el = e.currentTarget.querySelector<HTMLElement>("[data-morph]");
          if (el) {
            const rect = el.getBoundingClientRect();
            morphFrom = {
              text: el.dataset.morph || el.textContent || "",
              x: rect.left,
              y: rect.top,
              fontSize: parseFloat(getComputedStyle(el).fontSize),
            };
          }
        }
        navigate(h, morphFrom);
      }}
    >
      {children}
    </Link>
  );
}
