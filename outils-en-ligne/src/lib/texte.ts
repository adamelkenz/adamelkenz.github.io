/** Met un texte en minuscules, sans accents ni ponctuation, pour comparer des mots-clés. */
export function normaliser(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function compterMots(s: string): number {
  return (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;
}

/** Remplace {cle} par sa valeur : remplir("{n} fichiers", { n: 3 }) → "3 fichiers" */
export function remplir(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
