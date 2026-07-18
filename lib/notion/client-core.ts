import { Client } from "@notionhq/client";

let client: Client | null = null;
let clientToken: string | null = null;

export function hasNotionToken(): boolean {
  return Boolean(process.env.NOTION_TOKEN?.trim());
}

export function hasNotionConfig(): boolean {
  return hasNotionToken() && Boolean(process.env.NOTION_DATABASE_ID?.trim());
}

export function getNotionClient(): Client {
  const token = process.env.NOTION_TOKEN?.trim();
  if (!token) throw new Error("NOTION_TOKEN is not configured");

  if (!client || clientToken !== token) {
    client = new Client({ auth: token, timeoutMs: 10_000 });
    clientToken = token;
  }

  return client;
}

export function getNotionDatabaseId(): string {
  const databaseId = process.env.NOTION_DATABASE_ID?.trim();
  if (!databaseId) throw new Error("NOTION_DATABASE_ID is not configured");
  return databaseId;
}
