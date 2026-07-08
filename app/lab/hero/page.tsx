"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useMotionValue } from "motion/react";

const StepwellCanvas = dynamic(() => import("@/components/stepwell-canvas"), {
  ssr: false,
});

const SCENES = ["Night", "Dawn", "Day", "Dusk"];
const SEASONS = ["Winter", "Spring", "Summer", "Autumn"];

export default function HeroLab() {
  const [scene, setScene] = useState(3);
  const [season, setSeason] = useState(0);
  const descend = useMotionValue(0);

  return (
    <div className="fixed inset-0 z-40 bg-ink-950">
      <StepwellCanvas scene={scene} season={season} descend={descend} />
      <div className="absolute bottom-6 left-1/2 z-10 flex w-[min(92vw,640px)] -translate-x-1/2 flex-col gap-3 rounded-sm border border-paper/10 bg-ink-950/80 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-14 font-mono text-[10px] uppercase tracking-widest text-paper-faint">
            Scene
          </span>
          {SCENES.map((label, i) => (
            <button
              key={label}
              onClick={() => setScene(i)}
              className={`rounded-sm border px-3 py-1 font-mono text-xs transition-colors ${
                scene === i
                  ? "border-turmeric/60 text-turmeric"
                  : "border-paper/10 text-paper-dim hover:text-paper"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-14 font-mono text-[10px] uppercase tracking-widest text-paper-faint">
            Season
          </span>
          {SEASONS.map((label, i) => (
            <button
              key={label}
              onClick={() => setSeason(i)}
              className={`rounded-sm border px-3 py-1 font-mono text-xs transition-colors ${
                season === i
                  ? "border-turmeric/60 text-turmeric"
                  : "border-paper/10 text-paper-dim hover:text-paper"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="w-14 font-mono text-[10px] uppercase tracking-widest text-paper-faint">
            Descend
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            defaultValue={0}
            onChange={(e) => descend.set(Number(e.target.value))}
            className="w-full accent-[#d9a441]"
          />
        </div>
      </div>
    </div>
  );
}
