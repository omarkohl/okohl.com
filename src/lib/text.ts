/** Slugs of site-internal markdown links, e.g. `[x](/foo/)` → `foo`. */
export function extractInternalLinks(markdown: string): string[] {
  const slugs = new Set<string>();
  for (const m of markdown.matchAll(
    /\]\(\/([a-z0-9][a-z0-9-]*)\/?(?:#[^)]*)?\)/gi,
  )) {
    slugs.add(m[1].toLowerCase());
  }
  return [...slugs];
}

export function readingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Plain-text summary of the first paragraph, for previews and meta tags. */
export function excerpt(markdown: string, max = 200): string {
  const first =
    markdown
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !/^(#|\[\^[^\]]+\]:|```|---)/.test(p)) ?? "";
  const text = first
    .replace(/\[\^[^\]]+\]/g, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, text.lastIndexOf(" ", max)).replace(/[.,;:]$/, "") + "…";
}
