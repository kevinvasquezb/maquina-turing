import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base './' => funciona en GitHub Pages (/repo/) y abriendo dist/index.html con doble clic.
// viteSingleFile => todo (JS, CSS, fuentes) queda dentro de UN solo index.html.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { assetsInlineLimit: 100000000 },
});
