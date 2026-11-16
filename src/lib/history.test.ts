import { describe, expect, it } from "vitest";
import { parseLog } from "./history";

describe("parseLog", () => {
  it("reads hash, date and subject per line", () => {
    const out =
      "abc123\t2026-11-14T14:12:15+01:00\tfeat: add\ttabs\ndef456\t2026-11-01T10:00:00+01:00\tfirst\n";
    expect(parseLog(out)).toEqual([
      {
        hash: "abc123",
        date: new Date("2026-11-14T13:12:15Z"),
        subject: "feat: add\ttabs",
      },
      {
        hash: "def456",
        date: new Date("2026-11-01T09:00:00Z"),
        subject: "first",
      },
    ]);
  });

  it("is empty without output", () => {
    expect(parseLog("")).toEqual([]);
  });
});
