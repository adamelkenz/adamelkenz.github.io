#!/usr/bin/env python3
"""Génère le site Serrurier Vaucluse : page d'accueil (département), une page par ville,
sitemap.xml et robots.txt.

Usage (depuis le dossier serrurier-vaucluse/) :
    python3 _outils/generer.py

Les blocs HTML communs sont dans _outils/blocs/. Les textes propres à chaque ville sont
dans VILLES ci-dessous. Après une modification, relancer le script : toutes les pages
sont réécrites. Ne pas modifier les fichiers générés à la main.
"""
import html
import json
import math
import os
from datetime import date

# ---------------------------------------------------------------- Réglages
SITE = 'https://www.serrurier-vaucluse.fr/'   # adresse définitive du site (canonical, sitemap)
NOM = 'Serrurier Vaucluse'
TEL = '06 68 88 51 51'
TEL_HREF = 'tel:+33668885151'
TEL_INTL = '+33668885151'
EMAIL = 'contact@serrurier-vaucluse.fr'      # À VÉRIFIER
AVIGNON = (43.9493, 4.8055)

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(ICI)
BLOCS = os.path.join(ICI, 'blocs')

# ---------------------------------------------------------------- Réalisations
# Photos dans img/realisations/ (version 900 px + vignette -480). Pour une vidéo, ajouter
# 'video': 'video/nom.mp4' (le fichier 'photo' sert alors d'affiche).
REALISATIONS = [
    {'photo': 'ouverture-porte-serrure-applique-vaucluse', 'titre': 'Ouverture de porte palière', 'tag': 'Ouverture fine',
     'alt': "Serrure en applique en laiton sur une porte palière, ouverture fine en cours par le cylindre"},
    {'photo': 'remplacement-boitier-serrure-multipoints-vaucluse', 'titre': "Remplacement d'un boîtier de serrure", 'tag': 'Serrure',
     'alt': "Boîtier de serrure à larder neuf posé à côté de l'ancien boîtier endommagé"},
    {'photo': 'ouverture-porte-appartement-vaucluse', 'titre': "Porte d'appartement ouverte", 'tag': 'Ouverture de porte',
     'alt': "Porte d'appartement ouverte sur le palier d'un immeuble ancien, serrure et verrou intacts"},
    {'photo': 'changement-cylindre-porte-jardin-vaucluse', 'titre': 'Porte de jardin', 'tag': 'Changement de cylindre',
     'alt': "Porte métallique donnant sur un jardin, nouveau cylindre posé et jeu de clés neuves"},
    {'photo': 'pose-serrure-applique-porte-ancienne-vaucluse', 'titre': 'Serrure en applique sur porte ancienne', 'tag': 'Pose de serrure',
     'alt': "Serrure en applique noire posée sur une porte intérieure ancienne, avec ses clés"},
]

# ---------------------------------------------------------------- Villes
# slug, nom, code postal, coordonnées, accroche, textes, secteurs, communes voisines, FAQ locale
VILLES = [
    {
        'slug': 'serrurier-avignon', 'nom': 'Avignon', 'a': 'à Avignon', 'cp': '84000', 'cp2': 'Montfavet 84140',
        'geo': (43.9493, 4.8055),
        'lead': "Porte claquée dans l'intra-muros, clé perdue à Montfavet ou serrure forcée à Saint-Ruf ? Notre serrurier part d'Avignon même et intervient dans tous les quartiers de la cité des Papes, de jour comme de nuit.",
        'intro': [
            "Avignon est notre point de départ : c'est d'ici que partent toutes nos interventions dans le Vaucluse. Que vous habitiez au pied du Palais des Papes, dans un immeuble des boulevards extérieurs ou dans une villa de Montfavet, un serrurier se déplace rapidement chez vous.",
            "Nous intervenons pour les particuliers, les propriétaires bailleurs, les syndics et les commerçants : ouverture de porte, changement de serrure ou de cylindre, blindage, mise en sécurité après effraction et dépannage de volets roulants.",
        ],
        'habitat': [
            "L'intra-muros concentre des immeubles anciens et des hôtels particuliers aux portes palières en bois massif, souvent équipées de serrures en applique ou de serrures à larder anciennes. Nous privilégions l'ouverture fine pour préserver ces portes d'époque.",
            "Pendant le Festival, en juillet, beaucoup de logements sont loués à la semaine : changer le cylindre entre deux locations est une précaution simple quand des doubles de clés circulent. Côté Montfavet, Agroparc et la Courtine, on trouve surtout des maisons, des résidences récentes et des locaux professionnels avec serrures multipoints.",
        ],
        'secteurs': ['Intra-muros', 'Saint-Ruf', 'Monclar', 'Champfleury', 'Saint-Chamand', 'La Croix-Rouge', 'Montfavet', 'Agroparc', 'Courtine', 'Île de la Barthelasse'],
        'voisines': ['Le Pontet', 'Vedène', 'Morières-lès-Avignon', 'Caumont-sur-Durance', 'Entraigues-sur-la-Sorgue'],
        'faq': [
            ("Je loue mon logement pendant le Festival d'Avignon : dois-je changer la serrure ?",
             "Pas forcément toute la serrure : si elle fonctionne bien, remplacer le cylindre suffit à rendre inutilisables les clés qui ont circulé. C'est une intervention rapide, sur devis, que nous pouvons programmer entre deux locations."),
            ("Pouvez-vous ouvrir une porte ancienne de l'intra-muros sans l'abîmer ?",
             "Oui, c'est notre priorité. Sur les portes en bois massif et les serrures en applique, nous utilisons des techniques d'ouverture fine qui évitent de percer ou de forcer la serrure dans la grande majorité des cas."),
        ],
    },
    {
        'slug': 'serrurier-le-pontet', 'nom': 'Le Pontet', 'a': 'au Pontet', 'cp': '84130', 'geo': (43.9617, 4.8606),
        'lead': "Clé cassée, porte claquée ou serrure bloquée au Pontet ? Aux portes d'Avignon, notre serrurier intervient rapidement chez vous comme dans les commerces de la zone Avignon Nord.",
        'intro': [
            "Le Pontet touche Avignon : c'est l'une des communes où nous intervenons le plus souvent. Appartements, maisons ou locaux professionnels, nous prenons en charge l'ouverture de porte, le changement de serrure et la sécurisation de votre accès.",
            "Le prix est annoncé au téléphone avant le déplacement, et une facture détaillée vous est remise à la fin de l'intervention.",
        ],
        'habitat': [
            "La commune mêle résidences, lotissements pavillonnaires et grands espaces commerciaux autour de la zone Avignon Nord. Les portes d'entrée récentes sont souvent équipées de serrures multipoints, dont le cylindre peut être remplacé sans changer toute la serrure.",
            "Pour les commerces et bureaux, nous intervenons aussi en dehors des heures d'ouverture pour changer un cylindre ou sécuriser une porte après une tentative d'effraction.",
        ],
        'secteurs': ['Centre-ville', 'Quartiers pavillonnaires', 'Résidences', 'Zone Avignon Nord'],
        'voisines': ['Avignon', 'Vedène', 'Sorgues', 'Entraigues-sur-la-Sorgue', 'Morières-lès-Avignon'],
        'faq': [
            ("Intervenez-vous dans les commerces de la zone Avignon Nord ?",
             "Oui. Nous intervenons chez les particuliers comme chez les professionnels : ouverture, changement de cylindre, réparation de serrure ou mise en sécurité provisoire après une effraction."),
        ],
    },
    {
        'slug': 'serrurier-sorgues', 'nom': 'Sorgues', 'a': 'à Sorgues', 'cp': '84700', 'geo': (44.0083, 4.8728),
        'lead': "Porte fermée à clé, clé perdue ou serrure qui ne tourne plus à Sorgues ? Entre Avignon et Orange, un serrurier se déplace rapidement chez vous, 24h/24 et 7j/7.",
        'intro': [
            "Sorgues est à quelques minutes d'Avignon par la nationale 7 : nous y intervenons régulièrement pour des ouvertures de porte, des changements de serrure et des réparations après effraction.",
            "Nos tarifs sont les mêmes que dans tout le Vaucluse et vous sont communiqués avant le déplacement.",
        ],
        'habitat': [
            "La ville compte un centre ancien, de nombreux quartiers pavillonnaires et des zones d'activités. Dans les maisons individuelles, nous intervenons souvent sur les portes d'entrée, les portes de garage et les portillons de jardin équipés de cylindres.",
            "Après un cambriolage, nous assurons la mise en sécurité provisoire de la porte puis le remplacement de la serrure endommagée.",
        ],
        'secteurs': ['Centre-ville', 'Quartiers pavillonnaires', "Zones d'activités", 'Campagne sorguaise'],
        'voisines': ['Bédarrides', 'Entraigues-sur-la-Sorgue', 'Le Pontet', 'Vedène', 'Châteauneuf-du-Pape'],
        'faq': [],
    },
    {
        'slug': 'serrurier-carpentras', 'nom': 'Carpentras', 'a': 'à Carpentras', 'cp': '84200', 'geo': (44.0556, 5.0481),
        'lead': "Porte claquée dans le centre ancien, clé cassée dans la serrure ou effraction à Carpentras ? Notre serrurier intervient dans toute la capitale du Comtat Venaissin et ses environs.",
        'intro': [
            "De la cathédrale Saint-Siffrein à la Porte d'Orange, des ruelles du centre ancien aux quartiers résidentiels, nous intervenons dans tout Carpentras pour l'ouverture de porte, le remplacement de serrure et la sécurisation de votre logement.",
            "Le tarif est annoncé avant de partir et confirmé sur place avant de commencer : pas de surprise sur la facture.",
        ],
        'habitat': [
            "Le centre ancien, à l'intérieur des boulevards, compte beaucoup de maisons de ville et d'immeubles anciens aux portes en bois, parfois avec des serrures d'origine qui se grippent avec le temps. Nous les réparons ou les remplaçons par des modèles adaptés à la porte.",
            "Autour, les lotissements et les mas de la plaine comtadine sont plutôt équipés de serrures multipoints et de portails : changement de cylindre, réglage de serrure et blindage de porte font partie de nos interventions courantes.",
        ],
        'secteurs': ['Centre ancien', 'Boulevards', 'Quartiers résidentiels', 'Serres', 'Mas et campagne'],
        'voisines': ['Monteux', 'Pernes-les-Fontaines', 'Mazan', 'Aubignan', 'Loriol-du-Comtat'],
        'faq': [
            ("Intervenez-vous le vendredi matin, jour de marché, dans le centre de Carpentras ?",
             "Oui. Le marché complique un peu l'accès au centre, mais nous intervenons tous les jours de la semaine, y compris le vendredi, le week-end et les jours fériés."),
        ],
    },
    {
        'slug': 'serrurier-monteux', 'nom': 'Monteux', 'a': 'à Monteux', 'cp': '84170', 'geo': (44.0361, 4.9967),
        'lead': "Serrure bloquée, porte claquée ou clé perdue à Monteux ? Entre Avignon et Carpentras, un serrurier se déplace rapidement chez vous, 7j/7.",
        'intro': [
            "Monteux se trouve entre Avignon et Carpentras, sur notre trajet quotidien : nous y intervenons rapidement pour l'ouverture de porte, le changement de serrure ou de cylindre et la sécurisation des accès.",
            "Le prix est annoncé au téléphone et une facture détaillée est remise après l'intervention.",
        ],
        'habitat': [
            "Ville en plein développement autour de son lac et du parc Spirou, Monteux compte de nombreux quartiers récents et maisons individuelles, ainsi qu'un centre ancien. Les serrures multipoints des portes récentes se dépannent souvent sans changer toute la serrure : un cylindre neuf suffit si les clés ont été perdues.",
            "Nous intervenons aussi sur les portillons, portes de garage et volets roulants bloqués.",
        ],
        'secteurs': ['Centre ancien', 'Quartiers du lac', 'Lotissements récents', "Zones d'activités"],
        'voisines': ['Carpentras', 'Althen-des-Paluds', 'Sarrians', 'Entraigues-sur-la-Sorgue', 'Pernes-les-Fontaines'],
        'faq': [],
    },
    {
        'slug': 'serrurier-pernes-les-fontaines', 'nom': 'Pernes-les-Fontaines', 'a': 'à Pernes-les-Fontaines', 'cp': '84210',
        'geo': (43.9986, 5.0592),
        'lead': "Porte claquée, serrure grippée ou clé perdue à Pernes-les-Fontaines ? Notre serrurier intervient dans le village et ses hameaux, 24h/24 et 7j/7.",
        'intro': [
            "Dans la ville aux quarante fontaines, nous intervenons aussi bien dans les maisons de village du centre que dans les villas et les mas des alentours : ouverture de porte, remplacement de serrure, blindage et volets roulants.",
            "Les tarifs sont annoncés avant le déplacement et identiques dans tout le Vaucluse.",
        ],
        'habitat': [
            "Le centre historique, autour de la tour Ferrande et des portes de la ville, compte de nombreuses portes anciennes en bois avec serrures en applique ou serrures à larder. Nous les ouvrons en douceur et les réparons quand c'est possible.",
            "En périphérie, les maisons individuelles sont équipées de serrures multipoints et de portails : changement de cylindre et réglage de serrure sont nos interventions les plus fréquentes.",
        ],
        'secteurs': ['Centre historique', 'Hameaux', 'Quartiers résidentiels', 'Mas et campagne'],
        'voisines': ['Carpentras', 'Velleron', 'Saint-Didier', 'Monteux', "L'Isle-sur-la-Sorgue"],
        'faq': [],
    },
    {
        'slug': 'serrurier-orange', 'nom': 'Orange', 'a': 'à Orange', 'cp': '84100', 'geo': (44.1381, 4.8075),
        'lead': "Porte claquée près du théâtre antique, clé perdue ou serrure forcée à Orange ? Notre serrurier intervient dans toute la ville et le Haut-Vaucluse, de jour comme de nuit.",
        'intro': [
            "Du centre historique, entre le théâtre antique et l'arc de triomphe, jusqu'aux quartiers résidentiels et aux zones d'activités, nous intervenons dans tout Orange : ouverture de porte, changement de serrure, blindage et réparation après effraction.",
            "Le tarif vous est communiqué avant de partir. Une facture détaillée vous est remise, utile pour votre assurance habitation.",
        ],
        'habitat': [
            "Le cœur de ville compte des immeubles anciens et des maisons de ville aux portes en bois, tandis que les quartiers périphériques regroupent maisons individuelles et résidences avec serrures multipoints.",
            "L'été, pendant les Chorégies, de nombreux logements sont loués ponctuellement : changer le cylindre après une période de location est une précaution simple et peu coûteuse.",
        ],
        'secteurs': ['Centre historique', 'Colline Saint-Eutrope', 'Quartiers résidentiels', "Zones d'activités"],
        'voisines': ['Courthézon', 'Jonquières', 'Camaret-sur-Aigues', 'Piolenc', 'Caderousse'],
        'faq': [],
    },
    {
        'slug': 'serrurier-bollene', 'nom': 'Bollène', 'a': 'à Bollène', 'cp': '84500', 'geo': (44.2803, 4.7489),
        'lead': "Serrure bloquée, porte claquée ou effraction à Bollène ? Au nord du Vaucluse, notre serrurier se déplace chez vous 24h/24 et 7j/7.",
        'intro': [
            "Bollène est la porte nord du Vaucluse, le long du Rhône. Nous y intervenons pour l'ouverture de porte, le remplacement de serrure ou de cylindre, le blindage et la mise en sécurité après cambriolage.",
            "Comme partout dans le département, le prix est annoncé au téléphone avant le déplacement.",
        ],
        'habitat': [
            "Entre le centre ancien perché, les quartiers pavillonnaires et les résidences, les besoins sont variés : portes anciennes à réparer, serrures multipoints à dépanner, cylindres à changer après une perte de clés.",
            "Pour les logements en location, nous intervenons à la demande des propriétaires comme des locataires, avec facture au nom de la personne qui règle l'intervention.",
        ],
        'secteurs': ['Centre ancien', 'Quartiers pavillonnaires', 'Résidences', 'Hameaux'],
        'voisines': ['Mondragon', 'Lapalud', 'Mornas', 'Lamotte-du-Rhône', 'Sainte-Cécile-les-Vignes'],
        'faq': [],
    },
    {
        'slug': 'serrurier-vaison-la-romaine', 'nom': 'Vaison-la-Romaine', 'a': 'à Vaison-la-Romaine', 'cp': '84110',
        'geo': (44.2408, 5.0742),
        'lead': "Porte claquée dans la haute ville, clé perdue ou serrure ancienne bloquée à Vaison-la-Romaine ? Au pied du Ventoux, notre serrurier intervient chez vous 7j/7.",
        'intro': [
            "De la haute ville médiévale aux quartiers de la ville basse, autour des sites antiques et du pont romain, nous intervenons à Vaison-la-Romaine et dans les villages voisins pour tous vos besoins en serrurerie.",
            "Le déplacement est inclus dans nos tarifs, annoncés avant de partir.",
        ],
        'habitat': [
            "La haute ville compte de nombreuses maisons anciennes aux portes épaisses et aux serrures d'origine : nous privilégions toujours l'ouverture fine et la réparation plutôt que le remplacement.",
            "Beaucoup de résidences secondaires et de gîtes entourent Vaison : nous changeons les cylindres entre deux saisons et sécurisons les portes des maisons inoccupées une partie de l'année.",
        ],
        'secteurs': ['Haute ville', 'Ville basse', 'Quartiers résidentiels', 'Hameaux et campagne'],
        'voisines': ['Séguret', 'Roaix', 'Entrechaux', 'Malaucène', 'Puymeras'],
        'faq': [
            ("J'ai une résidence secondaire près de Vaison : pouvez-vous intervenir en mon absence ?",
             "Oui, si une personne de confiance peut nous ouvrir l'accès ou nous remettre les clés. Nous vous communiquons le tarif au téléphone, puis vous recevez la facture détaillée et des photos de l'intervention."),
        ],
    },
    {
        'slug': 'serrurier-valreas', 'nom': 'Valréas', 'a': 'à Valréas', 'cp': '84600', 'geo': (44.3847, 4.9908),
        'lead': "Porte claquée, clé cassée ou serrure forcée à Valréas ? Dans l'Enclave des Papes, notre serrurier intervient chez vous 24h/24 et 7j/7.",
        'intro': [
            "Valréas, capitale de l'Enclave des Papes, fait partie de notre zone d'intervention comme tout le Vaucluse. Ouverture de porte, changement de serrure, blindage, dépannage de volets roulants : nous nous déplaçons aussi à Grillon, Visan et Richerenches.",
            "Le prix est annoncé avant le déplacement, sans frais cachés.",
        ],
        'habitat': [
            "Le centre ancien, organisé en cercle autour de l'église et du château, compte de nombreuses maisons de ville aux portes anciennes. Autour, maisons individuelles et fermes sont plutôt équipées de serrures multipoints et de portails.",
            "Nous intervenons aussi dans les anciens ateliers et locaux professionnels pour sécuriser les accès.",
        ],
        'secteurs': ['Centre ancien', 'Faubourgs', 'Quartiers résidentiels', 'Campagne'],
        'voisines': ['Grillon', 'Visan', 'Richerenches'],
        'faq': [],
    },
    {
        'slug': 'serrurier-cavaillon', 'nom': 'Cavaillon', 'a': 'à Cavaillon', 'cp': '84300', 'geo': (43.8375, 5.0381),
        'lead': "Porte claquée, serrure bloquée ou effraction à Cavaillon ? Au pied du Luberon, notre serrurier intervient chez les particuliers et les professionnels, 7j/7.",
        'intro': [
            "Du centre-ville au pied de la colline Saint-Jacques jusqu'aux zones d'activités et aux mas de la plaine, nous intervenons dans tout Cavaillon pour l'ouverture de porte, le changement de serrure et la sécurisation après effraction.",
            "Le tarif est annoncé au téléphone avant de partir, puis confirmé sur place.",
        ],
        'habitat': [
            "Cavaillon compte un centre ancien avec maisons de ville et immeubles, de nombreux quartiers pavillonnaires et une importante activité agricole et commerciale. Nous intervenons aussi bien sur une porte d'appartement que sur la porte d'un local ou d'un entrepôt.",
            "Après une effraction, nous posons une fermeture provisoire puis remplaçons la serrure ou le boîtier endommagé.",
        ],
        'secteurs': ['Centre-ville', 'Colline Saint-Jacques', 'Quartiers pavillonnaires', "Zones d'activités", 'Les Vignères'],
        'voisines': ['Cheval-Blanc', 'Robion', 'Les Taillades', 'Caumont-sur-Durance', "L'Isle-sur-la-Sorgue"],
        'faq': [],
    },
    {
        'slug': 'serrurier-l-isle-sur-la-sorgue', 'nom': "L'Isle-sur-la-Sorgue", 'a': "à L'Isle-sur-la-Sorgue", 'cp': '84800',
        'geo': (43.9194, 5.0514),
        'lead': "Porte claquée, clé perdue ou serrure forcée à L'Isle-sur-la-Sorgue ? Notre serrurier intervient chez vous comme dans les boutiques du centre, 24h/24 et 7j/7.",
        'intro': [
            "Entre les bras de la Sorgue et ses roues à aubes, nous intervenons dans toute la ville et ses hameaux : ouverture de porte, changement de serrure ou de cylindre, blindage et réparation après effraction.",
            "Les tarifs sont annoncés avant le déplacement, déplacement inclus.",
        ],
        'habitat': [
            "Le centre compte de nombreuses maisons de ville et boutiques, notamment d'antiquaires, avec des portes anciennes à préserver. Nous privilégions l'ouverture fine et proposons des cylindres plus résistants pour les commerces.",
            "Autour, les villas, mas et locations saisonnières sont fréquents : changement de cylindre entre deux locations et sécurisation des maisons inoccupées font partie de nos interventions courantes.",
        ],
        'secteurs': ['Centre-ville', 'Bords de Sorgue', 'Velorgues', 'Quartiers résidentiels', 'Mas et campagne'],
        'voisines': ['Le Thor', 'Fontaine-de-Vaucluse', 'Saumane-de-Vaucluse', 'Lagnes', 'Châteauneuf-de-Gadagne'],
        'faq': [
            ("Intervenez-vous pour les boutiques et antiquaires de L'Isle-sur-la-Sorgue ?",
             "Oui : ouverture, changement de cylindre, réparation de serrure et mise en sécurité après une tentative d'effraction. Nous pouvons intervenir en dehors des heures d'ouverture pour ne pas gêner votre activité."),
        ],
    },
    {
        'slug': 'serrurier-apt', 'nom': 'Apt', 'a': 'à Apt', 'cp': '84400', 'geo': (43.8764, 5.3964),
        'lead': "Porte claquée, serrure bloquée ou clé perdue à Apt ? Au cœur du Luberon, notre serrurier intervient dans la ville et les villages alentour, 7j/7.",
        'intro': [
            "Capitale du Luberon, Apt fait partie de notre zone d'intervention comme tout le Vaucluse. Nous nous déplaçons dans le centre ancien comme dans les villages voisins pour l'ouverture de porte, le changement de serrure, le blindage et les volets roulants.",
            "Le prix est annoncé avant de partir : vous savez à l'avance ce que vous paierez.",
        ],
        'habitat': [
            "Le centre ancien d'Apt, autour de la cathédrale Sainte-Anne, compte de nombreuses maisons de ville aux portes anciennes. Dans la campagne, les mas et bastides sont souvent des résidences secondaires, inoccupées une partie de l'année.",
            "Pour ces maisons, nous vérifions et remplaçons les cylindres avant ou après la saison, et renforçons les portes les plus exposées (blindage, poignée anti-effraction).",
        ],
        'secteurs': ['Centre ancien', 'Quartiers résidentiels', 'Mas et bastides', 'Villages du Luberon'],
        'voisines': ['Gargas', 'Saignon', 'Roussillon', 'Rustrel', 'Bonnieux'],
        'faq': [],
    },
    {
        'slug': 'serrurier-pertuis', 'nom': 'Pertuis', 'a': 'à Pertuis', 'cp': '84120', 'geo': (43.6942, 5.5017),
        'lead': "Porte claquée, serrure forcée ou clé cassée à Pertuis ? Dans le sud Luberon, notre serrurier intervient chez vous 24h/24 et 7j/7.",
        'intro': [
            "Pertuis est la principale ville du sud Luberon et du pays d'Aigues, au bord de la Durance. Nous y intervenons pour l'ouverture de porte, le changement de serrure ou de cylindre, le blindage et la réparation après effraction.",
            "Les tarifs sont les mêmes partout dans le Vaucluse et vous sont annoncés avant le déplacement.",
        ],
        'habitat': [
            "La ville mêle un centre ancien aux ruelles étroites, des quartiers pavillonnaires en pleine croissance et des zones d'activités. Les portes récentes sont équipées de serrures multipoints, dont nous remplaçons le cylindre après une perte de clés.",
            "Dans les villages du pays d'Aigues, nous intervenons aussi sur les portes anciennes, les portails et les volets roulants.",
        ],
        'secteurs': ['Centre ancien', 'Quartiers pavillonnaires', "Zones d'activités", "Villages du pays d'Aigues"],
        'voisines': ["La Tour-d'Aigues", 'Villelaure', 'Ansouis', 'Cadenet', 'Mirabeau'],
        'faq': [],
    },
]

# ---------------------------------------------------------------- FAQ générale
FAQ_GENERALE = [
    ("Combien coûte une ouverture de porte ?",
     "Une ouverture de porte claquée coûte 90 € TTC avant 18h. Une porte fermée à clé coûte 130 € TTC avant 18h. Des majorations s'appliquent après 18h, après 22h, le week-end et les jours fériés (voir notre grille tarifaire). Le déplacement est inclus."),
    ("Quelle différence entre porte claquée et porte verrouillée ?",
     "Une porte claquée est simplement fermée sans tour de clé : seul le pêne demi-tour la retient. Une porte verrouillée a été fermée à clé, ce qui demande une technique d'ouverture plus longue."),
    ("Intervenez-vous la nuit et le week-end ?",
     "Oui, nous intervenons 24h/24 et 7j/7, y compris les jours fériés, dans tout le Vaucluse."),
    ("Le prix est-il annoncé avant l'intervention ?",
     "Oui. Le tarif vous est communiqué au téléphone avant tout déplacement, et confirmé sur place avant de commencer."),
    ("Faut-il changer toute la serrure ou seulement le cylindre ?",
     "Si vos clés ont été perdues ou volées et que la serrure fonctionne bien, remplacer le cylindre (la partie où entre la clé) suffit. Si la serrure a été forcée, percée ou si son mécanisme est usé, il faut remplacer le boîtier de serrure. Nous vous conseillons sur place, devis à l'appui."),
    ("Que faire après une effraction ou un cambriolage ?",
     "Ne touchez à rien et portez plainte au commissariat ou à la gendarmerie. Déclarez ensuite le sinistre à votre assureur dans les délais prévus par votre contrat (deux jours ouvrés en cas de vol). Nous assurons la mise en sécurité provisoire de la porte, puis la réparation ou le remplacement de la serrure, avec une facture détaillée pour votre assurance."),
    ("Comment éviter les arnaques au dépannage ?",
     "Méfiez-vous des numéros sans nom ni adresse et des prix qui ne sont pas annoncés au téléphone. La réglementation (arrêté du 24 janvier 2017) oblige le professionnel à vous informer de ses tarifs avant l'intervention et à vous remettre un devis détaillé avant les travaux au-delà d'un certain montant. Chez nous, le prix est annoncé avant le déplacement et la facture est systématique."),
    ("Mon assurance peut-elle prendre en charge l'intervention ?",
     "Selon votre contrat, certaines interventions (notamment après effraction) peuvent être prises en charge. Nous vous remettons une facture détaillée à transmettre à votre assureur."),
]

# ---------------------------------------------------------------- Outils
def e(texte):
    """Échappe le HTML (guillemets doubles compris) en gardant les apostrophes lisibles."""
    return html.escape(texte, quote=False).replace('"', '&quot;')



def km(a, b):
    r = math.pi / 180
    dlat, dlng = (b[0] - a[0]) * r, (b[1] - a[1]) * r
    h = math.sin(dlat / 2) ** 2 + math.cos(a[0] * r) * math.cos(b[0] * r) * math.sin(dlng / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


def bloc(nom):
    with open(os.path.join(BLOCS, nom + '.html'), encoding='utf-8') as f:
        return f.read()


def remplir(texte, valeurs):
    for k, v in valeurs.items():
        texte = texte.replace('{{' + k + '}}', v)
    assert '{{' not in texte, texte[texte.index('{{') - 80: texte.index('{{') + 80]
    return texte


PAR_NOM = {v['nom']: v for v in VILLES}


def lien_ville(nom, root):
    v = PAR_NOM.get(nom)
    return f'<a href="{root}{v["slug"]}/">{e(nom)}</a>' if v else e(nom)


def faq_html(items):
    return '\n'.join(
        f'        <details>\n          <summary>{e(q)}</summary>\n          <p>{e(r)}</p>\n        </details>' for q, r in items)


def faq_ld(items):
    return {'@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': r}} for q, r in items]}


def entreprise_ld(zone):
    return {
        '@type': 'Locksmith', '@id': SITE + '#entreprise', 'name': NOM, 'url': SITE,
        'telephone': TEL_INTL, 'email': EMAIL,
        'image': SITE + 'img/realisations/' + REALISATIONS[0]['photo'] + '.jpg',
        'priceRange': '90 € - 290 €',
        'openingHoursSpecification': [{
            '@type': 'OpeningHoursSpecification',
            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            'opens': '00:00', 'closes': '23:59'}],
        'areaServed': zone,
        'makesOffer': [
            {'@type': 'Offer', 'name': 'Ouverture de porte claquée', 'price': '90', 'priceCurrency': 'EUR'},
            {'@type': 'Offer', 'name': 'Ouverture de porte verrouillée', 'price': '130', 'priceCurrency': 'EUR'},
            {'@type': 'Offer', 'name': 'Ouverture et changement de serrure de boîte aux lettres', 'price': '90', 'priceCurrency': 'EUR'},
        ],
    }


def realisations_html(root, lieu):
    items = []
    for r in REALISATIONS:
        base = f'{root}img/realisations/{r["photo"]}'
        video = f' data-video="{root}{r["video"]}"' if r.get('video') else ''
        cls = 'shot video' if r.get('video') else 'shot'
        items.append(f'''        <figure class="{cls}" data-full="{base}.jpg"{video}>
          <button type="button" class="shot-open" aria-label="Agrandir : {e(r["titre"])}"><img src="{base}-480.jpg" srcset="{base}-480.jpg 480w, {base}.jpg 900w" sizes="(max-width: 720px) 68vw, 220px" width="480" height="640" loading="lazy" decoding="async" alt="{e(r["alt"])}"></button>
          <figcaption><strong>{e(r["titre"])}</strong><span>{e(r["tag"])}</span></figcaption>
        </figure>''')
    return f'''  <!-- ========== RÉALISATIONS ========== -->
  <section id="realisations">
    <div class="container">
      <div class="section-head">
        <div class="mini" aria-hidden="true"><svg viewBox="0 0 100 100">
          <rect x="10" y="22" width="80" height="58" rx="10" fill="#121A33" stroke="#00D1FF" stroke-width="4"/>
          <rect x="36" y="12" width="28" height="12" rx="4" fill="#2B3A67" stroke="#00D1FF" stroke-width="3"/>
          <circle cx="50" cy="51" r="17" fill="#070B18" stroke="#8F7BFF" stroke-width="4"/>
          <circle class="q-dot" cx="50" cy="51" r="7" fill="#00D1FF"/>
          <circle class="ph-wave" cx="77" cy="34" r="4" fill="#D6F4FF"/>
        </svg></div>
        <span class="eyebrow">Nos réalisations</span>
        <h2>Nos dernières interventions {e(lieu)}</h2>
        <p>Ouvertures de porte, remplacements de serrure, changements de cylindre : quelques chantiers récents réalisés par notre serrurier. Touchez une photo pour l'agrandir.</p>
      </div>
      <div class="gallery">
{chr(10).join(items)}
      </div>
    </div>
  </section>
'''


def villes_html(root, courante=None):
    cartes = []
    for v in VILLES:
        cur = ' current" aria-current="page' if v['nom'] == courante else ''
        cartes.append(f'        <a class="city-card{cur}" href="{root}{v["slug"]}/"><strong>Serrurier {e(v["nom"])}<em>{v["cp"]}</em></strong>'
                      f'<span>{e(", ".join(v["secteurs"][:3]))}</span></a>')
    titre = "Nos villes d'intervention dans le Vaucluse" if not courante else 'Nous intervenons aussi dans ces villes du Vaucluse'
    return f'''  <!-- ========== VILLES ========== -->
  <section id="villes">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Serrurier dans le Vaucluse (84)</span>
        <h2>{titre}</h2>
        <p>Avignon, le Comtat Venaissin, le Haut-Vaucluse, l'Enclave des Papes et le Luberon : choisissez votre ville pour découvrir nos interventions près de chez vous.</p>
      </div>
      <div class="cities">
{chr(10).join(cartes)}
      </div>
    </div>
  </section>
'''


def local_html(v, root):
    dist = km(AVIGNON, v['geo'])
    paras = '\n'.join(f'          <p>{e(p)}</p>' for p in v['intro'])
    habitat = '\n'.join(f'          <p>{e(p)}</p>' for p in v['habitat'])
    secteurs = '\n'.join(f'            <li>{e(s)}</li>' for s in v['secteurs'])
    voisines = '\n'.join(f'            <li>{lien_ville(n, root)}</li>' for n in v['voisines'])
    cp = v['cp'] + (f' · {v["cp2"]}' if v.get('cp2') else '')
    depart = 'Notre base' if v['nom'] == 'Avignon' else f'≈ {dist:.0f} km d\'Avignon'.replace('.', ',')
    return f'''  <!-- ========== LOCAL ========== -->
  <section id="ville" class="alt">
    <div class="container local">
      <div class="prose">
        <div class="section-head" style="text-align:left;margin:0">
          <span class="eyebrow">Serrurier {e(v["a"])}</span>
          <h2>Votre serrurier {e(v["a"])} et alentours</h2>
        </div>
{paras}
          <h3>Les logements {e(v["a"])} et leurs serrures</h3>
{habitat}
          <h3>Nos interventions {e(v["a"])}</h3>
          <p>Ouverture de porte claquée ou verrouillée, clé cassée ou coincée, réparation et changement de serrure, remplacement de cylindre, pose de serrure multipoints, blindage de porte, poignée anti-effraction, réparation après effraction et dépannage de volets roulants. <a href="#tarifs">Voir nos tarifs</a> ou <a href="{TEL_HREF}">appeler le {TEL}</a>.</p>
      </div>
      <aside>
        <div class="card">
          <h3>En bref</h3>
          <ul class="facts">
            <li><span>Code postal</span><b>{e(cp)}</b></li>
            <li><span>Départ</span><b>{e(depart)}</b></li>
            <li><span>Disponibilité</span><b>24h/24 – 7j/7</b></li>
            <li><span>Porte claquée</span><b>dès 90 € TTC</b></li>
            <li><span>Porte verrouillée</span><b>dès 130 € TTC</b></li>
          </ul>
        </div>
        <div class="card">
          <h3>Secteurs desservis</h3>
          <ul class="chips">
{secteurs}
          </ul>
        </div>
        <div class="card">
          <h3>Communes voisines</h3>
          <ul class="chips">
{voisines}
          </ul>
        </div>
      </aside>
    </div>
  </section>
'''


def tete(titre, desc, url, root, ld, image):
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(titre)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#070B18">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="{NOM}">
<meta property="og:title" content="{e(titre)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="FR-84">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect width='24' height='24' rx='6' fill='%23121A33'/><g fill='none' stroke='%2300D1FF' stroke-width='2' stroke-linecap='round' transform='translate(2.4 2.4) scale(.8)'><circle cx='7.5' cy='15.5' r='5.5'/><path d='m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3'/></g></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}css/style.css">
<!-- Page générée par _outils/generer.py : modifier le script, pas ce fichier. -->
<script type="application/ld+json">
{json.dumps({'@context': 'https://schema.org', '@graph': ld}, ensure_ascii=False, indent=1)}
</script>
</head>
<body>
'''


def bas(root):
    return f'''
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script src="{root}js/lock3d.js"></script>
<script src="{root}js/booking.js"></script>
<script src="{root}js/site.js"></script>
<script src="{root}js/zones-map.js"></script>
</body>
</html>
'''


def page(root, valeurs, sections, titre, desc, url, ld):
    image = SITE + 'img/realisations/' + REALISATIONS[0]['photo'] + '.jpg'
    commun = {
        'ROOT': root, 'HOME': root or './', 'TEL': TEL, 'TEL_HREF': TEL_HREF, 'EMAIL': EMAIL,
        'PIED_VILLES': '\n'.join(f'          <li><a href="{root}{v["slug"]}/">Serrurier {e(v["nom"])}</a></li>' for v in VILLES),
    }
    commun.update(valeurs)
    corps = bloc('sprite') + '\n' + bloc('entete') + '\n<main>\n' + ''.join(sections) + '</main>\n\n' + bloc('pied')
    return tete(titre, desc, url, root, ld, image) + remplir(corps, commun) + bas(root)


def ecrire(chemin, texte):
    chemin = os.path.join(RACINE, chemin)
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, 'w', encoding='utf-8') as f:
        f.write(texte)


# ---------------------------------------------------------------- Génération
def accueil():
    zone = [{'@type': 'AdministrativeArea', 'name': 'Vaucluse'}] + [{'@type': 'City', 'name': v['nom']} for v in VILLES]
    ld = [entreprise_ld(zone), faq_ld(FAQ_GENERALE)]
    valeurs = {
        'FIL': '', 'HERO_BADGE': 'Serrurier disponible maintenant',
        'HERO_H1': 'Votre serrurier dans tout le Vaucluse<br><span>24h/24 – 7j/7</span>',
        'HERO_LEAD': "Porte claquée, clé perdue, serrure bloquée ou effraction ? Un serrurier se déplace rapidement chez vous à Avignon, Carpentras, Orange, Cavaillon et dans tout le 84.",
        'SERVICES_H2': 'Toutes vos interventions de serrurerie',
        'TARIFS_H2': "Des tarifs clairs, annoncés avant l'intervention",
        'POURQUOI_H2': 'Un serrurier local, réactif et transparent',
        'ZONES_H2': 'Nous intervenons dans tout le Vaucluse', 'FOCUS': '',
        'URGENCE_P': 'Appelez-nous, un serrurier part immédiatement vers vous.',
        'FAQ_H2': 'Vos questions sur la serrurerie dans le Vaucluse', 'FAQ_ITEMS': faq_html(FAQ_GENERALE),
        'CONTACT_H2': 'Demandez une intervention ou un devis', 'CONTACT_ZONE': 'Tout le Vaucluse (84)', 'VILLE_EX': 'Avignon',
    }
    sections = [bloc('hero'), bloc('services'), bloc('tarifs'), realisations_html('', 'dans le Vaucluse'), bloc('pourquoi'),
                bloc('fonctionnement'), bloc('zones'), villes_html(''), bloc('urgence'), bloc('faq'), bloc('contact')]
    ecrire('index.html', page('', valeurs, sections,
                              'Serrurier Vaucluse (84) – Dépannage 24h/24 à Avignon et dans tout le 84',
                              "Serrurier dans le Vaucluse : ouverture de porte dès 90 € TTC, changement de serrure, blindage, réparation après effraction. Intervention 24h/24 à Avignon, Carpentras, Orange, Cavaillon, Apt, Pertuis. ☎ " + TEL,
                              SITE, ld))


def ville(v):
    root = '../'
    url = f'{SITE}{v["slug"]}/'
    faq = v['faq'] + [
        (f"Combien coûte une ouverture de porte {v['a']} ?",
         f"Nos tarifs sont les mêmes {v['a']} que dans tout le Vaucluse, déplacement inclus : 90 € TTC pour une porte claquée et 130 € TTC pour une porte fermée à clé avant 18h. Des majorations s'appliquent après 18h, après 22h, le week-end et les jours fériés."),
        (f"Intervenez-vous autour de {v['nom']} ?",
         f"Oui. Nous intervenons {v['a']} ({v['cp']}) et dans les communes voisines comme {', '.join(v['voisines'][:-1])} et {v['voisines'][-1]}, ainsi que dans tout le département."),
    ] + [FAQ_GENERALE[i] for i in (1, 2, 4, 5)]
    zone = [{'@type': 'City', 'name': v['nom'], 'address': {'@type': 'PostalAddress', 'postalCode': v['cp'], 'addressLocality': v['nom'], 'addressRegion': 'Vaucluse', 'addressCountry': 'FR'}}]
    ld = [
        dict(entreprise_ld(zone)),
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Serrurier Vaucluse', 'item': SITE},
            {'@type': 'ListItem', 'position': 2, 'name': f'Serrurier {v["nom"]}', 'item': url}]},
        faq_ld(faq),
    ]
    fil = (f'        <nav class="crumbs" aria-label="Fil d\'Ariane"><ol><li><a href="../">Serrurier Vaucluse</a></li>'
           f'<li aria-current="page">Serrurier {e(v["nom"])}</li></ol></nav>\n')
    valeurs = {
        'FIL': fil, 'HERO_BADGE': f'Serrurier disponible {e(v["a"])} ({v["cp"]})',
        'HERO_H1': f'Serrurier {e(v["a"])}<br><span>24h/24 – 7j/7</span>',
        'HERO_LEAD': e(v['lead']),
        'SERVICES_H2': f'Vos interventions de serrurerie {e(v["a"])}',
        'TARIFS_H2': f'Nos tarifs {e(v["a"])}, annoncés avant l\'intervention',
        'POURQUOI_H2': f'Pourquoi nous appeler {e(v["a"])}',
        'ZONES_H2': f'{e(v["nom"])} et tout le Vaucluse', 'FOCUS': e(v['nom']),
        'URGENCE_P': f'Appelez-nous, un serrurier part immédiatement vers {e(v["nom"])}.',
        'FAQ_H2': f'Questions fréquentes : serrurier {e(v["a"])}', 'FAQ_ITEMS': faq_html(faq),
        'CONTACT_H2': f'Demandez un serrurier {e(v["a"])}', 'CONTACT_ZONE': f'{e(v["nom"])} ({v["cp"]}) et tout le Vaucluse',
        'VILLE_EX': e(v['nom']),
    }
    sections = [bloc('hero'), local_html(v, root), bloc('services'), bloc('tarifs'), realisations_html(root, 'dans le Vaucluse'),
                bloc('pourquoi'), bloc('fonctionnement'), bloc('zones'), bloc('urgence'), bloc('faq'), villes_html(root, v['nom']),
                bloc('contact')]
    titre = f'Serrurier {v["nom"]} ({v["cp"]}) – Dépannage 24h/24 dès 90 €'
    desc = (f"Serrurier {v['a']} ({v['cp']}) : ouverture de porte dès 90 € TTC, changement de serrure et de cylindre, blindage, "
            f"réparation après effraction. Prix annoncé avant le déplacement, 24h/24 et 7j/7. ☎ {TEL}")
    ecrire(f'{v["slug"]}/index.html', page(root, valeurs, sections, titre, desc, url, ld))


def plan():
    jour = date.today().isoformat()
    urls = [SITE] + [f'{SITE}{v["slug"]}/' for v in VILLES]
    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for i, u in enumerate(urls):
        xml.append(f'  <url><loc>{u}</loc><lastmod>{jour}</lastmod><priority>{"1.0" if i == 0 else "0.8"}</priority></url>')
    xml.append('</urlset>')
    ecrire('sitemap.xml', '\n'.join(xml) + '\n')
    ecrire('robots.txt', f'User-agent: *\nAllow: /\nDisallow: /_outils/\n\nSitemap: {SITE}sitemap.xml\n')


if __name__ == '__main__':
    accueil()
    for v in VILLES:
        ville(v)
    plan()
    print(f'{1 + len(VILLES)} pages générées, sitemap.xml et robots.txt à jour.')
