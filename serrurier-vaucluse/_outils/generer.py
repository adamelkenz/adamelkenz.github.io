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

from conseils import ARTICLES, DATE as DATE_CONSEILS

# ---------------------------------------------------------------- Réglages
# Adresse publique du site (canonical, sitemap, partages). Quand le nom de domaine sera relié,
# remplacer par exemple par 'https://www.serrurier-vaucluse.fr/' puis relancer le script.
SITE = 'https://serrurier-vaucluse.fr/'
NOM = 'Serrurier Vaucluse'
TEL = '06 68 88 51 51'
TEL_HREF = 'tel:+33668885151'
TEL_INTL = '+33668885151'
EMAIL = 'contact@serrurier-vaucluse.fr'      # À VÉRIFIER
# Prise de rendez-vous dans le Google Agenda du client : URL de l'application web Apps Script
# (voir _outils/google-apps-script/INSTALLATION.md). Vide = le formulaire propose d'appeler ou d'envoyer un SMS.
AGENDA_URL = ''
# Code de vérification Google Search Console (balise HTML) : coller ici la valeur de content="..."
# fournie par Search Console, puis relancer le script. Vide = pas de balise.
GOOGLE_VERIFICATION = 'pIzGQQdSCMajAjUnPoYwvMJr5KDuuZQH1yya1rsGRVw'
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
        'voisines': ['Le Pontet', 'Villeneuve-lès-Avignon', 'Les Angles', 'Vedène', 'Morières-lès-Avignon', 'Entraigues-sur-la-Sorgue', 'Caumont-sur-Durance'],
        'titre': 'Serrurier Avignon (84000) – Urgence 24h/24, dès 90 €',
        'desc': "Serrurier à Avignon 24h/24 : intra-muros, Montfavet, Saint-Chamand… Ouverture de porte dès 90 € TTC, prix annoncé avant. ☎ " + TEL,
        'faq': [
            ("Je loue mon logement pendant le Festival d'Avignon : dois-je changer la serrure ?",
             "Pas forcément toute la serrure : si elle fonctionne bien, remplacer le cylindre suffit à rendre inutilisables les clés qui ont circulé. C'est une intervention rapide, sur devis, que nous pouvons programmer entre deux locations."),
            ("Pouvez-vous ouvrir une porte ancienne de l'intra-muros sans l'abîmer ?",
             "Oui, c'est notre priorité. Sur les portes en bois massif et les serrures en applique, nous utilisons des techniques d'ouverture fine qui évitent de percer ou de forcer la serrure dans la grande majorité des cas."),
            ("En combien de temps un serrurier peut-il arriver chez moi à Avignon ?",
             "Avignon est notre point de départ : c'est là que nous arrivons le plus vite. L'heure d'arrivée estimée vous est donnée au téléphone selon votre quartier et l'heure de la journée, les boulevards et l'intra-muros étant plus longs à rejoindre aux heures de pointe."),
            ("Comment trouver un serrurier pas cher à Avignon ?",
             "Demandez toujours le prix total au téléphone, déplacement compris, avant que le serrurier ne parte. Chez nous, une porte claquée coûte 90 € TTC avant 18h et une porte fermée à clé 130 € TTC, sans frais de déplacement ni de diagnostic ajoutés sur place."),
            ("Intervenez-vous dans le centre d'Avignon, à l'intérieur des remparts ?",
             "Oui, dans tout l'intra-muros, y compris les rues piétonnes : le serrurier se gare au plus près puis termine à pied avec son matériel. Indiquez-nous simplement le code ou l'interphone de l'immeuble."),
        ],
    },
    {
        'slug': 'serrurier-villeneuve-les-avignon', 'nom': 'Villeneuve-lès-Avignon', 'a': 'à Villeneuve-lès-Avignon', 'cp': '30400',
        'dep': 'Gard', 'geo': (43.9664, 4.7967),
        'lead': "Porte claquée au pied du fort Saint-André, clé perdue ou serrure forcée à Villeneuve-lès-Avignon ? Juste de l'autre côté du Rhône, notre serrurier part d'Avignon et arrive vite chez vous, 24h/24.",
        'intro': [
            "Villeneuve-lès-Avignon fait face à Avignon, de l'autre côté du Rhône : il suffit de traverser le pont pour être chez vous. La commune est dans le Gard, mais elle fait partie de notre secteur quotidien, au même titre que les quartiers d'Avignon.",
            "Ouverture de porte, changement de serrure ou de cylindre, blindage, réparation après effraction : le prix est le même qu'à Avignon et vous est annoncé au téléphone avant le déplacement.",
        ],
        'habitat': [
            "Le centre historique, entre la Chartreuse du Val de Bénédiction, la collégiale et le fort Saint-André, compte de nombreuses maisons anciennes aux portes en bois massif et aux serrures d'origine. Nous privilégions l'ouverture fine et la réparation pour préserver ces portes.",
            "Sur les hauteurs et en direction des Angles, les villas et résidences récentes sont équipées de serrures multipoints et de portails : changement de cylindre après une perte de clés et réglage de serrure sont nos interventions les plus fréquentes.",
        ],
        'secteurs': ['Centre historique', 'Fort Saint-André', 'Chartreuse', 'Bords du Rhône', 'Quartiers résidentiels'],
        'voisines': ['Avignon', 'Les Angles', 'Pujaut', 'Sauveterre', 'Rochefort-du-Gard'],
        'faq': [
            ("Intervenez-vous à Villeneuve-lès-Avignon alors que la commune est dans le Gard ?",
             "Oui. Villeneuve-lès-Avignon est juste en face d'Avignon, d'où partent nos interventions : nous y venons aussi souvent que dans les quartiers d'Avignon, aux mêmes tarifs, déplacement inclus."),
        ],
    },
    {
        'slug': 'serrurier-les-angles', 'nom': 'Les Angles', 'a': 'aux Angles', 'cp': '30133', 'dep': 'Gard', 'geo': (43.9547, 4.7631),
        'lead': "Porte claquée, clé cassée ou serrure bloquée aux Angles ? Sur le plateau qui domine Avignon, notre serrurier intervient chez vous comme dans les commerces, 24h/24 et 7j/7.",
        'intro': [
            "Les Angles surplombe Avignon, de l'autre côté du Rhône, à côté de Villeneuve-lès-Avignon. La commune est dans le Gard mais à quelques minutes de notre point de départ : nous y intervenons très régulièrement.",
            "Nos tarifs sont identiques à ceux d'Avignon, déplacement inclus, et vous sont communiqués avant que le serrurier ne parte.",
        ],
        'habitat': [
            "La commune est surtout résidentielle : villas, lotissements et petites résidences, souvent équipés de portes à serrure multipoints, de portails et de portes de garage. Après une perte de clés, remplacer le cylindre suffit dans la plupart des cas.",
            "Autour de la zone commerciale, nous intervenons aussi pour les commerces et les bureaux : ouverture, changement de cylindre et mise en sécurité après une tentative d'effraction.",
        ],
        'secteurs': ['Village', 'Quartiers résidentiels', 'Lotissements', 'Zone commerciale'],
        'voisines': ['Villeneuve-lès-Avignon', 'Avignon', 'Rochefort-du-Gard', 'Pujaut', 'Saze'],
        'faq': [
            ("Intervenez-vous aux Angles alors que la commune est dans le Gard ?",
             "Oui. Les Angles est juste au-dessus d'Avignon, notre point de départ : nous y intervenons aux mêmes tarifs qu'à Avignon, déplacement inclus."),
        ],
    },
    {
        'slug': 'serrurier-vedene', 'nom': 'Vedène', 'a': 'à Vedène', 'cp': '84270', 'geo': (43.9775, 4.9036),
        'lead': "Clé perdue, porte claquée ou serrure forcée à Vedène ? Dans le Grand Avignon, notre serrurier intervient rapidement chez vous, de jour comme de nuit.",
        'intro': [
            "Vedène se trouve au nord-est d'Avignon, entre Le Pontet et Entraigues-sur-la-Sorgue : c'est l'une des communes les plus proches de notre point de départ. Nous y intervenons pour l'ouverture de porte, le changement de serrure ou de cylindre, le blindage et la réparation après effraction.",
            "Le prix est annoncé au téléphone avant le déplacement, et une facture détaillée vous est remise après l'intervention.",
        ],
        'habitat': [
            "Le village ancien, perché autour de son église, côtoie de nombreux lotissements et quartiers pavillonnaires récents. Les maisons sont souvent équipées de serrures multipoints, de portes de garage et de portillons : nous changeons les cylindres et réglons les serrures qui forcent.",
            "La commune touche la zone commerciale d'Avignon Nord : nous intervenons aussi chez les commerçants et dans les bureaux, en dehors des heures d'ouverture si besoin.",
        ],
        'secteurs': ['Village', 'Quartiers pavillonnaires', 'Lotissements récents', "Zones d'activités"],
        'voisines': ['Le Pontet', 'Avignon', 'Entraigues-sur-la-Sorgue', 'Saint-Saturnin-lès-Avignon', 'Sorgues'],
        'faq': [
            ("Pouvez-vous changer les cylindres de toute ma maison à Vedène ?",
             "Oui : porte d'entrée, garage, portillon. Nous pouvons poser des cylindres qui s'ouvrent tous avec la même clé, pour ne plus avoir qu'un seul trousseau."),
        ],
    },
    {
        'slug': 'serrurier-morieres-les-avignon', 'nom': 'Morières-lès-Avignon', 'a': 'à Morières-lès-Avignon', 'cp': '84310',
        'geo': (43.9406, 4.9050),
        'lead': "Porte claquée, serrure bloquée ou clé cassée à Morières-lès-Avignon ? À l'est d'Avignon, notre serrurier se déplace chez vous 24h/24 et 7j/7.",
        'intro': [
            "Morières-lès-Avignon est voisine d'Avignon, sur la route de Cavaillon et de L'Isle-sur-la-Sorgue. Nous y intervenons rapidement pour l'ouverture de porte, le changement de serrure, le blindage et la mise en sécurité après cambriolage.",
            "Les tarifs sont ceux de tout le Vaucluse, déplacement inclus, et vous sont annoncés avant de partir.",
        ],
        'habitat': [
            "La commune est principalement résidentielle : maisons individuelles, lotissements et quelques résidences autour d'un petit centre ancien. Les portes d'entrée récentes ont généralement des serrures multipoints : un cylindre neuf suffit souvent après une perte de clés.",
            "Dans les maisons avec jardin, nous intervenons aussi sur les portillons, les portes de garage, les abris et les volets roulants bloqués.",
        ],
        'secteurs': ['Centre', 'Lotissements', 'Quartiers résidentiels', 'Campagne'],
        'voisines': ['Avignon', 'Saint-Saturnin-lès-Avignon', 'Châteauneuf-de-Gadagne', 'Caumont-sur-Durance', 'Le Thor'],
        'faq': [],
    },
    {
        'slug': 'serrurier-entraigues-sur-la-sorgue', 'nom': 'Entraigues-sur-la-Sorgue', 'a': 'à Entraigues-sur-la-Sorgue', 'cp': '84320',
        'geo': (43.9989, 4.9269),
        'lead': "Porte claquée, clé perdue ou serrure forcée à Entraigues-sur-la-Sorgue ? Entre Avignon et Carpentras, notre serrurier intervient chez vous 7j/7.",
        'intro': [
            "Entraigues-sur-la-Sorgue, traversée par plusieurs bras de la Sorgue, se trouve sur la route entre Avignon et Carpentras. Nous y intervenons régulièrement pour l'ouverture de porte, le changement de serrure ou de cylindre et la sécurisation des accès.",
            "Le prix vous est annoncé au téléphone avant le déplacement, sans frais cachés.",
        ],
        'habitat': [
            "Le centre ancien, autour de la tour des Templiers, compte des maisons de village aux portes anciennes. Autour, les quartiers pavillonnaires sont équipés de serrures plus récentes, souvent multipoints.",
            "Pour les entreprises des zones d'activités, nous changeons les cylindres lors du départ d'un salarié et sécurisons les portes après une tentative d'effraction.",
        ],
        'secteurs': ['Centre ancien', 'Quartiers pavillonnaires', "Zones d'activités", 'Bords de Sorgue'],
        'voisines': ['Sorgues', 'Vedène', 'Monteux', 'Althen-des-Paluds', 'Bédarrides'],
        'faq': [],
    },
    {
        'slug': 'serrurier-le-thor', 'nom': 'Le Thor', 'a': 'au Thor', 'cp': '84250', 'geo': (43.9292, 4.9950),
        'lead': "Porte claquée, serrure grippée ou clé perdue au Thor ? Sur la Sorgue, entre Avignon et L'Isle-sur-la-Sorgue, notre serrurier intervient chez vous 24h/24.",
        'intro': [
            "Le Thor est sur la route entre Avignon et L'Isle-sur-la-Sorgue : nous y passons chaque jour. Ouverture de porte, changement de serrure, blindage, dépannage de volets roulants : nous intervenons dans le village comme dans les mas des alentours.",
            "Le tarif est annoncé avant de partir et confirmé sur place avant de commencer.",
        ],
        'habitat': [
            "Le centre du village, autour de l'église Notre-Dame-du-Lac et des bords de Sorgue, compte de nombreuses maisons anciennes aux portes en bois. Vers Thouzon et dans la plaine, les maisons individuelles et les mas sont équipés de serrures multipoints et de portails.",
            "Beaucoup de maisons servent de locations saisonnières : changer le cylindre entre deux saisons évite que des doubles de clés en circulation ne posent problème.",
        ],
        'secteurs': ['Centre du village', 'Bords de Sorgue', 'Thouzon', 'Quartiers résidentiels', 'Mas et campagne'],
        'voisines': ["L'Isle-sur-la-Sorgue", 'Châteauneuf-de-Gadagne', 'Saint-Saturnin-lès-Avignon', 'Velleron', 'Morières-lès-Avignon'],
        'faq': [
            ("Pouvez-vous changer les cylindres de ma location saisonnière au Thor ?",
             "Oui, entre deux saisons ou après une perte de clés. L'intervention est rapide et peut être faite en votre absence si une personne de confiance nous ouvre."),
        ],
    },
    {
        'slug': 'serrurier-saint-saturnin-les-avignon', 'nom': 'Saint-Saturnin-lès-Avignon', 'a': 'à Saint-Saturnin-lès-Avignon', 'cp': '84450',
        'geo': (43.9542, 4.9258),
        'lead': "Porte claquée, serrure forcée ou clé perdue à Saint-Saturnin-lès-Avignon ? Dans le Grand Avignon, notre serrurier intervient rapidement chez vous, de jour comme de nuit.",
        'intro': [
            "Saint-Saturnin-lès-Avignon est une commune résidentielle à l'est d'Avignon, entre Vedène, Morières-lès-Avignon et Le Thor. Nous y intervenons rapidement pour l'ouverture de porte, le changement de serrure ou de cylindre, le blindage et la réparation après effraction.",
            "Le prix est annoncé au téléphone avant le déplacement, sans frais cachés, et une facture détaillée vous est remise.",
        ],
        'habitat': [
            "Le village s'est beaucoup développé avec des lotissements et des maisons individuelles, autour d'un petit centre ancien. Les portes récentes y sont généralement équipées de serrures multipoints et de cylindres standards.",
            "Nous intervenons aussi pour les artisans et les petites entreprises installés dans les zones d'activités voisines : changement de cylindres, ouverture d'un local, mise en sécurité après une effraction.",
        ],
        'secteurs': ['Centre', 'Lotissements', 'Quartiers résidentiels', "Zones d'activités"],
        'voisines': ['Vedène', 'Le Pontet', 'Morières-lès-Avignon', 'Le Thor', 'Châteauneuf-de-Gadagne'],
        'faq': [],
    },
    {
        'slug': 'serrurier-chateauneuf-de-gadagne', 'nom': 'Châteauneuf-de-Gadagne', 'a': 'à Châteauneuf-de-Gadagne', 'cp': '84470',
        'geo': (43.9275, 4.9417),
        'lead': "Porte claquée, serrure grippée ou clé perdue à Châteauneuf-de-Gadagne ? Entre Avignon et L'Isle-sur-la-Sorgue, notre serrurier intervient chez vous 7j/7.",
        'intro': [
            "Châteauneuf-de-Gadagne domine la plaine entre Avignon, Le Thor et L'Isle-sur-la-Sorgue. Nous y intervenons pour l'ouverture de porte, le changement de serrure ou de cylindre, le blindage et le dépannage de volets roulants.",
            "Le prix est annoncé avant de partir, déplacement inclus, et une facture détaillée vous est remise après l'intervention.",
        ],
        'habitat': [
            "Le village perché compte des maisons anciennes et des ruelles étroites, tandis que les pentes et la plaine accueillent villas, lotissements et mas. Les portes récentes ont généralement des serrures multipoints, les plus anciennes des serrures en applique ou à larder.",
            "Dans les villas avec grand terrain, nous intervenons aussi sur les portails, les abris et les portes de garage, souvent oubliés quand on pense à la sécurité de la maison.",
        ],
        'secteurs': ['Village perché', 'Quartiers résidentiels', 'Lotissements', 'Mas et campagne'],
        'voisines': ['Le Thor', 'Saint-Saturnin-lès-Avignon', 'Morières-lès-Avignon', 'Caumont-sur-Durance', "L'Isle-sur-la-Sorgue"],
        'faq': [],
    },
    {
        'slug': 'serrurier-caumont-sur-durance', 'nom': 'Caumont-sur-Durance', 'a': 'à Caumont-sur-Durance', 'cp': '84510',
        'geo': (43.8933, 4.9450),
        'lead': "Porte claquée, clé cassée ou serrure bloquée à Caumont-sur-Durance ? Entre Avignon et Cavaillon, notre serrurier intervient chez vous 24h/24 et 7j/7.",
        'intro': [
            "Caumont-sur-Durance s'étend entre la colline et la Durance, sur la route entre Avignon et Cavaillon. Nous y intervenons pour l'ouverture de porte, le changement de serrure ou de cylindre, le blindage de porte et la mise en sécurité après effraction.",
            "Nos prix sont identiques dans tout le Vaucluse, déplacement inclus, et vous sont communiqués avant que le serrurier ne parte.",
        ],
        'habitat': [
            "Le vieux village, au pied de la colline, compte des maisons anciennes aux portes en bois. Dans la plaine, les maisons individuelles, les mas et les exploitations agricoles sont équipés de portails, de portes de garage et de serrures multipoints.",
            "Pour les exploitations et les hangars, nous remplaçons les cylindres et les serrures des portes de service, et sécurisons les accès après une tentative d'effraction.",
        ],
        'secteurs': ['Vieux village', 'Plaine de la Durance', 'Quartiers résidentiels', 'Mas et exploitations'],
        'voisines': ['Avignon', 'Morières-lès-Avignon', 'Châteauneuf-de-Gadagne', 'Cavaillon', 'Le Thor'],
        'faq': [
            ("Intervenez-vous dans les mas et exploitations de Caumont-sur-Durance ?",
             "Oui : portes d'habitation, hangars, ateliers et portails. Indiquez-nous au téléphone l'adresse précise et l'accès, surtout la nuit."),
        ],
    },
    {
        'slug': 'serrurier-bedarrides', 'nom': 'Bédarrides', 'a': 'à Bédarrides', 'cp': '84370', 'geo': (44.0400, 4.8975),
        'lead': "Clé perdue, porte claquée ou serrure forcée à Bédarrides ? Au nord de Sorgues, notre serrurier intervient chez vous rapidement, 24h/24 et 7j/7.",
        'intro': [
            "Bédarrides, au bord de l'Ouvèze, se trouve entre Sorgues, Châteauneuf-du-Pape et Courthézon. Nous y intervenons régulièrement pour l'ouverture de porte, le changement de serrure ou de cylindre, le blindage et la réparation après effraction.",
            "Le tarif est annoncé avant de partir et confirmé sur place, sans frais de déplacement ajoutés.",
        ],
        'habitat': [
            "Le centre ancien, avec ses maisons de village, est entouré de lotissements et de maisons individuelles équipées de serrures multipoints, de portes de garage et de portails. Après une perte de clés, un cylindre neuf suffit dans la plupart des cas.",
            "Dans les maisons proches de la rivière, l'humidité peut gripper les cylindres extérieurs : nous les nettoyons, les lubrifions ou les remplaçons par des modèles adaptés.",
        ],
        'secteurs': ['Centre ancien', 'Lotissements', "Bords de l'Ouvèze", 'Campagne'],
        'voisines': ['Sorgues', 'Courthézon', 'Châteauneuf-du-Pape', 'Entraigues-sur-la-Sorgue', 'Monteux'],
        'faq': [],
    },
    {
        'slug': 'serrurier-chateauneuf-du-pape', 'nom': 'Châteauneuf-du-Pape', 'a': 'à Châteauneuf-du-Pape', 'cp': '84230',
        'geo': (44.0561, 4.8325),
        'lead': "Porte claquée, clé perdue ou serrure bloquée à Châteauneuf-du-Pape ? Entre Avignon et Orange, notre serrurier intervient dans le village, les domaines et les caves, 7j/7.",
        'intro': [
            "Châteauneuf-du-Pape, connu pour son vignoble et les ruines de son château des papes, se trouve entre Avignon, Sorgues et Orange. Nous y intervenons pour l'ouverture de porte, le changement de serrure ou de cylindre, le blindage et la mise en sécurité après effraction.",
            "Le prix vous est annoncé au téléphone avant le déplacement, et une facture détaillée est remise après l'intervention.",
        ],
        'habitat': [
            "Le village s'étage sur la colline, avec ses maisons de pierre et ses portes anciennes en bois. Autour, les domaines viticoles comptent des caves, des chais, des bureaux et des boutiques de dégustation, chacun avec ses propres accès à sécuriser.",
            "Pour les domaines, nous changeons les cylindres lors du départ d'un saisonnier ou d'un salarié et proposons des cylindres qui s'ouvrent avec la même clé pour simplifier les trousseaux.",
        ],
        'secteurs': ['Village', 'Château des papes', 'Domaines viticoles', 'Quartiers résidentiels'],
        'voisines': ['Sorgues', 'Bédarrides', 'Courthézon', 'Orange', 'Caderousse'],
        'faq': [
            ("Intervenez-vous dans les caves et domaines de Châteauneuf-du-Pape ?",
             "Oui : ouverture d'une porte de cave ou de bureau, changement de cylindres, sécurisation après une tentative d'effraction. Nous pouvons intervenir en dehors des heures de visite et de dégustation."),
        ],
    },
    {
        'slug': 'serrurier-courthezon', 'nom': 'Courthézon', 'a': 'à Courthézon', 'cp': '84350', 'geo': (44.0878, 4.8836),
        'lead': "Porte claquée, clé perdue ou serrure bloquée à Courthézon ? Entre Orange et Avignon, notre serrurier se déplace chez vous 24h/24 et 7j/7.",
        'intro': [
            "Courthézon se trouve entre Orange, Châteauneuf-du-Pape et Bédarrides, au cœur d'une zone de vignobles. Nous y intervenons pour l'ouverture de porte, le changement de serrure ou de cylindre, le blindage et la mise en sécurité après cambriolage.",
            "Le tarif est annoncé avant le déplacement et confirmé sur place avant de commencer.",
        ],
        'habitat': [
            "Le centre ancien, entouré de ses remparts, compte des maisons de village aux portes anciennes. Autour, les quartiers résidentiels et les mas sont équipés de serrures plus récentes, souvent multipoints.",
            "Les domaines viticoles et les caves de la commune ont aussi leurs besoins : cylindres à changer après la saison, portes de chai à sécuriser, accès à simplifier avec des cylindres qui s'ouvrent avec la même clé.",
        ],
        'secteurs': ['Centre ancien', 'Remparts', 'Quartiers résidentiels', 'Domaines et campagne'],
        'voisines': ['Orange', 'Châteauneuf-du-Pape', 'Bédarrides', 'Jonquières', 'Sarrians'],
        'faq': [],
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

# Urgences : un paragraphe propre à chaque ville
URGENCES = {
    'serrurier-avignon': "Porte claquée en rentrant d'une soirée intra-muros, clé cassée un dimanche à Montfavet, serrure forcée pendant les vacances : nous répondons à toute heure. Le tarif de nuit, de dimanche ou de jour férié vous est annoncé au téléphone avant que le serrurier ne parte.",
    'serrurier-le-pontet': "Au Pontet, une urgence se règle vite : la commune touche Avignon, d'où partent nos interventions. La nuit, le dimanche ou un jour férié, le prix majoré vous est annoncé avant le départ.",
    'serrurier-sorgues': "Clé perdue en rentrant tard, porte bloquée un dimanche matin : nous intervenons à Sorgues 24h/24. Comme partout, la majoration de nuit ou de jour férié est annoncée au téléphone avant le déplacement.",
    'serrurier-carpentras': "Une porte claquée un soir dans le centre ancien ou une serrure forcée pendant un week-end : appelez-nous à toute heure. Le tarif d'urgence vous est communiqué avant que le serrurier ne prenne la route vers Carpentras.",
    'serrurier-monteux': "Porte claquée en revenant du lac, clé cassée un jour férié : notre serrurier intervient à Monteux de jour comme de nuit, avec un prix annoncé avant le départ.",
    'serrurier-pernes-les-fontaines': "Une clé qui casse dans une vieille serrure du centre historique un dimanche, une porte claquée en pleine nuit : nous intervenons à Pernes-les-Fontaines 7j/7, au tarif annoncé avant le déplacement.",
    'serrurier-orange': "Après une soirée au théâtre antique, une clé perdue ou une porte claquée ne doit pas tourner au cauchemar : nous intervenons à Orange 24h/24, y compris le dimanche et les jours fériés, avec un prix annoncé à l'avance.",
    'serrurier-bollene': "Au nord du département, un dépannage de nuit ou de week-end se prépare au téléphone : nous vous annonçons le prix et vous indiquons quand le serrurier pourra être sur place à Bollène.",
    'serrurier-vaison-la-romaine': "Porte claquée dans la haute ville, serrure grippée dans une maison de vacances un dimanche : nous intervenons à Vaison-la-Romaine et dans les villages du Ventoux 7j/7, au tarif annoncé avant le départ.",
    'serrurier-valreas': "Même dans l'Enclave des Papes, vous n'êtes pas seul en cas d'urgence : nous intervenons à Valréas la nuit, le week-end et les jours fériés, avec un prix annoncé au téléphone avant le déplacement.",
    'serrurier-cavaillon': "Serrure forcée sur un local professionnel pendant la nuit, porte claquée un dimanche au pied de la colline Saint-Jacques : nous intervenons à Cavaillon 24h/24, prix annoncé avant le départ.",
    'serrurier-l-isle-sur-la-sorgue': "Pendant les foires aux antiquaires, la ville vit à toute heure : une porte de boutique bloquée ou une clé perdue se règle 7j/7. Le tarif de nuit ou de jour férié est annoncé avant que le serrurier ne parte pour L'Isle-sur-la-Sorgue.",
    'serrurier-apt': "Clé perdue un samedi de marché, porte bloquée dans un mas isolé un soir d'hiver : nous intervenons à Apt et dans les villages du Luberon 7j/7, au prix annoncé avant le déplacement.",
    'serrurier-pertuis': "Porte claquée en rentrant du travail, serrure endommagée après une tentative d'effraction la nuit : nous intervenons à Pertuis et dans le pays d'Aigues 24h/24, prix annoncé au téléphone.",
    'serrurier-villeneuve-les-avignon': "Une porte claquée en rentrant d'Avignon tard le soir, une clé cassée un dimanche : il suffit de traverser le Rhône pour venir chez vous. Le tarif de nuit ou de jour férié est annoncé au téléphone avant le départ.",
    'serrurier-les-angles': "Clé perdue en pleine nuit, porte bloquée un jour férié : nous intervenons aux Angles 24h/24, avec un prix annoncé avant que le serrurier ne quitte Avignon.",
    'serrurier-vedene': "Porte claquée un soir de semaine ou serrure forcée pendant un week-end : Vedène est à quelques minutes d'Avignon, nous intervenons à toute heure, au tarif annoncé avant le déplacement.",
    'serrurier-morieres-les-avignon': "Clé cassée un dimanche matin, porte claquée en pleine nuit : nous intervenons à Morières-lès-Avignon 7j/7, la majoration de nuit ou de jour férié vous est annoncée au téléphone.",
    'serrurier-entraigues-sur-la-sorgue': "Une porte qui ne s'ouvre plus en rentrant tard, un local forcé pendant la nuit : nous intervenons à Entraigues-sur-la-Sorgue 24h/24, prix annoncé avant le départ.",
    'serrurier-le-thor': "Porte claquée dans une maison de vacances un dimanche, clé perdue un soir d'été : nous intervenons au Thor de jour comme de nuit, avec un tarif annoncé avant le déplacement.",
    'serrurier-saint-saturnin-les-avignon': "Une porte claquée un soir de semaine, une clé cassée un dimanche : Saint-Saturnin-lès-Avignon est tout près d'Avignon, nous intervenons à toute heure, au tarif annoncé avant le départ.",
    'serrurier-chateauneuf-de-gadagne': "Porte claquée en sortant chercher le courrier, clé cassée un jour férié : nous intervenons à Châteauneuf-de-Gadagne de jour comme de nuit, au prix annoncé avant le départ.",
    'serrurier-caumont-sur-durance': "Porte claquée en rentrant tard, clé perdue un soir d'hiver : nous intervenons à Caumont-sur-Durance à toute heure, avec un prix annoncé au téléphone.",
    'serrurier-bedarrides': "Une clé perdue en rentrant tard, une porte bloquée un jour férié : nous intervenons à Bédarrides de jour comme de nuit, au prix annoncé avant le départ.",
    'serrurier-chateauneuf-du-pape': "Une porte claquée un soir de vendanges, une clé cassée un dimanche : nous intervenons à Châteauneuf-du-Pape 7j/7, avec un tarif annoncé avant le déplacement.",
    'serrurier-courthezon': "Clé cassée dans la serrure un soir, porte forcée pendant un week-end : nous intervenons à Courthézon à toute heure, avec un tarif annoncé au téléphone avant le déplacement.",
}

# Contenu local supplémentaire : un conseil propre à chaque ville (titre, paragraphe)
PLUS = {
    'serrurier-le-pontet': ("Changer les serrures après un emménagement au Pontet",
        "Le Pontet accueille beaucoup de nouveaux habitants dans ses résidences et lotissements récents. En emménageant, vous ne savez jamais combien de doubles de clés circulent : anciens occupants, agence, artisans. Remplacer le cylindre de la porte d'entrée dès l'arrivée est la façon la plus simple de repartir à zéro, sans toucher à la serrure. Pensez aussi à la porte de garage et au portillon s'ils ferment à clé."),
    'serrurier-sorgues': ("Portes de garage et portillons à Sorgues",
        "Dans les quartiers pavillonnaires de Sorgues, l'accès par le garage est souvent moins protégé que la porte d'entrée : serrure d'origine, cylindre exposé, porte basculante qui ferme mal. Nous changeons les cylindres de garage et de portillon, ajoutons un verrou quand c'est utile, et pouvons faire en sorte qu'une seule clé ouvre plusieurs portes de la maison."),
    'serrurier-carpentras': ("Serrures anciennes du centre de Carpentras : réparer plutôt que remplacer",
        "Dans les maisons de ville du centre ancien, les serrures en applique ou à larder d'origine ont souvent plusieurs décennies. Une serrure qui force n'est pas forcément à changer : un nettoyage, un réglage de la gâche ou le remplacement d'une pièce suffit parfois. Quand le remplacement est nécessaire, nous choisissons un modèle adapté aux dimensions de la porte pour ne pas l'abîmer, et vous annonçons le prix avant."),
    'serrurier-monteux': ("Maisons neuves de Monteux : bien protéger sa porte d'entrée",
        "Les portes livrées dans les constructions récentes sont souvent équipées d'un cylindre standard, sans carte de propriété. Si vous souhaitez plus de sécurité, un cylindre certifié A2P se pose sur la serrure existante, sans toucher à la porte. Nous vous conseillons aussi sur les portes de garage communicantes, souvent le point faible d'une maison."),
    'serrurier-pernes-les-fontaines': ("Portes et serrures anciennes à Pernes-les-Fontaines",
        "Les portes des maisons de village de Pernes ont souvent gardé leurs serrures d'époque. Elles ont du charme, mais leurs clés sont parfois uniques et difficiles à reproduire. Si vous n'avez plus qu'une seule clé, mieux vaut anticiper : nous pouvons poser une serrure neuve d'aspect discret ou ajouter un verrou de sûreté, sans dénaturer la porte."),
    'serrurier-orange': ("Propriétaires bailleurs à Orange",
        "Entre les locations ponctuelles pendant les Chorégies et les appartements loués à l'année dans le centre, beaucoup de clés changent de main à Orange. Propriétaires et agences nous appellent pour remplacer les cylindres entre deux occupants : l'intervention est rapide et la facture est établie au nom du propriétaire ou de l'agence."),
    'serrurier-bollene': ("Clés de sûreté et carte de propriété à Bollène",
        "Dans les maisons du centre ancien de Bollène comme dans les pavillons plus récents, beaucoup de propriétaires n'ont plus qu'une ou deux clés de leur porte. Faire reproduire une clé de sûreté demande souvent la carte de propriété du cylindre ; si vous ne l'avez plus, nous remplaçons le cylindre et vous remettons un nouveau jeu de clés avec sa nouvelle carte."),
    'serrurier-vaison-la-romaine': ("Résidences secondaires autour de Vaison : préparer la fermeture",
        "Avant de fermer une maison pour l'hiver, vérifiez que toutes les portes verrouillent correctement, que les volets roulants descendent jusqu'en bas et qu'aucun double de clé n'est resté chez un ancien locataire. Nous pouvons faire ce contrôle, remplacer les cylindres et renforcer la porte principale avant votre départ, puis intervenir à votre retour si une serrure s'est grippée."),
    'serrurier-valreas': ("Serrures et portails dans l'Enclave des Papes",
        "Autour de Valréas, à Grillon, Visan ou Richerenches, beaucoup de maisons et de fermes sont fermées par un portail ou un portillon à cylindre, exposé aux intempéries. Un cylindre qui grippe en hiver se nettoie ou se remplace facilement ; nous posons des modèles adaptés à l'extérieur pour éviter la panne au mauvais moment."),
    'serrurier-cavaillon': ("Locaux professionnels et entrepôts à Cavaillon",
        "Avec son marché d'intérêt national et ses nombreuses entreprises, Cavaillon compte beaucoup d'entrepôts, d'ateliers et de locaux commerciaux. Lors du départ d'un salarié ou d'un changement d'équipe, remplacer les cylindres permet de garder le contrôle des accès. Nous posons aussi des cylindres qui s'ouvrent avec la même clé, pour simplifier les trousseaux."),
    'serrurier-l-isle-sur-la-sorgue': ("Sécuriser une boutique ou une location à L'Isle-sur-la-Sorgue",
        "Pour une boutique d'antiquités, la porte d'entrée et l'arrière-boutique méritent des cylindres résistants au crochetage et une serrure multipoints. Pour une maison louée en saison, le plus simple est de remplacer le cylindre après une perte de clés ou un changement de gestionnaire, et de garder la carte de propriété pour maîtriser les doubles."),
    'serrurier-apt': ("Mas et bastides isolés autour d'Apt",
        "Une maison isolée dans la campagne aptésienne est plus exposée qu'un appartement en ville. Une serrure multipoints, des cornières anti-pince et un cylindre certifié A2P sur la porte principale rendent l'effraction beaucoup plus longue. Nous faisons le tour des accès avec vous et vous remettons un devis, sans engagement."),
    'serrurier-pertuis': ("Maisons récentes et nouveaux quartiers de Pertuis",
        "Pertuis s'agrandit vite et de nombreuses familles s'installent dans des maisons neuves. Le cylindre d'origine des portes livrées est souvent basique : le remplacer par un modèle de meilleure qualité, avec carte de propriété, améliore nettement la sécurité pour un coût modéré. Nous intervenons aussi sur les portes de garage et les portails des lotissements."),
    'serrurier-morieres-les-avignon': ("Portillons et portes de garage à Morières-lès-Avignon",
        "Dans une maison avec jardin, le portillon et la porte de garage sont souvent fermés par des cylindres d'origine, rarement changés. Après une perte de clés ou un emménagement, pensez à les remplacer en même temps que celui de la porte d'entrée : nous pouvons faire en sorte qu'une seule clé ouvre toutes les portes."),
    'serrurier-entraigues-sur-la-sorgue': ("Particuliers et entreprises à Entraigues-sur-la-Sorgue",
        "Entre le centre ancien, les lotissements et les zones d'activités, les demandes sont variées à Entraigues : ouverture d'une porte de maison de village, changement de cylindre dans un pavillon récent ou sécurisation d'un local après une tentative d'effraction. Dans tous les cas, le prix est annoncé avant et une facture détaillée est remise."),
    'serrurier-villeneuve-les-avignon': ("Maisons anciennes et résidences secondaires à Villeneuve",
        "Villeneuve-lès-Avignon compte beaucoup de résidences secondaires et de locations de vacances, notamment dans le centre historique. Une maison occupée quelques semaines par an mérite une attention particulière : cylindre de qualité avec carte de propriété, serrure multipoints sur la porte principale et contrôle des volets avant chaque départ. Dans les ruelles du centre, le stationnement est parfois compliqué l'été : indiquez-nous l'adresse exacte et un point de repère, le serrurier se gare au plus près et termine à pied."),
    'serrurier-les-angles': ("Portes de garage et accès secondaires aux Angles",
        "Dans les villas des Angles, la porte d'entrée est souvent bien équipée, mais l'accès par le garage, la buanderie ou la baie vitrée reste le point faible. Une porte de garage communicante mérite une serrure de qualité équivalente à celle de l'entrée, et un portillon fermé à clé un cylindre adapté à l'extérieur. Nous faisons le tour de ces accès avec vous et vous proposons des solutions simples, au prix annoncé avant."),
    'serrurier-vedene': ("Emménager à Vedène : le bon réflexe sécurité",
        "Avec ses nombreux lotissements récents, Vedène voit arriver beaucoup de nouveaux propriétaires et locataires. En entrant dans un logement, personne ne sait vraiment combien de clés ont été distribuées : promoteur, ancien occupant, agence, voisins de confiance. Remplacer le cylindre de la porte d'entrée dès l'emménagement coûte peu et règle la question. Profitez-en pour vérifier la porte de garage et le portillon, dont les cylindres d'origine sont souvent basiques."),
    'serrurier-le-thor': ("Mas et maisons de campagne autour du Thor",
        "Entre Thouzon et la plaine, beaucoup de maisons du Thor sont isolées ou entourées d'un grand terrain. Pour ces habitations, le portail et les dépendances (garage, atelier, abri) sont autant d'accès à sécuriser. Nous posons des cylindres adaptés à l'extérieur et des serrures multipoints sur la porte principale. Si vous louez votre maison l'été, une boîte à clés n'est pas toujours idéale : son code circule vite, et changer le cylindre en fin de saison reste le plus sûr."),
    'serrurier-saint-saturnin-les-avignon': ("Cylindres standards ou cylindres de sécurité ?",
        "Les maisons récentes de Saint-Saturnin sont souvent livrées avec des cylindres standards, dont les clés se reproduisent facilement chez n'importe quel cordonnier. Un cylindre de sécurité, livré avec une carte de propriété, empêche toute copie sans votre accord et résiste mieux au crochetage. Il se pose sur la serrure existante, sans modifier la porte, et peut être installé dans la foulée d'une ouverture si vous êtes bloqué dehors."),
    'serrurier-chateauneuf-de-gadagne': ("Ruelles du village et accès difficile",
        "Dans le haut du village de Châteauneuf-de-Gadagne, certaines ruelles sont étroites et peu accessibles en voiture. Indiquez-nous au téléphone le meilleur accès : le serrurier se gare au plus près et termine à pied avec son matériel, sans que cela change le prix annoncé. Pour les portes anciennes du village, nous privilégions toujours l'ouverture fine et la réparation de la serrure d'origine."),
    'serrurier-caumont-sur-durance': ("Portails et accès extérieurs à Caumont",
        "Les cylindres de portail et de portillon sont exposés au soleil, à la pluie et à la poussière de la plaine. Avec le temps, la clé force ou ne tourne plus. Un cylindre adapté à l'extérieur, avec un cache de protection, dure beaucoup plus longtemps. Nous pouvons le poser dans la même intervention que l'ouverture si vous êtes bloqué dehors, avec un prix annoncé avant."),
    'serrurier-bedarrides': ("Sécuriser une maison individuelle à Bédarrides",
        "Dans une maison individuelle, la porte d'entrée n'est pas le seul accès : porte de garage, porte-fenêtre, portillon. Nous vous aidons à repérer le point faible et à le renforcer sans tout changer : un cylindre de meilleure qualité, un verrou supplémentaire ou une serrure multipoints sur la porte la plus exposée. Le conseil est gratuit et le prix toujours annoncé avant les travaux."),
    'serrurier-chateauneuf-du-pape': ("Maisons de pierre du village",
        "Dans les ruelles en pente du vieux village, les portes en bois massif ont souvent des serrures en applique ou à larder d'origine. Une ouverture fine permet de les ouvrir sans abîmer le bois, et une serrure qui force peut souvent être réparée plutôt que remplacée. Quand le remplacement s'impose, nous choisissons un modèle adapté à la porte pour en préserver le caractère."),
    'serrurier-courthezon': ("Portes anciennes du centre de Courthézon",
        "À l'intérieur des remparts, les maisons de village ont souvent des portes épaisses et des serrures anciennes. Une clé qui accroche ou une serrure qui force annonce souvent une panne : mieux vaut intervenir avant que la clé ne casse. Un nettoyage, un réglage de la gâche ou le remplacement d'une pièce suffisent parfois, pour un coût bien inférieur à celui d'une serrure neuve."),
}

# FAQ locale ajoutée aux villes qui n'en ont pas encore
FAQ_PLUS = {
    'serrurier-sorgues': ("Pouvez-vous changer le cylindre de ma porte de garage à Sorgues ?",
        "Oui, nous remplaçons les cylindres de portes de garage, de portillons et de portes d'entrée, et pouvons faire en sorte que la même clé ouvre plusieurs portes."),
    'serrurier-monteux': ("Ma porte d'entrée neuve a un cylindre standard : faut-il le changer ?",
        "Ce n'est pas obligatoire, mais un cylindre certifié A2P avec carte de propriété résiste mieux à l'effraction et empêche la copie de vos clés. Il se pose sur la serrure existante."),
    'serrurier-pernes-les-fontaines': ("Je n'ai plus qu'une clé de ma vieille serrure, que faire ?",
        "Anticipez avant de la perdre : nous pouvons poser une serrure neuve ou un verrou de sûreté, avec plusieurs clés, sans dénaturer votre porte ancienne."),
    'serrurier-orange': ("Je suis propriétaire bailleur à Orange : pouvez-vous intervenir en mon absence ?",
        "Oui, si le locataire ou une agence nous ouvre. Le prix vous est annoncé au téléphone et la facture est établie à votre nom."),
    'serrurier-bollene': ("J'ai perdu la carte de propriété de mon cylindre, que faire ?",
        "Sans la carte, il est souvent impossible de faire reproduire une clé de sûreté. La solution est de remplacer le cylindre : vous recevez un nouveau jeu de clés et une nouvelle carte."),
    'serrurier-valreas': ("Intervenez-vous à Grillon, Visan et Richerenches ?",
        "Oui, nous intervenons dans toute l'Enclave des Papes, aux mêmes tarifs que dans le reste du Vaucluse."),
    'serrurier-cavaillon': ("Pouvez-vous changer tous les cylindres d'un local professionnel ?",
        "Oui, et nous pouvons poser des cylindres qui s'ouvrent avec la même clé. Le devis vous est remis avant l'intervention."),
    'serrurier-apt': ("Pouvez-vous intervenir dans les villages du Luberon autour d'Apt ?",
        "Oui : Gargas, Saignon, Roussillon, Rustrel, Bonnieux et tous les villages alentour, aux mêmes tarifs, déplacement inclus."),
    'serrurier-pertuis': ("Intervenez-vous dans le pays d'Aigues ?",
        "Oui : La Tour-d'Aigues, Villelaure, Ansouis, Cadenet, Mirabeau et les villages voisins de Pertuis, aux mêmes tarifs."),
    'serrurier-morieres-les-avignon': ("Intervenez-vous à Saint-Saturnin-lès-Avignon et Châteauneuf-de-Gadagne ?",
        "Oui, comme dans toutes les communes autour de Morières-lès-Avignon, aux mêmes tarifs que dans le reste du Vaucluse."),
    'serrurier-entraigues-sur-la-sorgue': ("Intervenez-vous dans les zones d'activités d'Entraigues ?",
        "Oui, pour les entreprises comme pour les particuliers : ouverture, changement de cylindre et mise en sécurité après une effraction, en dehors des heures d'ouverture si besoin."),
}

# Deuxième conseil local, propre à chaque ville (titre, paragraphes)
GUIDE = {
    'serrurier-villeneuve-les-avignon': ("Réparer une serrure ancienne à Villeneuve-lès-Avignon", [
        "Sur les portes anciennes du centre de Villeneuve, nous cherchons d'abord à réparer la serrure d'origine : extraction d'un morceau de clé, nettoyage, remplacement d'un ressort ou réglage de la gâche. Quand elle doit être remplacée, nous posons un modèle adapté aux dimensions de la porte, en applique ou à larder, sans la modifier.",
        "Pour les maisons récentes des hauteurs, le remplacement du cylindre après une perte de clés suffit dans la plupart des cas, et peut se faire juste après l'ouverture de la porte."]),
    'serrurier-les-angles': ("Commerces et bureaux aux Angles", [
        "Autour de la zone commerciale, nous intervenons pour les commerçants et les professions libérales : ouverture d'une porte de local, changement de cylindre après le départ d'un salarié, mise en sécurité après une tentative d'effraction. Nous pouvons intervenir en dehors des heures d'ouverture pour ne pas gêner l'activité.",
        "Pour simplifier les trousseaux, nous posons des cylindres qui s'ouvrent avec la même clé, et vous conseillons sur la gestion des doubles."]),
    'serrurier-vedene': ("Garages, portillons et trousseau unique", [
        "Dans les maisons de Vedène, il n'est pas rare d'avoir quatre ou cinq clés différentes : porte d'entrée, garage, portillon, abri, boîte aux lettres. Nous pouvons poser des cylindres qui s'ouvrent tous avec la même clé, pour un trousseau plus léger et des accès mieux maîtrisés.",
        "Si une seule de ces portes force ou se bloque, inutile de tout changer : nous réparons ou remplaçons uniquement la pièce en cause, prix annoncé avant."]),
    'serrurier-morieres-les-avignon': ("Résidences et petites copropriétés de Morières", [
        "Les petites résidences de Morières-lès-Avignon ont souvent des portes palières équipées de serrures 3 points et des boîtes aux lettres collectives. Une clé de boîte aux lettres perdue se règle au forfait de 90 € TTC, ouverture et remplacement de la serrure compris.",
        "Pour les syndics et les propriétaires bailleurs, nous intervenons aussi sur les portes de cave et de local technique, avec une facture au nom du syndicat ou du propriétaire."]),
    'serrurier-entraigues-sur-la-sorgue': ("Serrures exposées à l'humidité près de la Sorgue", [
        "Entre les bras de la Sorgue, certaines maisons et dépendances sont plus exposées à l'humidité. Un cylindre extérieur peut alors se gripper ou s'oxyder, jusqu'à ce que la clé force ou refuse de tourner. Un nettoyage et une lubrification adaptée suffisent souvent ; quand le cylindre est trop abîmé, nous le remplaçons par un modèle conçu pour l'extérieur.",
        "Évitez l'huile de cuisine ou les graisses épaisses, qui retiennent la poussière et finissent par bloquer le mécanisme : un lubrifiant sec pour serrures, à base de graphite ou de PTFE, est bien plus efficace."]),
    'serrurier-le-thor': ("Le village et les bords de Sorgue", [
        "Dans le centre du Thor, autour de l'église Notre-Dame-du-Lac, les maisons anciennes ont souvent des portes en bois et des serrures d'origine. Nous les ouvrons en douceur et les réparons quand c'est possible, plutôt que de les remplacer.",
        "Pour les maisons au bord de l'eau, nous conseillons des cylindres résistants à l'humidité et un entretien régulier au lubrifiant sec, pour éviter qu'une clé ne casse dans une serrure grippée."]),
    'serrurier-saint-saturnin-les-avignon': ("Perte de clés : les bons réflexes", [
        "Si vous avez perdu vos clés avec un document portant votre adresse, changez le cylindre sans attendre : quelqu'un pourrait les utiliser. Si elles sont simplement égarées, vérifiez d'abord auprès de vos proches et des lieux où vous êtes passé, puis appelez-nous si vous êtes bloqué dehors.",
        "Dans les deux cas, nous pouvons ouvrir la porte et remplacer le cylindre dans la même intervention. Vous repartez avec un nouveau jeu de clés et la certitude que les anciennes ne servent plus à rien."]),
    'serrurier-chateauneuf-de-gadagne': ("Vacances : préparer la maison avant de partir", [
        "Avant un départ en vacances, vérifiez que toutes les portes verrouillent bien, que les volets roulants descendent jusqu'en bas et que personne d'autre que vos proches ne détient de clé. Une serrure qui force ou un volet qui coince se répare plus facilement avant le départ qu'en urgence pendant l'absence.",
        "Nous pouvons faire ce contrôle avec vous, remplacer un cylindre fatigué ou poser un verrou supplémentaire, avec un prix annoncé avant l'intervention."]),
    'serrurier-caumont-sur-durance': ("Résidence principale ou maison secondaire", [
        "Que la maison soit habitée toute l'année ou seulement en saison, les mêmes règles s'appliquent : une porte principale solide, une serrure multipoints, un cylindre dont vous maîtrisez les doubles. Pour une maison souvent inoccupée, ajoutez une vérification régulière des volets et des accès secondaires.",
        "Nous vous conseillons sur place, sans pousser à la dépense : parfois un simple réglage de la gâche suffit pour qu'une porte ferme correctement, et c'est ce que nous vous proposerons en premier."]),
    'serrurier-bedarrides': ("Une intervention simple et transparente", [
        "Au téléphone, nous vous demandons l'adresse, le type de porte et la nature du problème : porte claquée, porte fermée à clé, clé cassée, serrure qui force. Vous connaissez le prix avant le départ du serrurier, déplacement compris.",
        "Sur place, le tarif est confirmé avant de commencer. Après l'intervention, vous recevez une facture détaillée qui mentionne les pièces remplacées, utile pour votre assurance ou votre propriétaire."]),
    'serrurier-chateauneuf-du-pape': ("Bien protéger un domaine ou une cave", [
        "Un domaine viticole cumule les accès : portail, chai, cave de stockage, bureau, boutique. Chacun a souvent sa clé, et beaucoup de personnes y ont accès pendant les vendanges. Faire le point avant la saison permet de savoir qui détient quelle clé et de remplacer les cylindres dont des doubles ont été perdus.",
        "Pour les portes les plus exposées, comme une cave de stockage, une serrure multipoints et un cylindre certifié A2P rendent l'effraction beaucoup plus longue. Nous vous remettons un devis détaillé, porte par porte."]),
    'serrurier-courthezon': ("De Courthézon au Haut-Vaucluse", [
        "Depuis Courthézon, nous intervenons aussi à Jonquières, Camaret-sur-Aigues, Sarrians, Violès et dans les communes du Haut-Vaucluse, aux mêmes tarifs que dans le reste du département.",
        "Pour une urgence, l'heure d'arrivée estimée vous est communiquée au téléphone. Pour un changement de serrure ou un blindage, nous convenons d'un rendez-vous qui vous arrange, en semaine comme le week-end."]),
    'serrurier-le-pontet': ("Zone Avignon Nord : interventions pour les professionnels", [
        "Les commerces, bureaux et entrepôts de la zone Avignon Nord ont des besoins spécifiques : intervenir avant l'ouverture ou après la fermeture, remplacer plusieurs cylindres en même temps, sécuriser une porte après une tentative d'effraction nocturne. Nous organisons l'intervention selon vos horaires pour ne pas perturber l'activité.",
        "Pour les rideaux métalliques et les fermetures motorisées, indiquez-nous le modèle au téléphone : nous vous dirons honnêtement si l'intervention relève de notre métier ou d'un spécialiste."]),
    'serrurier-sorgues': ("Le centre ancien et les résidences de Sorgues", [
        "Dans le centre ancien de Sorgues, les maisons de ville ont souvent conservé des portes en bois et des serrures d'origine, parfois difficiles à faire reproduire. Si vous n'avez plus qu'une ou deux clés, mieux vaut anticiper : nous pouvons réparer la serrure, poser un verrou de sûreté ou la remplacer par un modèle adapté à la porte.",
        "Pour les appartements des résidences, une porte claquée s'ouvre le plus souvent sans casse. Indiquez-nous au téléphone l'étage et le code d'accès de l'immeuble pour que le serrurier arrive directement devant votre porte."]),
    'serrurier-carpentras': ("Commerces du centre de Carpentras", [
        "Dans les rues commerçantes du centre ancien et le long des boulevards, de nombreux commerces occupent des rez-de-chaussée anciens. Leurs portes sont souvent équipées de serrures à cylindre qu'il faut changer quand un trousseau est perdu ou qu'un employé quitte l'entreprise.",
        "Le vendredi, jour de marché, et pendant les fêtes, l'accès au centre est plus long : prévenez-nous si vous avez besoin d'une intervention à une heure précise, nous organisons le déplacement en conséquence."]),
    'serrurier-monteux': ("Locations de vacances près du lac", [
        "Avec son lac et ses parcs de loisirs, Monteux accueille de nombreux vacanciers en été, et beaucoup de maisons sont louées à la semaine. Entre deux saisons, ou après un changement de gestionnaire, changer le cylindre de la porte d'entrée évite que des doubles de clés ne restent en circulation.",
        "Pour les propriétaires qui confient leurs clés à une conciergerie, un cylindre avec carte de propriété garantit qu'aucune copie ne pourra être faite sans leur accord."]),
    'serrurier-pernes-les-fontaines': ("Hameaux et mas autour de Pernes", [
        "Les hameaux et mas autour de Pernes-les-Fontaines sont parfois éloignés du centre : indiquez-nous au téléphone l'adresse précise, le nom du chemin ou un point de repère, pour que le serrurier trouve la maison sans perdre de temps, surtout la nuit.",
        "Dans ces maisons, le portail, la porte principale et les dépendances ont souvent des clés différentes. Nous pouvons harmoniser les cylindres pour qu'une seule clé ouvre plusieurs portes, et renforcer la porte principale si la maison reste inoccupée une partie de l'année."]),
    'serrurier-orange': ("Commerces et bureaux du centre d'Orange", [
        "Dans le centre historique d'Orange, autour du théâtre antique et des rues commerçantes, nous intervenons régulièrement pour des commerçants : clés perdues, cylindre qui accroche, porte forcée pendant la nuit. Nous pouvons intervenir avant l'ouverture ou après la fermeture pour ne pas gêner l'activité.",
        "Pendant les grands événements de l'été, la circulation et le stationnement sont plus compliqués dans le centre : précisez-nous l'adresse et l'accès le plus simple, le serrurier s'organise pour arriver au plus près."]),
    'serrurier-bollene': ("Le nord du Vaucluse, de Bollène à Mondragon", [
        "Bollène est la ville la plus au nord de notre secteur le long du Rhône. Nous y intervenons comme dans le reste du Vaucluse, ainsi qu'à Mondragon, Lapalud, Mornas ou Lamotte-du-Rhône. Pour une urgence de nuit, le serrurier vous indique au téléphone son heure d'arrivée estimée, compte tenu de la distance depuis Avignon.",
        "Pour une intervention qui peut attendre, comme un changement de serrure, la pose d'un blindage ou d'une serrure multipoints, nous fixons ensemble un créneau en journée, sans majoration horaire."]),
    'serrurier-vaison-la-romaine': ("Villages du Ventoux et des Dentelles", [
        "Autour de Vaison-la-Romaine, nous intervenons dans les villages au pied du Ventoux et des Dentelles de Montmirail : Séguret, Roaix, Entrechaux, Malaucène, Puymeras et leurs hameaux. Les routes y sont plus longues : pour une urgence, l'heure d'arrivée estimée vous est donnée au téléphone.",
        "Beaucoup de maisons de village ont des portes épaisses et des serrures anciennes, qu'il vaut mieux réparer que remplacer. Pour les maisons louées en saison, nous conseillons des cylindres faciles à changer entre deux locations."]),
    'serrurier-valreas': ("Intervenir dans l'Enclave des Papes", [
        "L'Enclave des Papes est une partie du Vaucluse entourée par la Drôme. Valréas, Grillon, Visan et Richerenches font bien partie de notre zone d'intervention, au même titre que les communes proches d'Avignon, avec les mêmes tarifs et le déplacement inclus.",
        "Comme la distance est plus grande, nous vous recommandons de prévoir les interventions non urgentes (changement de serrure, blindage, cylindres) sur rendez-vous : nous vous fixons un créneau précis."]),
    'serrurier-cavaillon': ("Le Luberon autour de Cavaillon", [
        "Depuis Cavaillon, nous intervenons aussi à Cheval-Blanc, Robion, Les Taillades, Caumont-sur-Durance et dans les villages au pied du Luberon. Beaucoup de maisons y sont des mas ou des villas avec portail, et certaines sont des résidences secondaires.",
        "Pour ces maisons, nous recommandons une serrure multipoints sur la porte principale, des cylindres certifiés et une vérification des accès secondaires. Le devis est gratuit pour un blindage, et le prix toujours annoncé avant l'intervention."]),
    'serrurier-l-isle-sur-la-sorgue': ("Pendant les foires aux antiquaires", [
        "Lors des grandes foires aux antiquaires, la ville accueille beaucoup de visiteurs et les boutiques ouvrent tôt et ferment tard. Une serrure qui casse ou une clé perdue ce jour-là ne peut pas attendre : nous intervenons rapidement et adaptons l'intervention à votre activité.",
        "Après la saison, c'est le bon moment pour faire le point sur la sécurité de la boutique : cylindres résistants au crochetage et au perçage, serrure multipoints sur la porte de réserve, protection du cylindre extérieur. Nous vous remettons un devis détaillé, sans engagement."]),
    'serrurier-apt': ("Le marché du samedi et le centre d'Apt", [
        "Le samedi, le grand marché d'Apt occupe une bonne partie du centre ancien, et l'accès en voiture devient compliqué. Si vous avez besoin d'un serrurier ce jour-là, précisez-nous l'adresse et l'accès le plus proche : le serrurier se gare au plus près et finit à pied.",
        "Dans les maisons de ville autour de la cathédrale Sainte-Anne, les portes anciennes méritent une ouverture soignée. Nous privilégions l'ouverture fine et la réparation de la serrure d'origine quand c'est possible."]),
    'serrurier-pertuis': ("Le pays d'Aigues et le sud Luberon", [
        "Depuis Pertuis, nous intervenons dans les villages du pays d'Aigues : La Tour-d'Aigues, Villelaure, Ansouis, Cadenet, Mirabeau, Grambois et leurs hameaux. Beaucoup de maisons de village y ont des portes anciennes, tandis que les nouveaux quartiers sont équipés de portes récentes à serrure multipoints.",
        "Pertuis est l'une des villes les plus éloignées d'Avignon dans notre secteur : pour une urgence, l'heure d'arrivée estimée vous est donnée au téléphone, et pour un changement de serrure ou un blindage, nous fixons un rendez-vous à votre convenance."]),
}

# Questions locales supplémentaires
FAQ_LOCALES = {
    'serrurier-villeneuve-les-avignon': [("Pouvez-vous remplacer une serrure ancienne sans changer la porte ?",
        "Oui. Nous posons un modèle adapté aux dimensions de la porte, en applique ou à larder, sans la modifier, après avoir vérifié si la serrure d'origine peut être réparée.")],
    'serrurier-les-angles': [("Intervenez-vous pour les commerces de la zone commerciale des Angles ?",
        "Oui : ouverture d'une porte de local, changement de cylindre, mise en sécurité après une tentative d'effraction, en dehors des heures d'ouverture si besoin.")],
    'serrurier-vedene': [("Intervenez-vous le week-end à Vedène ?",
        "Oui, 7j/7, y compris le dimanche et les jours fériés. La majoration de week-end figure dans notre grille tarifaire et vous est annoncée au téléphone.")],
    'serrurier-le-pontet': [("Pouvez-vous intervenir avant l'ouverture d'un commerce au Pontet ?",
        "Oui, nous intervenons 24h/24. Les éventuelles majorations horaires vous sont annoncées au téléphone avant le déplacement.")],
    'serrurier-carpentras': [("Intervenez-vous dans les villages du Comtat autour de Carpentras ?",
        "Oui : Monteux, Pernes-les-Fontaines, Mazan, Aubignan, Loriol-du-Comtat, Sarrians, Caromb et les villages voisins, aux mêmes tarifs que dans tout le Vaucluse.")],
    'serrurier-orange': [("Intervenez-vous à Jonquières, Camaret-sur-Aigues et Piolenc ?",
        "Oui, ainsi qu'à Caderousse, Courthézon et dans tout le Haut-Vaucluse, aux mêmes tarifs que dans le reste du département.")],
    'serrurier-vaison-la-romaine': [("Intervenez-vous à Malaucène et Entrechaux ?",
        "Oui, comme dans tous les villages autour de Vaison-la-Romaine, aux mêmes tarifs que dans le reste du Vaucluse, déplacement inclus.")],
    'serrurier-le-thor': [("Intervenez-vous à Thouzon et dans la campagne du Thor ?",
        "Oui, dans le village comme dans les mas et les hameaux. Indiquez-nous l'adresse précise et l'accès, surtout la nuit.")],
    'serrurier-saint-saturnin-les-avignon': [("Pouvez-vous changer le cylindre le jour même à Saint-Saturnin-lès-Avignon ?",
        "Le plus souvent oui, pour les dimensions courantes. Pour un modèle particulier ou haute sécurité, il peut falloir le commander ; nous sécurisons alors la porte en attendant.")],
    'serrurier-chateauneuf-de-gadagne': [("Pouvez-vous dépanner un volet roulant à Châteauneuf-de-Gadagne ?",
        "Oui, nous dépannons les volets roulants manuels et électriques : sangle, manivelle, lames bloquées ou panne électrique. Le prix est annoncé avant l'intervention.")],
    'serrurier-caumont-sur-durance': [("Combien de temps faut-il pour venir à Caumont-sur-Durance ?",
        "Caumont est proche d'Avignon, notre point de départ. L'heure d'arrivée estimée vous est donnée au téléphone selon l'heure et la circulation.")],
    'serrurier-bedarrides': [("Intervenez-vous à Bédarrides le dimanche ?",
        "Oui, 7j/7, y compris le dimanche et les jours fériés. La majoration correspondante vous est annoncée au téléphone avant le déplacement.")],
    'serrurier-chateauneuf-du-pape': [("Intervenez-vous entre Châteauneuf-du-Pape et Orange ?",
        "Oui, à Courthézon, Caderousse, Bédarrides et dans toutes les communes entre Avignon et Orange, aux mêmes tarifs, déplacement inclus.")],
    'serrurier-courthezon': [("Intervenez-vous dans les domaines viticoles de Courthézon ?",
        "Oui, pour les portes de chai, de cave, de bureau et de boutique : ouverture, changement de cylindres et sécurisation après une tentative d'effraction.")],
}

# Avignon : un paragraphe par grand secteur de la ville
QUARTIERS_AVIGNON = [
    ("Intra-muros et centre-ville",
     "À l'intérieur des remparts, entre le Palais des Papes, la place de l'Horloge, la rue de la République et le quartier des Teinturiers, les immeubles anciens ont des portes palières en bois massif et des serrures en applique. Les rues piétonnes et la circulation compliquent l'accès en voiture : notre serrurier se gare au plus près et finit à pied avec son matériel."),
    ("Saint-Ruf, Monclar, Champfleury",
     "Au sud des remparts, autour de la gare centre, ces quartiers comptent beaucoup de copropriétés et d'immeubles des années 1960 à 1980. Portes palières à serrure 3 points, caves et boîtes aux lettres : ce sont nos interventions les plus fréquentes, pour les occupants comme pour les syndics."),
    ("Saint-Chamand, La Croix-Rouge, Saint-Jean",
     "À l'est de la ville, le long de la rocade, les grandes résidences et les maisons individuelles se côtoient. Nous y changeons régulièrement des cylindres après une perte de clés et sécurisons les portes après une tentative d'effraction."),
    ("Montfavet et Agroparc",
     "Montfavet a gardé son esprit de village, avec ses maisons, ses villas et ses mas. Agroparc regroupe entreprises, bureaux et laboratoires : nous intervenons pour les particuliers comme pour les professionnels, y compris en dehors des heures de bureau."),
    ("Courtine et gare TGV",
     "Autour de la gare TGV et de la zone de Courtine, nous intervenons dans les bureaux, les hôtels, les commerces et les locaux d'activité : ouverture, changement de cylindre, mise en sécurité après effraction."),
    ("Île de la Barthelasse",
     "Sur l'île, entre les deux bras du Rhône, les maisons sont souvent isolées et fermées par des portails. Pour ces habitations parfois inoccupées une partie de l'année, nous conseillons des serrures multipoints et des cylindres certifiés A2P."),
]

# ---------------------------------------------------------------- Pages services
# slug, nom (menu), titres, accroche, sections (titre, paragraphes ou liste), FAQ, faits clés
SERVICES = [
    {
        'slug': 'ouverture-de-porte', 'nom': 'Ouverture de porte',
        'h1': 'Ouverture de porte dans le Vaucluse<br><span>dès 90 € TTC, 24h/24</span>',
        'titre': 'Ouverture de porte Avignon & Vaucluse – dès 90 € TTC, 24h/24',
        'desc': "Porte claquée ou fermée à clé ? Ouverture de porte à Avignon et dans le Vaucluse dès 90 € TTC, sans casse, prix annoncé avant. ☎ " + TEL,
        'lead': "Porte claquée, clés oubliées à l'intérieur, clé cassée dans la serrure ou serrure bloquée : notre serrurier ouvre votre porte à Avignon et dans tout le Vaucluse, en privilégiant toujours les techniques sans casse.",
        'sections': [
            ("Porte claquée ou porte fermée à clé : ce qui change", [
                "Une porte claquée est retenue uniquement par le pêne demi-tour, la petite languette biseautée qui s'enclenche quand on tire la porte. Dans la grande majorité des cas, elle s'ouvre en quelques minutes sans toucher à la serrure : c'est notre forfait à 90 € TTC avant 18h.",
                "Une porte fermée à clé est verrouillée par le pêne dormant, voire par plusieurs points sur une serrure multipoints. L'ouverture demande plus de temps et de technique : elle coûte 130 € TTC avant 18h. Dans les deux cas, le déplacement est inclus."]),
            ("L'ouverture fine : ouvrir sans abîmer la porte", [
                "Nous commençons toujours par les techniques non destructives : ouverture de la porte claquée par l'entrebâillement, travail sur le cylindre, outils adaptés aux serrures en applique ou aux serrures à larder des portes anciennes. Ces méthodes laissent la porte et la serrure en état de marche.",
                "Le perçage du cylindre n'est envisagé qu'en dernier recours, sur certains cylindres haute sécurité ou une serrure déjà endommagée. Dans ce cas, nous vous prévenons et vous annonçons le prix du cylindre de remplacement avant toute intervention."]),
            ("Clé cassée, clé coincée ou serrure bloquée", [
                "Une clé cassée dans le cylindre s'extrait le plus souvent sans changer la serrure. Si la clé tourne dans le vide, si la serrure force ou se bloque à mi-course, le problème vient généralement du cylindre ou du mécanisme : nous ouvrons d'abord la porte, puis vous proposons la réparation ou le remplacement de la pièce en cause, prix annoncé avant."]),
            ("Comment se passe une ouverture de porte ?", ['liste',
                f"Vous appelez le {TEL} : nous vous demandons l'adresse, le type de porte et s'il s'agit d'une porte claquée ou fermée à clé.",
                "Le prix vous est annoncé au téléphone, déplacement compris, avec l'heure d'arrivée estimée.",
                "Sur place, le serrurier confirme le tarif avant de commencer, puis ouvre la porte.",
                "Vous recevez une facture détaillée, utile si votre assurance prend en charge l'intervention."]),
            ("Ce qu'on vous demandera sur place", [
                "Par sécurité, le serrurier vérifie que vous habitez bien le logement : une fois la porte ouverte, présentez une pièce d'identité et un justificatif de domicile (facture, bail, avis d'imposition). Pour un logement loué, le locataire comme le propriétaire peuvent faire appel à nous."]),
        ],
        'faq': [
            ("Combien coûte une ouverture de porte dans le Vaucluse ?",
             "90 € TTC pour une porte claquée et 130 € TTC pour une porte fermée à clé avant 18h, déplacement inclus. Après 18h : 150 € et 210 €. Après 22h, le week-end et les jours fériés : 210 € et 290 €."),
            ("Allez-vous casser ma serrure ?",
             "Dans la grande majorité des cas, non : une porte claquée s'ouvre sans abîmer la serrure. Si un perçage est inévitable sur une porte fermée à clé, nous vous prévenons avant et vous annonçons le prix du cylindre de remplacement."),
            ("Combien de temps dure une ouverture de porte ?",
             "Une porte claquée s'ouvre généralement en quelques minutes. Une porte fermée à clé ou une serrure multipoints demande plus de temps selon le modèle."),
            ("Mon assurance rembourse-t-elle l'ouverture de porte ?",
             "Cela dépend de votre contrat : certaines assurances habitation ou cartes bancaires prévoient une assistance serrurerie. Nous vous remettons une facture détaillée à leur transmettre."),
        ],
        'faits': [('Porte claquée', 'dès 90 € TTC'), ('Porte fermée à clé', 'dès 130 € TTC'), ('Déplacement', 'inclus'), ('Disponibilité', '24h/24 – 7j/7')],
    },
    {
        'slug': 'changement-de-serrure', 'nom': 'Changement de serrure',
        'h1': 'Changement de serrure et de cylindre<br><span>dans tout le Vaucluse</span>',
        'titre': 'Changement de serrure et de cylindre – Avignon & Vaucluse (84)',
        'desc': "Clés perdues, serrure forcée ou usée ? Changement de cylindre ou de serrure (multipoints, A2P) à Avignon et dans le Vaucluse. ☎ " + TEL,
        'lead': "Clés perdues ou volées, serrure qui force, emménagement ou serrure abîmée après une effraction : nous remplaçons le cylindre ou la serrure complète, à Avignon et dans tout le Vaucluse.",
        'sections': [
            ("Cylindre ou serrure complète : que faut-il changer ?", [
                "Le cylindre, aussi appelé barillet, est la partie dans laquelle vous introduisez la clé. Si vos clés ont été perdues, volées ou confiées à trop de monde, et que la serrure fonctionne bien, changer le cylindre suffit : les anciennes clés deviennent inutilisables. C'est l'intervention la plus rapide et la plus économique.",
                "Il faut remplacer la serrure complète (le boîtier) quand le mécanisme est usé, cassé ou forcé lors d'une effraction, ou quand vous souhaitez passer à une serrure plus sûre, par exemple d'une serrure 1 point à une serrure 3 points."]),
            ("Les serrures que nous posons", ['liste',
                "Serrure en applique : fixée sur la face intérieure de la porte, fréquente sur les portes anciennes et les portes palières.",
                "Serrure à larder (encastrée) : logée dans l'épaisseur de la porte, plus discrète.",
                "Serrure multipoints (3 points ou plus) : verrouille la porte en haut, au milieu et en bas, bien plus résistante à l'effraction.",
                "Serrure de boîte aux lettres : ouverture et remplacement au forfait de 90 € TTC."]),
            ("Les normes A2P : choisir le bon niveau de sécurité", [
                "La certification A2P, délivrée par le CNPP, classe les serrures et les cylindres selon leur résistance à l'effraction : une étoile (environ 5 minutes), deux étoiles (environ 10 minutes) et trois étoiles (environ 15 minutes). Certaines assurances exigent un niveau minimal : vérifiez votre contrat.",
                "Les cylindres de sécurité sont souvent livrés avec une carte de propriété : sans elle, personne ne peut faire reproduire vos clés. Nous vous conseillons le niveau adapté à votre porte et à votre budget."]),
            ("Quand faut-il changer sa serrure ?", ['liste',
                "Après la perte ou le vol de vos clés.",
                "En emménageant, quand vous ignorez combien de doubles circulent.",
                "Entre deux locations saisonnières ou après le départ d'un locataire.",
                "Après une effraction ou une tentative d'effraction.",
                "Quand la clé force, accroche ou que la serrure se bloque."]),
            ("Prix d'un changement de serrure", [
                "Le prix dépend du type de serrure, de la marque et du niveau de sécurité choisi : le changement de serrure ou de cylindre se fait donc sur devis. Nous vous donnons une estimation au téléphone, puis un devis précis sur place, avant toute intervention. Si vous êtes bloqué dehors, l'ouverture de porte (dès 90 € TTC) et le changement de cylindre peuvent être faits dans la même intervention."]),
        ],
        'faq': [
            ("Faut-il changer la serrure quand on perd ses clés ?",
             "Pas forcément toute la serrure : remplacer le cylindre suffit si la serrure fonctionne bien. Les anciennes clés ne pourront plus ouvrir la porte."),
            ("Combien coûte un changement de cylindre ?",
             "Le prix dépend du modèle et du niveau de sécurité (standard, A2P une, deux ou trois étoiles). Nous vous donnons une estimation au téléphone et un devis précis sur place, avant toute intervention."),
            ("Peut-on ouvrir plusieurs portes avec la même clé ?",
             "Oui, avec des cylindres « s'entrouvrant », qui s'ouvrent tous avec la même clé : porte d'entrée, garage, portillon. Nous vous conseillons sur place."),
            ("Qui paie le changement de serrure, le propriétaire ou le locataire ?",
             "En principe, l'entretien courant et le remplacement des clés perdues sont à la charge du locataire, et le remplacement d'une serrure usée par la vétusté revient au propriétaire. Votre bail peut préciser ce point ; la facture est établie au nom de la personne qui règle l'intervention."),
        ],
        'faits': [('Cylindre', 'sur devis'), ('Serrure complète', 'sur devis'), ('Boîte aux lettres', '90 € TTC'), ('Normes', 'A2P 1 à 3 étoiles')],
    },
    {
        'slug': 'blindage-de-porte', 'nom': 'Blindage de porte',
        'h1': 'Blindage de porte<br><span>dans le Vaucluse, devis gratuit</span>',
        'titre': 'Blindage de porte Avignon & Vaucluse – Devis gratuit',
        'desc': "Renforcez votre porte sans la remplacer : blindage, serrure multipoints, cornières anti-pince. Avignon et Vaucluse, devis gratuit. ☎ " + TEL,
        'lead': "Plus économique qu'une porte blindée complète, le blindage renforce votre porte existante contre l'effraction. Nous intervenons à Avignon et dans tout le Vaucluse, devis gratuit après visite.",
        'sections': [
            ("Blindage de porte ou porte blindée : quelle différence ?", [
                "Le blindage consiste à renforcer votre porte actuelle : on conserve la porte et son cadre, et on y ajoute une tôle d'acier, une serrure multipoints et des renforts. C'est la solution la plus courante pour les portes d'appartement et de maison en bon état.",
                "La porte blindée, ou bloc-porte, remplace entièrement la porte et son huisserie par un ensemble conçu pour résister à l'effraction. Elle coûte plus cher mais offre le plus haut niveau de protection, notamment quand elle est certifiée A2P BP1, BP2 ou BP3."]),
            ("Ce que comprend un blindage", ['liste',
                "Une tôle d'acier fixée sur la face intérieure de la porte.",
                "Une serrure multipoints qui verrouille la porte en plusieurs endroits.",
                "Des cornières anti-pince sur le cadre, pour empêcher de glisser un outil entre la porte et le chambranle.",
                "Des renforts côté gonds contre le dégondage.",
                "Un protège-cylindre ou une poignée blindée anti-arrachement."]),
            ("Pour quels logements ?", [
                "Le blindage intéresse particulièrement les appartements en rez-de-chaussée ou au dernier étage, les maisons isolées ou inoccupées une partie de l'année (résidences secondaires du Luberon, du Ventoux ou de l'Enclave des Papes) et les logements qui ont déjà subi une tentative d'effraction.",
                "Il est aussi souvent demandé par les propriétaires qui louent leur logement pendant le Festival d'Avignon ou en saison touristique."]),
            ("Devis gratuit après visite", [
                "Le prix d'un blindage dépend de la porte (dimensions, matière, sens d'ouverture), du niveau de sécurité de la serrure et des options choisies. Nous venons voir la porte, prenons les mesures et vous remettons un devis gratuit et détaillé, sans engagement."]),
            ("Les étapes d'un blindage de porte", ['liste',
                "Visite et prise de mesures : nous vérifions l'état de la porte, du cadre et des gonds.",
                "Devis détaillé : chaque élément (tôle, serrure, cornières, cylindre) est chiffré séparément.",
                "Pose : la tôle est fixée côté intérieur, la serrure multipoints et les renforts sont installés et réglés.",
                "Remise des clés et de la carte de propriété du cylindre, puis facture détaillée."]),
            ("Blindage et confort au quotidien", [
                "Une porte blindée est plus lourde : c'est pourquoi nous réglons soigneusement les gonds et la gâche pour qu'elle reste facile à ouvrir et à fermer. La tôle intérieure peut être habillée pour s'accorder à votre intérieur, et le blindage améliore souvent l'isolation phonique de la porte palière.",
                "Pensez enfin à la cohérence de l'ensemble : une porte blindée n'est efficace qu'avec un cylindre de bonne qualité et un protège-cylindre extérieur. Nous vous conseillons sur ces points lors de la visite."]),
        ],
        'faq': [
            ("Le blindage est-il possible sur toutes les portes ?",
             "Sur la plupart des portes en bois en bon état, oui. Une porte trop abîmée, trop fine ou vitrée peut nécessiter un bloc-porte complet : nous vous le dirons honnêtement après avoir vu la porte."),
            ("Combien coûte un blindage de porte ?",
             "Le prix dépend de la porte et des équipements choisis. Le devis est gratuit : nous venons voir la porte et vous remettons un chiffrage détaillé."),
            ("Mon assurance exige-t-elle une porte blindée ?",
             "Certains contrats imposent une porte renforcée ou une serrure certifiée A2P, surtout en rez-de-chaussée. Vérifiez votre contrat ; nous vous remettons une facture qui détaille les équipements posés."),
            ("Faut-il l'accord de la copropriété pour blinder sa porte palière ?",
             "Le blindage se pose côté intérieur et ne change généralement pas l'aspect du palier. Le règlement de copropriété peut toutefois encadrer la face extérieure des portes : vérifiez-le avant les travaux."),
        ],
        'faits': [('Devis', 'gratuit'), ('Serrure', 'multipoints'), ('Normes portes', 'A2P BP1 à BP3'), ('Zone', 'tout le Vaucluse')],
    },
    {
        'slug': 'reparation-apres-effraction', 'nom': 'Réparation après effraction',
        'h1': 'Réparation après effraction<br><span>mise en sécurité 24h/24</span>',
        'titre': 'Réparation après effraction et cambriolage – Vaucluse 24h/24',
        'desc': "Porte forcée après un cambriolage ? Mise en sécurité 24h/24 puis réparation, facture pour l'assurance. Avignon et tout le Vaucluse. ☎ " + TEL,
        'lead': "Porte forcée, serrure arrachée, cylindre cassé : après une effraction, nous sécurisons votre logement ou votre commerce sans attendre, puis réparons la porte. Facture détaillée pour votre assurance.",
        'sections': [
            ("Les bons réflexes après un cambriolage", ['liste',
                "Appelez le 17 si les cambrioleurs sont peut-être encore sur place.",
                "Ne touchez à rien et ne rangez pas avant le passage des forces de l'ordre, pour préserver les traces.",
                "Portez plainte au commissariat ou à la gendarmerie, en listant les objets volés.",
                "Faites opposition sur les cartes bancaires et chéquiers volés.",
                "Déclarez le sinistre à votre assureur dans les deux jours ouvrés, avec le récépissé de plainte.",
                "Faites sécuriser l'accès : c'est là que nous intervenons."]),
            ("Mise en sécurité provisoire, de jour comme de nuit", [
                "Si la porte ne ferme plus, votre logement ne peut pas rester ouvert. Nous intervenons 24h/24 pour une fermeture provisoire : remplacement du cylindre, pose d'une serrure en applique, fixation de la porte ou condamnation provisoire de l'accès, selon les dégâts.",
                "Vous pouvez ainsi dormir chez vous, ou repartir en laissant un logement fermé, en attendant la réparation définitive et l'accord de votre assurance."]),
            ("Réparation définitive de la porte et de la serrure", [
                "Une fois l'urgence passée, nous remplaçons le boîtier de serrure ou le cylindre endommagé, réparons la gâche et les renforts arrachés, et vous proposons si besoin de renforcer la porte : serrure multipoints, cornières anti-pince, blindage. Le devis vous est remis avant les travaux."]),
            ("Une facture pour votre assurance", [
                "Nous vous remettons une facture détaillée, avec la description des dégâts constatés et des travaux réalisés, à joindre à votre déclaration de sinistre. Selon votre contrat, tout ou partie de l'intervention peut être prise en charge par votre assurance habitation."]),
            ("Commerces et locaux professionnels", [
                "Porte de commerce forcée, cylindre arraché sur un local ou un entrepôt : nous intervenons aussi pour les professionnels, de nuit si nécessaire, pour que vous puissiez rouvrir au plus vite."]),
            ("Éviter une nouvelle effraction", [
                "Après un cambriolage, le risque de récidive est réel : les cambrioleurs connaissent désormais les lieux et le point d'entrée. C'est le bon moment pour renforcer la porte utilisée : serrure multipoints, cylindre certifié A2P avec protège-cylindre, cornières anti-pince, voire blindage complet.",
                "Pensez aussi aux autres accès : porte de garage, porte-fenêtre, volets roulants. Nous faisons le tour du logement avec vous et vous proposons les renforcements utiles, sans surenchère, avec un devis détaillé."]),
        ],
        'faq': [
            ("Combien de temps ai-je pour déclarer un cambriolage à mon assurance ?",
             "En général deux jours ouvrés à partir du moment où vous constatez le vol ; vérifiez votre contrat. Portez plainte avant : le récépissé vous sera demandé."),
            ("Pouvez-vous intervenir avant le passage de la police ?",
             "Si les forces de l'ordre se déplacent, mieux vaut attendre leurs constatations pour ne pas effacer de traces. Appelez-nous dès que possible : nous organisons l'intervention en fonction."),
            ("L'assurance paie-t-elle le serrurier après une effraction ?",
             "Le plus souvent, les dégâts causés par une effraction sont couverts par la garantie vol de l'assurance habitation, selon votre contrat et sa franchise. Nous vous remettons une facture détaillée à leur transmettre."),
            ("Faut-il changer la serrure après une tentative d'effraction ?",
             "Si la serrure a été forcée, même sans succès, son mécanisme peut être fragilisé. Nous la contrôlons et vous disons honnêtement si un remplacement est nécessaire."),
        ],
        'faits': [('Mise en sécurité', '24h/24 – 7j/7'), ('Réparation', 'sur devis'), ('Facture', "pour l'assurance"), ('Clients', 'particuliers et pros')],
    },
    {
        'slug': 'depannage-volet-roulant', 'nom': 'Volets roulants',
        'h1': 'Dépannage de volet roulant<br><span>manuel ou électrique</span>',
        'titre': 'Dépannage volet roulant bloqué – Avignon & Vaucluse',
        'desc': "Volet roulant bloqué, sangle cassée, volet électrique en panne ? Dépannage à Avignon et dans tout le Vaucluse, prix annoncé avant. ☎ " + TEL,
        'lead': "Volet roulant bloqué en bas, sangle cassée, lames sorties des coulisses ou volet électrique qui ne répond plus : nous dépannons vos volets à Avignon et dans tout le Vaucluse.",
        'sections': [
            ("Les pannes de volet roulant les plus fréquentes", ['liste',
                "Sangle usée ou cassée sur un volet manuel.",
                "Manivelle ou treuil qui tourne dans le vide.",
                "Lames bloquées, désalignées ou sorties des coulisses.",
                "Volet électrique qui ne monte ou ne descend plus.",
                "Volet qui descend de travers ou s'arrête à mi-course."]),
            ("Volet manuel : sangle, manivelle, lames", [
                "Sur un volet à sangle, la sangle s'use avec le temps et le soleil, jusqu'à casser : nous la remplaçons, ainsi que l'enrouleur si nécessaire. Sur un volet à manivelle, c'est souvent le treuil qui est en cause. Des lames bloquées ou sorties des coulisses peuvent généralement être remises en place sans changer tout le tablier."]),
            ("Volet électrique : diagnostic et réparation", [
                "Quand un volet électrique ne répond plus, la panne peut venir de l'interrupteur, de la télécommande, de l'alimentation ou du moteur. Nous établissons le diagnostic sur place et vous annonçons le prix de la réparation avant de commencer."]),
            ("Pourquoi faire réparer rapidement un volet bloqué ?", [
                "Un volet bloqué en position ouverte laisse une fenêtre exposée, surtout en rez-de-chaussée ou pendant une absence ; bloqué en bas, il plonge la pièce dans le noir. Forcer sur la sangle ou la manivelle aggrave souvent la panne : mieux vaut nous appeler avant."]),
            ("Bien entretenir ses volets roulants", ['liste',
                "Nettoyez les coulisses une à deux fois par an pour retirer la poussière, le sable et les feuilles.",
                "Ne forcez jamais sur une sangle ou une manivelle qui résiste : cherchez d'abord ce qui bloque.",
                "Remontez complètement le volet par grand vent pour éviter que les lames ne se déforment.",
                "En hiver, ne manœuvrez pas un volet pris par le gel : attendez qu'il dégèle.",
                "Sur un volet électrique, remplacez la pile de la télécommande dès que la portée diminue."]),
            ("Volets roulants et sécurité du logement", [
                "Un volet roulant baissé ralentit un cambrioleur et cache l'intérieur de la maison. Pour qu'il joue ce rôle, il doit descendre jusqu'en bas et rester verrouillé : des verrous automatiques ou des lames renforcées empêchent de le soulever depuis l'extérieur.",
                "Avant un départ en vacances, vérifiez que tous vos volets fonctionnent. Un volet qui reste bloqué ouvert pendant une absence est une invitation : faites-le réparer avant de partir."]),
        ],
        'faq': [
            ("Combien coûte un dépannage de volet roulant ?",
             "Le prix dépend de la panne (sangle, manivelle, lames, partie électrique). Nous vous donnons une estimation au téléphone et confirmons le prix sur place avant d'intervenir."),
            ("Intervenez-vous sur les volets électriques ?",
             "Oui, nous dépannons les volets roulants manuels et électriques : diagnostic de la panne puis réparation, prix annoncé avant."),
            ("Mon volet est bloqué ouvert et je pars en vacances, que faire ?",
             "Appelez-nous : un volet bloqué ouvert laisse la fenêtre exposée. Nous intervenons rapidement pour le débloquer avant votre départ."),
        ],
        'faits': [('Volets', 'manuels et électriques'), ('Prix', 'annoncé avant'), ('Zone', 'tout le Vaucluse'), ('Disponibilité', '7j/7')],
    },
    {
        'slug': 'serrurier-urgence-avignon', 'nom': 'Urgence 24h/24 Avignon', 'parent': 'serrurier-avignon',
        'h1': 'Serrurier en urgence à Avignon<br><span>24h/24 – 7j/7</span>',
        'titre': 'Serrurier Urgence Avignon 24h/24 – Intervention rapide dès 90 €',
        'desc': "Serrurier en urgence à Avignon 24h/24 et 7j/7 : porte claquée, clé perdue, serrure forcée. Départ d'Avignon, prix annoncé avant, dès 90 € TTC. ☎ " + TEL,
        'lead': "Porte claquée en pleine nuit, clé perdue un dimanche, serrure forcée pendant les vacances : notre serrurier part d'Avignon et intervient en urgence dans tous les quartiers, 24h/24 et 7j/7.",
        'sections': [
            ("Un serrurier qui part d'Avignon", [
                "Avignon est notre point de départ : en cas d'urgence, nous n'avons pas à traverser le département pour venir chez vous. De l'intra-muros à Montfavet, de Saint-Chamand à l'île de la Barthelasse, nous rejoignons rapidement tous les quartiers de la ville et les communes voisines comme Le Pontet, Villeneuve-lès-Avignon ou Les Angles.",
                "Au téléphone, nous vous indiquons le prix et l'heure d'arrivée estimée avant que le serrurier ne prenne la route."]),
            ("Les urgences que nous traitons", ['liste',
                "Porte claquée, clés restées à l'intérieur.",
                "Porte fermée à clé et clés perdues ou volées.",
                "Clé cassée ou coincée dans la serrure.",
                "Serrure bloquée qui ne tourne plus.",
                "Porte forcée après une effraction ou un cambriolage : mise en sécurité.",
                "Volet roulant bloqué ouvert avant une absence."]),
            ("Tarifs d'urgence : nuit, dimanche et jours fériés", [
                "Nos prix sont annoncés à l'avance, déplacement inclus. Une porte claquée coûte 90 € TTC avant 18h, 150 € après 18h et 210 € après 22h, le week-end et les jours fériés. Une porte fermée à clé coûte 130 € TTC avant 18h, 210 € après 18h et 290 € après 22h, le week-end et les jours fériés.",
                "Ces majorations figurent dans notre grille tarifaire et vous sont confirmées au téléphone : pas de mauvaise surprise sur la facture, même au milieu de la nuit."]),
            ("Urgence : comment éviter les arnaques", [
                "En urgence, on appelle souvent le premier numéro trouvé. Méfiez-vous des annonces sans nom ni adresse, des prix d'appel très bas et des dépanneurs qui refusent d'annoncer un tarif au téléphone. Un professionnel sérieux vous donne son prix avant de partir et vous remet une facture détaillée : c'est ce que nous faisons à chaque intervention."]),
            ("En attendant le serrurier", [
                "Restez joignable au numéro avec lequel vous avez appelé, et préparez si possible une pièce d'identité et un justificatif de domicile (dans votre téléphone, par exemple) : ils vous seront demandés une fois la porte ouverte. Si votre porte a été forcée, ne touchez à rien avant le passage de la police."]),
            ("Le Grand Avignon, de jour comme de nuit", [
                "La nuit, nous intervenons dans tout Avignon et dans les communes du Grand Avignon : Le Pontet, Vedène, Morières-lès-Avignon, Saint-Saturnin-lès-Avignon, Entraigues-sur-la-Sorgue, mais aussi Villeneuve-lès-Avignon et Les Angles, de l'autre côté du Rhône. Pour les communes plus éloignées du Vaucluse, l'heure d'arrivée estimée vous est donnée au téléphone.",
                "Après une ouverture en urgence, si le cylindre doit être remplacé ou si la porte a été endommagée, nous pouvons le faire sur place ou revenir en journée, à votre choix, avec un devis annoncé avant."]),
        ],
        'faq': [
            ("Intervenez-vous vraiment la nuit à Avignon ?",
             "Oui, 24h/24 et 7j/7, y compris le dimanche et les jours fériés. Le tarif de nuit vous est annoncé au téléphone avant le départ du serrurier."),
            ("En combien de temps arrivez-vous ?",
             "Avignon étant notre point de départ, c'est là que nous arrivons le plus vite. L'heure d'arrivée estimée vous est donnée au téléphone selon votre quartier et l'heure."),
            ("Combien coûte un serrurier en urgence la nuit à Avignon ?",
             "Après 22h : 210 € TTC pour une porte claquée et 290 € TTC pour une porte fermée à clé, déplacement inclus. Avant 22h, les prix sont plus bas (voir la grille tarifaire)."),
            ("Intervenez-vous en urgence autour d'Avignon ?",
             "Oui : Le Pontet, Vedène, Morières-lès-Avignon, Villeneuve-lès-Avignon, Les Angles, Sorgues, Entraigues-sur-la-Sorgue et tout le Vaucluse."),
        ],
        'faits': [('Disponibilité', '24h/24 – 7j/7'), ('Départ', 'Avignon'), ('Porte claquée', 'dès 90 € TTC'), ('Nuit, week-end, férié', 'dès 210 € TTC')],
    },
    {
        'slug': 'ouverture-boite-aux-lettres', 'nom': 'Boîte aux lettres',
        'h1': 'Boîte aux lettres : ouverture et serrure<br><span>forfait 90 € TTC</span>',
        'titre': 'Ouverture de boîte aux lettres et changement de serrure – 90 € TTC',
        'desc': "Clé de boîte aux lettres perdue ou serrure cassée ? Ouverture et serrure neuve au forfait de 90 € TTC, Avignon et Vaucluse. ☎ " + TEL,
        'lead': "Clé perdue, serrure cassée ou boîte aux lettres forcée : nous ouvrons votre boîte et remplaçons la serrure au forfait de 90 € TTC, à Avignon et dans tout le Vaucluse.",
        'sections': [
            ("Clé de boîte aux lettres perdue : que faire ?", [
                "La clé de boîte aux lettres est souvent la plus petite du trousseau, et la plus facile à perdre. Sans elle, le courrier s'accumule, les avis de passage restent coincés et certains documents importants deviennent inaccessibles. Il n'existe en général pas de double chez le gardien ou l'agence, et la serrure n'est pas conçue pour être ouverte sans sa clé.",
                "La solution la plus simple est d'ouvrir la boîte et de remplacer la serrure : vous recevez de nouvelles clés et la personne qui aurait trouvé l'ancienne ne peut plus rien en faire."]),
            ("Un forfait clair : 90 € TTC", [
                "L'ouverture de la boîte aux lettres et le remplacement de sa serrure coûtent 90 € TTC au forfait. Ce prix comprend le déplacement, l'ouverture, la serrure neuve, sa pose et ses clés. Il n'y a pas de frais de diagnostic ni de supplément pour la pièce.",
                "Si vous avez aussi besoin d'une ouverture de porte ou d'un changement de cylindre, les interventions peuvent être regroupées sur le même déplacement, chacune au prix annoncé avant."]),
            ("Boîtes individuelles et boîtes collectives", ['liste',
                "Boîte individuelle de maison, sur pied ou encastrée dans un muret : ouverture et remplacement de la serrure.",
                "Boîte aux lettres d'immeuble : remplacement de la serrure de votre casier, sans toucher aux autres.",
                "Boîte forcée ou vandalisée : remplacement de la serrure et, si possible, remise en état de la porte du casier.",
                "Changement de locataire : remplacement de la serrure pour remettre de nouvelles clés."]),
            ("Comment se passe l'intervention", ['liste',
                f"Vous nous appelez au {TEL} et indiquez l'adresse et le type de boîte aux lettres.",
                "Nous vous confirmons le forfait de 90 € TTC et l'heure de passage.",
                "Sur place, la boîte est ouverte, la serrure remplacée et les nouvelles clés vous sont remises.",
                "Une facture détaillée vous est remise, utile pour votre propriétaire ou votre syndic."]),
            ("Qui doit payer ?", [
                "Si vous avez perdu la clé, le remplacement est en principe à votre charge, comme pour toute clé égarée par un locataire. Si la serrure est usée par le temps ou défectueuse, c'est au propriétaire. Pour une boîte vandalisée dans un immeuble, renseignez-vous auprès du syndic : la réparation peut relever de la copropriété. La facture est établie au nom de la personne qui règle l'intervention."]),
        ],
        'faq': [
            ("Combien coûte l'ouverture d'une boîte aux lettres ?",
             "90 € TTC au forfait, avec le remplacement de la serrure et les nouvelles clés, déplacement inclus."),
            ("Peut-on refaire une clé de boîte aux lettres sans l'original ?",
             "Rarement. Sans clé ni référence, il est plus simple et plus sûr de remplacer la serrure, ce qui est compris dans notre forfait."),
            ("Intervenez-vous sur les boîtes aux lettres d'immeuble ?",
             "Oui, nous remplaçons la serrure de votre casier sans toucher aux autres. Prévenez-nous si l'accès au hall nécessite un code ou un badge."),
            ("Combien de temps dure l'intervention ?",
             "Quelques minutes en général : la boîte est ouverte, la serrure remplacée et les nouvelles clés vous sont remises sur place."),
        ],
        'faits': [('Forfait', '90 € TTC'), ('Serrure neuve', 'incluse'), ('Déplacement', 'inclus'), ('Boîtes', 'individuelles et collectives')],
    },
    {
        'slug': 'serrurier-professionnels', 'nom': 'Professionnels et syndics',
        'h1': 'Serrurier pour les professionnels<br><span>commerces, syndics, bailleurs</span>',
        'titre': 'Serrurier pour professionnels, syndics et bailleurs – Vaucluse',
        'desc': "Commerces, syndics, agences, bailleurs, conciergeries : ouverture, cylindres, mise en sécurité 24h/24 dans le Vaucluse. ☎ " + TEL,
        'lead': "Commerces, bureaux, entrepôts, syndics de copropriété, agences immobilières, propriétaires bailleurs et conciergeries : nous intervenons pour les professionnels de tout le Vaucluse, à vos horaires, avec une facturation claire.",
        'sections': [
            ("Commerces, bureaux et entrepôts", [
                "Une serrure bloquée ou une clé perdue dans un commerce, c'est une boutique qui ne peut pas ouvrir. Nous intervenons rapidement, avant l'ouverture ou après la fermeture si nécessaire, pour ouvrir la porte, remplacer un cylindre ou réparer une serrure. Après une tentative d'effraction, nous assurons la mise en sécurité provisoire puis la réparation définitive.",
                "Lors du départ d'un salarié ou d'un changement d'équipe, remplacer les cylindres permet de garder le contrôle des accès. Pour simplifier les trousseaux, nous posons des cylindres qui s'ouvrent avec la même clé, ou vous conseillons sur une organisation des clés adaptée à votre activité."]),
            ("Syndics et copropriétés", [
                "Pour les syndics et les conseils syndicaux, nous intervenons sur les parties communes : portes de cave, locaux techniques, locaux vélos ou poubelles, boîtes aux lettres. La facture est établie au nom du syndicat des copropriétaires, avec le détail de l'intervention et des pièces remplacées.",
                "Nous intervenons aussi à la demande du syndic dans les logements, en présence de l'occupant ou d'une personne autorisée, par exemple après une effraction dans l'immeuble."]),
            ("Agences immobilières et propriétaires bailleurs", ['liste',
                "Changement de cylindre entre deux locataires, avec remise des clés à l'agence.",
                "Ouverture de porte pour un état des lieux quand les clés n'ont pas été rendues.",
                "Remplacement d'une serrure usée signalée par un locataire.",
                "Intervention en présence du locataire, facture au nom du propriétaire ou de l'agence."]),
            ("Conciergeries et locations saisonnières", [
                "Avignon pendant le Festival, le Luberon, le Ventoux, L'Isle-sur-la-Sorgue : le Vaucluse compte de très nombreuses locations de courte durée. Les clés y changent souvent de main et se perdent plus qu'ailleurs. Nous remplaçons les cylindres entre deux saisons ou après une perte de clés, et posons des cylindres avec carte de propriété pour maîtriser les copies.",
                "En cas d'urgence pendant un séjour, un voyageur bloqué dehors ou une serrure qui casse, nous intervenons 24h/24 à la demande du propriétaire ou de la conciergerie, au prix annoncé avant."]),
            ("Une facturation adaptée aux entreprises", [
                "Chaque intervention donne lieu à une facture détaillée au nom de votre société, de votre syndic ou de votre agence, avec l'adresse de l'intervention, la nature du problème et les pièces remplacées. Le prix est toujours annoncé avant le déplacement, et un devis vous est remis avant tout travail important.",
                f"Pour en parler, appelez-nous au {TEL} ou décrivez votre besoin dans le formulaire de contact : nous vous rappelons rapidement."]),
        ],
        'faq': [
            ("Pouvez-vous intervenir en dehors des heures d'ouverture ?",
             "Oui, nous intervenons 24h/24 et 7j/7. Les éventuelles majorations de soir, de nuit ou de week-end vous sont annoncées au téléphone avant le déplacement."),
            ("La facture peut-elle être établie au nom de ma société ?",
             "Oui, au nom de la société, du syndicat des copropriétaires, de l'agence ou du propriétaire, selon la personne qui règle l'intervention."),
            ("Pouvez-vous changer tous les cylindres d'un local en une fois ?",
             "Oui, et nous pouvons poser des cylindres qui s'ouvrent avec la même clé. Le devis vous est remis avant l'intervention."),
            ("Intervenez-vous pour un voyageur bloqué dehors dans une location ?",
             "Oui, à la demande du propriétaire ou de la conciergerie, 24h/24. Le prix est annoncé avant le départ du serrurier."),
        ],
        'faits': [('Clients', 'pros, syndics, bailleurs'), ('Disponibilité', '24h/24 – 7j/7'), ('Facture', 'au nom de la société'), ('Zone', 'tout le Vaucluse')],
    },
]

# Page « Tarifs » : même gabarit que les services, mais hors de la liste des prestations
TARIFS = {
    'slug': 'tarifs-serrurier', 'nom': 'Tarifs',
    'h1': 'Tarifs serrurier Avignon et Vaucluse<br><span>prix annoncés à l\'avance</span>',
    'titre': 'Tarifs serrurier Avignon & Vaucluse – Prix annoncés, dès 90 € TTC',
    'desc': "Prix d'un serrurier à Avignon et dans le Vaucluse : ouverture dès 90 € TTC, nuit et week-end, déplacement inclus. ☎ " + TEL,
    'lead': "Combien coûte un serrurier ? Chez nous, la réponse tient en une page : des prix TTC publics, le déplacement inclus, des majorations clairement indiquées et un tarif toujours annoncé avant l'intervention.",
    'sections': [
        ("Nos tarifs d'ouverture de porte", [
            "Une porte claquée, fermée sans tour de clé, coûte 90 € TTC avant 18h, 150 € TTC après 18h, et 210 € TTC après 22h, le week-end et les jours fériés. Une porte fermée à clé coûte 130 € TTC avant 18h, 210 € TTC après 18h, et 290 € TTC après 22h, le week-end et les jours fériés.",
            "L'ouverture d'une boîte aux lettres avec le remplacement de sa serrure coûte 90 € TTC au forfait. Ces prix sont les mêmes à Avignon, à Carpentras, à Orange, à Apt ou à Valréas : le déplacement est inclus partout dans notre zone d'intervention."]),
        ("Ce que comprend le prix", ['liste',
            "Le déplacement du serrurier jusqu'à chez vous, où que vous soyez dans notre secteur.",
            "La main-d'œuvre de l'ouverture, quelle que soit la technique utilisée.",
            "Aucun frais de diagnostic, de dossier ou de « mise en route » ajouté sur place.",
            "Une facture détaillée remise à la fin de l'intervention.",
            "Seules les pièces remplacées à votre demande (cylindre, serrure) s'ajoutent, toujours chiffrées avant la pose."]),
        ("Pourquoi un prix différent le soir, la nuit et le week-end ?", [
            "Intervenir à 23h un dimanche ou un jour férié mobilise un serrurier en dehors des heures normales de travail. C'est pourquoi, comme dans tous les métiers du dépannage, une majoration s'applique après 18h, puis après 22h, le week-end et les jours fériés. Ce qui compte, c'est qu'elle soit annoncée clairement : nos majorations figurent dans la grille ci-dessous et vous sont rappelées au téléphone.",
            "Si votre situation peut attendre le lendemain, par exemple si vous pouvez dormir chez un proche, nous vous le dirons honnêtement : vous paierez alors le tarif de journée."]),
        ("Les prestations sur devis", [
            "Le changement de cylindre ou de serrure, la pose d'une serrure multipoints, le blindage de porte, la réparation après effraction et le dépannage de volets roulants dépendent du matériel choisi et de l'état de la porte. Ils sont donc réalisés sur devis. Nous vous donnons une estimation au téléphone, puis un prix précis sur place, avant toute intervention.",
            "Pour un blindage ou un renforcement de porte, le devis est gratuit et sans engagement : nous venons voir la porte, prenons les mesures et vous remettons un chiffrage détaillé, élément par élément."]),
        ("Quelques exemples concrets", ['liste',
            "Mardi à 14h, porte claquée à Avignon : 90 € TTC, déplacement inclus.",
            "Vendredi à 20h, porte fermée à clé à Carpentras après une perte de clés : 210 € TTC pour l'ouverture, plus le cylindre si vous choisissez de le remplacer, prix annoncé avant la pose.",
            "Dimanche à 11h, porte claquée à Orange : 210 € TTC, déplacement inclus.",
            "Lundi, clé de boîte aux lettres perdue à Cavaillon : 90 € TTC, serrure neuve et clés comprises."]),
        ("Vos droits face à un serrurier", [
            "L'arrêté du 24 janvier 2017 oblige les professionnels du dépannage à informer le client de leurs tarifs avant d'intervenir, et à remettre un devis détaillé avant les travaux dès que le montant estimé dépasse 150 € TTC. Une facture détaillée doit ensuite être remise.",
            "Méfiez-vous des annonces à prix d'appel très bas qui cachent des frais de déplacement ou de diagnostic. Un prix honnête est un prix total, annoncé au téléphone avant le départ du serrurier : c'est notre façon de travailler à chaque intervention."]),
    ],
    'faq': [
        ("Quel est le prix d'un serrurier pas cher à Avignon ?",
         "Chez nous, une porte claquée coûte 90 € TTC avant 18h et une porte fermée à clé 130 € TTC, déplacement inclus, sans frais de diagnostic ajoutés."),
        ("Le déplacement est-il facturé en plus ?",
         "Non, le déplacement est inclus dans tous nos prix, partout dans notre zone d'intervention."),
        ("Le prix peut-il changer une fois sur place ?",
         "Le prix de l'ouverture annoncé au téléphone est confirmé sur place avant de commencer. Seules les pièces que vous choisissez de remplacer s'ajoutent, après accord."),
        ("Proposez-vous des devis gratuits ?",
         "Oui, pour le blindage, le renforcement de porte et les changements de serrure planifiés. Le devis est gratuit et sans engagement."),
    ],
    'faits': [('Porte claquée', 'dès 90 € TTC'), ('Porte fermée à clé', 'dès 130 € TTC'), ('Boîte aux lettres', '90 € TTC'), ('Déplacement', 'inclus')],
}

# ---------------------------------------------------------------- FAQ générale
FAQ_GENERALE = [
    ("Combien coûte une ouverture de porte ?",
     "Une ouverture de porte claquée coûte 90 € TTC avant 18h. Une porte fermée à clé coûte 130 € TTC avant 18h. Des majorations s'appliquent après 18h, après 22h, le week-end et les jours fériés (voir notre grille tarifaire). Le déplacement est inclus."),
    ("Comment trouver un serrurier pas cher et honnête ?",
     "Comparez des prix annoncés, pas des promesses : un serrurier sérieux vous donne son tarif au téléphone, déplacement compris, avant de partir. Méfiez-vous des annonces à prix d'appel très bas qui cachent des frais de déplacement ou de diagnostic. Chez nous, une porte claquée coûte 90 € TTC avant 18h, tout compris."),
    ("Quelle différence entre porte claquée et porte verrouillée ?",
     "Une porte claquée est simplement fermée sans tour de clé : seul le pêne demi-tour la retient. Une porte verrouillée a été fermée à clé, ce qui demande une technique d'ouverture plus longue."),
    ("Intervenez-vous la nuit, le dimanche et les jours fériés ?",
     "Oui, nous intervenons 24h/24 et 7j/7, y compris le dimanche et les jours fériés, dans tout le Vaucluse. Les majorations de nuit et de jour férié figurent dans notre grille tarifaire et vous sont confirmées au téléphone."),
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
    ("Pouvez-vous transformer ma porte en porte blindée ?",
     "Oui : le blindage de porte renforce votre porte existante (plaque d'acier, serrure multipoints, cornières anti-pince, poignée blindée) sans la remplacer. C'est une solution plus économique qu'une porte blindée complète. Nous établissons un devis gratuit après avoir vu la porte."),
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
PAR_SLUG = {v['slug']: v for v in VILLES}


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
        'logo': SITE + 'img/logo-cle-ventoux.svg',
        'priceRange': '90 € - 290 €',
        'address': {'@type': 'PostalAddress', 'addressLocality': 'Avignon', 'postalCode': '84000',
                    'addressRegion': 'Vaucluse', 'addressCountry': 'FR'},
        'geo': {'@type': 'GeoCoordinates', 'latitude': AVIGNON[0], 'longitude': AVIGNON[1]},
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
          <rect x="10" y="22" width="80" height="58" rx="10" fill="#FFFFFF" stroke="#00B4E6" stroke-width="4"/>
          <rect x="36" y="12" width="28" height="12" rx="4" fill="#C7D5F0" stroke="#00B4E6" stroke-width="3"/>
          <circle cx="50" cy="51" r="17" fill="#EAF4FF" stroke="#7B66F5" stroke-width="4"/>
          <circle class="q-dot" cx="50" cy="51" r="7" fill="#00B4E6"/>
          <circle class="ph-wave" cx="77" cy="34" r="4" fill="#1B2550"/>
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
    titre = "Nos villes d'intervention dans le Vaucluse" if not courante else 'Nous intervenons aussi dans ces villes'
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
    plus = ''
    if v['slug'] in PLUS:
        t, p = PLUS[v['slug']]
        plus = f'          <h3>{e(t)}</h3>\n          <p>{e(p)}</p>\n'
    if v['slug'] in GUIDE:
        t, ps = GUIDE[v['slug']]
        plus += f'          <h3>{e(t)}</h3>\n' + ''.join(f'          <p>{e(p)}</p>\n' for p in ps)
    urgence = (f' Tout savoir sur notre <a href="{root}serrurier-urgence-avignon/">serrurier en urgence à Avignon 24h/24</a>.'
               if v['nom'] == 'Avignon' else '')
    return f'''  <!-- ========== LOCAL ========== -->
  <section id="secteur" class="alt">
    <div class="container local">
      <div class="prose">
        <div class="section-head" style="text-align:left;margin:0">
          <span class="eyebrow">Serrurier {e(v["a"])}</span>
          <h2>Votre serrurier {e(v["a"])} et alentours</h2>
        </div>
{paras}
          <h3>Les logements {e(v["a"])} et leurs serrures</h3>
{habitat}
{plus}          <h3>Serrurier en urgence {e(v["a"])} : nuit, dimanche et jours fériés</h3>
          <p>{e(URGENCES[v["slug"]])}{urgence}</p>
          <h3>Nos interventions {e(v["a"])}</h3>
          <p><a href="{root}ouverture-de-porte/">Ouverture de porte</a> claquée ou verrouillée, clé cassée ou coincée, réparation et <a href="{root}changement-de-serrure/">changement de serrure</a>, remplacement de cylindre, pose de serrure multipoints, <a href="{root}blindage-de-porte/">blindage de porte</a>, poignée anti-effraction, <a href="{root}reparation-apres-effraction/">réparation après effraction</a> et <a href="{root}depannage-volet-roulant/">dépannage de volets roulants</a>. <a href="{root}tarifs-serrurier/">Voir tous nos tarifs</a> ou <a href="{TEL_HREF}">appeler le {TEL}</a>.</p>
          <p>Besoin d'un conseil avant d'appeler ? Lisez nos guides : <a href="{root}conseils/porte-claquee-que-faire/">porte claquée, que faire ?</a>, <a href="{root}conseils/cle-perdue-que-faire/">clés perdues ou volées</a> et <a href="{root}conseils/eviter-arnaque-serrurier/">comment éviter les arnaques au serrurier</a>.</p>
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


def quartiers_html():
    cartes = '\n'.join(f'''        <article class="card">
          <h3>{e(t)}</h3>
          <p>{e(p)}</p>
        </article>''' for t, p in QUARTIERS_AVIGNON)
    return f'''  <!-- ========== QUARTIERS ========== -->
  <section id="quartiers">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Serrurier Avignon centre et quartiers</span>
        <h2>Serrurier à Avignon, quartier par quartier</h2>
        <p>De l'intra-muros à Montfavet, nous connaissons les portes, les serrures et les accès de chaque secteur de la ville.</p>
      </div>
      <div class="grid grid-3">
{cartes}
      </div>
    </div>
  </section>
'''


# Accueil : présentation du serrurier et des secteurs du département
SECTEURS = [
    ('Avignon et le Grand Avignon', ['Avignon', 'Le Pontet', 'Vedène', 'Morières-lès-Avignon', 'Saint-Saturnin-lès-Avignon', 'Entraigues-sur-la-Sorgue', 'Sorgues']),
    ("De l'autre côté du Rhône", ['Villeneuve-lès-Avignon', 'Les Angles']),
    ('Le Comtat Venaissin', ['Carpentras', 'Monteux', 'Pernes-les-Fontaines', "L'Isle-sur-la-Sorgue", 'Le Thor', 'Châteauneuf-de-Gadagne']),
    ('Le Haut-Vaucluse', ['Orange', 'Courthézon', 'Châteauneuf-du-Pape', 'Bédarrides', 'Bollène', 'Vaison-la-Romaine', 'Valréas']),
    ('Le Luberon et la Durance', ['Cavaillon', 'Caumont-sur-Durance', 'Apt', 'Pertuis']),
]


def presentation_html():
    paras = [
        "Serrurier Vaucluse est un service de dépannage en serrurerie installé à Avignon, qui intervient dans tout le département, 24h/24 et 7j/7. Notre métier : ouvrir les portes claquées ou fermées à clé, changer les serrures et les cylindres, renforcer les portes, sécuriser un logement après une effraction et dépanner les volets roulants, pour les particuliers comme pour les professionnels.",
        "Notre engagement tient en trois points. Le prix est annoncé au téléphone avant le déplacement, puis confirmé sur place avant de commencer. Le déplacement est inclus dans nos tarifs, qui sont les mêmes à Avignon, à Orange, à Apt ou à Valréas. Et chaque intervention donne lieu à une facture détaillée, utile pour votre assurance, votre propriétaire ou votre syndic.",
        "Sur le terrain, nous privilégions toujours les techniques d'ouverture fine, qui laissent la porte et la serrure en état de marche. Le Vaucluse compte beaucoup de portes anciennes, dans les centres historiques d'Avignon, de Carpentras, de Pernes-les-Fontaines ou de Vaison-la-Romaine : elles méritent d'être ouvertes et réparées avec soin plutôt que percées ou remplacées par réflexe.",
        "Du Grand Avignon au Luberon, du Comtat Venaissin au Haut-Vaucluse et jusqu'à l'Enclave des Papes, chaque ville a ses particularités : copropriétés et immeubles anciens en ville, villas et lotissements en périphérie, mas isolés et résidences secondaires à la campagne, domaines viticoles autour de Châteauneuf-du-Pape. Nos pages locales détaillent ces situations et les interventions les plus fréquentes près de chez vous.",
    ]
    secteurs = '\n'.join(
        f'          <h3>{e(t)}</h3>\n          <ul class="chips">\n' + '\n'.join(f'            <li>{lien_ville(n, "")}</li>' for n in villes) + '\n          </ul>'
        for t, villes in SECTEURS)
    return f'''  <!-- ========== PRÉSENTATION ========== -->
  <section id="presentation" class="alt">
    <div class="container local">
      <div class="prose">
        <div class="section-head" style="text-align:left;margin:0">
          <span class="eyebrow">Votre serrurier local</span>
          <h2>Un serrurier à Avignon pour tout le Vaucluse</h2>
        </div>
{chr(10).join(f'          <p>{e(p)}</p>' for p in paras)}
          <p><a href="tarifs-serrurier/">Consulter tous nos tarifs</a> · <a href="conseils/">Lire nos conseils de serrurier</a></p>
      </div>
      <aside>
        <div class="card">
{secteurs}
        </div>
      </aside>
    </div>
  </section>
'''


def tete(titre, desc, url, root, ld, image, robots='index, follow, max-image-preview:large'):
    verif = (f'\n<meta name="google-site-verification" content="{e(GOOGLE_VERIFICATION)}">'
             if GOOGLE_VERIFICATION and url == SITE else '')
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">{verif}
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(titre)}</title>
<meta name="description" content="{e(desc)}">
<meta name="theme-color" content="#070B18">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="{NOM}">
<meta property="og:title" content="{e(titre)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="FR-84">
<link rel="icon" type="image/svg+xml" href="{root}img/logo-cle-ventoux.svg">
<link rel="apple-touch-icon" href="{root}img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"></noscript>
<link rel="stylesheet" href="{root}css/style.css">
<!-- Page générée par _outils/generer.py : modifier le script, pas ce fichier. -->
<script type="application/ld+json">
{json.dumps({'@context': 'https://schema.org', '@graph': ld}, ensure_ascii=False, indent=1)}
</script>
</head>
<body>
'''


def bas(root, complet=True):
    if not complet:
        return f'\n<script defer src="{root}js/site.js"></script>\n</body>\n</html>\n'
    # La 3D (three.js) et la carte (Leaflet) sont chargées par site.js seulement quand elles sont utiles.
    return f'''
<script defer src="{root}js/booking.js"></script>
<script defer src="{root}js/site.js"></script>
</body>
</html>
'''


def page(root, valeurs, sections, titre, desc, url, ld, robots='index, follow, max-image-preview:large', complet=True):
    image = SITE + 'img/partage-serrurier-vaucluse.jpg'
    commun = {
        'ROOT': root, 'HOME': root or './', 'NAV': '', 'ANCRE': '', 'NB_VILLES': str(len(VILLES)), 'ENDPOINT': AGENDA_URL, 'TEL': TEL, 'TEL_HREF': TEL_HREF, 'EMAIL': EMAIL,
        'PIED_SERVICES': '\n'.join(f'          <li><a href="{root}{s["slug"]}/">{e(s["nom"])}</a></li>' for s in SERVICES)
                         + f'\n          <li><a href="{root}tarifs-serrurier/">Nos tarifs</a></li>',
        'PIED_GUIDES': '\n'.join(f'          <li><a href="{root}conseils/{a["slug"]}/">{e(a["h1"])}</a></li>' for a in ARTICLES),
        'PIED_VILLES': '\n'.join(f'          <li><a href="{root}{v["slug"]}/">Serrurier {e(v["nom"])}</a></li>' for v in VILLES),
    }
    commun.update(valeurs)
    corps = bloc('sprite') + '\n' + bloc('entete') + '\n<main>\n' + ''.join(sections) + '</main>\n\n' + bloc('pied')
    return tete(titre, desc, url, root, ld, image, robots) + remplir(corps, commun) + bas(root, complet)


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
    sections = [bloc('hero'), bloc('services'), bloc('tarifs'), realisations_html('', 'dans le Vaucluse'), presentation_html(), bloc('pourquoi'),
                bloc('fonctionnement'), bloc('zones'), villes_html(''), bloc('urgence'), guides_html('', ARTICLES[:6]), bloc('faq'), bloc('contact')]
    ecrire('index.html', page('', valeurs, sections,
                              'Serrurier Vaucluse (84) – Dépannage 24h/24, ouverture de porte',
                              "Serrurier dans le Vaucluse 24h/24 : ouverture de porte dès 90 € TTC, changement de serrure, blindage. Avignon, Carpentras, Orange, Cavaillon… ☎ " + TEL,
                              SITE, ld))


def ville(v):
    root = '../'
    url = f'{SITE}{v["slug"]}/'
    faq = v['faq'] + ([FAQ_PLUS[v['slug']]] if v['slug'] in FAQ_PLUS else []) + FAQ_LOCALES.get(v['slug'], []) + [
        (f"Combien coûte une ouverture de porte {v['a']} ?",
         f"Nos tarifs sont les mêmes {v['a']} que dans tout le Vaucluse, déplacement inclus : 90 € TTC pour une porte claquée et 130 € TTC pour une porte fermée à clé avant 18h. Des majorations s'appliquent après 18h, après 22h, le week-end et les jours fériés."),
        (f"Intervenez-vous autour de {v['nom']} ?",
         f"Oui. Nous intervenons {v['a']} ({v['cp']}) et dans les communes voisines comme {', '.join(v['voisines'][:-1])} et {v['voisines'][-1]}, ainsi que dans tout le département."),
    ] + [FAQ_GENERALE[i] for i in (1, 3, 6, 9)]
    zone = [{'@type': 'City', 'name': v['nom'], 'address': {'@type': 'PostalAddress', 'postalCode': v['cp'], 'addressLocality': v['nom'], 'addressRegion': v.get('dep', 'Vaucluse'), 'addressCountry': 'FR'}}]
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
    sections = [bloc('hero'), local_html(v, root)] + ([quartiers_html()] if v['nom'] == 'Avignon' else []) + [
                bloc('services'), bloc('tarifs'), realisations_html(root, 'dans le Vaucluse'),
                bloc('zones'), bloc('urgence'), bloc('faq'), villes_html(root, v['nom']),
                bloc('contact')]
    titre = v.get('titre', f'Serrurier {v["nom"]} ({v["cp"]}) – Dépannage 24h/24 dès 90 €')
    desc = v.get('desc', f"Serrurier {v['a']} ({v['cp']}) 24h/24 : ouverture de porte dès 90 € TTC, changement de serrure, "
                         f"blindage, prix annoncé à l'avance. ☎ {TEL}")
    ecrire(f'{v["slug"]}/index.html', page(root, valeurs, sections, titre, desc, url, ld))


MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']


def date_fr(iso):
    a, m, j = iso.split('-')
    return f'{int(j)} {MOIS[int(m) - 1]} {a}'


def mots(a):
    textes = [a['lead']] + a['essentiel'] + [r for q, r in a['faq']]
    for t, contenu in a['sections']:
        textes += [t] + [x for x in contenu if x != 'liste']
    return sum(len(t.split()) for t in textes)


def guides_html(root, liste, titre="Nos conseils de serrurier", intro="Des guides pratiques pour réagir en cas d'urgence, éviter les arnaques et mieux protéger votre logement."):
    cartes = '\n'.join(f'''        <a class="card guide-card" href="{root}conseils/{a["slug"]}/">
          <span class="guide-cat">{e(a["categorie"])}</span>
          <h3>{e(a["h1"])}</h3>
          <p>{e(a["desc"])}</p>
          <span class="card-more">Lire le guide · {max(3, round(mots(a) / 200))} min →</span>
        </a>''' for a in liste)
    return f'''  <!-- ========== CONSEILS ========== -->
  <section id="conseils">
    <div class="container">
      <div class="section-head">
        <span class="eyebrow">Conseils</span>
        <h2>{e(titre)}</h2>
        <p>{e(intro)}</p>
      </div>
      <div class="grid grid-3 guides">
{cartes}
      </div>
    </div>
  </section>
'''


def prose_html(sections, ancres=False):
    blocs = []
    for i, (t, contenu) in enumerate(sections):
        ancre = f' id="s{i + 1}"' if ancres else ''
        balise = 'h2' if ancres or i == 0 else 'h3'
        if contenu[0] == 'liste':
            corps = '          <ul class="ticks">\n' + '\n'.join(f'            <li>{e(x)}</li>' for x in contenu[1:]) + '\n          </ul>'
        else:
            corps = '\n'.join(f'          <p>{e(x)}</p>' for x in contenu)
        blocs.append(f'          <{balise}{ancre}>{e(t)}</{balise}>\n{corps}')
    return '\n'.join(blocs)


def article(a):
    root = '../../'
    url = f'{SITE}conseils/{a["slug"]}/'
    duree = max(3, round(mots(a) / 200))
    image = SITE + 'img/partage-serrurier-vaucluse.jpg'
    ld = [
        entreprise_ld([{'@type': 'AdministrativeArea', 'name': 'Vaucluse'}]),
        {'@type': 'BlogPosting', 'headline': a['h1'], 'description': a['desc'], 'url': url, 'mainEntityOfPage': url,
         'datePublished': DATE_CONSEILS, 'dateModified': DATE_CONSEILS, 'inLanguage': 'fr-FR', 'image': image,
         'wordCount': mots(a), 'articleSection': a['categorie'],
         'author': {'@type': 'Organization', 'name': NOM, 'url': SITE}, 'publisher': {'@id': SITE + '#entreprise'}},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Serrurier Vaucluse', 'item': SITE},
            {'@type': 'ListItem', 'position': 2, 'name': 'Conseils', 'item': SITE + 'conseils/'},
            {'@type': 'ListItem', 'position': 3, 'name': a['h1'], 'item': url}]},
        faq_ld(a['faq']),
    ]
    essentiel = '\n'.join(f'            <li>{e(x)}</li>' for x in a['essentiel'])
    sommaire = '\n'.join(f'            <li><a href="#s{i + 1}">{e(t)}</a></li>' for i, (t, _) in enumerate(a['sections']))
    services = '\n'.join(f'            <li><a href="{root}{x["slug"]}/">{e(x["nom"])}</a></li>' for x in SERVICES if x['slug'] in a['liens'])
    autres = [x for x in ARTICLES if x is not a]
    corps = f'''  <!-- ========== EN-TÊTE DU GUIDE ========== -->
  <section class="page-hero">
    <div class="container">
        <nav class="crumbs" aria-label="Fil d'Ariane"><ol><li><a href="{root}">Serrurier Vaucluse</a></li><li><a href="{root}conseils/">Conseils</a></li><li aria-current="page">{e(a["h1"])}</li></ol></nav>
      <span class="badge"><span class="dot"></span>{e(a["categorie"])}</span>
      <h1>{e(a["h1"])}</h1>
      <p class="lead">{e(a["lead"])}</p>
      <p class="article-meta">Mis à jour le {date_fr(DATE_CONSEILS)} · Lecture : {duree} min · Par l'équipe {NOM}</p>
    </div>
  </section>

  <section id="article" class="alt">
    <div class="container local">
      <article class="prose article-body">
        <div class="card key">
          <h2>L'essentiel</h2>
          <ul class="ticks">
{essentiel}
          </ul>
        </div>
{prose_html(a["sections"], ancres=True)}
        <div class="card article-cta">
          <h2>Besoin d'un serrurier dans le Vaucluse ?</h2>
          <p>Prix annoncé au téléphone avant le déplacement, déplacement inclus, 24h/24 et 7j/7. Porte claquée dès 90 € TTC.</p>
          <p><a href="{TEL_HREF}" class="btn btn-light"><svg><use href="#i-phone"/></svg>{TEL}</a> <a href="{root}tarifs-serrurier/" class="btn btn-ghost">Voir nos tarifs</a></p>
        </div>
      </article>
      <aside class="sticky">
        <div class="card">
          <h3>Sommaire</h3>
          <ol class="toc">
{sommaire}
          </ol>
        </div>
        <div class="card">
          <h3>Nos services liés</h3>
          <ul class="chips">
{services}
          </ul>
        </div>
      </aside>
    </div>
  </section>
'''
    valeurs = {
        'FIL': '', 'NAV': root,
        'URGENCE_P': 'Appelez-nous, un serrurier part immédiatement vers vous.',
        'FAQ_H2': 'Questions fréquentes', 'FAQ_ITEMS': faq_html(a['faq']),
        'CONTACT_H2': 'Demandez une intervention ou un devis', 'CONTACT_ZONE': 'Tout le Vaucluse (84)', 'VILLE_EX': 'Avignon',
    }
    sections = [corps, bloc('urgence'), bloc('faq'), guides_html(root, autres[:3], 'À lire aussi', 'D\'autres guides pratiques de nos serruriers.'), bloc('contact')]
    ecrire(f'conseils/{a["slug"]}/index.html', page(root, valeurs, sections, a['titre'], a['desc'], url, ld))


def conseils_index():
    root = '../'
    url = SITE + 'conseils/'
    intro = [
        "Une porte qui claque, des clés qui disparaissent, une serrure qui force un matin d'hiver : la plupart des problèmes de serrurerie arrivent sans prévenir, et souvent au pire moment. Dans l'urgence, on prend parfois de mauvaises décisions : forcer la porte, appeler le premier numéro venu, accepter un prix qui n'a jamais été annoncé.",
        "Nos serruriers interviennent chaque jour à Avignon et dans tout le Vaucluse. Nous avons rassemblé ici les conseils que nous donnons le plus souvent à nos clients : comment réagir quand on est bloqué dehors, comment reconnaître un professionnel honnête, comment choisir une serrure adaptée à son logement, qui doit payer entre locataire et propriétaire, et comment protéger durablement sa maison des cambriolages.",
        "Chaque guide est rédigé pour être utile tout de suite, même si vous ne faites jamais appel à nous. Et si vous avez besoin d'un serrurier, nos tarifs sont publics, le déplacement est inclus et le prix vous est toujours annoncé avant l'intervention.",
    ]
    ld = [
        entreprise_ld([{'@type': 'AdministrativeArea', 'name': 'Vaucluse'}]),
        {'@type': 'CollectionPage', 'name': 'Conseils de serrurier', 'url': url, 'inLanguage': 'fr-FR',
         'hasPart': [{'@type': 'BlogPosting', 'headline': a['h1'], 'url': f'{url}{a["slug"]}/'} for a in ARTICLES]},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Serrurier Vaucluse', 'item': SITE},
            {'@type': 'ListItem', 'position': 2, 'name': 'Conseils', 'item': url}]},
        faq_ld(FAQ_GENERALE),
    ]
    corps = f'''  <section class="page-hero">
    <div class="container">
        <nav class="crumbs" aria-label="Fil d'Ariane"><ol><li><a href="{root}">Serrurier Vaucluse</a></li><li aria-current="page">Conseils</li></ol></nav>
      <span class="badge"><span class="dot"></span>Guides pratiques</span>
      <h1>Conseils de serrurier</h1>
      <p class="lead">Urgences, prix, sécurité, location : nos guides pour bien réagir et bien choisir, rédigés par nos serruriers du Vaucluse.</p>
    </div>
  </section>
  <section id="intro" class="alt">
    <div class="container">
      <div class="prose narrow">
{chr(10).join(f'        <p>{e(p)}</p>' for p in intro)}
      </div>
    </div>
  </section>
'''
    valeurs = {
        'FIL': '', 'NAV': root,
        'URGENCE_P': 'Appelez-nous, un serrurier part immédiatement vers vous.',
        'FAQ_H2': 'Vos questions sur la serrurerie', 'FAQ_ITEMS': faq_html(FAQ_GENERALE),
        'CONTACT_H2': 'Demandez une intervention ou un devis', 'CONTACT_ZONE': 'Tout le Vaucluse (84)', 'VILLE_EX': 'Avignon',
    }
    sections = [corps, guides_html(root, ARTICLES, 'Tous nos guides', 'Choisissez un sujet : chaque guide se lit en quelques minutes.'),
                bloc('urgence'), bloc('faq'), bloc('contact')]
    ecrire('conseils/index.html', page(root, valeurs, sections, 'Conseils de serrurier – Guides pratiques | Serrurier Vaucluse',
                                       "Porte claquée, clés perdues, arnaques, serrures A2P, cambriolage, locataire ou propriétaire : les guides pratiques de nos serruriers du Vaucluse.",
                                       url, ld))


def service(s, info=False):
    root = '../'
    url = f'{SITE}{s["slug"]}/'
    parent = PAR_SLUG.get(s.get('parent'))
    crumbs = [('Serrurier Vaucluse', SITE, '../')] + ([(f'Serrurier {parent["nom"]}', f'{SITE}{parent["slug"]}/', f'../{parent["slug"]}/')] if parent else [])
    ld = [
        entreprise_ld([{'@type': 'AdministrativeArea', 'name': 'Vaucluse'}] + [{'@type': 'City', 'name': v['nom']} for v in VILLES]),
        {'@type': 'WebPage', 'name': s['titre'], 'url': url} if info else
        {'@type': 'Service', 'name': s['nom'], 'serviceType': s['nom'], 'url': url,
         'provider': {'@id': SITE + '#entreprise'}, 'areaServed': {'@type': 'AdministrativeArea', 'name': 'Vaucluse'}},
        {'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': u} for i, (n, u, _) in enumerate(crumbs + [(s['nom'], url, '')])]},
        faq_ld(s['faq']),
    ]
    fil = ('        <nav class="crumbs" aria-label="Fil d\'Ariane"><ol>'
           + ''.join(f'<li><a href="{h}">{e(n)}</a></li>' for n, _, h in crumbs)
           + f'<li aria-current="page">{e(s["nom"])}</li></ol></nav>\n')
    lies = [a for a in ARTICLES if s['slug'] in a['liens']] or ARTICLES[:2]
    guides = '\n'.join(f'            <li><a href="../conseils/{a["slug"]}/">{e(a["h1"])}</a></li>' for a in lies)
    faits = '\n'.join(f'            <li><span>{e(a)}</span><b>{e(b)}</b></li>' for a, b in s['faits'])
    autres = '\n'.join(f'            <li><a href="../{x["slug"]}/">{e(x["nom"])}</a></li>' for x in SERVICES if x is not s)
    villes = '\n'.join(f'            <li><a href="../{v["slug"]}/">{e(v["nom"])}</a></li>' for v in VILLES)
    corps = f'''  <!-- ========== DÉTAIL DU SERVICE ========== -->
  <section id="detail" class="alt">
    <div class="container local">
      <div class="prose">
{prose_html(s["sections"])}
      </div>
      <aside>
        <div class="card">
          <h3>En bref</h3>
          <ul class="facts">
{faits}
          </ul>
          <p style="margin-top:14px"><a href="{TEL_HREF}" class="btn btn-light"><svg><use href="#i-phone"/></svg>{TEL}</a></p>
        </div>
        <div class="card">
          <h3>Nos autres services</h3>
          <ul class="chips">
{autres}
          </ul>
        </div>
        <div class="card">
          <h3>Nos conseils</h3>
          <ul class="links">
{guides}
          </ul>
        </div>
        <div class="card">
          <h3>Dans votre ville</h3>
          <ul class="chips">
{villes}
          </ul>
        </div>
      </aside>
    </div>
  </section>
'''
    valeurs = {
        'FIL': fil, 'NAV': '../', 'HERO_BADGE': 'Serrurier disponible 24h/24 – 7j/7',
        'HERO_H1': s['h1'], 'HERO_LEAD': e(s['lead']),
        'TARIFS_H2': "Nos tarifs, annoncés avant l'intervention",
        'URGENCE_P': 'Appelez-nous, un serrurier part immédiatement vers vous.',
        'FAQ_H2': f'Questions fréquentes – {e(s["nom"])}', 'FAQ_ITEMS': faq_html(s['faq']),
        'CONTACT_H2': 'Demandez une intervention ou un devis', 'CONTACT_ZONE': 'Tout le Vaucluse (84)', 'VILLE_EX': 'Avignon',
    }
    sections = [bloc('hero'), corps, bloc('tarifs'), realisations_html(root, 'dans le Vaucluse'), bloc('urgence'),
                bloc('faq'), villes_html(root, ''), bloc('contact')]
    ecrire(f'{s["slug"]}/index.html', page(root, valeurs, sections, s['titre'], s['desc'], url, ld))
    return lies


# Informations légales : à compléter par le client avant la mise en ligne définitive
A_COMPLETER = '<span class="todo">[à compléter]</span>'
LEGAL = {
    'raison': A_COMPLETER,      # ex. « Jean Dupont, entrepreneur individuel » ou « SARL Serrurier Vaucluse »
    'siret': A_COMPLETER,
    'adresse': A_COMPLETER,
    'directeur': A_COMPLETER,   # directeur de la publication
}


def mentions():
    root = '../'
    corps = f'''  <section id="legal" class="alt">
    <div class="container legal">
      <nav class="crumbs" aria-label="Fil d'Ariane"><ol><li><a href="../">Serrurier Vaucluse</a></li><li aria-current="page">Mentions légales</li></ol></nav>
      <h1>Mentions légales et confidentialité</h1>

      <h2>Éditeur du site</h2>
      <ul class="facts">
        <li><span>Nom commercial</span><b>{NOM}</b></li>
        <li><span>Exploitant</span><b>{LEGAL['raison']}</b></li>
        <li><span>SIRET</span><b>{LEGAL['siret']}</b></li>
        <li><span>Adresse</span><b>{LEGAL['adresse']}</b></li>
        <li><span>Téléphone</span><b><a href="{TEL_HREF}">{TEL}</a></b></li>
        <li><span>E-mail</span><b><a href="mailto:{EMAIL}">{EMAIL}</a></b></li>
        <li><span>Directeur de la publication</span><b>{LEGAL['directeur']}</b></li>
      </ul>

      <h2>Hébergement</h2>
      <p>Netlify, Inc., San Francisco, Californie, États-Unis – netlify.com.</p>

      <h2>Tarifs et dépannage</h2>
      <p>Les prix affichés sont TTC, déplacement inclus, conformément à l'arrêté du 24 janvier 2017 relatif à l'information des consommateurs sur les prestations de dépannage, de réparation et d'entretien dans le secteur du bâtiment et de l'équipement de la maison. Le tarif est annoncé avant l'intervention et confirmé sur place ; une facture détaillée est remise après chaque intervention.</p>

      <h2>Données personnelles</h2>
      <p>Les informations saisies dans le formulaire de demande (nom, téléphone, e-mail facultatif, ville, prestation, date souhaitée, message) servent uniquement à vous recontacter et à organiser l'intervention ; les demandes de rendez-vous sont enregistrées dans l'agenda Google du serrurier. Elles ne sont ni vendues ni cédées à des tiers et sont conservées le temps nécessaire au traitement de votre demande et aux obligations comptables.</p>
      <p>Conformément au RGPD, vous pouvez demander l'accès, la rectification ou l'effacement de vos données en nous contactant par téléphone ou par e-mail. Vous pouvez aussi adresser une réclamation à la CNIL (cnil.fr).</p>
      <p>Le site ne dépose aucun cookie publicitaire ni de mesure d'audience. Pour afficher la police de caractères, l'animation et la carte, votre navigateur contacte des services tiers (Google Fonts, cdnjs de Cloudflare, fonds de carte Esri), qui reçoivent votre adresse IP.</p>

      <h2>Propriété intellectuelle et crédits</h2>
      <p>Les textes, photos d'interventions et le logo appartiennent à {NOM}. Toute reproduction sans autorisation est interdite. Fonds de carte © Esri, HERE, Garmin et les contributeurs OpenStreetMap.</p>
    </div>
  </section>
'''
    valeurs = {'FIL': '', 'NAV': '../', 'ANCRE': '../'}
    ecrire('mentions-legales/index.html', page(root, valeurs, [corps], f'Mentions légales – {NOM}',
                                               f'Mentions légales, hébergement et politique de confidentialité du site {NOM}.',
                                               SITE + 'mentions-legales/', [entreprise_ld([{'@type': 'AdministrativeArea', 'name': 'Vaucluse'}])],
                                               robots='noindex, follow', complet=False))


def plan():
    jour = date.today().isoformat()
    urls = ([SITE] + [f'{SITE}{v["slug"]}/' for v in VILLES] + [f'{SITE}{s["slug"]}/' for s in SERVICES]
            + [f'{SITE}{TARIFS["slug"]}/', f'{SITE}conseils/'] + [f'{SITE}conseils/{a["slug"]}/' for a in ARTICLES])
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
    for s in SERVICES:
        service(s)
    service(TARIFS, info=True)
    conseils_index()
    for a in ARTICLES:
        article(a)
    mentions()
    plan()
    print(f'{1 + len(VILLES) + len(SERVICES) + 2 + len(ARTICLES)} pages générées, sitemap.xml et robots.txt à jour.')
