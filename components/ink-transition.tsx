"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { Buti, LotusSeal, TreeOfLife } from "./motifs";

type Phase = "idle" | "covering" | "revealing";

type MorphFrom = { text: string; x: number; y: number; fontSize: number };
type MorphTarget = { x: number; y: number; fontSize: number };
export type TurnDir = "older" | "newer";

// a sheet caught mid-turn: a clone of the cloth, exactly where it lay
type Leaf = {
  node: HTMLElement;
  rect: { top: number; left: number; width: number; height: number };
  dir: 1 | -1;
};

type TransitionApi = {
  navigate: (href: string, morph?: MorphFrom, turn?: TurnDir) => boolean;
  morphText: string | null;
  morphDone: boolean;
  // set while a page turn is in flight: the arriving sheet slides in from
  // the side the old one did not leave by
  turnDir: 1 | -1 | null;
  registerMorphTarget: (t: MorphTarget) => void;
};

const TransitionContext = createContext<TransitionApi>({
  navigate: () => false,
  morphText: null,
  morphDone: true,
  turnDir: null,
  registerMorphTarget: () => {},
});

export const useInkTransition = () => useContext(TransitionContext);

// each destination gets its own block pressed mid-wipe
const MOTIFS = {
  tree: TreeOfLife,
  lotus: LotusSeal,
  buti: Buti,
} as const;

type MotifKey = keyof typeof MOTIFS;

const motifFor = (href: string): MotifKey =>
  href.startsWith("/blog")
    ? "buti"
    : href === "/"
      ? "tree"
      : href.startsWith("/garden")
        ? "lotus"
        : "buti";

// the stamp-pad kiss of madder first, then the dye takes the page
const layers = [
  { color: "var(--madder)", delay: 0 },
  { color: "var(--ink-800)", delay: 0.05 },
  { color: "var(--ink-950)", delay: 0.1 },
];

export function InkTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("idle");
  const [glyph, setGlyph] = useState<MotifKey>("buti");
  const [morph, setMorph] = useState<MorphFrom | null>(null);
  const [morphTarget, setMorphTarget] = useState<MorphTarget | null>(null);
  const [morphDone, setMorphDone] = useState(true);
  const [leaf, setLeaf] = useState<Leaf | null>(null);
  const target = useRef<string | null>(null);

  const navigate = useCallback((href: string, morphFrom?: MorphFrom, turn?: TurnDir) => {
    if (phase !== "idle" || leaf) return false;
    if (href === pathname) {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      return true;
    }
    if (reduceMotion) {
      router.push(href);
      return true;
    }

    // turning a page: lift the sheet off the table, no dye between posts
    if (turn) {
      const sheet = document.querySelector<HTMLElement>("article .sheet");
      if (sheet) {
        const r = sheet.getBoundingClientRect();
        const node = sheet.cloneNode(true) as HTMLElement;
        node.removeAttribute("id");
        node.querySelectorAll("[id]").forEach((el) => el.removeAttribute("id"));
        // a copy must not replay its entrance: freeze every animation on it
        node.classList.add("leaf");
        setLeaf({
          node,
          rect: { top: r.top, left: r.left, width: r.width, height: r.height },
          dir: turn === "older" ? -1 : 1,
        });
        void import("@/lib/sound").then(({ press }) => press());
        router.push(href);
        return true;
      }
    }

    target.current = href;
    setGlyph(motifFor(href));
    if (morphFrom) {
      setMorph(morphFrom);
      setMorphDone(false);
    }
    setPhase("covering");
    void import("@/lib/sound").then(({ transitionMotif }) => transitionMotif());
    return true;
  }, [leaf, pathname, phase, reduceMotion, router]);

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
        turnDir: leaf?.dir ?? null,
        registerMorphTarget: setMorphTarget,
      }}
    >
      {children}

      {/* the sheet on its way off the table */}
      {leaf && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed z-[85] overflow-hidden rounded-[2px]"
          style={{
            top: leaf.rect.top,
            left: leaf.rect.left,
            width: leaf.rect.width,
            height: leaf.rect.height,
            transformOrigin: leaf.dir < 0 ? "0% 100%" : "100% 100%",
          }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            x: leaf.dir * (leaf.rect.width * 1.15 + 80),
            y: -70,
            rotate: leaf.dir * 6,
            opacity: [1, 1, 0.85],
            boxShadow: [
              "0 20px 60px -20px rgba(0,0,0,0.55)",
              "0 60px 120px -30px rgba(0,0,0,0.75)",
              "0 40px 90px -30px rgba(0,0,0,0.5)",
            ],
          }}
          transition={{ duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
          onAnimationComplete={() => setLeaf(null)}
          ref={(el) => {
            if (el && !el.hasChildNodes()) el.appendChild(leaf.node);
          }}
        />
      )}
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
                : { duration: 0.42, delay: l.delay, ease: [0.76, 0, 0.24, 1] }
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
        {morph && (
          <motion.span
            className="absolute z-10 origin-top-left whitespace-nowrap font-display leading-tight text-[#ece2cc] mix-blend-difference"
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
  turn,
  ...rest
}: React.ComponentProps<typeof Link> & { morph?: boolean; turn?: TurnDir }) {
  const { navigate } = useInkTransition();

  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        const h = typeof href === "string" ? href : (href.pathname ?? "/");
        if (
          e.defaultPrevented ||
          e.metaKey ||
          e.ctrlKey ||
          e.shiftKey ||
          e.altKey ||
          e.currentTarget.target === "_blank" ||
          e.currentTarget.hasAttribute("download") ||
          h.includes("#")
        ) {
          return;
        }

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
        e.preventDefault();
        navigate(h, morphFrom, turn);
      }}
    >
      {children}
    </Link>
  );
}
