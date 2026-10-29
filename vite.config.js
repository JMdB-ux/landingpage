import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

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
  plugins: [tailwindcss()],
  build: {
    target: 'es2022',
    rolldownOptions: {
      input: Object.fromEntries(
        Object.entries(pages).map(([name, file]) => [name, resolve(root, file)]),
      ),
    },
  },
});
