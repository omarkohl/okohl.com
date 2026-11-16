import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { allNotes, summary, tended, url } from "../lib/notes";

export async function GET(context: APIContext) {
  const notes = await allNotes();
  return rss({
    title: "Omar Kohl",
    description: "Notes and essays by Omar Kohl.",
    site: context.site!,
    items: notes.map((n) => ({
      title: n.data.title,
      link: url(n),
      pubDate: tended(n),
      description: summary(n),
    })),
  });
}
