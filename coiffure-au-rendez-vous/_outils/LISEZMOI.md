# Coiffure au Rendez-Vous : générer le site

Toutes les pages (accueil, 6 pages de prestations, réservation, mentions légales), `js/donnees.js`,
`sitemap.xml` et `robots.txt` sont produits par `generer.py`. Ne modifiez pas les fichiers HTML à la main :
modifiez les données ou les textes, puis relancez :

```sh
cd coiffure-au-rendez-vous
python3 _outils/generer.py
```

- **Téléphone, WhatsApp, Instagram, adresse** : en haut de `donnees.py`.
- **Politique de réservation** (acompte 30 %, retard 15 min, annulation 48 h, dépôt de perruque 5 jours) :
  `POLITIQUE` dans `donnees.py`. Elle alimente les textes et les calculs du formulaire de réservation.
- **Tarifs et durées** : liste `PRESTATIONS` dans `donnees.py` (reprise de la page « Réserver » du site d'origine).
  Une prestation apparaît automatiquement sur sa page, dans le menu, le formulaire de réservation et le ticket.
- **Textes des pages** (intro, étapes, FAQ) : dictionnaire `PAGES` dans `pages.py` ; accueil : fonction `accueil`.
- **Schéma de tête** (closure, frontal, tissages…) : `ZONES` dans `pages.py`, dessin dans `schema_tete` (`generer.py`).
- **Photos** : déposer `nom-480.webp` et `nom-960.webp` (format 4:5) dans `img/photos/`, puis ajouter l'entrée
  dans `PHOTOS` (texte alternatif) et, pour la galerie, dans `GALERIE`.
- **Logo** : `img/marque.svg` (vectorisé depuis le logo officiel ; symboles `wm`, `wm-g`, `wm-m`, `wm-d`, `wm-t`
  pour l'animation du wordmark, `mono` pour le monogramme).
- **Animations** : `js/site.js` (rideau d'ouverture, curseur, apparitions, pile de photos, guides),
  `js/meches.js` (mèches du héros), `js/zones.js`, `js/galerie.js`, `js/atelier.js` (atelier de confection et
  styling), `js/ponytail.js` (studio ponytail), `js/rdv.js` (réservation et calcul de dépôt).
