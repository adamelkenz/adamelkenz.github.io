/** Décodage / encodage d'images avec les capacités natives du navigateur (Canvas). */

export const MIME: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp' };

export interface ImageDecodee {
  source: CanvasImageSource;
  largeur: number;
  hauteur: number;
  liberer(): void;
}

/** Décode un fichier image (createImageBitmap, avec repli sur <img> pour les vieux navigateurs). */
export async function decoderImage(blob: Blob): Promise<ImageDecodee> {
  try {
    const bmp = await createImageBitmap(blob);
    return { source: bmp, largeur: bmp.width, hauteur: bmp.height, liberer: () => bmp.close() };
  } catch {
    const url = URL.createObjectURL(blob);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return { source: img, largeur: img.naturalWidth, hauteur: img.naturalHeight, liberer: () => {} };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

/**
 * Dessine l'image sur un canvas et l'encode au format demandé.
 * Le JPG ne gérant pas la transparence, on pose un fond blanc dessous.
 */
export async function encoderImage(
  img: ImageDecodee,
  mime: string,
  qualite = 0.92,
  dimensions?: { largeur: number; hauteur: number },
): Promise<Blob> {
  const l = dimensions?.largeur ?? img.largeur;
  const h = dimensions?.hauteur ?? img.hauteur;
  const canvas: OffscreenCanvas | HTMLCanvasElement =
    typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(l, h) : Object.assign(document.createElement('canvas'), { width: l, height: h });
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) throw new Error('Canvas indisponible');
  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, l, h);
  }
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img.source, 0, 0, l, h);
  const blob =
    'convertToBlob' in canvas
      ? await canvas.convertToBlob({ type: mime, quality: qualite })
      : await new Promise<Blob | null>((r) => (canvas as HTMLCanvasElement).toBlob(r, mime, qualite));
  // Libère la mémoire du canvas (important sur iPhone)
  canvas.width = canvas.height = 0;
  if (!blob) throw new Error("Échec de l'encodage de l'image");
  if (blob.type !== mime) throw new Error(`Votre navigateur ne sait pas créer des fichiers ${mime}`);
  return blob;
}
