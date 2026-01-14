import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.gjnx.cc',
  compressHTML: true,
  prefetch: true,
  build: {
    format: 'directory'
  },
  server: {
    port: 4321,
    host: true
  },
  integrations: [sitemap()],
});
