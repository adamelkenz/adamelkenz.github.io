import site from '../config/site.json';

// Les jetons %%...%% des pages Markdown sont remplacés par les valeurs de src/config/site.json.
const JETONS: Record<string, string> = {
  NOM: site.nom,
  URL: site.url,
  EMAIL: site.email,
  EDITEUR_NOM: site.editeur.nom,
  EDITEUR_STATUT: site.editeur.statut,
  EDITEUR_ADRESSE: site.editeur.adresse,
  EDITEUR_SIRET: site.editeur.siret,
  DIRECTEUR: site.editeur.directeurPublication,
  HEBERGEUR_NOM: site.hebergeur.nom,
  HEBERGEUR_ADRESSE: site.hebergeur.adresse,
  HEBERGEUR_SITE: site.hebergeur.site,
};

export function remplacerJetons(s: string): string {
  return s.replace(/%%([A-Z_]+)%%/g, (m, k) => JETONS[k] ?? m);
}
