import type { Metadata } from "next";
import { BlockprintStrip } from "@/components/themes/blockprint";
import { ThemeHero } from "@/components/themes/theme-hero";

export const metadata: Metadata = {
  title: "Theme Study · Indian Craft Minimal",
  description:
    "The living style tile behind the current skin of maanavdalal.com.",
  openGraph: {
    title: "Indian Craft Minimal · Maanav Dalal",
    description:
      "The living style tile behind the current skin of maanavdalal.com.",
    url: "/themes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Craft Minimal · Maanav Dalal",
    description:
      "The living style tile behind the current skin of maanavdalal.com.",
  },
  robots: { index: false },
};

const palette = [
  { name: "Vat indigo", hex: "#0e1220", note: "page ground (was sumi ink)" },
  { name: "Indigo bloom", hex: "#1c2642", note: "raised surfaces" },
  { name: "Khadi", hex: "#ece2cc", note: "text (was kinari paper)" },
  { name: "Madder", hex: "#8f3b2e", note: "primary accent (was moss green)" },
  { name: "Turmeric", hex: "#d9a441", note: "links, glow (was celadon)" },
  { name: "Peacock", hex: "#1f5f5b", note: "secondary accent" },
];

export default function ThemesPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pt-36 pb-28">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-turmeric">
        Theme Study 01 · Shipped
      </p>
      <h1 className="mt-4 font-display text-5xl text-paper md:text-6xl">
        Indian Craft Minimal
      </h1>
      <p className="mt-5 max-w-lg text-paper-dim">
        The same bones: dye instead of ink, khadi instead of washi, blockprint
        instead of brushwork. Craft and symbolism carry all the meaning, no
        script anywhere. Everything below is live, not a mockup.
      </p>

      {/* mini hero: the stepwell at dusk */}
      <section className="relative mt-14 flex h-[55svh] min-h-[420px] items-center overflow-hidden rounded-sm border border-paper/8">
        <ThemeHero />
        <div className="pointer-events-none relative z-10 w-full px-10">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-turmeric">
            Developer Relations Engineer · Black Forest Labs
          </p>
          <h2 className="mt-4 font-display text-6xl text-paper md:text-8xl">
            Maanav Dalal
          </h2>
          <p className="mt-4 font-mono text-[11px] tracking-wide text-paper/50">
            the stepwell hero, pinned to dusk
          </p>
        </div>
      </section>

      {/* palette */}
      <section className="mt-14">
        <h2 className="font-display text-2xl text-paper">Palette</h2>
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
        <h2 className="font-display text-2xl text-paper">Type</h2>
        <div className="mt-5 rounded-sm border border-paper/8 bg-ink-900/50 p-8">
          <p className="font-display text-4xl text-paper md:text-5xl">
            Rozha One carries the headlines
          </p>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-paper-dim">
            Body text stays on Geist, exactly as before. Rozha One was drawn in
            Ahmedabad for Indian editorial work: high contrast, sharp serifs, a
            single confident weight. The lettering is the only place the theme
            speaks; everything else is motif and color.
          </p>
        </div>
      </section>

      {/* signature interaction */}
      <section className="mt-14">
        <h2 className="font-display text-2xl text-paper">
          Signature interaction: the blockprint
        </h2>
        <p className="mt-3 max-w-lg text-sm text-paper-dim">
          Where the old theme brushed ink, this one presses wood blocks into
          cloth. Section reveals, seals, and the read-stamp all land
          hand-stamped: slightly crooked, unevenly inked, human. Try it (sound
          on helps):
        </p>
        <div className="mt-6">
          <BlockprintStrip />
        </div>
      </section>

      {/* concept mapping */}
      <section className="mt-14">
        <h2 className="font-display text-2xl text-paper">What mapped where</h2>
        <ul className="mt-5 grid gap-2 text-sm text-paper-dim sm:grid-cols-2">
          {[
            ["Sumi ink hero", "stepwell + festival clock (live above)"],
            ["Kanji glosses", "craft motifs, or simply nothing"],
            ["Hanko read-stamp", "lotus seal pressed in madder"],
            ["Ensō circle unlock", "drawn circle · rangoli courtyard"],
            ["Koto plucks", "santoor plucks, Raag Bhupali on D"],
            ["Seasons in the shader", "kites, monsoon, marigolds, diyas"],
            ["Torii-gate 404", "a lotus adrift on dark water"],
            ["Brush progress rail", "temple-border rangoli in powder"],
          ].map(([from, to]) => (
            <li
              key={from}
              className="rounded-sm border border-paper/8 px-3 py-2"
            >
              <span className="text-paper-faint">{from}</span>
              <span className="mx-2 text-turmeric">→</span>
              <span className="text-paper">{to}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
