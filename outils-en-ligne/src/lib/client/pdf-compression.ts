/**
 * Compression de PDF dans le navigateur, en deux techniques :
 *
 * 1. « images » : on recompresse les images contenues dans le PDF (JPEG plus léger,
 *    définition réduite). Le texte, les liens et la mise en page restent intacts.
 * 2. « pages »  : chaque page devient une image JPEG (pdf.js). Très efficace, mais
 *    le texte n'est plus sélectionnable. Utilisé en dernier recours.
 */
import type { PDFDict as TPDFDict, PDFRawStream as TPDFRawStream } from 'pdf-lib';
import { chargerPdfLib, rasteriser, type PdfLib } from './pdf';

export interface ReglageImages {
  qualite: number; // qualité JPEG (0 à 1)
  dimMax: number; // plus grand côté, en pixels
}

export interface ReglagePages {
  dpi: number;
  qualite: number;
}

export interface ResultatCompression {
  octets: Uint8Array;
  methode: 'images' | 'pages' | 'aucune';
  atteint: boolean;
}

export type Progression = (message: 'images' | 'pages', avancement: number) => void;

// Niveaux du compresseur classique
export const NIVEAUX = {
  legere: { qualite: 0.8, dimMax: 2500 },
  recommandee: { qualite: 0.65, dimMax: 1700 },
} satisfies Record<string, ReglageImages>;
export const NIVEAU_MAXIMAL: ReglagePages = { dpi: 110, qualite: 0.55 };

// Paliers pour atteindre une taille cible, du plus doux au plus fort
const PALIERS_IMAGES: ReglageImages[] = [
  { qualite: 0.8, dimMax: 2500 },
  { qualite: 0.7, dimMax: 2000 },
  { qualite: 0.6, dimMax: 1600 },
  { qualite: 0.5, dimMax: 1300 },
  { qualite: 0.4, dimMax: 1000 },
];
const PALIERS_PAGES: ReglagePages[] = [
  { dpi: 150, qualite: 0.7 },
  { dpi: 125, qualite: 0.6 },
  { dpi: 100, qualite: 0.55 },
  { dpi: 85, qualite: 0.5 },
  { dpi: 72, qualite: 0.45 },
  { dpi: 60, qualite: 0.4 },
];

/* ------------------------------------------------------------------------------------ */
/* Technique 1 : recompression des images                                                 */
/* ------------------------------------------------------------------------------------ */

/** Annule le « prédicteur PNG » parfois appliqué aux images compressées en Flate. */
function defiltrerPng(donnees: Uint8Array, largeur: number, hauteur: number, comps: number): Uint8Array | null {
  const ligne = largeur * comps;
  if (donnees.length < (ligne + 1) * hauteur) return null;
  const sortie = new Uint8Array(ligne * hauteur);
  for (let y = 0; y < hauteur; y++) {
    const type = donnees[y * (ligne + 1)];
    const src = y * (ligne + 1) + 1;
    const dst = y * ligne;
    for (let x = 0; x < ligne; x++) {
      const brut = donnees[src + x];
      const a = x >= comps ? sortie[dst + x - comps] : 0;
      const b = y > 0 ? sortie[dst - ligne + x] : 0;
      const c = x >= comps && y > 0 ? sortie[dst - ligne + x - comps] : 0;
      let v: number;
      switch (type) {
        case 0: v = brut; break;
        case 1: v = brut + a; break;
        case 2: v = brut + b; break;
        case 3: v = brut + ((a + b) >> 1); break;
        case 4: {
          const p = a + b - c;
          const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          v = brut + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c);
          break;
        }
        default: return null;
      }
      sortie[dst + x] = v & 0xff;
    }
  }
  return sortie;
}

/** Nombre de composantes couleur d'un espace colorimétrique, ou null s'il n'est pas géré. */
function composantes(lib: PdfLib, dict: TPDFDict): 1 | 3 | 4 | null {
  const { PDFName, PDFArray, PDFRawStream, PDFNumber } = lib;
  const cs = dict.lookup(PDFName.of('ColorSpace'));
  if (cs === PDFName.of('DeviceRGB')) return 3;
  if (cs === PDFName.of('DeviceGray')) return 1;
  if (cs === PDFName.of('DeviceCMYK')) return 4;
  if (cs instanceof PDFArray && cs.get(0) === PDFName.of('ICCBased')) {
    const profil = cs.lookup(1);
    if (profil instanceof PDFRawStream) {
      const n = profil.dict.lookup(PDFName.of('N'));
      if (n instanceof PDFNumber && [1, 3, 4].includes(n.asNumber())) return n.asNumber() as 1 | 3 | 4;
    }
  }
  return null;
}

async function decoderImagePdf(lib: PdfLib, flux: TPDFRawStream): Promise<ImageBitmap | null> {
  const { PDFName, PDFArray, PDFNumber, PDFDict } = lib;
  const d = flux.dict;
  if (d.lookup(PDFName.of('ImageMask'))?.toString() === 'true') return null;
  if (d.has(PDFName.of('Decode'))) return null; // couleurs inversées : on n'y touche pas
  const smask = d.lookup(PDFName.of('SMask'));
  if (smask instanceof PDFDict && smask.has(PDFName.of('Matte'))) return null;

  const largeur = (d.lookup(PDFName.of('Width')) as InstanceType<typeof PDFNumber>)?.asNumber?.() ?? 0;
  const hauteur = (d.lookup(PDFName.of('Height')) as InstanceType<typeof PDFNumber>)?.asNumber?.() ?? 0;
  if (largeur * hauteur < 40_000) return null; // trop petite pour valoir le coup

  const f = d.lookup(PDFName.of('Filter'));
  const filtres = f instanceof PDFArray ? f.asArray() : f ? [f] : [];
  if (filtres.length !== 1) return null;
  const comps = composantes(lib, d);

  if (filtres[0] === PDFName.of('DCTDecode')) {
    if (comps !== 1 && comps !== 3) return null; // CMYK : rendu des navigateurs peu fiable
    return createImageBitmap(new Blob([flux.contents as BlobPart], { type: 'image/jpeg' }));
  }

  if (filtres[0] === PDFName.of('FlateDecode')) {
    const bpc = (d.lookup(PDFName.of('BitsPerComponent')) as InstanceType<typeof PDFNumber>)?.asNumber?.();
    if (bpc !== 8 || (comps !== 1 && comps !== 3)) return null;
    const { unzlibSync, inflateSync } = await import('fflate');
    let brut: Uint8Array;
    try {
      brut = unzlibSync(flux.contents);
    } catch {
      brut = inflateSync(flux.contents);
    }
    const parms = d.lookup(PDFName.of('DecodeParms'));
    const pred = parms instanceof PDFDict ? (parms.lookup(PDFName.of('Predictor')) as InstanceType<typeof PDFNumber>)?.asNumber?.() ?? 1 : 1;
    if (pred >= 10) {
      const defiltre = defiltrerPng(brut, largeur, hauteur, comps);
      if (!defiltre) return null;
      brut = defiltre;
    } else if (pred !== 1) return null;
    if (brut.length < largeur * hauteur * comps) return null;
    const rgba = new Uint8ClampedArray(largeur * hauteur * 4);
    for (let i = 0, j = 0; i < largeur * hauteur; i++, j += comps) {
      const r = brut[j];
      rgba[i * 4] = r;
      rgba[i * 4 + 1] = comps === 3 ? brut[j + 1] : r;
      rgba[i * 4 + 2] = comps === 3 ? brut[j + 2] : r;
      rgba[i * 4 + 3] = 255;
    }
    return createImageBitmap(new ImageData(rgba, largeur, hauteur));
  }
  return null;
}

async function encoderJpeg(img: ImageBitmap, largeur: number, hauteur: number, qualite: number): Promise<Uint8Array> {
  const canvas = new OffscreenCanvas(largeur, hauteur);
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, largeur, hauteur);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, largeur, hauteur);
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: qualite });
  return new Uint8Array(await blob.arrayBuffer());
}

/** Technique 1 : renvoie le PDF avec ses images recompressées. */
export async function recompresserImages(
  data: Uint8Array,
  reglage: ReglageImages,
  progression?: (avancement: number) => void,
): Promise<Uint8Array> {
  const lib = await chargerPdfLib();
  const { PDFDocument, PDFRawStream, PDFName, PDFNumber } = lib;
  const doc = await PDFDocument.load(data, { updateMetadata: false });
  const images = doc.context
    .enumerateIndirectObjects()
    .filter(([, o]) => o instanceof PDFRawStream && o.dict.lookup(PDFName.of('Subtype')) === PDFName.of('Image')) as [
    Parameters<typeof doc.context.assign>[0],
    TPDFRawStream,
  ][];

  for (const [i, [ref, flux]] of images.entries()) {
    progression?.(i / Math.max(1, images.length));
    let img: ImageBitmap | null = null;
    try {
      img = await decoderImagePdf(lib, flux);
    } catch {
      img = null; // image exotique : on la laisse telle quelle
    }
    if (!img) continue;
    const ratio = Math.min(1, reglage.dimMax / Math.max(img.width, img.height));
    const largeur = Math.max(1, Math.round(img.width * ratio));
    const hauteur = Math.max(1, Math.round(img.height * ratio));
    const jpeg = await encoderJpeg(img, largeur, hauteur, reglage.qualite);
    img.close();
    if (jpeg.length >= flux.contents.length * 0.95) continue; // aucun gain : on garde l'original

    const dict = flux.dict.clone(doc.context);
    dict.set(PDFName.of('Filter'), PDFName.of('DCTDecode'));
    dict.set(PDFName.of('Width'), PDFNumber.of(largeur));
    dict.set(PDFName.of('Height'), PDFNumber.of(hauteur));
    dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'));
    dict.set(PDFName.of('BitsPerComponent'), PDFNumber.of(8));
    dict.delete(PDFName.of('DecodeParms'));
    dict.delete(PDFName.of('Length'));
    doc.context.assign(ref, PDFRawStream.of(dict, jpeg));
  }
  progression?.(1);
  return doc.save({ useObjectStreams: true });
}

/* ------------------------------------------------------------------------------------ */
/* Stratégies                                                                             */
/* ------------------------------------------------------------------------------------ */

/** Compression à un niveau fixe (outil « Compresser un PDF »). */
export async function compresserNiveau(
  data: Uint8Array,
  niveau: 'legere' | 'recommandee' | 'maximale',
  progression?: Progression,
): Promise<ResultatCompression> {
  let meilleur: ResultatCompression = { octets: data, methode: 'aucune', atteint: false };
  const garder = (octets: Uint8Array, methode: 'images' | 'pages') => {
    if (octets.length < meilleur.octets.length) meilleur = { octets, methode, atteint: true };
  };

  if (niveau === 'maximale') {
    garder(await rasteriser(data, { ...NIVEAU_MAXIMAL, progression: (p, n) => progression?.('pages', p / n) }), 'pages');
    // Un PDF de texte pur peut être plus léger avec ses images simplement recompressées
    if (meilleur.octets.length > data.length * 0.8) {
      garder(await recompresserImages(data, { qualite: 0.5, dimMax: 1200 }, (a) => progression?.('images', a)), 'images');
    }
  } else {
    garder(await recompresserImages(data, NIVEAUX[niveau], (a) => progression?.('images', a)), 'images');
  }
  return meilleur;
}

/**
 * Compression jusqu'à une taille cible (outils « moins de 1 Mo / 2 Mo ») :
 * on cherche le palier le plus DOUX qui passe sous la cible, d'abord en recompressant
 * les images (texte conservé), puis en dernier recours en convertissant les pages.
 */
export async function compresserVersCible(
  data: Uint8Array,
  cible: number,
  progression?: Progression,
): Promise<ResultatCompression> {
  if (data.length <= cible) return { octets: data, methode: 'aucune', atteint: true };
  let plusPetit: ResultatCompression = { octets: data, methode: 'aucune', atteint: false };
  const noter = (octets: Uint8Array, methode: 'images' | 'pages') => {
    if (octets.length < plusPetit.octets.length) plusPetit = { octets, methode, atteint: octets.length <= cible };
  };

  // Recherche dichotomique du palier le plus doux qui respecte la cible.
  async function chercher<R>(paliers: R[], essayer: (r: R) => Promise<Uint8Array>, methode: 'images' | 'pages') {
    const cache = new Map<number, Uint8Array>();
    const essai = async (i: number) => {
      if (!cache.has(i)) {
        const octets = await essayer(paliers[i]);
        cache.set(i, octets);
        noter(octets, methode);
      }
      return cache.get(i)!;
    };
    const dernier = paliers.length - 1;
    if ((await essai(dernier)).length > cible) return null; // même le plus fort ne suffit pas
    let bas = 0;
    let haut = dernier;
    while (bas < haut) {
      const milieu = (bas + haut) >> 1;
      if ((await essai(milieu)).length <= cible) haut = milieu;
      else bas = milieu + 1;
    }
    return (await essai(haut))!;
  }

  let tours = 0;
  const viaImages = await chercher(
    PALIERS_IMAGES,
    (r) => recompresserImages(data, r, (a) => progression?.('images', Math.min(0.99, (tours + a) / 4))).finally(() => tours++),
    'images',
  );
  if (viaImages) return { octets: viaImages, methode: 'images', atteint: true };

  tours = 0;
  const viaPages = await chercher(
    PALIERS_PAGES,
    (r) => rasteriser(data, { ...r, progression: (p, n) => progression?.('pages', Math.min(0.99, (tours + p / n) / 4)) }).finally(() => tours++),
    'pages',
  );
  if (viaPages) return { octets: viaPages, methode: 'pages', atteint: true };

  return plusPetit; // cible impossible : on propose le plus petit fichier obtenu
}
