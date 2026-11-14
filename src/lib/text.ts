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
