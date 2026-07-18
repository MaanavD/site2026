import type { Metadata } from "next";
import { getPosts } from "@/lib/notion";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { TransitionLink } from "@/components/ink-transition";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Rangoli Courtyard",
  description:
    "A hidden courtyard where every piece of writing draws its own rangoli.",
  openGraph: {
    title: "The Rangoli Courtyard · Maanav Dalal",
    description:
      "A hidden courtyard where every piece of writing draws its own rangoli.",
    url: "/garden",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Rangoli Courtyard · Maanav Dalal",
    description:
      "A hidden courtyard where every piece of writing draws its own rangoli.",
  },
  robots: { index: false },
};

// deterministic per-slug randomness so each rangoli is stable across builds
function seedHash(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

const POWDERS = [
  "var(--color-madder)",
  "var(--color-turmeric)",
  "var(--color-peacock)",
  "var(--color-paper-dim)",
];

type Ring = {
  kind: number; // 0 dots, 1 petals, 2 diamonds, 3 arc
  radius: number;
  color: string;
  phase: number;
  size: number;
};

function Rangoli({ seed }: { seed: string }) {
  const r = rng(seed);
  const folds = [6, 8, 12][Math.floor(r() * 3)];
  const ringCount = 2 + Math.floor(r() * 3);
  const bindu = POWDERS[Math.floor(r() * 2)]; // madder or turmeric centre
  const wobbleSeed = Math.floor(r() * 90);
  const fid = `rg-${seedHash(seed)}`;

  const rings: Ring[] = [];
  let radius = 13;
  for (let k = 0; k < ringCount; k++) {
    radius += 10 + r() * 7;
    rings.push({
      kind: Math.floor(r() * 4),
      radius,
      color: POWDERS[Math.floor(r() * POWDERS.length)],
      phase: r() * 360,
      size: 2 + r() * 2.2,
    });
  }

  const step = 360 / folds;

  return (
    <svg viewBox="0 0 120 120" className="w-full" aria-hidden>
      <filter id={fid} x="-20%" y="-20%" width="140%" height="140%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.06"
          numOctaves="2"
          seed={wobbleSeed}
        />
        <feDisplacementMap in="SourceGraphic" scale="2.2" />
      </filter>
      <g filter={`url(#${fid})`}>
        <circle
          cx="60"
          cy="60"
          r={3 + r() * 1.5}
          fill={bindu}
          style={bloom(0)}
        />
        {rings.map((ring, k) => (
          <g key={k} style={bloom(k + 1)}>
            {ring.kind === 3 ? (
              <circle
                cx="60"
                cy="60"
                r={ring.radius}
                fill="none"
                stroke={ring.color}
                strokeWidth="1.4"
                strokeDasharray={`${((2 * Math.PI * ring.radius) / folds) * 0.55} ${((2 * Math.PI * ring.radius) / folds) * 0.45}`}
                transform={`rotate(${ring.phase} 60 60)`}
              />
            ) : (
              Array.from({ length: folds }, (_, i) => (
                <g
                  key={i}
                  transform={`rotate(${ring.phase + i * step} 60 60)`}
                >
                  {ring.kind === 0 && (
                    <circle
                      cx="60"
                      cy={60 - ring.radius}
                      r={ring.size * 0.8}
                      fill={ring.color}
                    />
                  )}
                  {ring.kind === 1 && (
                    <ellipse
                      cx="60"
                      cy={60 - ring.radius}
                      rx={ring.size * 0.9}
                      ry={ring.size * 2}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth="1.5"
                    />
                  )}
                  {ring.kind === 2 && (
                    <rect
                      x={60 - ring.size}
                      y={60 - ring.radius - ring.size}
                      width={ring.size * 2}
                      height={ring.size * 2}
                      transform={`rotate(45 60 ${60 - ring.radius})`}
                      fill={ring.color}
                      opacity="0.85"
                    />
                  )}
                </g>
              ))
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}

// each ring blooms outward from the bindu, like powder poured ring by ring
function bloom(k: number): React.CSSProperties {
  return {
    animation: "rangoli-bloom 0.7s cubic-bezier(0.22, 1, 0.36, 1) both",
    animationDelay: `${k * 90}ms`,
    transformOrigin: "60px 60px",
  };
}

export default async function GardenPage() {
  const posts = await getPosts();

  return (
    <div className="relative mx-auto max-w-5xl px-6 pt-36 pb-28">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 right-0 hidden w-64 select-none text-paper/5 sm:block"
      >
        <Rangoli seed="courtyard" />
      </span>
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-turmeric">
          Secret Found
        </p>
        <h1 className="mt-4 font-display text-5xl text-paper md:text-6xl">
          The Rangoli Courtyard
        </h1>
        <p className="mt-5 max-w-md text-paper-dim">
          You drew a circle and the site noticed. Every piece of writing here
          draws its own rangoli: same seed, same pattern, every visit. The
          courtyard grows when I write.
        </p>
      </Reveal>

      <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={(i % 4) * 0.06}>
            <TransitionLink
              href={`/blog/${post.slug}`}
              className="group block rounded-sm border border-paper/8 bg-ink-900/60 p-4 transition-colors hover:border-madder/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turmeric"
            >
              <Rangoli seed={post.slug} />
              <p className="mt-2 line-clamp-2 font-display text-sm text-paper-dim transition-colors group-hover:text-paper group-focus-visible:text-paper">
                {post.title}
              </p>
              <p className="mt-1 font-mono text-[10px] text-paper-faint">
                drawn {formatDate(post.date)}
              </p>
            </TransitionLink>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
