import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ikit.cloud',
  compressHTML: true,
  prefetch: true,
  build: {
    format: 'file'
  },
  server: {
    port: 4321,
    host: true
  },
  integrations: [sitemap()],
});
