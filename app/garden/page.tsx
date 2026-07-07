import type { Metadata } from "next";
import { getPosts } from "@/lib/notion";
import { formatDate } from "@/lib/format";
import { Reveal } from "@/components/reveal";
import { TransitionLink } from "@/components/ink-transition";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Ink Garden",
  description: "A hidden garden where every piece of writing grows an ensō.",
  robots: { index: false },
};

// deterministic per-slug randomness so each plant is stable across builds
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

const GREENS = ["#6f8f76", "#a3bfa8", "#34503e", "#8aa88f"];

function EnsoPlant({ seed }: { seed: string }) {
  const r = rng(seed);
  const color = GREENS[Math.floor(r() * GREENS.length)];
  const radius = 26 + r() * 12;
  const open = 0.78 + r() * 0.16; // how closed the circle is
  const rotate = Math.floor(r() * 360);
  const width = 2.5 + r() * 3.5;
  const wobbleFreq = 0.035 + r() * 0.05;
  const wobbleScale = 3 + r() * 5;
  const stemLean = (r() - 0.5) * 22;
  const circumference = 2 * Math.PI * radius;
  const fid = `w-${seed.replace(/[^a-z0-9]/gi, "").slice(0, 12)}`;

  return (
    <svg viewBox="0 0 120 160" className="w-full" aria-hidden>
      <filter id={fid} x="-30%" y="-30%" width="160%" height="160%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={wobbleFreq}
          numOctaves="2"
          seed={Math.floor(r() * 90)}
        />
        <feDisplacementMap in="SourceGraphic" scale={wobbleScale} />
      </filter>
      <g filter={`url(#${fid})`}>
        <path
          d={`M60 150 C ${60 + stemLean} 130, ${60 - stemLean * 0.6} 112, 60 ${60 + radius + 4}`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray={`${circumference * open} ${circumference}`}
          transform={`rotate(${rotate} 60 60)`}
        />
        <path
          d={`M60 128 q ${8 + r() * 8} ${-4 - r() * 6} ${14 + r() * 8} ${-2 - r() * 4}`}
          stroke={color}
          strokeWidth="1.6"
          fill="none"
          opacity="0.55"
        />
      </g>
    </svg>
  );
}

export default async function GardenPage() {
  const posts = await getPosts();

  return (
    <div className="relative mx-auto max-w-5xl px-6 pt-36 pb-28">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-4 right-0 select-none font-display text-[14rem] leading-none text-paper/4"
      >
        庭
      </span>
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-moss">
          Secret Found
        </p>
        <h1 className="mt-4 font-display text-5xl text-paper md:text-6xl">
          The Ink Garden
        </h1>
        <p className="mt-3 font-mono text-[11px] text-paper-faint">
          庭 niwa · &ldquo;garden&rdquo;
        </p>
        <p className="mt-5 max-w-md text-paper-dim">
          You drew a circle and the site noticed. Every piece of writing
          planted here grows its own ensō: same seed, same plant, every visit.
          The garden grows when I write.
        </p>
      </Reveal>

      <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={(i % 4) * 0.06}>
            <TransitionLink
              href={`/blog/${post.slug}`}
              className="group block rounded-sm border border-paper/8 bg-ink-900/60 p-4 transition-colors hover:border-moss/40"
            >
              <EnsoPlant seed={post.slug} />
              <p className="mt-2 truncate font-display text-sm text-paper-dim transition-colors group-hover:text-paper">
                {post.title}
              </p>
              <p className="mt-1 font-mono text-[10px] text-paper-faint">
                planted {formatDate(post.date)}
              </p>
            </TransitionLink>
          </Reveal>
        ))}
      </div>

    </div>
  );
}
