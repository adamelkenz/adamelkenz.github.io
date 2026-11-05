import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';

export const fixture = (nom: string) => new URL(`./fixtures/${nom}`, import.meta.url).pathname;

/** Clique sur le n-ième bouton "Télécharger" et renvoie le contenu du fichier. */
export async function telecharger(page: Page, index = 0): Promise<{ nom: string; contenu: Buffer }> {
  const lien = page.locator('.resultat a[download]').nth(index);
  const [dl] = await Promise.all([page.waitForEvent('download'), lien.click()]);
  return { nom: dl.suggestedFilename(), contenu: await readFile((await dl.path())!) };
}

export function dimensionsPng(b: Buffer) {
  if (b.subarray(1, 4).toString() !== 'PNG') throw new Error('Pas un PNG');
  return { largeur: b.readUInt32BE(16), hauteur: b.readUInt32BE(20), typeCouleur: b[25] };
}

export function dimensionsJpeg(b: Buffer) {
  if (b[0] !== 0xff || b[1] !== 0xd8) throw new Error('Pas un JPEG');
  let i = 2;
  while (i < b.length) {
    const marqueur = b[i + 1];
    const longueur = b.readUInt16BE(i + 2);
    if (marqueur >= 0xc0 && marqueur <= 0xc3) {
      return { hauteur: b.readUInt16BE(i + 5), largeur: b.readUInt16BE(i + 7) };
    }
    i += 2 + longueur;
  }
  throw new Error('Dimensions JPEG introuvables');
}

/** Lit la couleur d'un pixel d'une image produite par l'outil (lien blob: de la page). */
export async function pixel(page: Page, index: number, x: number, y: number): Promise<number[]> {
  const href = await page.locator('.resultat a[download]').nth(index).getAttribute('href');
  return page.evaluate(
    async ({ href, x, y }) => {
      const bmp = await createImageBitmap(await (await fetch(href!)).blob());
      const c = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = c.getContext('2d')!;
      ctx.drawImage(bmp, 0, 0);
      return Array.from(ctx.getImageData(x, y, 1, 1).data);
    },
    { href, x, y },
  );
}

/** Extrait le texte d'un PDF (pour vérifier qu'il est toujours sélectionnable). */
export async function texteDuPdf(octets: Buffer): Promise<string> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({ data: new Uint8Array(octets), verbosity: 0 }).promise;
  let texte = '';
  for (let i = 1; i <= doc.numPages; i++) {
    const contenu = await (await doc.getPage(i)).getTextContent();
    texte += contenu.items.map((it) => ('str' in it ? it.str : '')).join(' ') + '\n';
  }
  return texte;
}

/** Liste les types de boîtes et codecs présents dans un MP4 (vérification légère, sans ffprobe). */
export function infosMp4(b: Buffer) {
  const marque = b.subarray(8, 12).toString();
  const contient = (s: string) => b.includes(Buffer.from(s));
  return {
    estMp4: b.subarray(4, 8).toString() === 'ftyp' && marque !== 'qt  ',
    marque,
    h264: contient('avc1'),
    hevc: contient('hvc1') || contient('hev1'),
    aac: contient('mp4a'),
    pcm: contient('sowt') || contient('lpcm') || contient('ipcm'),
  };
}
