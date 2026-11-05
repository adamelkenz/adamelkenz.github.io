// Association "moteur" (champ du JSON) → composant de l'outil.
import ImageConvert from './image-convert/ImageConvert.astro';
import PdfMerge from './pdf-merge/PdfMerge.astro';
import PdfCompress from './pdf-compress/PdfCompress.astro';
import VideoConvert from './video-convert/VideoConvert.astro';

export const MOTEURS: Record<string, (props: any) => any> = {
  'image-convert': ImageConvert,
  'pdf-merge': PdfMerge,
  'pdf-compress': PdfCompress,
  'video-convert': VideoConvert,
};
