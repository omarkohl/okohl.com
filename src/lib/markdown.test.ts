import { describe, expect, it } from "vitest";
import { markdownToHtml } from "satteri";
import { wikiLinks } from "./markdown";

const html = (md: string) =>
  markdownToHtml(md, {
    features: { wikilinks: true },
    mdastPlugins: [
      wikiLinks((s) => (s === "known" ? "Known Note" : undefined)),
    ],
  }).html.trim();

describe("wikiLinks", () => {
  it("links to the note and shows its title", () => {
    expect(html("[[known]]")).toBe('<p><a href="/known/">Known Note</a></p>');
  });

  it("keeps custom text and fragments", () => {
    expect(html("[[known|see here]] [[known#part]]")).toBe(
      '<p><a href="/known/">see here</a> <a href="/known/#part">Known Note</a></p>',
    );
  });

  it("falls back to the slug for unknown notes", () => {
    expect(html("[[missing]]")).toBe('<p><a href="/missing/">missing</a></p>');
  });

  it("leaves ordinary links alone", () => {
    expect(html("[a](/x/) [b](https://x.org)")).toBe(
      '<p><a href="/x/">a</a> <a href="https://x.org">b</a></p>',
    );
  });
});
