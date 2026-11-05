# Feuille de route : prochains outils et option IA

## 10 idées de niche (à valider avant de coder)

Ce sont des **hypothèses** : je n'ai pas eu accès à un outil de volumes de recherche. Pour valider une idée en 5 minutes :

1. Tapez la requête dans Google et regardez les suggestions automatiques. Si elles existent, il y a de la demande.
2. Regardez le top 10. S'il est occupé par des forums, des pages vieillissantes ou des sites peu spécialisés, c'est jouable. S'il n'y a que iLovePDF, Smallpdf et Adobe, passez votre chemin.
3. Une fois le site en ligne, Search Console montre les requêtes voisines pour lesquelles vous apparaissez déjà : c'est la meilleure source d'idées.

| # | Outil | Exemples de pages (slug) | Effort |
|---|---|---|---|
| 1 | **AVIF → JPG / PNG**, PNG → JPG, JPG → PNG | `/convertir-avif-en-jpg` | **Un fichier JSON** (moteur `image-convert` existant) |
| 2 | **Compresser une image à une taille cible** | `/compresser-image-moins-de-200-ko`, `-100-ko`, `-500-ko` | Petit moteur ; une page par taille, comme pour les PDF |
| 3 | **Supprimer la localisation GPS / EXIF d'une photo** avant de la publier ou de la vendre (Vinted, Leboncoin) | `/supprimer-localisation-photo` | Petit moteur, colle parfaitement à l'argument « rien ne quitte votre appareil » |
| 4 | **Plusieurs photos → un seul PDF** (justificatifs pris au téléphone) | `/mettre-plusieurs-photos-dans-un-pdf` | Petit moteur (pdf-lib) |
| 5 | **Supprimer ou extraire des pages d'un PDF** | `/supprimer-une-page-pdf` | Moteur moyen (miniatures avec pdf.js) |
| 6 | **Pivoter un PDF et l'enregistrer** (scans à l'envers) | `/pivoter-pdf-et-enregistrer` | Petit moteur |
| 7 | **Signer un PDF** (dessiner sa signature au doigt) | `/signer-un-pdf-sur-iphone` | Moteur moyen ; argument confidentialité très fort |
| 8 | **Compresser une vidéo pour WhatsApp / e-mail / Discord** | `/compresser-video-pour-whatsapp`, `/compresser-video-moins-de-25-mo` | Moteur moyen (Mediabunny déjà présent) ; une page par plateforme |
| 9 | **Message vocal WhatsApp (.opus / .ogg) → MP3** | `/convertir-vocal-whatsapp-en-mp3` | Petit moteur (Mediabunny + encodeur MP3 officiel) |
| 10 | **Planche photo d'identité 35×45 mm à imprimer** (format 10×15) | `/planche-photo-identite-10x15` | Moteur moyen (recadrage + mise en page) ; utile pour les badges et dossiers sans photo certifiée |

Ordre conseillé : 1, puis 2, 3 et 4 (rapides, nombreuses variantes longue traîne), puis 8 et 9 (vidéo et audio), puis 5, 6, 7 et 10.

---

## Outil « image / vidéo → prompt » : les options (non codé, en attente de validation)

L'outil décrit une image (ou une vidéo) sous forme de prompt réutilisable dans Midjourney, Stable Diffusion, etc. Cela nécessite un modèle d'IA de vision. Les prix ci-dessous ont été vérifiés sur les pages officielles le 5 novembre 2026.

### A. 100 % dans le navigateur : gratuit et privé

- **Modèle** : Florence-2 (Microsoft, licence MIT) via Transformers.js, sur la carte graphique (WebGPU).
- **Coût** : 0 €, quel que soit le trafic.
- **Confidentialité** : l'image ne quitte pas l'appareil, la promesse du site est intacte.
- **Limites** :
  - premier usage lourd, avec un modèle de plusieurs centaines de Mo à télécharger (ensuite en cache) ;
  - lent sur les téléphones modestes ;
  - descriptions en anglais uniquement (ce qui convient aux prompts, rédigés en anglais en général) ;
  - qualité correcte, mais en dessous des grands modèles ;
  - pour une vidéo, on décrit quelques images extraites : pas de vraie compréhension du mouvement.

### B. Claude Haiku 5.5 (Anthropic) : meilleur rapport qualité / prix

- **Prix** : 0,10 $ par million de tokens en entrée, 0,50 $ en sortie.
- **Image** : redimensionnée à 1 000 px, elle coûte environ 1 300 tokens. Avec la consigne et environ 300 tokens de réponse, cela fait **≈ 0,0003 $ par image, soit ≈ 0,30 $ pour 1 000 prompts**.
- **Vidéo** : Claude ne lit pas la vidéo directement. On extrait 6 à 8 images dans le navigateur (avec Mediabunny, déjà présent), soit **≈ 0,0006 $ par vidéo**.
- **Pas d'offre gratuite** : crédits prépayés. Fixez une limite de dépense dans la console Anthropic.
- **Points d'attention** :
  - il faut une petite fonction serveur pour cacher la clé API (Cloudflare Pages Functions, comprise dans l'offre gratuite de Cloudflare) ;
  - il faut un anti-robot gratuit (Cloudflare Turnstile) et un quota par visiteur, sinon un robot peut vider vos crédits ;
  - l'image est envoyée à Anthropic : sur cette page, il faut l'annoncer clairement et mettre à jour la politique de confidentialité (pas d'entraînement sur les données de l'API par défaut).

### C. Gemini 3.1 Flash-Lite (Google)

- **Prix** : 0,25 $ par million de tokens en entrée (texte, image ou vidéo), 1,50 $ en sortie.
- **Atout** : il **comprend la vidéo nativement**, sans extraction d'images.
- **Offre gratuite** : elle existe, mais **les contenus envoyés servent à améliorer les produits Google**. C'est incompatible avec la promesse de confidentialité du site. En pratique, il faut donc l'offre payante.

### D. Cloudflare Workers AI

- **Offre gratuite** : 10 000 « neurones » par jour, puis 0,011 $ pour 1 000 neurones.
- **Prix des modèles de vision** :
  - Llama 3.2 11B Vision : 0,049 $ par million de tokens en entrée, 0,676 $ en sortie ;
  - Moondream 3.1 : 0,30 $ / 1,00 $.
- **Volume gratuit** : de l'ordre de quelques centaines d'images par jour (estimation).
- **Atout** : même fournisseur que l'hébergement.
- **Limite** : qualité en dessous de Claude et de Gemini.

### Recommandation

1. **Lancer avec l'option A** (gratuite, privée, cohérente avec la marque) pour mesurer la demande réelle.
2. Si la page attire du trafic, ajouter un bouton **« Version avancée »** avec l'option B : environ 0,03 centime par image, avec un consentement explicite à l'envoi.

L'option B reste rentable tant que chaque génération correspond à au moins une page vue avec publicité.
