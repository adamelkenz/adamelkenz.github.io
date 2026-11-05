# Outils en ligne — site multi-outils SEO (Astro)

Site d'outils gratuits (PDF, image, vidéo) où **chaque outil a sa propre page optimisée pour Google**
et où **tout le traitement se fait dans le navigateur** : aucun fichier n'est envoyé sur un serveur.
Le site est 100 % statique, donc hébergeable gratuitement, et monétisé par AdSense.

**Outils déjà en ligne (MVP)**

| Page | Moteur | Ce qu'il fait |
|---|---|---|
| `/compresser-pdf` | `pdf-compress` | 3 niveaux : légère, recommandée, maximale |
| `/compresser-pdf-moins-de-1-mo` | `pdf-compress` | Cherche la compression la plus douce qui passe sous 1 Mo |
| `/compresser-pdf-moins-de-2-mo` | `pdf-compress` | Idem sous 2 Mo |
| `/fusionner-pdf` | `pdf-merge` | Ordre réglable ; les PDF « protégés » sont ajoutés en image |
| `/convertir-heic-en-jpg` | `image-convert` | Photos d'iPhone ; décodeur HEIC chargé seulement si besoin |
| `/convertir-webp-en-png` | `image-convert` | Sans perte, transparence conservée |
| `/convertir-webp-en-jpg` | `image-convert` | Qualité réglable, fond blanc |
| `/convertir-mov-en-mp4` | `video-convert` | Copie instantanée ou réencodage H.264 ; secours ffmpeg.wasm |

---

## 1. Commandes (à lancer dans un terminal)

Une seule fois :

1. Installer **Node.js version LTS** (24 ou plus récente) depuis <https://nodejs.org>.
2. Ouvrir un terminal dans ce dossier :
   ```bash
   cd outils-en-ligne
   npm install
   ```

Ensuite :

| Commande | À quoi ça sert |
|---|---|
| `npm run dev` | Voir le site en local sur <http://localhost:4321> (se met à jour à chaque modification). Les emplacements pub y apparaissent en gris. |
| `npm run build` | Construire le site final dans `dist/`. **S'arrête avec un message clair si un fichier d'outil est incomplet.** |
| `npm run preview` | Voir le site construit (après `npm run build`). |
| `npm test` | Tester automatiquement tous les outils avec de vrais fichiers (voir § 8). La première fois : `npx playwright install chromium`. |

---

## 2. Comment ajouter un outil

**Un outil = un fichier JSON** dans `src/content/outils/`. Le nom du fichier est l'identifiant de l'outil.

### Étapes

1. Copiez un fichier existant qui utilise le même moteur. Exemple : pour « AVIF en JPG », copiez `webp-en-jpg.json` en `avif-en-jpg.json`.
2. Modifiez les valeurs (voir le tableau ci-dessous). Écrivez un **vrai texte** propre à cette page : Google pénalise les pages en série où seuls deux mots changent.
3. Ajoutez l'identifiant du nouvel outil dans les `similaires` de 2 ou 3 outils proches (maillage interne).
4. Lancez `npm run dev` pour vérifier, puis `npm run build`. Si une règle n'est pas respectée, le message indique le fichier et le champ à corriger.

### Les champs

```jsonc
{
  "categorie": "image",               // pdf | image | video
  "moteur": "image-convert",          // le code qui fait le travail (liste ci-dessous)
  "options": { "accepte": [".avif"], "sortie": "jpg" },
  "similaires": ["webp-en-jpg", "heic-en-jpg", "webp-en-png", "compresser-pdf"], // 4 à 6 outils
  "brouillon": false,                 // true = page non publiée (préparation)
  "dateMaj": "2026-11-05",            // affichée sur la page et dans le sitemap
  "langues": {
    "fr": {
      "slug": "convertir-avif-en-jpg",            // l'adresse : /convertir-avif-en-jpg
      "motCle": "convertir avif en jpg",          // la requête Google visée
      "nomCourt": "AVIF en JPG",                  // menus, fil d'Ariane, cartes
      "title": "…",                               // ≤ 60 caractères, contient le mot-clé
      "metaDescription": "…",                     // 120 à 160 caractères, contient le mot-clé
      "h1": "Convertir AVIF en JPG",              // contient le mot-clé
      "accroche": "…",                            // phrase sous le titre
      "contenu": [                                // 300 à 500 mots au total
        { "h2": "Comment … ?", "etapes": ["…", "…", "…"] },
        { "h2": "Pourquoi … ?", "paragraphes": ["…", "…"] },
        { "h2": "Limites", "liste": ["…", "…"] }
      ],
      "faq": [ { "q": "…", "r": "…" } ]           // 4 à 5 questions
    }
  }
}
```

### Règles vérifiées automatiquement à chaque build

- `title` ≤ 60 caractères ; `metaDescription` entre 120 et 160 caractères ;
- le `motCle` exact (sans tenir compte des accents ni des majuscules) est présent dans `title`, `metaDescription` et `h1` ;
- le contenu sous l'outil fait **entre 300 et 500 mots** ; la FAQ a **4 à 5 questions** ;
- 4 à 6 outils similaires, qui doivent exister ;
- aucun slug, title, description ou H1 en double sur le site.

### Moteurs disponibles et leurs options

| Moteur | Options | Exemples d'outils possibles sans écrire de code |
|---|---|---|
| `image-convert` | `accepte` (extensions), `sortie` : `png`, `jpg` ou `webp` | AVIF → JPG, PNG → JPG, JPG → PNG, HEIC → PNG, BMP → JPG |
| `pdf-compress` | `accepte`, `tailleCibleMo` (facultatif) | « compresser PDF moins de 500 Ko » → `"tailleCibleMo": 0.5` |
| `pdf-merge` | `accepte` | — |
| `video-convert` | `accepte`, `sortie` | M4V → MP4, MKV → MP4 (si le navigateur lit le codec) |

Un outil d'un **nouveau type** (signer un PDF, compresser une vidéo…) demande un nouveau moteur : un composant dans `src/moteurs/<nom>/`, déclaré dans `src/moteurs/index.ts` et dans la liste `moteur` de `src/content.config.ts`.

---

## 3. Réglages du site : `src/config/site.json`

| Champ | À faire avant la mise en ligne |
|---|---|
| `nom` | Le nom de votre site (provisoire : « FichierLocal »). |
| `url` | **Votre domaine**, par exemple `https://www.mondomaine.fr` (sans `/` final). Sert aux URLs canoniques, au sitemap et aux balises hreflang. |
| `email` | Adresse de contact (page Contact, mentions légales). |
| `editeur` | Remplacez tous les `[À COMPLÉTER]` : identité, statut, adresse, SIRET. Obligatoire en France (LCEN). Si le site rapporte de l'argent, c'est une activité professionnelle : un statut (par exemple micro-entreprise) est nécessaire. |
| `adsense` | Voir § 6. |
| `languesActives` | Voir § 4. |

Les textes des pages légales sont dans `src/content/pages/fr/*.md`. Les `%%JETONS%%` y sont remplacés automatiquement par les valeurs de `site.json`. Ces modèles sont une base sérieuse, mais pas un avis juridique : faites-les relire si vous avez un doute.

---

## 4. Ajouter l'anglais ou l'espagnol

La structure est prête et a été testée (hreflang réciproques, `x-default` vers le français, sitemap multilingue).

1. Dans `site.json` : `"languesActives": ["fr", "en"]`.
2. Dans `src/config/categories.json`, ajoutez une version `en` à chaque catégorie (slug, titres, intro).
3. Dans chaque outil à traduire, ajoutez une version `"en": { … }` à côté de `"fr"`, avec **un slug et des textes écrits pour le marché anglophone** (mots-clés anglais, exemples locaux), pas une traduction mot à mot.
4. Créez les pages légales dans `src/content/pages/en/` (copiez les fichiers `fr` en changeant `langue: en` et le `slug`).
5. Les textes de l'interface (boutons, messages) sont déjà traduits dans `src/i18n/en.json` et `es.json`.

Les pages anglaises sont publiées sous `/en/…` et les espagnoles sous `/es/…`. Un outil sans version `en` n'a simplement pas de page anglaise, et le build vous prévient si une catégorie n'est pas traduite.

---

## 5. Déployer gratuitement sur Cloudflare Pages

**Pourquoi Cloudflare plutôt que Netlify ?** L'offre gratuite de Cloudflare Pages ne facture pas la bande passante (500 builds par mois, 20 000 fichiers, 25 Mo maximum par fichier). Depuis septembre 2025, l'offre gratuite de Netlify fonctionne avec 300 crédits par mois : 15 crédits par mise en ligne et 20 par Go de trafic, puis le site est suspendu. Le fichier `public/_headers` fonctionne sur les deux.

### Première mise en ligne (environ 10 minutes)

1. Créez un compte sur <https://dash.cloudflare.com> (gratuit).
2. Menu **Workers & Pages** → **Create** → onglet **Pages** → **Connect to Git** → autorisez GitHub → choisissez le dépôt `adamelkenz.github.io`.
3. Réglages du build :
   - **Production branch** : `master` (une fois ce travail fusionné) ;
   - **Framework preset** : `Astro` ;
   - **Build command** : `npm run build` ;
   - **Build output directory** : `dist` ;
   - **Root directory (advanced)** : `outils-en-ligne` ← important, le dépôt contient d'autres sites.
4. **Save and Deploy**. Le site est en ligne sur `https://<projet>.pages.dev`.
5. Économisez vos builds : dans **Settings → Build → Build watch paths**, mettez `outils-en-ligne/*` en *Include*. Les modifications des autres sites du dépôt ne déclencheront plus de build.
6. **Domaine** : **Custom domains** → **Set up a custom domain**. Si le domaine est acheté chez Cloudflare (Registrar, prix coûtant, environ 10 €/an pour un .fr ou un .com), tout est automatique. Mettez ensuite ce domaine dans `site.json` (`url`).
7. **Statistiques gratuites et sans cookie** : dans le projet, **Metrics → Web Analytics → Enable**. Aucune bannière n'est nécessaire pour cet outil.

Ensuite, chaque `git push` sur `master` met le site à jour automatiquement (1 à 2 minutes).

> Le fichier `.node-version` indique à Cloudflare d'utiliser Node.js 24.

---

## 6. Activer AdSense (une fois le site en ligne avec quelques pages)

1. Ayez d'abord un **domaine à vous** : AdSense refuse les sous-domaines comme `*.pages.dev`. Remplissez aussi toutes les mentions légales.
2. Sur <https://adsense.google.com>, ajoutez votre site. Mettez votre identifiant `ca-pub-…` dans `site.json` → `adsense.client` et passez `"actif": true`. Le site ajoute alors automatiquement :
   - la balise de validation `google-adsense-account` ;
   - le fichier `ads.txt` (généré à partir de `site.json`) ;
   - le lien « Gérer les cookies » en bas de page.
3. Après l'approbation, créez **3 blocs d'annonces « Display »** (Annonces → Par bloc d'annonces) et mettez leurs identifiants dans `adsense.emplacements` : `sousOutil`, `milieuContenu`, `finDePage`.
4. **N'activez pas les « Annonces automatiques »** : elles placent des pubs au-dessus des outils et font bouger la page (mauvais pour les Core Web Vitals et pour les utilisateurs).
5. **Consentement RGPD (obligatoire en Europe)** : AdSense → **Confidentialité et messages** → **Europe (RGPD)** → créez et publiez le message. C'est la plateforme de consentement de Google, **certifiée TCF et gratuite**. C'est la seule solution acceptée par AdSense pour les pubs personnalisées en Europe, au Royaume-Uni et en Suisse ; une bannière faite maison ne suffit pas. Elle s'affiche automatiquement avec le script AdSense.

Côté performances, les emplacements ont une **hauteur fixe réservée** (aucun décalage de mise en page). Le script Google n'est chargé qu'à la **première interaction** de l'utilisateur (défilement, toucher, clavier), pour garder une page très rapide. Attendez-vous quand même à perdre quelques points Lighthouse une fois les vraies pubs actives : c'est inévitable.

---

## 7. Checklist Google Search Console

**Le jour de la mise en ligne**

- [ ] Ouvrez <https://search.google.com/search-console> → **Ajouter une propriété** → **Domaine** → validez via l'enregistrement DNS TXT (avec Cloudflare, quelques clics dans l'onglet DNS).
- [ ] **Sitemaps** → soumettez `https://www.votre-domaine.fr/sitemap.xml` et vérifiez que l'état indique « Opération effectuée ».
- [ ] **Inspection de l'URL** → testez la page d'accueil et 3 ou 4 pages outils → **Demander l'indexation**.
- [ ] Vérifiez que `https://www.votre-domaine.fr/robots.txt` mentionne bien le sitemap.
- [ ] Bonus : <https://www.bing.com/webmasters> → **Importer depuis Google Search Console** (Bing alimente aussi DuckDuckGo et Ecosia).

**Après 1 à 2 semaines**

- [ ] **Indexation → Pages** : chaque page outil doit être « Indexée ». Si une page est « Détectée, actuellement non indexée », renforcez son contenu et ses liens internes, puis redemandez l'indexation.
- [ ] Aucune erreur « Autre page avec balise canonique correcte » ni « Page en double ».
- [ ] **Expérience → Signaux Web essentiels** : tout doit être « Bon » (mobile et ordinateur).
- [ ] **Améliorations → Fils d'Ariane** : aucune erreur.

**Chaque mois**

- [ ] **Performances → Requêtes** : repérez les requêtes affichées mais peu cliquées (CTR < 2 %) et réécrivez le `title` et la `metaDescription` de la page concernée.
- [ ] Repérez les requêtes proches qui n'ont pas encore leur page (par exemple « compresser pdf moins de 500 ko ») : chacune est un nouvel outil à créer en un fichier JSON.
- [ ] Mettez à jour `dateMaj` quand vous améliorez réellement une page.
- [ ] Le jour où vous lancez l'anglais : **Paramètres → Rapports** → vérifiez les erreurs hreflang éventuelles.

À savoir : depuis 2023, Google n'affiche plus les FAQ « enrichies » que pour les sites officiels et de santé. Le balisage FAQPage reste présent (utile aux autres moteurs et aux IA), mais ne vous attendez pas à le voir en résultat enrichi.

---

## 8. Tests et qualité

`npm test` construit le site, le lance et vérifie automatiquement (21 tests) :

- le **SEO de toutes les pages** du sitemap : title, description, H1 unique, canonical, Open Graph, JSON-LD WebApplication + FAQPage + BreadcrumbList, pub jamais au-dessus de l'outil, maillage interne ;
- l'**affichage mobile** (pas de défilement horizontal, outil visible sans défiler) ;
- **chaque outil avec de vrais fichiers** (`tests/fixtures/`) : dimensions et transparence des images, ordre et nombre de pages des PDF fusionnés, texte encore sélectionnable après compression, respect des cibles de 1 et 2 Mo, codecs des MP4 produits, messages d'erreur (PDF à mot de passe, mauvais format).

**Mesuré au lancement** (Lighthouse 13, profil mobile) : **100/100** en Performance, Accessibilité, Bonnes pratiques et SEO sur l'accueil, les pages outils et les pages catégories (LCP 0,7 s, CLS 0, TBT 0 ms). Pour mesurer en ligne : <https://pagespeed.web.dev>.

---

## 9. Comment c'est construit (pour un développeur)

```
outils-en-ligne/
├── astro.config.mjs        URLs sans « / » final, CSS intégré à la page
├── public/                 _headers, favicon, images Open Graph
├── scripts/                copie des fichiers pdf.js ; génération des images OG
├── src/
│   ├── config/             site.json, categories.json
│   ├── content/outils/     ★ un JSON par outil
│   ├── content/pages/fr/   pages légales en Markdown
│   ├── content.config.ts   schéma et règles SEO des JSON
│   ├── i18n/               textes d'interface fr / en / es
│   ├── lib/                routes (pages, hreflang, sitemap), aides i18n
│   ├── lib/client/         code navigateur partagé (zone de dépôt, PDF, compression…)
│   ├── moteurs/            un dossier par type d'outil
│   ├── layouts/            gabarits : outil, catégorie, accueil, page texte
│   └── pages/              [...chemin].astro (toutes les pages), sitemap, robots, ads.txt
└── tests/                  tests Playwright et fichiers d'exemple
```

- **Zéro framework côté navigateur** : chaque page outil charge environ 10 Ko de JavaScript. Les bibliothèques lourdes sont téléchargées **au premier fichier déposé** : pdf-lib, pdf.js (~1,7 Mo), heic-to (~3,2 Mo, ~0,8 Mo compressé), Mediabunny, encodeur AAC.
- **ffmpeg.wasm** (~31 Mo) dépasse la limite de 25 Mo par fichier de Cloudflare : il est chargé depuis jsDelivr, **uniquement si l'utilisateur clique** sur « convertisseur de secours ». C'est mentionné dans la politique de confidentialité.
- **Pas d'en-têtes COOP/COEP** : ils bloqueraient les publicités. ffmpeg.wasm tourne donc en mono-thread, ce qui est acceptable puisque c'est un secours.

### Limites connues

- Sur iPhone, Safari limite la mémoire : très grandes images (plus de 16 mégapixels environ) et vidéos de plusieurs centaines de Mo.
- La vidéo HEVC n'est décodée que là où le système le permet (Safari, Chrome sous Windows et macOS avec accélération matérielle). Ailleurs, le secours ffmpeg.wasm prend le relais.
- Les PDF chiffrés **avec** mot de passe d'ouverture sont refusés, avec un message clair.
