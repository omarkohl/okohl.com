/** A search query split into free text and the operators the search box knows. */
export interface Query {
  /** Free text, with `"exact phrases"` kept for the search engine. */
  term: string;
  /** From `#topic`. */
  topics: string[];
  /** From `stage:evergreen`. */
  stage?: string;
  /** From `date:2026-01..2026-06`: inclusive ISO days, either may be open. */
  from?: string;
  to?: string;
}

const STAGE = /^stage:(seedling|budding|evergreen)$/i;
const DAY = String.raw`\d{4}(?:-\d{2}(?:-\d{2})?)?`;
const DATE = new RegExp(`^date:(${DAY})?(\\.\\.)?(${DAY})?$`, "i");

// "2026" and "2026-02" name a period. As ISO strings compare by character,
// "-31" ends every month.
const start = (d: string) => (d + "-01-01").slice(0, 10);
const end = (d: string) => (d + "-12-31".slice(d.length - 4)).slice(0, 10);

export function parseQuery(q: string): Query {
  const query: Query = { term: "", topics: [] };
  const words: string[] = [];
  for (const token of q.match(/"[^"]*"|\S+/g) ?? []) {
    const date = token.match(DATE);
    if (/^#[^#\s]+$/.test(token)) {
      query.topics.push(token.slice(1).toLowerCase());
    } else if (STAGE.test(token)) {
      query.stage = token.slice(6).toLowerCase();
    } else if (date && (date[1] || date[3])) {
      const [, a, range, b] = date;
      if (a) query.from = start(a);
      if (b) query.to = end(b);
      else if (a && !range) query.to = end(a);
    } else {
      words.push(token);
    }
  }
  query.term = words.join(" ");
  return query;
}

/** Whether an ISO day is in the date range of the query. */
export function inRange(day: string, { from, to }: Query): boolean {
  return (!from || day >= from) && (!to || day <= to);
}
