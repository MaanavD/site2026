const KEY = "read-posts";

export function readSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function isRead(slug: string) {
  return readSlugs().includes(slug);
}

export function markRead(slug: string) {
  const slugs = readSlugs();
  if (!slugs.includes(slug)) {
    localStorage.setItem(KEY, JSON.stringify([...slugs, slug]));
  }
}
