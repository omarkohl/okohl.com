// Hover previews: a small card with the title, stage and summary of the note
// a link points to. The data comes from the meta tags of the target page, so
// there is no extra index to build and a link without a note has no preview.

type Preview = { title: string; meta: string; text: string } | null;

const cache = new Map<string, Promise<Preview>>();
const card = document.createElement("div");
card.id = "link-preview";
card.setAttribute("role", "tooltip");
card.hidden = true;
document.body.append(card);

let timer: number | undefined;
let current: HTMLAnchorElement | null = null;

function load(href: string): Promise<Preview> {
  let p = cache.get(href);
  if (!p) {
    p = fetch(href)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then((html) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const og = (name: string) =>
          doc.querySelector<HTMLMetaElement>(`meta[property="og:${name}"]`)
            ?.content ?? "";
        if (og("type") !== "article") return null;
        const stage = doc.querySelector('[data-pagefind-meta="stage"]');
        return {
          title: og("title"),
          meta: stage?.textContent?.trim() ?? "",
          text: og("description"),
        };
      })
      .catch(() => null);
    cache.set(href, p);
  }
  return p;
}

/** Internal links to a single-segment path, the URL shape of a note. */
function noteLink(target: EventTarget | null): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const a = target.closest<HTMLAnchorElement>("main a[href]");
  if (!a || a.origin !== location.origin) return null;
  if (!/^\/[a-z0-9-]+\/$/.test(a.pathname)) return null;
  return a.pathname === location.pathname ? null : a;
}

function show(a: HTMLAnchorElement, p: NonNullable<Preview>) {
  const el = (tag: string, text: string) => {
    const e = document.createElement(tag);
    e.textContent = text;
    return e;
  };
  card.replaceChildren(el("strong", p.title), el("small", p.meta));
  if (p.text) card.append(el("p", p.text));
  card.hidden = false;
  const link = a.getBoundingClientRect();
  const box = card.getBoundingClientRect();
  const left = Math.min(link.left, innerWidth - box.width - 12);
  const below = link.bottom + 8;
  const top =
    below + box.height > innerHeight ? link.top - box.height - 8 : below;
  card.style.left = `${Math.max(12, left)}px`;
  card.style.top = `${Math.max(12, top)}px`;
}

function hide() {
  clearTimeout(timer);
  current = null;
  card.hidden = true;
}

function enter(e: Event) {
  const a = noteLink(e.target);
  if (!a || a === current) return;
  hide();
  current = a;
  timer = window.setTimeout(async () => {
    const p = await load(a.pathname);
    if (p && current === a) show(a, p);
  }, 200);
}

function leave(e: Event) {
  if (noteLink(e.target) === current) hide();
}

if (matchMedia("(hover: hover)").matches) {
  document.addEventListener("mouseover", enter);
  document.addEventListener("mouseout", leave);
  document.addEventListener("focusin", enter);
  document.addEventListener("focusout", leave);
  document.addEventListener("keydown", (e) => e.key === "Escape" && hide());
  addEventListener("scroll", hide, { passive: true });
}
