import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

export type Post = {
  id: string;
  slug: string;
  title: string;
  date: string;
  category: string | null;
  isMock?: boolean;
};

export type NotionBlock = BlockObjectResponse & {
  children?: NotionBlock[];
};

export type NotionRichText = RichTextItemResponse[];

export type NotionMediaType = "image" | "file" | "audio" | "video" | "pdf";

export type NotionMedia = {
  url: string;
  type: NotionMediaType;
  name: string | null;
};
