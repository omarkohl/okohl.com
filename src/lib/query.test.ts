import { describe, expect, it } from "vitest";
import { inRange, parseQuery } from "./query";

describe("parseQuery", () => {
  it("keeps plain text and exact phrases as the term", () => {
    expect(parseQuery('  lowering "the bar"  now ')).toEqual({
      term: 'lowering "the bar" now',
      topics: [],
    });
  });

  it("reads topics and stage", () => {
    expect(parseQuery("#Writing notes stage:evergreen #tools")).toEqual({
      term: "notes",
      topics: ["writing", "tools"],
      stage: "evergreen",
    });
  });

  it("leaves operators in a phrase and unknown stages alone", () => {
    expect(parseQuery('"#a stage:budding" stage:old').term).toBe(
      '"#a stage:budding" stage:old',
    );
  });

  it.each([
    ["date:2026", "2026-01-01", "2026-12-31"],
    ["date:2026-02", "2026-02-01", "2026-02-31"],
    ["date:2026-02-03", "2026-02-03", "2026-02-03"],
    ["date:2025-11..2026-02", "2025-11-01", "2026-02-31"],
    ["date:2026-03..", "2026-03-01", undefined],
    ["date:..2025", undefined, "2025-12-31"],
  ])("reads %s", (q, from, to) => {
    const parsed = parseQuery(q);
    expect([parsed.from, parsed.to]).toEqual([from, to]);
    expect(parsed.term).toBe("");
  });

  it("treats a bare date: as text", () => {
    expect(parseQuery("date:").term).toBe("date:");
  });
});

describe("inRange", () => {
  it("is inclusive and allows open ends", () => {
    const q = parseQuery("date:2026-02..2026-03");
    expect(inRange("2026-02-01", q)).toBe(true);
    expect(inRange("2026-03-31", q)).toBe(true);
    expect(inRange("2026-04-01", q)).toBe(false);
    expect(inRange("1999-01-01", parseQuery("date:..2025"))).toBe(true);
    expect(inRange("2026-01-01", parseQuery("anything"))).toBe(true);
  });
});
