/**
 * Fonctions communes côté navigateur pour tous les moteurs d'outils :
 * glisser-déposer, filtrage des formats, messages d'état, résultats téléchargeables, ZIP.
 */
export type Textes = Record<string, string>;

export function remplir(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export function formatTaille(octets: number, langue = 'fr'): string {
  const fmt = (n: number, d: number) => n.toLocaleString(langue, { maximumFractionDigits: d });
  const u = langue === 'fr' ? ['o', 'Ko', 'Mo', 'Go'] : ['B', 'KB', 'MB', 'GB'];
  if (octets < 1024) return `${octets} ${u[0]}`;
  if (octets < 1024 ** 2) return `${fmt(octets / 1024, 0)} ${u[1]}`;
  if (octets < 1024 ** 3) return `${fmt(octets / 1024 ** 2, 2)} ${u[2]}`;
  return `${fmt(octets / 1024 ** 3, 2)} ${u[3]}`;
}

/** "photo.webp" → "photo.png" */
export function renommer(nom: string, ext: string): string {
  const base = nom.replace(/\.[^.]+$/, '') || 'fichier';
  return `${base}.${ext}`;
}

/** Laisse le navigateur respirer (mise à jour de l'affichage pendant un long traitement). */
export const pause = () => new Promise<void>((r) => setTimeout(r, 0));

export interface Resultat {
  nom: string;
  blob: Blob;
  tailleAvant?: number;
  note?: string;
}

export class InterfaceOutil {
  readonly root: HTMLElement;
  readonly input: HTMLInputElement;
  readonly t: Textes;
  readonly options: Record<string, any>;
  readonly langue: string;
  private etat: HTMLElement;
  private liste: HTMLUListElement;
  private actions: HTMLElement;
  private boutonZip: HTMLButtonElement;
  private urls: string[] = [];
  readonly resultats: Resultat[] = [];
  private accepte: string[];

  constructor(root: HTMLElement) {
    this.root = root;
    this.input = root.querySelector('input[type=file]')!;
    this.t = JSON.parse(root.dataset.textes || '{}');
    this.options = JSON.parse(root.dataset.options || '{}');
    this.langue = this.t.langue || 'fr';
    this.etat = root.querySelector('.etat')!;
    this.liste = root.querySelector('.resultats')!;
    this.actions = root.querySelector('.actions')!;
    this.boutonZip = root.querySelector('[data-action=zip]')!;
    this.accepte = (this.input.accept || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

    this.boutonZip.addEventListener('click', () => this.telechargerZip());
    root.querySelector('[data-action=recommencer]')!.addEventListener('click', () => {
      this.reinitialiser();
      this.input.click();
    });
  }

  /** Branche le sélecteur de fichiers et le glisser-déposer. */
  surFichiers(cb: (fichiers: File[]) => void | Promise<void>) {
    const traiter = async (liste: FileList | File[] | null) => {
      if (!liste || !liste.length) return;
      const fichiers = this.filtrer(Array.from(liste));
      this.input.value = '';
      if (fichiers.length) await cb(fichiers);
    };
    this.input.addEventListener('change', () => traiter(this.input.files));
    const zone = this.root.querySelector('.depot-zone')!;
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.root.classList.add('survol');
    });
    zone.addEventListener('dragleave', () => this.root.classList.remove('survol'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.root.classList.remove('survol');
      if (this.root.classList.contains('occupe')) return;
      traiter((e as DragEvent).dataTransfer?.files ?? null);
    });
    // Évite que le navigateur ouvre le fichier si on le lâche à côté de la zone.
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => e.preventDefault());
  }

  /** Garde uniquement les fichiers dont l'extension est acceptée. */
  filtrer(fichiers: File[]): File[] {
    if (!this.accepte.length) return fichiers;
    const ok: File[] = [];
    const refuses: string[] = [];
    for (const f of fichiers) {
      const ext = '.' + (f.name.split('.').pop() || '').toLowerCase();
      if (this.accepte.includes(ext) || this.accepte.includes(f.type.toLowerCase())) ok.push(f);
      else refuses.push(f.name);
    }
    if (refuses.length) {
      this.erreur(remplir(this.t.formatRefuse, { nom: refuses.join(', '), formats: this.t.formats }));
    }
    return ok;
  }

  occupe(oui: boolean) {
    this.root.classList.toggle('occupe', oui);
    this.input.disabled = oui;
    this.root.querySelectorAll<HTMLInputElement | HTMLButtonElement>('.options input, .options button, .options select').forEach((el) => (el.disabled = oui));
  }

  info(message: string, progression?: number) {
    this.etat.hidden = false;
    this.etat.className = 'etat';
    this.etat.textContent = message;
    if (progression !== undefined) {
      const p = document.createElement('progress');
      p.max = 1;
      p.value = Math.max(0, Math.min(1, progression));
      this.etat.append(p);
    }
  }

  ok(message: string) {
    this.etat.hidden = false;
    this.etat.className = 'etat ok';
    this.etat.textContent = message;
  }

  erreur(message: string) {
    this.etat.hidden = false;
    this.etat.className = 'etat erreur';
    this.etat.textContent = message;
  }

  ajouterResultat(r: Resultat) {
    this.resultats.push(r);
    const url = URL.createObjectURL(r.blob);
    this.urls.push(url);
    const li = document.createElement('li');
    li.className = 'resultat';
    const nom = document.createElement('span');
    nom.className = 'resultat-nom';
    nom.textContent = r.nom;
    const taille = document.createElement('span');
    taille.className = 'resultat-taille';
    if (r.tailleAvant) {
      taille.textContent = `${formatTaille(r.tailleAvant, this.langue)} → ${formatTaille(r.blob.size, this.langue)} `;
      // On affiche le pourcentage seulement quand le fichier s'allège (compression).
      const pct = Math.round((1 - r.blob.size / r.tailleAvant) * 100);
      if (pct > 0) {
        const b = document.createElement('b');
        b.className = 'gain';
        b.textContent = remplir(this.t.gain, { pct });
        taille.append(b);
      }
    } else {
      taille.textContent = formatTaille(r.blob.size, this.langue);
    }
    const a = document.createElement('a');
    a.className = 'btn btn-petit';
    a.href = url;
    a.download = r.nom;
    a.textContent = this.t.telecharger;
    li.append(nom, taille, a);
    if (r.note) {
      const p = document.createElement('p');
      p.className = 'resultat-note';
      p.textContent = r.note;
      li.append(p);
    }
    this.liste.append(li);
  }

  /** Affiche les boutons finaux (ZIP si plusieurs fichiers). */
  terminer() {
    this.actions.hidden = false;
    this.boutonZip.hidden = this.resultats.length < 2;
    this.liste.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
  }

  reinitialiser() {
    this.urls.forEach((u) => URL.revokeObjectURL(u));
    this.urls = [];
    this.resultats.length = 0;
    this.liste.replaceChildren();
    this.actions.hidden = true;
    this.etat.hidden = true;
  }

  private async telechargerZip() {
    const { zipSync } = await import('fflate');
    const fichiers: Record<string, [Uint8Array, { level: 0 }]> = {};
    for (const r of this.resultats) {
      let nom = r.nom;
      let i = 2;
      while (fichiers[nom]) nom = r.nom.replace(/(\.[^.]+)?$/, ` (${i++})$1`);
      fichiers[nom] = [new Uint8Array(await r.blob.arrayBuffer()), { level: 0 }];
    }
    telecharger(new Blob([zipSync(fichiers)], { type: 'application/zip' }), 'fichiers-convertis.zip');
  }
}

export function telecharger(blob: Blob, nom: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nom;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** Message d'erreur lisible à partir d'une exception. */
export function messageErreur(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}
