/**
 * Outils PDF communs côté navigateur.
 * - pdf-lib : lecture/écriture de la structure PDF (fusion, remplacement d'images).
 * - pdf.js  : rendu des pages en image (compression forte, PDF protégés).
 * Les deux bibliothèques ne sont téléchargées qu'au premier usage.
 */
import type { PDFDocument as TypePDFDocument } from 'pdf-lib';

export type PdfLib = typeof import('pdf-lib');
export type PdfJs = typeof import('pdfjs-dist');

let pdfLib: Promise<PdfLib> | undefined;
let pdfJs: Promise<PdfJs> | undefined;

export function chargerPdfLib(): Promise<PdfLib> {
  pdfLib ??= import('pdf-lib');
  return pdfLib;
}

export function chargerPdfJs(): Promise<PdfJs> {
  pdfJs ??= (async () => {
    const [pdfjs, worker] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    return pdfjs;
  })();
  return pdfJs;
}

/** Erreur lisible pour l'utilisateur. */
export class ErreurPdf extends Error {
  constructor(public code: 'mot-de-passe' | 'illisible', message: string) {
    super(message);
  }
}

/**
 * Ouvre un PDF avec pdf.js (fichiers annexes servis depuis /vendor/pdfjs/).
 * Appeler `fermer()` ensuite pour libérer la mémoire.
 */
export async function ouvrirAvecPdfJs(data: Uint8Array) {
  const pdfjs = await chargerPdfJs();
  const base = '/vendor/pdfjs/';
  const tache = pdfjs.getDocument({
    data: data.slice(), // pdf.js « consomme » le tableau : on lui passe une copie
    cMapUrl: base + 'cmaps/',
    cMapPacked: true,
    standardFontDataUrl: base + 'standard_fonts/',
    wasmUrl: base + 'wasm/',
    iccUrl: base + 'iccs/',
    isEvalSupported: false,
    password: '',
  });
  try {
    const doc = await tache.promise;
    return { doc, fermer: () => tache.destroy() };
  } catch (e) {
    void tache.destroy();
    if (e && (e as Error).name === 'PasswordException') {
      throw new ErreurPdf('mot-de-passe', 'protégé par un mot de passe');
    }
    console.error(e);
    throw new ErreurPdf('illisible', 'fichier PDF illisible ou endommagé');
  }
}

/**
 * Charge un PDF avec pdf-lib. Renvoie `protege: true` si le fichier est chiffré
 * (souvent sans mot de passe d'ouverture : relevés bancaires, factures…).
 */
export async function ouvrirAvecPdfLib(data: Uint8Array): Promise<{ doc: TypePDFDocument | null; protege: boolean }> {
  const { PDFDocument } = await chargerPdfLib();
  try {
    return { doc: await PDFDocument.load(data, { updateMetadata: false }), protege: false };
  } catch (e) {
    if (e && (e as Error).constructor?.name === 'EncryptedPDFError') return { doc: null, protege: true };
    if (/encrypt/i.test(String((e as Error)?.message))) return { doc: null, protege: true };
    throw new ErreurPdf('illisible', 'fichier PDF illisible ou endommagé');
  }
}

export function canvasVersJpeg(canvas: HTMLCanvasElement, qualite: number): Promise<Uint8Array> {
  return new Promise((ok, ko) =>
    canvas.toBlob(
      async (b) => (b ? ok(new Uint8Array(await b.arrayBuffer())) : ko(new Error('Encodage JPEG impossible'))),
      'image/jpeg',
      qualite,
    ),
  );
}

// Limite de surface d'un canvas : Safari iOS refuse au-delà d'environ 16,7 millions de pixels.
const PIXELS_MAX = 16_000_000;

export interface OptionsRaster {
  dpi: number;
  qualite: number;
  /** Appelé après chaque page : (page, total) */
  progression?: (page: number, total: number) => void;
}

/**
 * Transforme chaque page en image JPEG et reconstruit un PDF.
 * Le texte n'est plus sélectionnable, mais le fichier devient très léger
 * et cela fonctionne aussi pour les PDF protégés contre la modification.
 */
export async function rasteriser(data: Uint8Array, o: OptionsRaster): Promise<Uint8Array> {
  const { PDFDocument } = await chargerPdfLib();
  const { doc: source, fermer } = await ouvrirAvecPdfJs(data);
  const sortie = await PDFDocument.create();
  const canvas = document.createElement('canvas');
  try {
    for (let i = 1; i <= source.numPages; i++) {
      const page = await source.getPage(i);
      const taille = page.getViewport({ scale: 1 }); // en points (1/72 de pouce)
      let echelle = o.dpi / 72;
      const surface = taille.width * taille.height * echelle * echelle;
      if (surface > PIXELS_MAX) echelle *= Math.sqrt(PIXELS_MAX / surface);
      const vue = page.getViewport({ scale: echelle });
      canvas.width = Math.ceil(vue.width);
      canvas.height = Math.ceil(vue.height);
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, viewport: vue }).promise;
      const jpeg = await canvasVersJpeg(canvas, o.qualite);
      const image = await sortie.embedJpg(jpeg);
      const nouvelle = sortie.addPage([taille.width, taille.height]);
      nouvelle.drawImage(image, { x: 0, y: 0, width: taille.width, height: taille.height });
      page.cleanup();
      o.progression?.(i, source.numPages);
    }
  } finally {
    canvas.width = canvas.height = 0;
    await fermer();
  }
  return sortie.save({ useObjectStreams: true });
}
