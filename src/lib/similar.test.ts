import { describe, expect, it } from "vitest";
import { similar } from "./similar";

const note = (id: string, ...topics: string[]) => ({ id, data: { topics } });

describe("similar", () => {
  const a = note("a", "x", "y");
  const all = [a, note("b", "x"), note("c", "z"), note("d", "y", "x")];

  it("ranks by shared topics and leaves out unrelated notes", () => {
    expect(similar(a, all).map((n) => n.id)).toEqual(["d", "b"]);
  });

  it("limits the number of results", () => {
    expect(similar(a, all, 1).map((n) => n.id)).toEqual(["d"]);
  });
});
