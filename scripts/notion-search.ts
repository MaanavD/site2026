import { isFullPageOrDatabase } from "@notionhq/client";
import { getNotionClient } from "../lib/notion/client-core";
import { pageTitle, richTextPlainText } from "../lib/notion/normalize";

const notion = getNotionClient();

for (const query of ["currently", "now", ""]) {
  const response = await notion.search({ query, page_size: 20 });
  console.log(`\n=== search: "${query}" (${response.results.length}) ===`);
  for (const result of response.results) {
    if (!isFullPageOrDatabase(result)) continue;
    const title =
      result.object === "database"
        ? richTextPlainText(result.title)
        : pageTitle(result);
    console.log(`${result.object}  ${result.id}  ${title || "(untitled)"}`);
  }
}
