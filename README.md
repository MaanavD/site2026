# site2026

Maanav's 2026 personal site. Dark Japandi — sumi ink, kinari paper,
persimmon. WebGL ink shader hero, Notion-backed blog.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind 4 · motion · React Three
Fiber · Lenis · Notion SDK v2 · Bun

## Run

```bash
bun install
cp .env.example .env.local   # add your NOTION_TOKEN
bun dev
```

Without `NOTION_TOKEN` the blog renders mock posts so the design is
still previewable.

## Imagery

Generated with FLUX — prompts and the shared style DNA live in
[FLUX_PROMPTS.md](./FLUX_PROMPTS.md). Cutout assets go in
`public/assets/`, atmosphere plates in `public/plates/`.
