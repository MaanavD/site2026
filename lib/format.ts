export function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso + (iso.length === 10 ? "T00:00:00Z" : "")).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }
  );
}
