import type { Metadata } from "next";
import {
  Buti,
  Flame,
  Kite,
  LotusOutline,
  LotusSeal,
  Marigold,
  Paisley,
  PeacockFeather,
  RiverLines,
  Sparkler,
  TreeOfLife,
} from "@/components/motifs";

export const metadata: Metadata = {
  title: "Lab · Motifs",
  robots: { index: false },
};

const MOTIFS = [
  ["LotusSeal", LotusSeal],
  ["LotusOutline", LotusOutline],
  ["TreeOfLife", TreeOfLife],
  ["RiverLines", RiverLines],
  ["PeacockFeather", PeacockFeather],
  ["Flame", Flame],
  ["Marigold", Marigold],
  ["Kite", Kite],
  ["Paisley", Paisley],
  ["Buti", Buti],
  ["Sparkler", Sparkler],
] as const;

export default function MotifSheet() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-36 pb-28">
      <h1 className="font-display text-3xl text-paper">Motif proof sheet</h1>
      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {MOTIFS.map(([name, M]) => (
          <div
            key={name}
            className="flex flex-col items-center gap-4 rounded-sm border border-paper/10 p-6"
          >
            <M className="h-24 w-24 text-paper" />
            <div className="flex items-center gap-3">
              <M className="h-5 w-5 text-turmeric" />
              <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-madder text-ink-950">
                <M className="h-6 w-6" />
              </span>
              <span className="w-10 text-paper/10">
                <M className="w-full" />
              </span>
            </div>
            <p className="font-mono text-[10px] text-paper-faint">{name}</p>
          </div>
        ))}
        <div className="flex flex-col items-center gap-4 rounded-sm border border-paper/10 p-6">
          <Sparkler className="h-24 w-24 text-paper" lit={false} />
          <p className="font-mono text-[10px] text-paper-faint">
            Sparkler (out)
          </p>
        </div>
      </div>
    </div>
  );
}
