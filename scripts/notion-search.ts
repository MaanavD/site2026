import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_TOKEN });

for (const query of ["currently", "now", ""]) {
  const res = await notion.search({ query, page_size: 20 });
  console.log(`\n=== search: "${query}" (${res.results.length}) ===`);
  for (const r of res.results as any[]) {
    const title =
      r.title?.map((t: any) => t.plain_text).join("") ??
      Object.values(r.properties ?? {})
        .filter((p: any) => p?.type === "title")
        .flatMap((p: any) => p.title)
        .map((t: any) => t.plain_text)
        .join("") ??
      "(untitled)";
    console.log(`${r.object}  ${r.id}  ${title}`);
  }
}
