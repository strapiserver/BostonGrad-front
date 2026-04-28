export function readSlug(slug: string): [string, string, string] {
  // remove leading slash
  if (!slug) return ["", "", ""];
  const cleaned = slug.startsWith("/") ? slug.slice(1) : slug;

  // split into parts
  const [first, rest] = cleaned.split("/");
  if (!rest) throw new Error("Invalid slug format");

  const [second, third] = rest.split("-for-");
  if (!second || !third) throw new Error("Invalid slug format");

  return [first, second, third];
}
