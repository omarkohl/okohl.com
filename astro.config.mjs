import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import tailwindcss from "@tailwindcss/vite";
import { noteTitle, wikiLinks } from "./src/lib/markdown";

export default defineConfig({
  site: "https://okohl.com",
  trailingSlash: "always",
  markdown: {
    processor: satteri({
      features: { wikilinks: true },
      mdastPlugins: [wikiLinks(noteTitle)],
    }),
  },
  vite: { plugins: [tailwindcss()] },
});
