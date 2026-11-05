import site from '../config/site.json';
import fr from '../i18n/fr.json';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

export const LANGUES = {
  fr: { code: 'fr', hreflang: 'fr', ogLocale: 'fr_FR', nom: 'Français', dateLocale: 'fr-FR' },
  en: { code: 'en', hreflang: 'en', ogLocale: 'en_US', nom: 'English', dateLocale: 'en-US' },
  es: { code: 'es', hreflang: 'es', ogLocale: 'es_ES', nom: 'Español', dateLocale: 'es-ES' },
} as const;

export type Langue = keyof typeof LANGUES;
export type Textes = typeof fr;

export const langueParDefaut = site.langueParDefaut as Langue;
export const languesActives = site.languesActives as Langue[];

/** Fusion profonde : une clé absente en anglais/espagnol retombe sur le français. */
function fusion<T>(base: T, ajout: unknown): T {
  if (Array.isArray(base) || typeof base !== 'object' || base === null) return (ajout ?? base) as T;
  const res: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries((ajout ?? {}) as Record<string, unknown>)) {
    res[k] = fusion((base as Record<string, unknown>)[k], v);
  }
  return res as T;
}

const DICTIONNAIRES: Record<Langue, Textes> = {
  fr,
  en: fusion(fr, en),
  es: fusion(fr, es),
};

export function textes(l: Langue): Textes {
  return DICTIONNAIRES[l];
}

/** Chemin d'une page : le français est à la racine, les autres langues sous /en, /es. */
export function chemin(l: Langue, slug = ''): string {
  const prefixe = l === langueParDefaut ? '' : `/${l}`;
  if (!slug) return prefixe || '/';
  return `${prefixe}/${slug}`;
}

export function urlAbsolue(p: string): string {
  return new URL(p, site.url).href;
}

export function formatDate(iso: string, l: Langue): string {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString(LANGUES[l].dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
