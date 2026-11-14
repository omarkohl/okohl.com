import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const notes = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/notes" }),
  schema: z.object({
    title: z.string(),
    // Notes and essays share one collection and one URL space, so a note
    // can grow into an essay without its URL changing.
    kind: z.enum(["note", "essay"]).default("note"),
    stage: z.enum(["seedling", "budding", "evergreen"]).default("seedling"),
    planted: z.coerce.date(),
    tended: z.coerce.date().optional(),
    topics: z.array(z.string()).default([]),
    description: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { notes };
