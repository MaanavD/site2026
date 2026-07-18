# site2026

Maanav's 2026 personal site. Indian craft minimal: vat indigo, khadi,
madder, turmeric. WebGL stepwell hero, Notion-backed blog.

## Stack

Next.js 16 (App Router), React 19, Tailwind 4, Motion, React Three Fiber,
Notion SDK v2, Bun.

## Run

```bash
bun install
cp .env.example .env.local
bun dev
```

The blog uses mock posts when the Notion credentials are absent. A complete
Notion setup requires both `NOTION_TOKEN` and `NOTION_DATABASE_ID`.

## Notion setup

Share the writing database with the Notion integration. The database expects:

- One title property (the property name does not matter)
- `Date`, a date property
- `Slug`, an optional rich-text property
- `Category`, an optional select property
- `Category: TBD` for drafts

Slugs are normalized in code and generated from the title when `Slug` is empty.
Duplicate or invalid slugs fail the content refresh instead of publishing an
ambiguous route.

The footer searches the shared workspace for a page titled `Currently` and
reads its first paragraphs or list items. No separate database ID is required.

Published pages use one-hour ISR plus Vercel's data cache for the normalized
Notion index and block trees. A configured Notion failure throws so the last
successful cached page remains available. Notion-hosted media is served through
a same-origin block-ID route so expiring signed URLs are never embedded in
cached article HTML.

## Checks

```bash
bun run lint
bun run typecheck
bun test
bun run build
bun run check
```

GitHub Actions runs the same checks without Notion credentials, using mock
content for the production build.

## Design references

`/themes`, `/lab/hero`, and `/lab/motifs` are noindex proof surfaces for the
visual system. [FLUX_PROMPTS.md](./FLUX_PROMPTS.md) is an optional prompt kit
for future generated imagery, not a required asset pipeline.
