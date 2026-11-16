import { readFileSync } from "node:fs";
import { defineHastPlugin, defineMdastPlugin, type HastNode } from "satteri";

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

type El = Extract<HastNode, { type: "element" }>;
const isEl = (n: HastNode, tag?: string): n is El =>
  n.type === "element" && (!tag || n.tagName === tag);
const elements = (n: HastNode, tag: string): El[] =>
  "children" in n
    ? (n.children as HastNode[]).flatMap((c) => [
        ...(isEl(c, tag) ? [c] : []),
        ...elements(c, tag),
      ])
    : [];

/** Footnote body as inline content, since a sidenote sits inside a paragraph. */
function inline(li: El): HastNode[] {
  const out: HastNode[] = [];
  for (const block of li.children.filter((c) => isEl(c))) {
    if (out.length) out.push({ type: "text", value: " " });
    out.push(
      ...(block as El).children.filter(
        (c) => !(isEl(c, "a") && "dataFootnoteBackref" in c.properties),
      ),
    );
  }
  return structuredClone(out);
}

/**
 * Copies each footnote next to its reference as a `.sidenote`. CSS shows the
 * copy in the margin on wide screens and the footnote list on narrow ones, so
 * no JavaScript is needed.
 */
export const sidenotes = defineHastPlugin({
  name: "sidenotes",
  after(root, ctx) {
    const section = root.children.find(
      (c): c is El => isEl(c, "section") && "dataFootnotes" in c.properties,
    );
    if (!section) return;
    const notes = new Map(
      elements(section, "li").map((li) => [`#${li.properties.id}`, li]),
    );
    for (const sup of elements(root, "sup")) {
      const ref = sup.children.find(
        (c): c is El => isEl(c, "a") && "dataFootnoteRef" in c.properties,
      );
      const li = ref && notes.get(String(ref.properties.href));
      if (!ref || !li) continue;
      ctx.insertAfter(sup, {
        type: "element",
        tagName: "span",
        properties: { className: ["sidenote"], dataPagefindIgnore: true },
        children: [
          {
            type: "element",
            tagName: "sup",
            properties: {},
            children: [{ type: "text", value: ctx.textContent(ref) }],
          },
          { type: "text", value: " " },
          ...inline(li),
        ] as El["children"],
      });
    }
  },
});
