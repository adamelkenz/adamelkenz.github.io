# Générer le site

Toutes les pages (accueil + une page par ville), `sitemap.xml` et `robots.txt` sont produits par `generer.py`.
Ne modifiez pas les fichiers HTML générés à la main : modifiez le script ou les blocs de `blocs/`, puis relancez :

```sh
cd serrurier-vaucluse
python3 _outils/generer.py
```

- **Téléphone, e-mail, adresse du site** : en haut de `generer.py` (`TEL`, `EMAIL`, `SITE`).
- **Textes d'une ville** : liste `VILLES` (accroche, paragraphes, secteurs, communes voisines, FAQ locale).
- **Ajouter une ville** : ajouter une entrée dans `VILLES`, puis son nom et sa page dans `PAGES` de `js/zones-map.js`
  (et ses coordonnées dans `POINTS` si elle n'y est pas).
- **Ajouter une photo** : déposer `nom.jpg` (900 px de large) et `nom-480.jpg` (480 px) dans `img/realisations/`,
  puis ajouter une entrée dans `REALISATIONS`.
- **Ajouter une vidéo** : déposer le fichier `.mp4` dans `video/` et ajouter `'video': 'video/nom.mp4'` à une entrée
  de `REALISATIONS` (sa photo sert d'affiche). Un bouton ▶ apparaît sur la vignette et la vidéo se lit en plein écran.
