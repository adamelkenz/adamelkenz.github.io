/**
 * Registre de toutes les pages du site. C'est la source unique utilisée pour :
 * - générer les pages (src/pages/[...chemin].astro),
 * - les balises hreflang,
 * - le sitemap.xml.
 * Il vérifie aussi la cohérence globale (doublons de slug/title, outils similaires inexistants).
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import categoriesJson from '../config/categories.json';
import { chemin, langueParDefaut, languesActives, type Langue } from './i18n';

export type Outil = CollectionEntry<'outils'>;
export type VersionOutil = NonNullable<Outil['data']['langues'][Langue]>;
export type PageTexte = CollectionEntry<'pages'>;
export type CleCategorie = keyof typeof categoriesJson;
export type VersionCategorie = (typeof categoriesJson)['pdf']['langues']['fr'];

export interface Alternative {
  langue: Langue;
  chemin: string;
}

interface RouteBase {
  langue: Langue;
  chemin: string;
  alternatives: Alternative[];
}

export type Route =
  | (RouteBase & { type: 'accueil' })
  | (RouteBase & { type: 'outil'; outil: Outil; version: VersionOutil })
  | (RouteBase & { type: 'hub'; categorie: CleCategorie; version: VersionCategorie })
  | (RouteBase & { type: 'page'; page: PageTexte });

export const categories = categoriesJson as Record<
  CleCategorie,
  { ordre: number; couleur: string; langues: Partial<Record<Langue, VersionCategorie>> }
>;

export const clesCategories = (Object.keys(categories) as CleCategorie[]).sort(
  (a, b) => categories[a].ordre - categories[b].ordre,
);

let cache: Promise<Route[]> | undefined;

export function toutesLesRoutes(): Promise<Route[]> {
  cache ??= construire();
  return cache;
}

/** Tous les outils publiés (hors brouillons). */
export async function outilsActifs(): Promise<Outil[]> {
  return (await getCollection('outils', (o) => !o.data.brouillon)).sort((a, b) => a.id.localeCompare(b.id));
}

/** Les outils disponibles dans une langue, regroupés par catégorie (dans l'ordre des catégories). */
export async function outilsParCategorie(l: Langue) {
  const outils = (await outilsActifs()).filter((o) => o.data.langues[l]);
  return clesCategories
    .filter((c) => categories[c].langues[l])
    .map((c) => ({
      cle: c,
      version: categories[c].langues[l]!,
      outils: outils.filter((o) => o.data.categorie === c),
    }))
    .filter((g) => g.outils.length > 0);
}

export function cheminOutil(o: Outil, l: Langue): string | undefined {
  const v = o.data.langues[l];
  return v ? chemin(l, v.slug) : undefined;
}

async function construire(): Promise<Route[]> {
  const outils = await outilsActifs();
  const pages = await getCollection('pages');
  const routes: Route[] = [];
  const erreurs: string[] = [];

  // --- Vérifications globales ---------------------------------------------------
  // (un outil similaire peut être un brouillon : il sera simplement masqué)
  const ids = new Set((await getCollection('outils')).map((o) => o.id));
  for (const o of outils) {
    for (const s of o.data.similaires) {
      if (!ids.has(s)) erreurs.push(`[${o.id}.json] "similaires" contient "${s}" qui n'existe pas.`);
      if (s === o.id) erreurs.push(`[${o.id}.json] un outil ne peut pas être similaire à lui-même.`);
    }
  }

  // --- Accueil --------------------------------------------------------------------
  const altAccueil = languesActives.map((l) => ({ langue: l, chemin: chemin(l) }));
  for (const l of languesActives) {
    routes.push({ type: 'accueil', langue: l, chemin: chemin(l), alternatives: altAccueil });
  }

  // --- Pages outils -------------------------------------------------------------
  for (const o of outils) {
    const alts = languesActives
      .filter((l) => o.data.langues[l])
      .map((l) => ({ langue: l, chemin: chemin(l, o.data.langues[l]!.slug) }));
    for (const alt of alts) {
      routes.push({
        type: 'outil',
        langue: alt.langue,
        chemin: alt.chemin,
        alternatives: alts,
        outil: o,
        version: o.data.langues[alt.langue]!,
      });
    }
  }

  // --- Hubs de catégorie --------------------------------------------------------
  for (const c of clesCategories) {
    const alts = languesActives
      .filter((l) => categories[c].langues[l] && outils.some((o) => o.data.categorie === c && o.data.langues[l]))
      .map((l) => ({ langue: l, chemin: chemin(l, categories[c].langues[l]!.slug) }));
    for (const alt of alts) {
      routes.push({
        type: 'hub',
        langue: alt.langue,
        chemin: alt.chemin,
        alternatives: alts,
        categorie: c,
        version: categories[c].langues[alt.langue]!,
      });
    }
  }

  // --- Pages de texte (mentions légales, confidentialité, contact…) --------------
  const actives = pages.filter((p) => languesActives.includes(p.data.langue));
  for (const p of actives) {
    const alts = actives
      .filter((x) => x.data.cle === p.data.cle)
      .map((x) => ({ langue: x.data.langue, chemin: chemin(x.data.langue, x.data.slug) }));
    routes.push({
      type: 'page',
      langue: p.data.langue,
      chemin: chemin(p.data.langue, p.data.slug),
      alternatives: alts,
      page: p,
    });
  }

  // --- Doublons (slug, title, description) ----------------------------------------
  const vus = new Map<string, string>();
  const verifierUnique = (genre: string, valeur: string, origine: string) => {
    const cle = `${genre}::${valeur.trim().toLowerCase()}`;
    const deja = vus.get(cle);
    if (deja) erreurs.push(`${genre} en double : "${valeur}" (${deja} et ${origine}).`);
    else vus.set(cle, origine);
  };
  for (const r of routes) {
    verifierUnique('Chemin', r.chemin, r.chemin);
    if (r.type === 'outil') {
      verifierUnique('Title', r.version.title, `${r.outil.id}.json`);
      verifierUnique('Meta description', r.version.metaDescription, `${r.outil.id}.json`);
      verifierUnique('H1', r.version.h1, `${r.outil.id}.json`);
    }
  }

  if (erreurs.length) {
    throw new Error('\n\n❌ Problèmes dans la configuration des outils :\n- ' + erreurs.join('\n- ') + '\n');
  }

  // Ordre stable : langue par défaut d'abord
  return routes.sort((a, b) => Number(b.langue === langueParDefaut) - Number(a.langue === langueParDefaut));
}
