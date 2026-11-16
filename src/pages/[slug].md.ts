import { readFile } from "node:fs/promises";
import type { APIContext } from "astro";
import { allNotes, type Note } from "../lib/notes";

export async function getStaticPaths() {
  return (await allNotes())
    .filter((note) => note.filePath)
    .map((note) => ({ params: { slug: note.id }, props: { note } }));
}

/** The note as written, frontmatter included. */
export async function GET({ props }: APIContext) {
  const { filePath } = (props as { note: Note }).note;
  return new Response(await readFile(filePath!), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
