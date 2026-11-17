import { execFileSync } from "node:child_process";

export interface Revision {
  hash: string;
  date: Date;
  subject: string;
}

const FORMAT = "%H%x09%aI%x09%s";

/** Parses `git log --format=FORMAT` output, newest revision first. */
export function parseLog(out: string): Revision[] {
  return out
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...subject] = line.split("\t");
      return { hash, date: new Date(date), subject: subject.join("\t") };
    });
}

const cache = new Map<string, Revision[]>();

/** Commits that changed `file`, or none if git or the history is missing. */
export function revisions(file: string): Revision[] {
  const hit = cache.get(file);
  if (hit) return hit;
  const revs = readRevisions(file);
  cache.set(file, revs);
  return revs;
}

function readRevisions(file: string): Revision[] {
  try {
    return parseLog(
      execFileSync(
        "git",
        ["log", "--follow", `--format=${FORMAT}`, "--", file],
        { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
      ),
    );
  } catch {
    return [];
  }
}
