import { getCollection, type CollectionEntry } from "astro:content";
import { extractInternalLinks, readingMinutes } from "./text";

export type Note = CollectionEntry<"notes">;

export const STAGES = {
  seedling: { symbol: "∘", label: "Seedling", blurb: "a first, rough thought" },
  budding: { symbol: "◐", label: "Budding", blurb: "revised, taking shape" },
  evergreen: { symbol: "●", label: "Evergreen", blurb: "I stand behind this" },
} as const;

// Top-level routes that a note slug must not shadow.
const RESERVED = new Set([
  "notes",
  "essays",
  "topics",
  "search",
  "rss.xml",
  "pagefind",
]);

export const tended = (n: Note) => n.data.tended ?? n.data.planted;
export const url = (n: Note) => `/${n.id}/`;
export const topicUrl = (t: string) => `/topics/${t}/`;
export const minutes = (n: Note) => readingMinutes(n.body ?? "");

export async function allNotes(): Promise<Note[]> {
  const notes = await getCollection(
    "notes",
    (n) => import.meta.env.DEV || !n.data.draft,
  );
  for (const n of notes) {
    if (RESERVED.has(n.id))
      throw new Error(`Note slug "${n.id}" clashes with a site route`);
  }
  return notes.sort((a, b) => tended(b).getTime() - tended(a).getTime());
}

export function backlinks(target: Note, notes: Note[]): Note[] {
  return notes.filter(
    (n) =>
      n.id !== target.id &&
      extractInternalLinks(n.body ?? "").includes(target.id),
  );
}

export function topicsOf(notes: Note[]): Map<string, Note[]> {
  const map = new Map<string, Note[]>();
  for (const n of notes) {
    for (const t of n.data.topics) map.set(t, [...(map.get(t) ?? []), n]);
  }
  return new Map([...map].sort(([a], [b]) => a.localeCompare(b)));
}

export const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
export const fmtLong = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
