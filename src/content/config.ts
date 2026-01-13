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

// Define the "knowledge" collection
const knowledge = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/knowledge"
    }),
    schema: z.object({
        title: z.string(),
        date: z.date().optional(),
        category: z.string(),
        description: z.string().optional(),
    })
});

// Define the "database" collection (Product/Chip Database)
const database = defineCollection({
    loader: glob({
        pattern: "**/*.md",
        base: "./src/content/database"
    }),
    schema: z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        brand: z.string(),
        category: z.string(), // e.g., CPU, GPU, NPU
        releaseDate: z.date().optional(),
        // Technical Specs
        specs: z.object({
            process: z.string(), // e.g., "3nm", "Intel 4"
            tdp: z.number().optional(), // in Watts
            cores: z.string().optional(),
            frequency: z.string().optional(),
            score: z.number().optional(), // PScore or similar metric
        }),
        // Curves for Efficiency Calculator
        curves: z.array(z.object({
            watts: z.number(),
            score: z.number(),
            scenario: z.string().optional(),
        })).optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        image: z.string().optional(),
    })
});

export const collections = { articles, knowledge, database };
