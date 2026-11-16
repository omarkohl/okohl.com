interface Tagged {
  id: string;
  data: { topics: string[] };
}

/**
 * Notes that share the most topics with `target`. Ties keep the order of
 * `all`, which callers pass most recently tended first.
 */
export function similar<T extends Tagged>(target: T, all: T[], max = 3): T[] {
  const topics = new Set(target.data.topics);
  return all
    .filter((n) => n.id !== target.id)
    .map((n) => ({
      n,
      shared: n.data.topics.filter((t) => topics.has(t)).length,
    }))
    .filter((s) => s.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, max)
    .map((s) => s.n);
}
