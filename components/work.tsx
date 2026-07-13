"use client";

import { motion } from "motion/react";
import { SectionHeading } from "./section-heading";
import { Buti, Flame, Kite, LotusOutline, RiverLines } from "./motifs";
import { pluck } from "@/lib/sound";

// one quiet ascending note per card, Sa Ga Pa Sa'
const CARD_NOTES = [0, 2, 3, 5];

const projects = [
  {
    motif: RiverLines,
    title: "FLUX at Black Forest Labs",
    description:
      "Launch kits, live demos, and developer tooling for FLUX.2. The job is making frontier image models feel like tools you already know.",
    meta: ["DevRel", "FLUX.2", "2026"],
    href: "https://github.com/MaanavD/bfl-launch-kit",
  },
  {
    motif: Flame,
    title: "Foundry Local",
    description:
      "Built foundrylocal.ai from scratch as the home for Microsoft's local AI runtime. 20K+ monthly views.",
    meta: ["Product", "Web", "20K/mo"],
    href: "https://foundrylocal.ai",
  },
  {
    motif: Kite,
    title: "ONNX Runtime",
    description:
      "Complete redesign of onnxruntime.ai, the site for Microsoft's cross-platform inference engine. 250K+ monthly views.",
    meta: ["Design", "Web", "250K/mo"],
    href: "https://onnxruntime.ai",
  },
  {
    motif: LotusOutline,
    title: "Hush",
    description:
      "Private, fully offline voice-to-text for the desktop. Open source, no cloud, no compromise.",
    meta: ["OSS", "Desktop", "Local AI"],
    href: "https://github.com/MaanavD/Hush",
  },
];

export function Work() {
  return (
    <section id="work" className="relative mx-auto max-w-6xl scroll-mt-24 px-6 py-28">
      <SectionHeading
        motif={<Buti className="w-full" />}
        sub="Selected Work"
        title="Things I've built"
      />
      <div className="grid gap-px overflow-hidden rounded-sm border border-paper/8 bg-paper/8 md:grid-cols-2">
        {projects.map((p, i) => (
          <motion.a
            key={p.title}
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => pluck(CARD_NOTES[i % CARD_NOTES.length], 0.035)}
            className="group relative overflow-hidden bg-ink-900 p-8 md:p-10"
          >
            {/* ink sweep on hover */}
            <span className="absolute inset-0 origin-left scale-x-0 bg-ink-800 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100" />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -bottom-8 w-36 select-none text-paper/5 transition-all duration-500 group-hover:text-madder/20 group-hover:-translate-y-2"
            >
              <p.motif className="w-full" />
            </span>
            <div className="relative">
              <span className="font-mono text-xs text-paper-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-2xl text-paper transition-colors group-hover:text-turmeric md:text-3xl">
                {p.title}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-paper-dim">
                {p.description}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {p.meta.map((m) => (
                  <li
                    key={m}
                    className="rounded-sm border border-paper/10 px-2.5 py-1 font-mono text-[11px] text-paper-faint"
                  >
                    {m}
                  </li>
                ))}
              </ul>
              <span className="mt-8 inline-block text-sm text-madder opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                Visit →
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
