import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ikit.cloud',
  compressHTML: true,
  integrations: [sitemap()],
});
