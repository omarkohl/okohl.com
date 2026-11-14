import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://okohl.com",
  trailingSlash: "always",
  vite: { plugins: [tailwindcss()] },
});
