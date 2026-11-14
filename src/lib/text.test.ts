import { describe, expect, it } from "vitest";
import { extractInternalLinks, readingMinutes } from "./text";

describe("extractInternalLinks", () => {
  it("finds internal links and ignores external ones", () => {
    const md =
      "See [a](/writing-more/), [b](/other#part) and [c](https://x.org/foo/).";
    expect(extractInternalLinks(md)).toEqual(["writing-more", "other"]);
  });

  it("deduplicates", () => {
    expect(extractInternalLinks("[a](/x/) [b](/x/)")).toEqual(["x"]);
  });
});

describe("readingMinutes", () => {
  it("is at least one minute", () => {
    expect(readingMinutes("short")).toBe(1);
  });

  it("rounds at 220 words per minute", () => {
    expect(readingMinutes("w ".repeat(660))).toBe(3);
  });
});
