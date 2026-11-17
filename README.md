# okohl.com

Personal site: short evergreen notes and occasional essays. Astro + Tailwind, search by Pagefind, deployed to GitHub Pages.

```sh
npm install
npm run dev      # http://localhost:4321 (search needs a build)
npm run build && npm run preview
```

## Writing

Add `src/content/notes/<slug>.md`. The note is served at `/<slug>/`.

```yaml
---
title: Writing More
stage: seedling # seedling | budding | evergreen
planted: 2026-11-14
tended: 2026-11-20 # optional, defaults to last commit date
topics: [writing]
kind: note # note | essay
description: … # optional, shown for essays and in RSS
draft: false
---
```

Link notes with `[[other-slug]]` (shows the title of that note), `[[other-slug|text]]` or plain markdown `[text](/other-slug/)`. Backlinks are computed from these links.

Footnotes (`text[^1]` and `[^1]: …`) become sidenotes in the margin on wide screens.
