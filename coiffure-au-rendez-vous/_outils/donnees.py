# -*- coding: utf-8 -*-
"""Données du site Coiffure au Rendez-Vous : coordonnées, politique, prestations, photos.

Toutes les pages sont produites par generer.py à partir de ce fichier.
Tarifs et durées repris du site d'origine (coiffureaurendezvous.com, page Réserver).
"""

SITE = 'https://adamelkenz.github.io/coiffure-au-rendez-vous/'
NOM = 'Coiffure au Rendez-Vous'
TEL = '07 62 74 78 82'
TEL_INTL = '+33762747882'
WHATSAPP = '33762747882'
INSTAGRAM = 'https://www.instagram.com/coiffureaurendezvous/'
INSTAGRAM_NOM = '@coiffureaurendezvous'
ADRESSE = '8 rue Montespan'
CP = '91000'
VILLE = 'Évry-Courcouronnes'
QUARTIER = 'quartier des Loges'
LAT, LON = 48.6339731, 2.4370074
MAPS = 'https://www.google.com/maps/search/?api=1&query=Coiffure+au+Rendez+Vous+8+Rue+Montespan+91000+%C3%89vry-Courcouronnes'
MAJ = '2026-11-02'

# Politique de réservation (visuel « Acompte / Paiement / Retard / Annulation » de la page d'accueil d'origine)
POLITIQUE = {
    'acompte_pct': 30,
    'retard_min': 15,
    'annulation_h': 48,
    'depot_perruque_j': 5,
    'paiement': 'espèces ou PayPal',
}

# Catégories = pages de prestations
CATEGORIES = [
    {
        'slug': 'pose-perruque', 'nom': 'Pose perruque', 'court': 'Pose perruque',
        'resume': 'Closure, lace frontal ou perruque extérieure',
        'photo': 'pose-body-wave',
    },
    {
        'slug': 'confection-perruque', 'nom': 'Confection perruque', 'court': 'Confection',
        'resume': 'Perruque confectionnée à la machine, puis posée',
        'photo': 'confection-meche',
    },
    {
        'slug': 'tissage', 'nom': 'Tissage', 'court': 'Tissage',
        'resume': 'Ouvert, fermé, closure, lace frontal, flip over',
        'photo': 'tissage-rouge',
    },
    {
        'slug': 'ponytail', 'nom': 'Ponytail', 'court': 'Ponytail',
        'resume': 'Simple, frange, demi-tête ou lace frontal',
        'photo': 'ponytail-chignon',
    },
    {
        'slug': 'nattes-brushing', 'nom': 'Nattes & brushing', 'court': 'Nattes & brushing',
        'resume': 'Nattes sous perruque, brushing & styling',
        'photo': 'nattes-ondulees',
    },
    {
        'slug': 'formations', 'nom': 'Formations', 'court': 'Formations',
        'resume': 'Tissage, confection, pose lace, ponytail',
        'photo': 'shooting',
    },
]

# id, catégorie, nom, prix (€), durée (min), description, note éventuelle
PRESTATIONS = [
    # Pose perruque
    dict(id='pose-closure', cat='pose-perruque', nom='Pose closure', prix=50, duree=90,
         desc="Pose d'une perruque closure confectionnée par Coiffure au Rendez-Vous : petite base en lace sur le dessus "
              "de la tête, pour une raie naturelle au milieu ou sur le côté."),
    dict(id='pose-lace-frontal', cat='pose-perruque', nom='Pose lace frontal', prix=60, duree=120,
         desc="Pose d'une perruque lace frontal confectionnée par Coiffure au Rendez-Vous : la lace suit votre ligne "
              "frontale d'une oreille à l'autre, pour une naissance de cheveux invisible."),
    dict(id='pose-wig-exterieure', cat='pose-perruque', nom='Pose wig extérieure', prix=80, duree=120,
         desc="Pose ou repose d'une perruque qui n'a pas été confectionnée par Coiffure au Rendez-Vous.",
         note='Perruque à déposer à l’institut 5 jours avant le rendez-vous.'),
    dict(id='confection-pose-frontal', cat='confection-perruque', nom='Confection lace frontal + pose', prix=180,
         duree=120,
         desc="Votre perruque lace frontal confectionnée à la machine par l'institut, personnalisée, puis posée et "
              "coiffée.", aussi='pose-perruque'),
    # Tissage
    dict(id='tissage-ouvert', cat='tissage', nom='Tissage ouvert', prix=70, duree=120,
         desc="Les mèches sont cousues sur une base de nattes ; une partie de vos cheveux reste dehors et se fond dans "
              "les mèches pour un rendu très naturel."),
    dict(id='tissage-ferme', cat='tissage', nom='Tissage fermé', prix=90, duree=180,
         desc="Tous vos cheveux sont nattés et entièrement recouverts par les mèches : aucun cheveu naturel n'est "
              "exposé, ils sont protégés le temps de la pose."),
    dict(id='tissage-closure', cat='tissage', nom='Tissage closure', prix=100, duree=150,
         desc="Tissage refermé sur le dessus par une closure : la raie est dessinée dans la lace, sans laisser de "
              "cheveux dehors."),
    dict(id='tissage-lace-frontal', cat='tissage', nom='Tissage lace frontal', prix=150, duree=180,
         desc="Tissage terminé par une lace frontal d'une oreille à l'autre : ligne frontale naturelle, raies libres et "
              "coiffures dégagées possibles."),
    dict(id='flip-over', cat='tissage', nom='Flip over', prix=70, duree=180,
         desc="Technique de tissage pensée pour retourner la chevelure : la raie passe d'un côté à l'autre pour varier "
              "les coiffures."),
    # Ponytail
    dict(id='ponytail-simple', cat='ponytail', nom='Ponytail simple', prix=50, duree=90,
         desc="Cheveux plaqués et rassemblés, queue de cheval allongée avec des mèches : nette, lisse et volumineuse."),
    dict(id='ponytail-frange', cat='ponytail', nom='Ponytail frange', prix=60, duree=60,
         desc="La ponytail accompagnée d'une frange qui encadre le visage."),
    dict(id='ponytail-demi-tete', cat='ponytail', nom='Ponytail demi-tête', prix=70, duree=120,
         desc="Half up, half down : le dessus est attaché en ponytail, la longueur reste lâchée."),
    dict(id='ponytail-lace-frontal', cat='ponytail', nom='Ponytail lace frontal', prix=120, duree=180,
         desc="Ponytail réalisée avec une lace frontal qui recrée toute la ligne frontale, pour des contours parfaitement "
              "dessinés."),
    # Autres
    dict(id='nattes-sous-perruque', cat='nattes-brushing', nom='Nattes sous perruque', prix=20, duree=60,
         desc="Vos cheveux nattés à plat pour une base fine et régulière : la perruque tombe mieux et vos cheveux sont "
              "protégés dessous."),
    dict(id='brushing-styling', cat='nattes-brushing', nom='Brushing & styling', prix=40, duree=60,
         desc="Lissage, ondulations ou boucles : on redonne forme et mouvement à vos cheveux ou à votre perruque."),
    # Formations
    dict(id='formation-tissage', cat='formations', nom='Formation tissage', prix=550, duree=300, jours='1 journée',
         desc="Les étapes d'un tissage professionnel et les tactiques de styling de l'institut."),
    dict(id='formation-confection', cat='formations', nom='Formation confection perruque', prix=500, duree=300,
         jours='1 journée',
         desc="Les étapes d'une confection complète de perruque à la machine."),
    dict(id='formation-pose-lace', cat='formations', nom='Formation pose lace', prix=500, duree=300,
         jours='1 journée',
         desc="Les techniques de pose de perruques (blanchiment des nœuds, customisation, pose) et le styling sur une "
              "pose perruque."),
    dict(id='formation-confection-pose', cat='formations', nom='Formation confection + pose perruque', prix=1000,
         duree=600, jours='2 journées',
         desc="La confection complète d'une perruque à la machine, les techniques de pose (blanchiment des nœuds, "
              "customisation, pose) et le styling sur une pose perruque."),
    dict(id='formation-ponytail', cat='formations', nom='Formation ponytail', prix=400, duree=240, jours='1 journée',
         desc="Les étapes d'une ponytail simple et/ou sophistiquée."),
]

# nom : (texte alternatif, existe en 960 px)
PHOTOS = {
    'pose-lisse': ("Perruque noire lisse très longue, raie au milieu, portée par une cliente à l'institut", True),
    'pose-body-wave': ("Perruque noire body wave, raie au milieu, cliente assise à l'institut", True),
    'pose-ondulee': ("Perruque noire aux larges ondulations, cliente souriante devant les pampas de l'institut", True),
    'pose-lisse-raie': ("Perruque lisse brun foncé, raie au milieu et ligne frontale naturelle", True),
    'pose-glamour': ("Longue chevelure noire ondulée, raie au milieu, cliente à l'institut", True),
    'lace-frontal': ("Lace frontal lisse, raie sur le côté et baby hair dessinés", True),
    'confection-meche': ("Perruque noire ondulée avec mèches blondes devant, raie sur le côté", True),
    'confection-carre': ("Carré lisse noir au niveau de la mâchoire", True),
    'confection-ombre': ("Longues ondulations blond miel sur racines foncées", True),
    'confection-boucles': ("Perruque noire mi-longue aux boucles souples, raie au milieu", False),
    'tissage-boucle': ("Cheveux mi-longs aux pointes bouclées, raie au milieu", True),
    'tissage-lisse': ("Cliente souriante, cheveux noirs lisses et raie au milieu", True),
    'tissage-body-wave': ("Longue chevelure body wave noire, mains dans les cheveux", True),
    'tissage-rouge': ("Longueur rouge bordeaux aux pointes travaillées, à l'institut", False),
    'pose-chocolat': ("Longues ondulations brun chocolat, raie au milieu", False),
    'ponytail-demi-tete': ("Ponytail demi-tête : dessus attaché, longueur bouclée lâchée", True),
    'ponytail-chignon': ("Ponytail haute nouée en chignon, cheveux parfaitement plaqués", False),
    'nattes-ondulees': ("Chevelure ondulée avec nattes fines sur le côté", True),
    'shooting': ("Longue chevelure brune ondulée lors d'un shooting en extérieur", True),
    'longue-ondulee': ("Très longue chevelure noire ondulée", True),
}

# Galerie : filtres par allure (ce que l'on voit sur la photo)
GALERIE = [
    ('pose-body-wave', 'ondule'), ('confection-meche', 'couleur'), ('pose-lisse', 'lisse'),
    ('ponytail-demi-tete', 'attache'), ('tissage-rouge', 'couleur'), ('pose-ondulee', 'ondule'),
    ('lace-frontal', 'lisse'), ('confection-ombre', 'couleur'), ('ponytail-chignon', 'attache'),
    ('tissage-body-wave', 'ondule'), ('confection-carre', 'lisse'), ('pose-glamour', 'ondule'),
    ('tissage-lisse', 'lisse'), ('nattes-ondulees', 'ondule'), ('pose-chocolat', 'ondule'),
    ('shooting', 'couleur'), ('pose-lisse-raie', 'lisse'), ('confection-boucles', 'ondule'),
    ('tissage-boucle', 'ondule'), ('longue-ondulee', 'ondule'),
]
FILTRES = [('tout', 'Tout'), ('lisse', 'Lisse'), ('ondule', 'Ondulé & bouclé'), ('couleur', 'Couleurs'),
           ('attache', 'Attaché')]
