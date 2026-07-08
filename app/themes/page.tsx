import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Rozha_One } from "next/font/google";
import { BlockprintStrip } from "@/components/themes/blockprint";

const rozha = Rozha_One({ weight: "400", subsets: ["latin", "devanagari"] });

const DyeCanvas = dynamic(() => import("@/components/themes/dye-canvas"));

export const metadata: Metadata = {
  title: "Theme Study · Indian Craft Minimal",
  description: "A live style tile for the next skin of maanavdalal.com.",
  robots: { index: false },
};

const palette = [
  { name: "Vat indigo", hex: "#0e1220", note: "page ground (was sumi ink)" },
  { name: "Indigo bloom", hex: "#1c2642", note: "raised surfaces" },
  { name: "Khadi", hex: "#ece2cc", note: "text (was kinari paper)" },
  { name: "Madder", hex: "#8f3b2e", note: "primary accent (was moss)" },
  { name: "Turmeric", hex: "#d9a441", note: "links, glow (was celadon)" },
  { name: "Peacock", hex: "#1f5f5b", note: "secondary accent" },
];

export default function ThemesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-36 pb-28">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-[#d9a441]">
        Theme Study 01
      </p>
      <h1 className={`${rozha.className} mt-4 text-5xl text-paper md:text-6xl`}>
        Indian Craft Minimal
      </h1>
      <p className="mt-5 max-w-lg text-paper-dim">
        The same bones: dye instead of ink, khadi instead of washi, blockprint
        instead of brushwork. Craft only, nothing sacred. Everything below is
        live, not a mockup.
      </p>

      {/* mini hero: the indigo dye vat */}
      <section className="relative mt-14 flex h-[55svh] min-h-[420px] items-center overflow-hidden rounded-sm border border-paper/8">
        <DyeCanvas />
        <div className="pointer-events-none relative z-10 w-full px-10">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-[#d9a441]">
            Developer Relations · Black Forest Labs
          </p>
          <h2
            className={`${rozha.className} mt-4 text-6xl text-[#ece2cc] md:text-8xl`}
          >
            Maanav Dalal
          </h2>
          <p className="mt-4 font-mono text-[11px] tracking-wide text-[#ece2cc]/50">
            मानव mānava · &ldquo;human&rdquo; — the name, in its own script
          </p>
        </div>
      </section>

      {/* palette */}
      <section className="mt-14">
        <h3 className={`${rozha.className} text-2xl text-paper`}>Palette</h3>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {palette.map((c) => (
            <div key={c.name} className="rounded-sm border border-paper/8 p-2">
              <div
                className="h-16 rounded-[2px]"
                style={{ background: c.hex }}
              />
              <p className="mt-2 text-xs text-paper">{c.name}</p>
              <p className="font-mono text-[10px] text-paper-faint">{c.hex}</p>
              <p className="mt-1 text-[10px] leading-snug text-paper-faint">
                {c.note}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* type */}
      <section className="mt-14">
        <h3 className={`${rozha.className} text-2xl text-paper`}>Type</h3>
        <div className="mt-5 rounded-sm border border-paper/8 bg-ink-900/50 p-8">
          <p className={`${rozha.className} text-4xl text-[#ece2cc] md:text-5xl`}>
            Rozha One carries the headlines
          </p>
          <p className={`${rozha.className} mt-3 text-2xl text-[#d9a441]`}>
            मानव दलाल — one face, two scripts
          </p>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-paper-dim">
            Body text stays on Geist, exactly as today. Rozha One was drawn in
            Ahmedabad for Indian editorial work: high contrast, sharp serifs,
            and native Devanagari that isn&apos;t an afterthought. The glosses
            that were kanji become my own script.
          </p>
        </div>
      </section>

      {/* signature interaction */}
      <section className="mt-14">
        <h3 className={`${rozha.className} text-2xl text-paper`}>
          Signature interaction: the blockprint
        </h3>
        <p className="mt-3 max-w-lg text-sm text-paper-dim">
          Where the old theme brushed ink, this one presses wood blocks into
          cloth. Section reveals, list bullets, dividers, and the read-stamp
          all become hand-stamped: slightly crooked, unevenly inked, human.
          Try it (sound on helps):
        </p>
        <div className="mt-6">
          <BlockprintStrip />
        </div>
      </section>

      {/* concept mapping */}
      <section className="mt-14">
        <h3 className={`${rozha.className} text-2xl text-paper`}>
          What maps where
        </h3>
        <ul className="mt-5 grid gap-2 text-sm text-paper-dim sm:grid-cols-2">
          {[
            ["Sumi ink hero", "indigo dye vat (live above)"],
            ["Kanji glosses", "Devanagari glosses (मानव · human)"],
            ["Hanko read-stamp", "blockprint stamp in madder"],
            ["Ensō circle unlock", "drawn circle → courtyard of motifs"],
            ["Koto plucks", "santoor/tanpura plucks, same synth"],
            ["Seasons in the shader", "marigold petals, monsoon rain, kites"],
            ["Torii-gate 404", "jharokha window on a foggy haveli wall"],
            ["筆 progress brush", "running-stitch embroidery line"],
          ].map(([from, to]) => (
            <li
              key={from}
              className="rounded-sm border border-paper/8 px-3 py-2"
            >
              <span className="text-paper-faint">{from}</span>
              <span className="mx-2 text-[#d9a441]">→</span>
              <span className="text-paper">{to}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
