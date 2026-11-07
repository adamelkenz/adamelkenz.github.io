# Les Douceurs d'Elo : générer le site

Toutes les pages, `js/donnees.js`, `sitemap.xml` et `robots.txt` sont produits par `generer.py`.
Ne modifiez pas les fichiers HTML à la main : modifiez les données ou les textes, puis relancez :

```sh
cd les-douceurs-delo
python3 _outils/generer.py
```

- **Téléphone, WhatsApp, adresse, horaires, note Google** : en haut de `donnees.py`.
- **Tarifs indicatifs** : `TARIFS` dans `donnees.py` (page Tarifs) ; prix « dès » du configurateur : `FORMATS` dans `generer.py`.
- **Parfums** (et leurs couleurs génoise / crème / garniture pour la découpe et le configurateur) : `PARFUMS`.
- **Avis cités** : `AVIS` (cités tels quels depuis Google, prénom + initiale).
- **Photos** : déposer `nom-480.webp` (et `nom-960.webp` si haute définition) dans `img/photos/`, puis ajouter
  l'entrée dans `PHOTOS` (texte alternatif, HD oui/non, ratio) et, pour la galerie, dans `GALERIE`.
- **Textes des pages** : une fonction par page dans `generer.py` ; articles de conseils dans `articles.py`.
- **Gabarit commun** (en-tête, menu, pied, composants, icônes) : `commun.py`.
- **Animations et outils** : `js/site.js` (navigation, apparitions, horaires en direct, découpe du layer cake,
  carrousel d'avis, galerie et visionneuse, poussière d'or du héros), `js/gateau.js` (dessin SVG des gâteaux),
  `js/atelier.js` (configurateur), `js/mariage.js` (pièce montée), `js/enfants.js` (thèmes + rappel .ics),
  `js/entreprise.js` (cupcakes logotypés + quantités), `js/parts.js` (calculateur de parts),
  `js/calendrier.js` (fêtes, compte à rebours, rappels), `js/contact.js` (devis WhatsApp / SMS).

Aucune donnée n'est collectée : les formulaires préparent un message WhatsApp ou SMS, les rappels d'agenda
et l'aperçu de logo sont générés dans le navigateur du visiteur.

À compléter par l'exploitante : raison sociale et SIRET dans les mentions légales (`mentions()` dans `generer.py`).
