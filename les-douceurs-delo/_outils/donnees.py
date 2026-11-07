# -*- coding: utf-8 -*-
"""Données du site Les Douceurs d'Elo : coordonnées, horaires, photos, parfums, tarifs, avis.

Sources : fiche Google Maps (adresse, horaires, note, avis), profil Snapchat public @lesdouceursdelo et
flyers publiés par la boutique (prix, parfums, ateliers). Modifiez ici puis relancez generer.py.
"""

NOM = "Les Douceurs d'Elo"
SITE = 'https://adamelkenz.github.io/les-douceurs-delo/'

ADRESSE = '3 avenue de la Viste'
CP = '13015'
VILLE = 'Marseille'
QUARTIER = 'La Viste, Marseille 15e'
LAT, LON = 43.3550028, 5.3571948

TEL = '06 29 68 81 04'
TEL_LIEN = '+33629688104'
WHATSAPP = '33629688104'
FACEBOOK = 'https://www.facebook.com/lesdouceursdelo/'
SNAPCHAT = 'https://www.snapchat.com/add/lesdouceursdelo'
MAPS = 'https://maps.app.goo.gl/1AuLr1t9VyNxLyL2A'
MAPS_ITI = 'https://www.google.com/maps/dir/?api=1&destination=Les+Douceurs+d%27Elo%2C+3+Av.+de+la+Viste%2C+13015+Marseille'

NOTE = '4,7'
NB_AVIS = 309

# 0 = lundi ... 6 = dimanche ; None = fermé. Utilisé par le badge « ouvert maintenant » (js/site.js).
HORAIRES = [None, ('12:00', '20:00'), ('12:00', '20:00'), ('12:00', '20:00'),
            ('12:00', '20:00'), ('12:00', '20:00'), ('12:00', '20:00')]
JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

# nom : (texte alternatif, existe en 960 px, ratio largeur/hauteur)
PHOTOS = {
    'vitrine': ("La vitrine de la boutique Les Douceurs d'Elo : cupcakes, layer cakes à la fraise et drip cakes", True, 0.8),
    'vitrine-large': ("Vitrine réfrigérée garnie de cupcakes et de layer cakes à l'avenue de la Viste", True, 1.5),
    'jungle': ("Layer cake thème jungle pour les 2 ans d'un enfant, lionceau en sucre et plaque en chocolat", True, 0.8),
    'rose-2-ans': ("Layer cake rose pailleté pour un deuxième anniversaire, entouré de cupcakes assortis", True, 0.8),
    'foret-enchantee': ("Gâteau 3D sculpté : livre ancien, mousse végétale et petite porte en pâte à sucre pour des 50 ans", True, 0.8),
    'noeud-bleu': ("Gâteau ivoire orné d'un nœud turquoise et d'un cadre doré en pâte à sucre", False, 0.8),
    'fleurs-bleues': ("Décor floral bleu roi et roses poudrées sur un gâteau de cérémonie", False, 0.8),
    'perles-or': ("Gâteau à la crème blanche, perles dorées et chiffre 22 doré à la feuille", False, 0.8),
    'princesse': ("Box layer cake « Princess » et cupcakes aux fleurs roses en sucre", False, 1.0),
    'rose-fleurs': ("Layer cake personnalisé 30 ans : roses fraîches, gypsophile et topper doré", False, 1.0),
    'drip-chocolat': ("Drip cake au chocolat garni de barres chocolatées, présenté en vitrine", False, 1.0),
    'vitrine-parts': ("Parts de layer cakes en vitrine : chocolat, fraise, citron, spéculoos", False, 0.8),
    'vitrine-cupcakes': ("Cupcakes et mini layer cakes alignés en vitrine", False, 1.0),
    'parts-layer': ("Parts de layer cake colorées vendues à l'unité en boutique", False, 0.8),
    'vitrine-gourmande': ("Vitrine gourmande : parts de gâteaux, desserts individuels et cupcakes", False, 0.8),
    'tiramisu': ("Plaques de tiramisu maison décorées de rosaces de crème", False, 0.8),
    'part-layer': ("Une part de layer cake : génoise moelleuse, crème et garniture", False, 0.8),
    'verrines': ("Desserts individuels prêts à emporter", False, 1.0),
    'costume-vert': ("Gâteau sculpté costume vert émeraude avec nœud papillon et chéchia", False, 0.8),
}

# Galerie (page Créations) : (photo, catégories, légende)
GALERIE = [
    ('jungle', 'enfants', 'Thème jungle, 2 ans'),
    ('perles-or', 'mariage', 'Crème blanche & perles dorées'),
    ('vitrine', 'boutique', 'La vitrine du jour'),
    ('rose-2-ans', 'enfants', 'Rose pailleté, 2 ans'),
    ('noeud-bleu', 'mariage', 'Nœud turquoise & cadre doré'),
    ('princesse', 'enfants', 'Box « Princess » & cupcakes'),
    ('foret-enchantee', 'sur-mesure', 'Gâteau 3D sculpté, 50 ans'),
    ('fleurs-bleues', 'mariage', 'Fleurs bleu roi'),
    ('rose-fleurs', 'sur-mesure', 'Roses fraîches, 30 ans'),
    ('drip-chocolat', 'boutique', 'Drip cake chocolat'),
    ('costume-vert', 'sur-mesure', 'Costume émeraude sculpté'),
    ('vitrine-parts', 'boutique', 'Parts de layer cake'),
    ('tiramisu', 'boutique', 'Tiramisu maison'),
    ('vitrine-cupcakes', 'boutique', 'Cupcakes & mini layers'),
    ('part-layer', 'boutique', 'Génoise & garniture'),
    ('vitrine-gourmande', 'boutique', 'Vitrine gourmande'),
]
CATEGORIES_GALERIE = [('tout', 'Tout voir'), ('mariage', 'Mariages & cérémonies'), ('enfants', 'Anniversaires enfants'),
                      ('sur-mesure', 'Sur-mesure'), ('boutique', 'En boutique')]

# Parfums (génoise, crème, garniture) : couleurs utilisées par la découpe et le configurateur
PARFUMS = [
    ('chocolat', 'Chocolat & Nutella', '#6b4330', '#c9a27e', '#3f2519'),
    ('fraise', 'Fraise', '#f0dbb2', '#fbf3ea', '#d9475b'),
    ('framboise', 'Framboise', '#efd8ae', '#fbf0f0', '#b0294f'),
    ('speculoos', 'Spéculoos', '#d6ac74', '#f2e1c8', '#a2622a'),
    ('oreo', 'Oreo', '#3a302c', '#f4f1ec', '#231c1a'),
    ('pistache', 'Pistache', '#eed6a8', '#e4edd2', '#8ea956'),
    ('dubai', 'Chocolat « Dubaï »', '#5d3a28', '#cddba0', '#b5853f'),
    ('mangue', 'Mangue', '#f2dcab', '#fff4df', '#f0a12f'),
    ('caramel', 'Caramel beurre salé', '#e5c891', '#f6e7cf', '#b36a28'),
]

# Tarifs indicatifs relevés sur les offres publiées par la boutique (à confirmer au devis)
TARIFS = [
    ('Gâteaux personnalisés', [
        ('Layer cake personnalisé 4/6 parts', 'dès 40 €', 'Décor à votre goût, parfum au choix'),
        ('Layer cake 6/8 parts', 'dès 50 €', 'Le format des anniversaires en famille'),
        ('Layer cake 10/12 parts', 'dès 65 €', 'Pour les grandes tablées'),
        ('Box layer cake 4/6 parts + 6 cupcakes', 'dès 45 €', 'Le coffret assorti, prêt à offrir'),
        ('Pièce montée, wedding cake, gâteau 3D', 'sur devis', 'Selon le nombre d\'étages et le décor'),
    ]),
    ('Petites douceurs', [
        ('Boîte de 10 cupcakes', '25 €', 'Chocolat-Nutella, fraise, framboise, spéculoos, Oreo'),
        ('Plateau de 20 mignardises', '20 €', 'Assortiment pour les réceptions'),
        ('Tiramisu, 4 barquettes', '15 €', 'Parfum au choix'),
        ('Part de layer cake en vitrine', '4 €', 'Selon l\'arrivage du jour'),
    ]),
    ('Événements & ateliers', [
        ('Sweet table, buffet de desserts', 'sur devis', 'Mariages, baby showers, Aïd, entreprises'),
        ('Commandes d\'entreprise', 'sur devis', 'Cupcakes logotypés, plateaux, gâteaux d\'équipe'),
        ('Atelier cake design (journée)', 'dès 150 €', 'Petits groupes, vous repartez avec vos réalisations'),
    ]),
]

# Avis Google cités à l'identique (prénom + initiale)
AVIS = [
    ('Indjil L.', 'Anniversaire 2 ans',
     "Comment vous dire que son gâteau était exceptionnel je l'ai commandé pour les deux ans de ma fille, "
     "il était tellement beau et tellement bon ! Je recommande"),
    ('Ines', 'Gâteau d\'anniversaire',
     "Ma maman m'a commandé un gâteau chez elle. Le résultat est juste incroyable on n'osait même pas le "
     "couper ! Magnifique gâteau un grand bravo et un grand merci à vous !"),
    ('Vaïana F.', 'Gâteau 3D sur le thème choisi',
     "Elo est une pâtissière INCROYABLE ! Je lui avais demandé un gâteau d'anniversaire sur le thème du "
     "seigneur des […]"),
    ('Moanna L.', 'Commande de dernière minute',
     "Gâteau commandé que quelques jours avant l'événement et une réactivité super ! Je recommande sans "
     "soucis cette pâtissière dans le secteur."),
]
THEMES_AVIS = ['sucré', 'layer cake', 'génoise', 'succulent', 'gâteau bento', 'fraise', 'générosité', 'très très bon']
