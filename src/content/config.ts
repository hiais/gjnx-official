import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Define the "articles" collection
const articles = defineCollection({
    // Use the glob loader to pull files from the Content Factory
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/articles"
    }),
    schema: z.object({
        title: z.string(),
        date: z.date().optional(),
        tags: z.array(z.string()).optional(),
        description: z.string().optional(),
        // Allow drafts to be filtered out in production
        draft: z.boolean().optional().default(false),
    })
});

export const collections = { articles };
