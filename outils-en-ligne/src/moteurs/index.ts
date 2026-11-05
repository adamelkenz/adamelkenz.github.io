// Association "moteur" (champ du JSON) → composant de l'outil.
import ImageConvert from './image-convert/ImageConvert.astro';

export const MOTEURS: Record<string, (props: any) => any> = {
  'image-convert': ImageConvert,
};
