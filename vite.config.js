import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const root = import.meta.dirname;

// Every HTML page must be registered here to be part of the multi-page build.
const pages = {
  main: 'index.html',
  participation: 'teilnahme.html',
  participationClosed: 'teilnahme-ende.html',
  styleguide: 'styleguide.html',
  terms: 'teilnahmebedingungen.html',
  privacy: 'datenschutz.html',
  imprint: 'impressum.html',
};

export default defineConfig({
  base: './',
  plugins: [
    tailwindcss(),
    // Compresses images (incl. public/) in the build output only; originals stay untouched.
    ViteImageOptimizer({
      includePublic: true,
      logStats: true,
      jpeg: { quality: 75, mozjpeg: true },
      jpg: { quality: 75, mozjpeg: true },
      // quality < 100 quantizes to a palette (keeps alpha); check soft glows for banding when assets change
      png: { quality: 80, compressionLevel: 9, effort: 10 },
      svg: { multipass: true, plugins: [{ name: 'preset-default' }] },
      cache: true,
      cacheLocation: 'node_modules/.cache/image-optimizer',
    }),
  ],
  build: {
    target: 'es2022',
    rolldownOptions: {
      input: Object.fromEntries(
        Object.entries(pages).map(([name, file]) => [name, resolve(root, file)]),
      ),
    },
  },
});
