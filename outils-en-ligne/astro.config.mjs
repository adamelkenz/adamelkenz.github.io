// Configuration Astro. Le domaine se règle dans src/config/site.json (champ "url").
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';

const site = JSON.parse(readFileSync(new URL('./src/config/site.json', import.meta.url), 'utf8'));

if (site.url.includes('example.com')) {
  console.warn('\n⚠️  Domaine provisoire : remplacez "url" dans src/config/site.json avant la mise en ligne.\n');
}

export default defineConfig({
  site: site.url,
  // URLs propres sans "/" final : /convertir-webp-en-png
  trailingSlash: 'never',
  build: {
    format: 'file',
    // CSS directement dans la page : aucun fichier CSS bloquant à télécharger
    inlineStylesheets: 'always',
  },
  devToolbar: { enabled: false },
  vite: {
    optimizeDeps: { exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'] },
    build: { chunkSizeWarningLimit: 4000 },
  },
});
