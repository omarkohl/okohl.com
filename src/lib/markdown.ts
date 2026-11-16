import { readFileSync } from "node:fs";
import { defineMdastPlugin } from "satteri";

const NOTES_DIR = "src/content/notes";

/** Title of a note from its frontmatter, or undefined if there is no such note. */
export function noteTitle(slug: string, dir = NOTES_DIR): string | undefined {
  let source: string;
  try {
    source = readFileSync(`${dir}/${slug}.md`, "utf8");
  } catch {
    return undefined;
  }
  const m = source.match(/^title:\s*(.+?)\s*$/m);
  return m?.[1].replace(/^(["'])(.*)\1$/, "$2");
}

/**
 * Makes `[[slug]]` shorthand for `[Title of that note](/slug/)`.
 * `[[slug|text]]` sets the link text, `[[slug#heading]]` keeps the fragment.
 */
export const wikiLinks = (titleOf: (slug: string) => string | undefined) =>
  defineMdastPlugin({
    name: "wiki-links",
    link(node, ctx) {
      const m = node.url.match(/^([a-z0-9][a-z0-9-]*)(#.*)?$/i);
      if (!m) return;
      const slug = m[1].toLowerCase();
      ctx.setField(node, "url", `/${slug}/${m[2] ?? ""}`);
      const title = titleOf(slug);
      if (title && ctx.textContent(node) === node.url)
        ctx.setField(node, "children", [{ type: "text", value: title }]);
    },
  });
