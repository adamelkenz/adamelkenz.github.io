// Copie les fichiers annexes de pdf.js (polices, CMaps, WebAssembly) dans public/vendor.
// Lancé automatiquement avant `npm run dev` et `npm run build`.
import { cpSync, mkdirSync } from 'node:fs';

const dossiers = ['cmaps', 'standard_fonts', 'wasm', 'iccs'];
mkdirSync('public/vendor/pdfjs', { recursive: true });
for (const d of dossiers) {
  cpSync(`node_modules/pdfjs-dist/${d}`, `public/vendor/pdfjs/${d}`, { recursive: true });
}
console.log('✓ Fichiers pdf.js copiés dans public/vendor/pdfjs');
