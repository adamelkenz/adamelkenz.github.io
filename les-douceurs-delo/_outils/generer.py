# -*- coding: utf-8 -*-
"""Génère toutes les pages du site Les Douceurs d'Elo.

    cd les-douceurs-delo && python3 _outils/generer.py

Données : donnees.py · gabarit et composants : commun.py · articles de conseils : articles.py
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from commun import *  # noqa: E402,F401,F403
import articles  # noqa: E402

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAJ = '2026-11-07'
PAGES = []  # (chemin, priorité)

# formats du configurateur : id, nom, précision, prix « dès », étages (largeur, hauteur), cupcakes
FORMATS = [
    ('bento', 'Bento cake', '1 à 2 parts', None, [(150, 84)], 0),
    ('layer46', 'Layer cake 4/6 parts', '4 à 6 parts', 40, [(200, 150)], 0),
    ('layer68', 'Layer cake 6/8 parts', '6 à 8 parts', 50, [(232, 160)], 0),
    ('layer1012', 'Layer cake 10/12 parts', '10 à 12 parts', 65, [(268, 168)], 0),
    ('box', 'Box layer 4/6 + 6 cupcakes', 'coffret à offrir', 45, [(190, 140)], 6),
    ('cupcakes', 'Boîte de 10 cupcakes', '10 pièces', 25, [], 10),
    ('etages2', 'Pièce montée 2 étages', '20 à 30 parts', None, [(250, 112), (176, 100)], 0),
    ('etages3', 'Pièce montée 3 étages', '40 à 60 parts', None, [(286, 100), (214, 92), (146, 84)], 0),
    ('etages4', 'Pièce montée 4 étages', '70 à 100 parts', None, [(300, 90), (238, 84), (178, 78), (122, 72)], 0),
]
TEINTES = [('#fbf3ea', 'Ivoire'), ('#ffffff', 'Blanc'), ('#f2d4cf', 'Rose poudré'), ('#d6e6f2', 'Bleu ciel'),
           ('#dfe6d3', 'Sauge'), ('#e6dcef', 'Lilas'), ('#6b4330', 'Chocolat'), ('#2b2522', 'Noir chic')]
ACCENTS = [('#c9a14e', 'Or'), ('#e39aa5', 'Rose'), ('#b0294f', 'Framboise'), ('#5d8fc4', 'Bleu'),
           ('#8ea97a', 'Vert sauge'), ('#4a2c1d', 'Chocolat'), ('#f7f3ec', 'Blanc')]


def ecrire(chemin, contenu, priorite='0.7'):
    dest = os.path.join(RACINE, chemin, 'index.html') if chemin else os.path.join(RACINE, 'index.html')
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    with open(dest, 'w', encoding='utf-8') as f:
        f.write(contenu)
    PAGES.append((chemin + '/' if chemin else '', priorite))


def ecrire_brut(nom, contenu):
    with open(os.path.join(RACINE, nom), 'w', encoding='utf-8') as f:
        f.write(contenu)


SCHEMA_BOUTIQUE = {
    '@context': 'https://schema.org', '@type': 'Bakery', '@id': SITE + '#boutique', 'name': NOM, 'url': SITE,
    'image': [SITE + 'img/partage.jpg', SITE + 'img/photos/vitrine-960.webp'], 'logo': SITE + 'img/apple-touch-icon.png',
    'description': "Pâtisserie et cake design à Marseille 15e : gâteaux de mariage, pièces montées, layer cakes, cupcakes, "
                   "sweet tables, gâteaux d'anniversaire pour enfants et commandes d'entreprise.",
    'telephone': '+33 6 29 68 81 04', 'priceRange': '€€', 'servesCuisine': 'Pâtisserie',
    'address': {'@type': 'PostalAddress', 'streetAddress': ADRESSE, 'addressLocality': VILLE, 'postalCode': CP,
                'addressRegion': "Provence-Alpes-Côte d'Azur", 'addressCountry': 'FR'},
    'geo': {'@type': 'GeoCoordinates', 'latitude': LAT, 'longitude': LON}, 'hasMap': MAPS,
    'openingHoursSpecification': [{'@type': 'OpeningHoursSpecification',
                                   'dayOfWeek': ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                                   'opens': '12:00', 'closes': '20:00'}],
    'sameAs': [FACEBOOK, SNAPCHAT],
    'areaServed': [{'@type': 'City', 'name': 'Marseille'}, {'@type': 'AdministrativeArea', 'name': 'Bouches-du-Rhône'}],
}


def schema_service(nom, desc, chemin):
    return {'@context': 'https://schema.org', '@type': 'Service', 'name': nom, 'description': desc, 'url': SITE + chemin,
            'provider': {'@id': SITE + '#boutique'}, 'areaServed': {'@type': 'City', 'name': 'Marseille'}}


# ================================================================== accueil
def accueil():
    r = ''
    marquee = ' '.join(f'<span>{m}</span>' for m in [
        'Mariages', 'Anniversaires d\'enfants', 'Séminaires & entreprises', 'Baby showers', 'Baptêmes', 'Aïd & Ramadan',
        'Fiançailles', 'Diplômes', 'Fête des mères', 'Layer cakes', 'Cupcakes', 'Sweet tables'])
    univers = [
        ('gateaux-mariage', '01', 'Mariages', 'Pièces montées, wedding cakes et sweet tables accordés à votre décoration et à votre histoire.', 'perles-or'),
        ('gateaux-entreprises', '02', 'Entreprises', 'Séminaires, inaugurations, cadeaux clients : des douceurs à l\'image de votre marque.', 'vitrine-cupcakes'),
        ('anniversaire-enfant', '03', 'Anniversaires d\'enfants', 'Jungle, princesse, espace, football… le thème de votre enfant, jusqu\'au moindre détail.', 'jungle'),
    ]
    cartes = ''.join(
        f'<a class="carte-univers" href="{s}/" data-r style="--d:{i}">{photo(r, p, "(max-width: 960px) 100vw, 33vw")}'
        f'<div class="cu-txt"><span class="cu-num">{n}</span><h3>{t}</h3><p>{d}</p><span class="cu-lien">Découvrir {ico("fleche")}</span></div></a>'
        for i, (s, n, t, d, p) in enumerate(univers))
    pastilles = ''.join(f'<a class="pastille" href="{s}/">{ico(ic)}{t}</a>' for s, t, ic in [
        ('layer-cakes', 'Layer cakes', 'gateau'), ('cupcakes-mignardises', 'Cupcakes & mignardises', 'cupcake'),
        ('sweet-table-evenements', 'Sweet tables & fêtes', 'etincelle'), ('ateliers-cake-design', 'Ateliers cake design', 'toque'),
        ('calendrier-des-fetes', 'Calendrier des fêtes', 'calendrier')])
    mosa = [('mo-a', 'jungle', 'Thème jungle, 2 ans'), ('mo-b', 'rose-2-ans', 'Rose pailleté, 2 ans'),
            ('mo-c', 'foret-enchantee', 'Gâteau 3D sculpté'), ('mo-d', 'rose-fleurs', 'Roses fraîches, 30 ans'),
            ('mo-e', 'noeud-bleu', 'Nœud turquoise & cadre doré'), ('mo-f', 'princesse', 'Box « Princess » & cupcakes')]
    mosaique = ''.join(f'<figure class="{c}" data-r="z" style="--d:{i}">{photo(r, p, "(max-width: 760px) 50vw, 33vw")}'
                       f'<figcaption>{E(l)}</figcaption>{zoom(r, p, l)}</figure>' for i, (c, p, l) in enumerate(mosa))
    corps = f'''
<section class="heros">
 <div class="heros-fond"></div>
 <canvas id="poussiere" aria-hidden="true"></canvas>
 <div class="conteneur">
  <div>
   <p class="surtitre" data-r>Pâtisserie & cake design · Marseille 15e</p>
   <h1 class="mots">{mots('Des gâteaux <em>sur-mesure</em> qui font le souvenir')}</h1>
   <p class="chapo" data-r style="--d:3">Pièces montées de mariage, layer cakes, cupcakes et sweet tables : Elo imagine et réalise à la main le gâteau de vos grands jours, dans sa boutique de l'avenue de la Viste.</p>
   <div class="actions" data-r style="--d:4">
    <a class="btn or aimant" href="composer-mon-gateau/">{ico("gateau")}Composer mon gâteau</a>
    <a class="btn contour" href="creations/">Voir les créations</a>
   </div>
   <div class="heros-preuves" data-r style="--d:5">
    <a class="preuve" href="avis/"><b data-compte="{NOTE}">{NOTE}</b><span>{etoiles()}<br>{NB_AVIS} avis Google</span></a>
    <span class="preuve-sep"></span>
    <span class="preuve"><span class="statut">Mardi – dimanche, 12h – 20h</span></span>
   </div>
  </div>
  <div class="heros-visuel" data-r="z" style="--d:2">
   <div class="arche">{photo(r, "vitrine", "(max-width: 900px) 82vw, 520px", charge="eager")}</div>
   <div class="medaillon m1">{photo(r, "jungle", "180px", alt="")}</div>
   <div class="medaillon m2">{photo(r, "rose-2-ans", "150px", alt="")}</div>
   <div class="sceau" aria-hidden="true"><svg viewBox="0 0 120 120"><defs><path id="cercle" d="M60 60 m-46 0 a46 46 0 1 1 92 0 a46 46 0 1 1 -92 0"/></defs><text font-family="Jost, sans-serif" font-size="9.6" letter-spacing="3.1" fill="currentColor"><textPath href="#cercle">FAIT MAIN · MARSEILLE · CAKE DESIGN · </textPath></text></svg><span class="coeur">Elo</span></div>
  </div>
 </div>
 <a class="defiler" href="#univers">Découvrir<i></i></a>
</section>

<div class="bandeau" aria-hidden="true"><div class="bandeau-piste">{marquee} {marquee}</div></div>

<section class="section" id="univers">
 <div class="conteneur">
  <div class="tete-section centre"><p class="surtitre">Trois savoir-faire</p><h2 class="mots">{mots('Un gâteau pour chaque <em>grand jour</em>')}</h2>
   <p class="chapo" data-r>Du mariage de 150 invités au goûter des 3 ans, chaque création est pensée pour l'occasion, le nombre de convives et vos goûts.</p></div>
  <div class="univers">{cartes}</div>
  <div class="autres-univers" data-r>{pastilles}</div>
 </div>
</section>

<section class="section creme">
 <div class="conteneur decoupe">
  <div class="scene-decoupe" role="button" tabindex="0" aria-label="Couper une part du layer cake">{decoupe_svg()}</div>
  <div>
   <p class="surtitre" data-r>Sous le décor</p>
   <h2 class="mots">{mots('Une génoise moelleuse, <em>généreusement</em> garnie')}</h2>
   <p data-r style="--d:2">Dans les avis, un mot revient sans cesse : la générosité. Génoise légère, crème onctueuse et garniture fruitée ou chocolatée, montées en couches régulières. Choisissez un parfum pour voir l'intérieur du layer cake <b data-nom-parfum>Fraise</b>.</p>
   <div class="puces" data-r style="--d:3">{parfums_puces()}</div>
   <div class="compo-couches" data-r style="--d:4">
    <div><span class="c" style="background:#f0dbb2"></span><b>Génoise</b><span>moelleuse, cuite chaque jour</span></div>
    <div><span class="c" style="background:#fbf3ea"></span><b>Crème</b><span>onctueuse, peu sucrée</span></div>
    <div><span class="c" style="background:#d9475b"></span><b>Garniture</b><span>fruits, chocolat, spéculoos…</span></div>
   </div>
   <div class="actions" style="margin-top:26px" data-r>
    <button class="btn contour" type="button" data-couper aria-pressed="false">{ico("parts")}<span>Couper une part</span></button>
    <a class="lien-fleche" href="layer-cakes/">Tout sur nos layer cakes {ico("fleche")}</a>
   </div>
  </div>
 </div>
</section>

<section class="section">
 <div class="conteneur">
  <div class="tete-section" style="display:flex;justify-content:space-between;align-items:end;gap:20px;flex-wrap:wrap;max-width:none">
   <div><p class="surtitre">Galerie</p><h2 class="mots">{mots('Quelques <em>créations</em> récentes')}</h2></div>
   <a class="lien-fleche" href="creations/" data-r>Toute la galerie {ico("fleche")}</a>
  </div>
  <div class="mosaique" data-galerie>{mosaique}</div>
 </div>
</section>

{etapes_html(classe="section creme")}

{avis_carrousel(r)}

{boutique_bloc(r)}

<section class="section creme serre">
 <div class="conteneur teasers">
  <a class="teaser" href="ateliers-cake-design/" data-r="g">
   <span class="deco" aria-hidden="true">{ico("toque")}</span>
   <p class="surtitre">Ateliers cake design</p>
   <h3>Apprenez les gestes <em>avec Elo</em></h3>
   <p>Layer cake, cupcakes, popcakes, sweet table : des ateliers en petit groupe, et vous repartez avec vos réalisations.</p>
   <span class="lien-fleche">Voir les ateliers {ico("fleche")}</span>
  </a>
  <a class="teaser" href="calendrier-des-fetes/" data-r="d" data-prochaine>
   <span class="deco" aria-hidden="true">{ico("calendrier")}</span>
   <p class="surtitre">Prochaine occasion</p>
   <h3 data-p-nom>Noël</h3>
   <p data-p-date></p>
   <div class="compte"><div><b data-p-j>–</b><span>jours</span></div><div><b data-p-h>–</b><span>heures</span></div><div><b data-p-m>–</b><span>min</span></div></div>
   <span class="lien-fleche">Calendrier des fêtes & rappels {ico("fleche")}</span>
  </a>
 </div>
</section>

{appel(r)}
'''
    schemas = [SCHEMA_BOUTIQUE, {'@context': 'https://schema.org', '@type': 'WebSite', 'name': NOM, 'url': SITE, 'inLanguage': 'fr-FR'}]
    ecrire('', page(r, '', "Les Douceurs d'Elo | Gâteaux personnalisés & cake design à Marseille",
                    "Pâtisserie et cake design à Marseille 15e : gâteaux de mariage, pièces montées, layer cakes, cupcakes, "
                    "sweet tables et gâteaux d'anniversaire pour enfants. Note 4,7/5, devis gratuit.",
                    corps, schemas, js=('calendrier',)), '1.0')


# ================================================================== mariage
def mariage():
    r, ch = '../', 'gateaux-mariage/'
    et = [('Gâteaux de mariage', None)]
    offres = [
        ('alliances', 'Pièce montée à étages', 'De 2 à 5 étages, crème lisse, fleurs ou dorure, avec un parfum différent par étage si vous le souhaitez.'),
        ('fleur', 'Wedding cake & naked cake', 'Un gâteau plus intimiste, naked ou semi-naked, habillé de fleurs fraîches ou en sucre et de fruits.'),
        ('etincelle', 'Sweet table assortie', 'Cupcakes, popcakes, mignardises et sablés personnalisés aux couleurs du mariage, autour du gâteau.'),
        ('coeur', 'Fiançailles, henné, cérémonies', 'Layer cakes, box et plateaux de douceurs pour toutes les étapes avant le grand jour.'),
    ]
    cartes = ''.join(f'<div class="carte" data-r style="--d:{i}"><div class="ic-carte">{ico(ic)}</div><h3>{t}</h3><p>{d}</p></div>'
                     for i, (ic, t, d) in enumerate(offres))
    styles = [('perles', 'Crème lisse & perles'), ('fleurs', 'Fleurs en cascade'), ('or', 'Feuille d\'or'),
              ('naked', 'Naked cake champêtre'), ('rosettes', 'Rosettes & dentelle')]
    r_styles = ''.join(f'<label><input type="radio" name="style" value="{v}" data-lib="{E(l)}"{" checked" if i == 0 else ""}><span>{E(l)}</span></label>'
                       for i, (v, l) in enumerate(styles))
    teintes = [('#fbf3ea', 'Ivoire'), ('#ffffff', 'Blanc'), ('#f2d4cf', 'Rose poudré'), ('#dfe6d3', 'Sauge'), ('#d6e6f2', 'Bleu ciel')]
    r_teintes = ''.join(f'<label title="{l}"><input type="radio" name="teinte" value="{v}" data-lib="{l}"{" checked" if i == 0 else ""}><span style="background:{v}"><span class="sr">{l}</span></span></label>'
                        for i, (v, l) in enumerate(teintes))
    fleurs = [('#e8c8be', 'Blush'), ('#ffffff', 'Blanc'), ('#3d6fc4', 'Bleu roi'), ('#8ea97a', 'Sauge'), ('#8c2f39', 'Bordeaux'), ('#d9bd8c', 'Champagne')]
    r_fleurs = ''.join(f'<label title="{l}"><input type="radio" name="fleurs" value="{v}" data-lib="{l}"{" checked" if i == 0 else ""}><span style="background:{v}"><span class="sr">{l}</span></span></label>'
                       for i, (v, l) in enumerate(fleurs))
    faq = [
        ('Combien de temps à l\'avance réserver notre gâteau de mariage ?', 'Le plus tôt possible : les week-ends de mai à septembre sont très demandés. Idéalement, bloquez votre date plusieurs mois avant, puis affinez le décor et le nombre de parts dans le dernier mois.'),
        ('Peut-on choisir un parfum différent pour chaque étage ?', 'Oui, c\'est même une bonne idée pour contenter tout le monde : par exemple fraise, chocolat-Nutella et pistache. Elo vous conseille les associations qui se marient le mieux.'),
        ('Combien de parts prévoir ?', 'Comptez une part par invité pour le dessert, un peu plus si le gâteau est le seul dessert. Le simulateur ci-dessus donne une première estimation, affinée ensuite au devis.'),
        ('Faites-vous la livraison et l\'installation sur le lieu de réception ?', 'Les gâteaux se retirent à la boutique. Pour une pièce montée ou une sweet table de mariage, parlez-en lors de votre demande : les conditions de livraison et de mise en place sont étudiées au cas par cas.'),
        ('Peut-on combiner pièce montée et sweet table ?', 'Bien sûr. La pièce montée reste la vedette, et la sweet table (cupcakes, popcakes, mignardises, sablés personnalisés) reprend les mêmes couleurs pour un buffet harmonieux.'),
    ]
    corps = f'''
{heros_page(r, et, 'Mariages & cérémonies', 'Le gâteau de mariage, <em>signature</em> de votre réception',
            'Pièce montée à étages, wedding cake fleuri, naked cake champêtre ou sweet table complète : Elo dessine avec vous un gâteau à l\'image de votre histoire et de votre décoration.',
            actions_devis(r, 'mariage', 'Bonjour Elo ! Nous préparons notre mariage et aimerions un devis pour notre gâteau. '),
            'perles-or', ['Conseils personnalisés sur le style, les parfums et les quantités', 'Un parfum différent par étage, au choix', 'Topper et décor accordés à votre thème', 'Sweet table assortie en option'])}

<section class="section">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Nos formules</p><h2 class="mots">{mots('Du « oui » au <em>dessert</em>')}</h2>
  <p class="chapo" data-r>Chaque mariage est unique : le gâteau aussi. Voici ce qu'Elo réalise le plus souvent pour les couples marseillais.</p></div>
  <div class="grille g4">{cartes}</div>
 </div>
</section>

<section class="section creme" id="simulateur">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Simulateur</p><h2 class="mots">{mots('Imaginez votre <em>pièce montée</em>')}</h2>
  <p class="chapo" data-r>Indiquez le nombre d'invités et votre style : le gâteau se dessine sous vos yeux, avec une estimation des étages et des parts. Envoyez ensuite votre projet à Elo en un clic.</p></div>
  <div class="atelier" id="simulateur-mariage">
   <div class="atelier-scene">
    <div class="rendu" aria-live="polite"></div>
    <div class="bilan">
     <div class="estimation"><span>Proposition</span><b data-etages>3 étages</b></div>
     <div class="resume"><b data-parts>≈ 64 parts</b><br><span data-diametres></span></div>
    </div>
   </div>
   <form class="panneau" id="form-mariage">
    <div class="curseur">
     <div class="curseur-tete"><label class="lbl" for="invites" style="font-family:var(--serif);font-size:1.45rem">Nombre d'invités</label><output data-out-invites>60</output></div>
     <input type="range" id="invites" name="invites" min="20" max="240" step="5" value="60">
     <div class="graduations"><span>20</span><span>80</span><span>160</span><span>240</span></div>
    </div>
    <p class="encart or" data-conseil></p>
    <fieldset class="etape-outil"><legend><i>Style</i>Le décor</legend><div class="choix">{r_styles}</div></fieldset>
    <fieldset class="etape-outil"><legend><i>Teinte</i>La crème</legend><div class="choix couleurs">{r_teintes}</div></fieldset>
    <fieldset class="etape-outil"><legend><i>Accents</i>Fleurs & détails</legend><div class="choix couleurs">{r_fleurs}</div></fieldset>
    <div class="champs">
     <div class="champ"><label for="initiales">Topper (initiales, prénoms)</label><input type="text" id="initiales" name="initiales" maxlength="18" placeholder="S & Y"></div>
     <div class="champ"><label for="date-mariage">Date du mariage</label><input type="date" id="date-mariage" name="date"></div>
    </div>
    <div class="actions"><button class="btn wa" type="submit">{ico("bulle")}Envoyer ce projet à Elo</button></div>
    <p class="note-bas">Estimation indicative (portions de dessert), à affiner ensemble. Aucun engagement : votre message s'ouvre dans WhatsApp.</p>
   </form>
  </div>
 </div>
</section>

<section class="section">
 <div class="conteneur duo">
  <div class="duo-photos" data-r="g">{photo(r, "noeud-bleu", "(max-width: 900px) 55vw, 30vw")}{photo(r, "fleurs-bleues", "(max-width: 900px) 45vw, 25vw")}</div>
  <div>
   <p class="surtitre" data-r>Le détail qui change tout</p>
   <h2 class="mots">{mots('Pâte à sucre, fleurs <em>et dorure</em>')}</h2>
   <p data-r style="--d:2">Nœud modelé à la main, cadre baroque doré, fleurs bleu roi ou blush assorties à vos bouquets : le décor se construit à partir de votre faire-part, de vos couleurs ou d'une simple photo d'inspiration.</p>
   <ul class="atouts" data-r style="--d:3">
    <li>{ico("check")}<span>Apportez vos inspirations (Pinterest, faire-part, échantillon de tissu)</span></li>
    <li>{ico("check")}<span>Crème lisse, naked cake, drip ou effet marbre</span></li>
    <li>{ico("check")}<span>Toppers personnalisés : initiales, prénoms, date</span></li>
   </ul>
   <a class="lien-fleche" href="{r}creations/" data-r>Voir la galerie {ico("fleche")}</a>
  </div>
 </div>
</section>

<section class="section lin">
 <div class="conteneur etroit">
  <div class="tete-section centre"><p class="surtitre">Rétroplanning</p><h2 class="mots">{mots('Quand <em>s\'y prendre</em> ?')}</h2></div>
  <ul class="liste-sobre" data-r>
   <li><b>Dès que la date est fixée</b><span>Réservez votre date auprès d'Elo</span></li>
   <li><b>2 à 3 mois avant</b><span>Style, couleurs, parfums par étage, sweet table</span></li>
   <li><b>3 à 4 semaines avant</b><span>Nombre d'invités confirmé, décor validé</span></li>
   <li><b>La semaine du mariage</b><span>Derniers détails, horaire de retrait</span></li>
  </ul>
  <p class="centre" style="margin-top:26px" data-r><a class="lien-fleche" href="{r}conseils/combien-de-parts-gateau-mariage/">Guide : combien de parts pour un mariage ? {ico("fleche")}</a></p>
 </div>
</section>

{faq_html(faq, classe='section')}
{cartes_liens(r, ['sweet-table-evenements', 'layer-cakes', 'creations'])}
{appel(r, 'Parlons de votre <em>mariage</em>', 'Date, lieu, nombre d\'invités, style : envoyez ces premières informations à Elo et recevez des propositions et un devis gratuit.', 'Bonjour Elo ! Nous préparons notre mariage et aimerions un devis pour notre gâteau. ')}
'''
    ecrire('gateaux-mariage', page(r, ch, "Gâteau de mariage & pièce montée à Marseille | Les Douceurs d'Elo",
                                   "Pièces montées, wedding cakes et sweet tables de mariage sur-mesure à Marseille (13015). "
                                   "Simulateur de pièce montée, parfums par étage, devis gratuit.",
                                   corps, [schema_fil(et), schema_faq(faq), schema_service('Gâteaux de mariage et pièces montées', 'Pièces montées, wedding cakes et sweet tables de mariage sur-mesure.', ch)],
                                   js=('gateau', 'mariage'), actif='gateaux-mariage'), '0.9')


# ================================================================== entreprises
def entreprises():
    r, ch = '../', 'gateaux-entreprises/'
    et = [('Entreprises', None)]
    occ = [
        ('utilisateurs', 'Séminaires & réunions', 'Une pause gourmande qui change du sachet de biscuits : cupcakes, mignardises, mini layer cakes.'),
        ('etincelle', 'Inaugurations & lancements', 'Gâteau aux couleurs de la marque, plateaux de mignardises pour le cocktail.'),
        ('gateau', 'Anniversaires & pots d\'équipe', 'Le gâteau du départ en retraite, de la promotion ou des 10 ans de la société.'),
        ('cadeau', 'Cadeaux clients & fin d\'année', 'Box layer cake + cupcakes ou boîtes de cupcakes personnalisées, prêtes à offrir.'),
        ('mallette', 'CSE & commandes groupées', 'Fête des mères, Noël, Aïd : des commandes groupées pour les salariés.'),
        ('note', 'Salons & événements', 'Des douceurs faciles à servir et à déguster debout, en format individuel.'),
    ]
    cartes = ''.join(f'<div class="carte" data-r style="--d:{i % 3}"><div class="ic-carte">{ico(ic)}</div><h3>{t}</h3><p>{d}</p></div>'
                     for i, (ic, t, d) in enumerate(occ))
    glacages = [('#f6e7cf', 'Vanille'), ('#ffffff', 'Blanc'), ('#f2c9cf', 'Fraise'), ('#7a4b33', 'Chocolat'), ('#d9e4c8', 'Pistache')]
    r_gl = ''.join(f'<label title="{l}"><input type="radio" name="glacage" value="{v}"{" checked" if i == 0 else ""}><span style="background:{v}"><span class="sr">{l}</span></span></label>'
                   for i, (v, l) in enumerate(glacages))
    cups = ''.join('<div class="cupcake"><div class="moule"></div><div class="glacage"></div><div class="disque"></div></div>' for _ in range(6))
    types = [('pause', 'Pause café / séminaire'), ('cocktail', 'Cocktail / inauguration'), ('equipe', 'Anniversaire d\'équipe'), ('cadeau', 'Cadeaux clients')]
    r_types = ''.join(f'<label><input type="radio" name="type" value="{v}"{" checked" if i == 0 else ""}><span>{l}</span></label>' for i, (v, l) in enumerate(types))
    faq = [
        ('Pouvez-vous établir un devis et une facture au nom de l\'entreprise ?', 'Oui : indiquez la raison sociale et l\'adresse de facturation lors de votre demande, Elo vous transmet un devis puis la facture correspondante.'),
        ('Comment personnaliser les douceurs avec notre logo ?', 'Couleurs de la marque dans la crème et les moules, toppers ou disques personnalisés, gâteau reprenant votre logo… Envoyez votre logo et votre charte : Elo vous propose le rendu le plus adapté.'),
        ('Quel délai pour une commande d\'entreprise ?', 'Le plus tôt est le mieux, surtout pour les grosses quantités et les périodes de fêtes. Pour une petite commande, appelez : une solution est souvent possible rapidement.'),
        ('Livrez-vous nos locaux ?', 'Les commandes se retirent à la boutique, avenue de la Viste. Pour un événement important, précisez l\'adresse et l\'horaire : la livraison est étudiée selon la demande.'),
        ('Proposez-vous des commandes régulières ?', 'Oui, pour un rendez-vous mensuel (anniversaires du mois, réunions d\'équipe), il suffit d\'en parler : on organise un format et un calendrier qui vous conviennent.'),
    ]
    corps = f'''
{heros_page(r, et, 'Entreprises & événements professionnels', 'Des douceurs <em>à l\'image</em> de votre entreprise',
            'Séminaire, inauguration, lancement de produit, anniversaire d\'équipe ou cadeaux clients : cupcakes personnalisés, plateaux de mignardises et gâteaux aux couleurs de votre marque, préparés à Marseille.',
            actions_devis(r, 'entreprise', 'Bonjour Elo ! Je vous contacte pour une commande d\'entreprise. ', composer=False) ,
            'vitrine-cupcakes', ['Devis rapide et facture au nom de la société', 'Personnalisation aux couleurs de votre marque', 'Formats individuels, faciles à servir', 'Une réactivité saluée par nos clients'])}

<section class="section">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Pour quelles occasions ?</p><h2 class="mots">{mots('Le sucré qui <em>rassemble</em> vos équipes')}</h2></div>
  <div class="grille g3">{cartes}</div>
 </div>
</section>

<section class="section creme">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Aperçu instantané</p><h2 class="mots">{mots('Visualisez vos cupcakes <em>personnalisés</em>')}</h2>
  <p class="chapo" data-r>Tapez le nom de votre société ou chargez votre logo, choisissez votre couleur : la boîte se met à jour. Votre fichier reste sur votre appareil, rien n'est envoyé.</p></div>
  <div class="atelier">
   <div class="atelier-scene"><div class="rendu"><div class="boite-cupcakes" aria-label="Aperçu d'une boîte de 6 cupcakes personnalisés">{cups}</div></div>
    <div class="bilan"><div class="estimation"><span>Boîte de 6</span><b>À votre image</b></div><p class="resume">Rendu indicatif : la finition exacte est définie avec Elo selon votre logo.</p></div></div>
   <form class="panneau" id="form-logo" onsubmit="return false">
    <div class="champ"><label for="societe">Nom de l'entreprise</label><input type="text" id="societe" name="societe" maxlength="28" placeholder="Votre société"></div>
    <div class="champ"><label for="logo">Logo (facultatif)</label><input type="file" id="logo" name="logo" accept="image/png,image/jpeg,image/svg+xml,image/webp"><button type="button" class="lien-fleche" data-effacer style="background:none;border:0;cursor:pointer;justify-self:start">Retirer le logo</button></div>
    <div class="champs">
     <div class="champ"><label for="couleur">Couleur de votre marque</label><input type="color" id="couleur" name="couleur" value="#2e211b" style="width:100%;height:52px;border:1px solid var(--ligne);border-radius:12px;background:#fff;padding:4px"></div>
     <fieldset class="etape-outil"><legend style="font-size:.8rem;font-family:var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--texte-doux)">Glaçage</legend><div class="choix couleurs">{r_gl}</div></fieldset>
    </div>
   </form>
  </div>
 </div>
</section>

<section class="section">
 <div class="conteneur etroit">
  <div class="tete-section centre"><p class="surtitre">Calculateur</p><h2 class="mots">{mots('Quelle quantité <em>prévoir</em> ?')}</h2></div>
  <form class="panneau" id="form-quantites">
   <fieldset class="etape-outil"><legend><i>1</i>Type d'événement</legend><div class="choix">{r_types}</div></fieldset>
   <div class="curseur">
    <div class="curseur-tete"><label class="lbl" for="personnes" style="font-family:var(--serif);font-size:1.45rem">Nombre de personnes</label><output data-out-personnes>30</output></div>
    <input type="range" id="personnes" name="personnes" min="5" max="300" step="5" value="30">
   </div>
   <div class="encart or"><b>Notre suggestion :</b> <span data-quantite></span><div class="parts-visu" aria-hidden="true"></div></div>
   <div class="actions"><button class="btn wa" type="submit">{ico("bulle")}Demander un devis avec cette estimation</button></div>
   <p class="note-bas">Repères indicatifs, à ajuster selon le reste du buffet et l'horaire de l'événement.</p>
  </form>
 </div>
</section>

<section class="section creme">
 <div class="conteneur duo inverse">
  <div class="photo-cadre arc" data-r="d">{photo(r, "vitrine-gourmande", "(max-width: 900px) 90vw, 45vw")}</div>
  <div>
   <p class="surtitre" data-r>Pourquoi nous choisir</p>
   <h2 class="mots">{mots('Une artisane, <em>un interlocuteur</em>')}</h2>
   <p data-r style="--d:2">Pas de plateforme ni d'intermédiaire : vous échangez directement avec Elo, qui réalise vos douceurs. Les clients soulignent souvent sa réactivité, même pour une demande de dernière minute.</p>
   <ul class="atouts" data-r style="--d:3">
    <li>{ico("check")}<span>Réalisé à la main dans la boutique du 15e arrondissement</span></li>
    <li>{ico("check")}<span>Large choix de parfums : chocolat-Nutella, fraise, pistache, spéculoos, Oreo…</span></li>
    <li>{ico("check")}<span>Formats individuels pratiques : cupcakes, mignardises, mini layers</span></li>
   </ul>
  </div>
 </div>
</section>

{faq_html(faq, classe='section')}
{cartes_liens(r, ['cupcakes-mignardises', 'layer-cakes', 'tarifs'])}
{appel(r, 'Un événement <em>en préparation</em> ?', 'Date, nombre de personnes, format souhaité, logo : envoyez ces informations et recevez un devis rapidement.', 'Bonjour Elo ! Je vous contacte pour une commande d\'entreprise. ')}
'''
    ecrire('gateaux-entreprises', page(r, ch, "Gâteaux & cupcakes personnalisés pour entreprises à Marseille | Les Douceurs d'Elo",
                                       "Cupcakes logotypés, plateaux de mignardises et gâteaux pour séminaires, inaugurations, CSE et cadeaux clients à Marseille. "
                                       "Aperçu de vos cupcakes en ligne, devis et facture.",
                                       corps, [schema_fil(et), schema_faq(faq), schema_service('Gâteaux et cupcakes pour entreprises', 'Cupcakes personnalisés, mignardises et gâteaux pour événements professionnels.', ch)],
                                       js=('entreprise',), actif='gateaux-entreprises'), '0.9')


# ================================================================== anniversaires enfants
def enfants():
    r, ch = '../', 'anniversaire-enfant/'
    et = [('Anniversaires d\'enfants', None)]
    themes = [('jungle', 'Jungle & safari'), ('princesse', 'Princesse'), ('licorne', 'Licorne'), ('sirene', 'Sirène & océan'),
              ('espace', 'Espace'), ('dinos', 'Dinosaures'), ('foot', 'Football'), ('arcenciel', 'Arc-en-ciel'),
              ('nuage', 'Petit nuage'), ('jardin', 'Jardin fleuri'), ('gourmand', 'Gourmand chocolat')]
    tb = ''.join(f'<button type="button" class="theme-btn" data-theme="{i}" aria-pressed="{"true" if k == 0 else "false"}"><span class="pal"></span>{E(n)}</button>'
                 for k, (i, n) in enumerate(themes))
    formats = [
        ('gateau', 'Layer cake à thème', 'Le grand classique : génoise, crème, garniture et un décor qui raconte l\'univers de votre enfant.', 'dès 40 €'),
        ('etincelle', 'Number cake', 'Le chiffre de l\'âge en gâteau, garni de fleurs, macarons, fruits ou bonbons.', 'sur devis'),
        ('coeur', 'Bento cake', 'Le mini gâteau à partager à deux, parfait pour la fête à l\'école ou le jour J en famille.', 'sur devis'),
        ('boite', 'Box layer + cupcakes', 'Un layer cake 4/6 parts et 6 cupcakes assortis, dans un coffret prêt à poser sur la table.', 'dès 45 €'),
        ('cupcake', 'Cupcakes & popcakes', 'Des douceurs individuelles aux couleurs du thème, idéales pour les goûters de classe.', 'boîte de 10 : 25 €'),
        ('ballon', 'Sweet table d\'anniversaire', 'Gâteau, cupcakes, popcakes et sablés personnalisés pour une table qui fait l\'effet waouh.', 'sur devis'),
    ]
    cartes = ''.join(f'<div class="carte" data-r style="--d:{i % 3}"><div class="ic-carte">{ico(ic)}</div><h3>{t}</h3><p>{d}</p><span class="prix">{p}</span></div>'
                     for i, (ic, t, d, p) in enumerate(formats))
    faq = [
        ('Combien de temps à l\'avance commander le gâteau d\'anniversaire ?', 'Idéalement une à deux semaines avant la fête, davantage pour un gâteau très détaillé ou en période de fêtes. Pour une demande de dernière minute, appelez : Elo fera son possible.'),
        ('Pouvez-vous reproduire un personnage de dessin animé ?', 'Elo s\'inspire de l\'univers préféré de votre enfant : couleurs, animaux, objets, ambiance. Les personnages sous licence ne peuvent pas toujours être reproduits à l\'identique ; on trouve ensemble une version originale tout aussi réussie.'),
        ('Quel parfum plaît le plus aux enfants ?', 'Le chocolat-Nutella et l\'Oreo sont les grands favoris, suivis de la fraise. Pour un public mixte, une génoise vanille garnie de fraises met tout le monde d\'accord.'),
        ('Mon enfant a une allergie : est-ce possible ?', 'Signalez toute allergie dès votre demande. Les gâteaux contiennent notamment gluten, œufs et lait, et l\'atelier utilise des fruits à coque (pistache, noisette) : Elo vous dira honnêtement ce qui est envisageable.'),
        ('Combien de parts pour une fête d\'enfants ?', 'Les enfants mangent des parts plus petites : un layer cake 10/12 parts suffit en général pour 12 à 15 enfants. Ajoutez des cupcakes si les parents restent pour le goûter.'),
    ]
    avis = [a for a in AVIS if a[0] in ('Indjil L.', 'Ines')]
    av = ''.join(f'<figure class="avis-carte" data-r style="--d:{i}"><blockquote>{E(t)}</blockquote><figcaption><span><b>{E(n)}</b> · {E(c)}</span>{etoiles()}</figcaption></figure>'
                 for i, (n, c, t) in enumerate(avis))
    corps = f'''
{heros_page(r, et, 'Anniversaires d\'enfants', 'Le gâteau d\'anniversaire <em>dont votre enfant rêvait</em>',
            'Thème jungle, princesse, espace ou football, chiffre en or, prénom en lettres dorées et cupcakes assortis : Elo transforme les idées des petits en gâteaux qu\'on n\'ose pas couper.',
            actions_devis(r, 'anniversaire-enfant', 'Bonjour Elo ! Je prépare l\'anniversaire de mon enfant et je souhaite un devis. '),
            'jungle', ['Le thème choisi par votre enfant, décliné jusqu\'aux cupcakes', 'Prénom, âge et toppers personnalisés', 'Parfums préférés des enfants : chocolat-Nutella, Oreo, fraise', 'Box et sweet tables pour les goûters de classe'])}

<section class="section creme" id="studio">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Studio des thèmes</p><h2 class="mots">{mots('Choisissez <em>son univers</em>')}</h2>
  <p class="chapo" data-r>Laissez votre enfant cliquer sur son thème préféré, ajoutez son prénom et son âge : voici une première idée de son gâteau, à affiner avec Elo.</p></div>
  <div class="atelier" id="studio-enfant">
   <div class="atelier-scene"><div class="rendu" aria-live="polite"></div>
    <div class="bilan"><div class="estimation"><span>Thème</span><b data-nom-theme>Jungle & safari</b></div><p class="resume">Layer cake 6/8 parts, dès 50 € · décor détaillé au devis</p></div></div>
   <form class="panneau" id="form-enfant">
    <fieldset class="etape-outil"><legend><i>1</i>Le thème</legend><div class="themes">{tb}</div></fieldset>
    <div class="curseur">
     <div class="curseur-tete"><label class="lbl" for="age" style="font-family:var(--serif);font-size:1.45rem">Âge</label><output data-out-age>3 ans</output></div>
     <input type="range" id="age" name="age" min="1" max="12" value="3">
    </div>
    <label class="puce" style="width:max-content;padding:10px 16px"><input type="checkbox" name="bougieAge" checked style="accent-color:var(--or)"> Bougie chiffre plutôt que la figurine du thème</label>
    <div class="champs">
     <div class="champ"><label for="prenom-enfant">Prénom</label><input type="text" id="prenom-enfant" name="prenom" maxlength="16" placeholder="Prénom de l'enfant"></div>
     <div class="champ"><label for="invites-enfant">Nombre d'invités</label><input type="number" id="invites-enfant" name="invites" min="1" max="200" placeholder="12"></div>
    </div>
    <div class="champ"><label for="date-enfant">Date de la fête</label><input type="date" id="date-enfant" name="date"></div>
    <div class="actions"><button class="btn wa" type="submit">{ico("bulle")}Envoyer cette idée à Elo</button></div>
   </form>
  </div>
 </div>
</section>

<section class="section">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Les formats</p><h2 class="mots">{mots('Du bento au <em>buffet complet</em>')}</h2></div>
  <div class="grille g3">{cartes}</div>
 </div>
</section>

<section class="section lin">
 <div class="conteneur duo">
  <div class="duo-photos" data-r="g">{photo(r, "rose-2-ans", "(max-width: 900px) 55vw, 30vw")}{photo(r, "princesse", "(max-width: 900px) 45vw, 25vw")}</div>
  <div>
   <p class="surtitre" data-r>Ce que disent les parents</p>
   <h2 class="mots">{mots('« On n\'osait même pas <em>le couper</em> »')}</h2>
   <div class="avis-liste grille" style="gap:16px">{av}</div>
  </div>
 </div>
</section>

<section class="section">
 <div class="conteneur duo">
  <div>
   <p class="surtitre" data-r>Ne ratez plus aucun anniversaire</p>
   <h2 class="mots">{mots('Un rappel <em>chaque année</em>')}</h2>
   <p data-r style="--d:2">Ajoutez la date d'anniversaire de votre enfant à votre agenda : vous recevez une alerte quelques jours avant, le temps de commander son gâteau sereinement. Aucune donnée n'est envoyée, le fichier est créé sur votre appareil.</p>
  </div>
  <form class="panneau carte" id="form-rappel" data-r="d">
   <div class="champs">
    <div class="champ"><label for="prenom-rappel">Prénom</label><input type="text" id="prenom-rappel" name="prenomRappel" maxlength="20" placeholder="Lina"></div>
    <div class="champ"><label for="date-rappel">Date d'anniversaire</label><input type="date" id="date-rappel" name="dateRappel" required></div>
   </div>
   <div class="champ"><label for="delai">Me prévenir</label><select id="delai" name="delai"><option value="7">7 jours avant</option><option value="14" selected>14 jours avant</option><option value="21">3 semaines avant</option></select></div>
   <button class="btn" type="submit">{ico("calendrier")}Ajouter à mon agenda</button>
  </form>
 </div>
</section>

{faq_html(faq)}
{cartes_liens(r, ['layer-cakes', 'cupcakes-mignardises', 'sweet-table-evenements'], classe='section')}
{appel(r, 'Sa fête approche ?', 'Thème, âge, nombre d\'invités, date : écrivez à Elo et recevez une proposition et un devis gratuit.', 'Bonjour Elo ! Je prépare l\'anniversaire de mon enfant et je souhaite un devis. ')}
'''
    ecrire('anniversaire-enfant', page(r, ch, "Gâteau d'anniversaire enfant personnalisé à Marseille | Les Douceurs d'Elo",
                                       "Gâteaux d'anniversaire à thème pour enfants à Marseille : jungle, princesse, licorne, football, number cake, "
                                       "cupcakes et sweet tables. Studio des thèmes en ligne et rappel d'anniversaire.",
                                       corps, [schema_fil(et), schema_faq(faq), schema_service('Gâteaux d\'anniversaire pour enfants', 'Layer cakes à thème, number cakes, cupcakes et sweet tables d\'anniversaire.', ch)],
                                       js=('gateau', 'enfants'), actif='anniversaire-enfant'), '0.9')


# ================================================================== layer cakes
def outil_parts(r):
    return f'''<form class="panneau carte" id="form-parts" onsubmit="return false">
 <div class="curseur">
  <div class="curseur-tete"><label class="lbl" for="invites-parts" style="font-family:var(--serif);font-size:1.45rem">Nombre d'invités</label><output data-out-invites>10</output></div>
  <input type="range" id="invites-parts" name="invites" min="2" max="150" value="10">
  <div class="graduations"><span>2</span><span>50</span><span>100</span><span>150</span></div>
 </div>
 <label class="puce" style="width:max-content;padding:10px 16px"><input type="checkbox" name="autres" style="accent-color:var(--or)"> Il y aura d'autres desserts</label>
 <div class="resultat-parts">
  <div><b data-p-parts>10 parts</b><span>à prévoir</span></div>
  <div><b data-p-budget style="font-size:1.6rem">dès 65 €</b><span>budget indicatif</span></div>
  <div><span data-p-format style="font-size:.92rem;color:var(--cacao)">Un layer cake 10/12 parts</span><br><span>format conseillé</span></div>
 </div>
 <div class="parts-visu" aria-hidden="true"></div>
 <a class="btn or" href="{r}composer-mon-gateau/" data-p-lien data-base="{r}composer-mon-gateau/">{ico("gateau")}Composer ce gâteau</a>
</form>'''


def layer():
    r, ch = '../', 'layer-cakes/'
    et = [('Layer cakes', None)]
    fmts = [('Layer cake 4/6 parts', 'dès 40 €', 'Pour un dîner, un anniversaire en petit comité.'),
            ('Layer cake 6/8 parts', 'dès 50 €', 'Le format préféré des fêtes de famille.'),
            ('Layer cake 10/12 parts', 'dès 65 €', 'Pour les grandes tablées et les goûters d\'enfants.'),
            ('Box layer 4/6 + 6 cupcakes', 'dès 45 €', 'Le coffret assorti, prêt à offrir.')]
    cartes = ''.join(f'<div class="carte" data-r style="--d:{i}"><div class="ic-carte">{ico("gateau")}</div><h3>{t}</h3><p>{d}</p><span class="prix">{p}</span></div>'
                     for i, (t, p, d) in enumerate(fmts))
    desc_parfums = {
        'chocolat': 'Génoise cacao, crème chocolat et cœur de Nutella : l\'incontournable.',
        'fraise': 'Génoise vanille, crème légère et fraises : frais et gourmand.',
        'framboise': 'La version acidulée, parfaite avec un décor blanc et rose.',
        'speculoos': 'Biscuit épicé et caramélisé, un goût qui rappelle l\'enfance.',
        'oreo': 'Génoise chocolat et crème aux éclats de biscuit : succès garanti auprès des ados.',
        'pistache': 'Crème pistache délicate, élégante pour les mariages et les fêtes.',
        'dubai': 'Chocolat, crème pistache et cheveux d\'ange croustillants, la tendance du moment.',
        'mangue': 'Exotique et ensoleillée, idéale l\'été.',
        'caramel': 'Caramel beurre salé fondant, pour les amateurs de douceur intense.',
    }
    lp = ''.join(f'<li><b>{E(n)}</b><span>{desc_parfums[i]}</span></li>' for i, n, *_ in PARFUMS)
    faq = [
        ('Comment conserver un layer cake ?', 'Au réfrigérateur, dans sa boîte, jusqu\'au moment de servir. Sortez-le 20 à 30 minutes avant la dégustation : la crème retrouve toute sa texture et les parfums s\'expriment mieux.'),
        ('Comment le transporter sans l\'abîmer ?', 'Posez la boîte bien à plat (au sol de la voiture ou sur un siège à plat), jamais sur les genoux, et évitez la chaleur. Climatisation en été, et direction le frigo dès l\'arrivée.'),
        ('Peut-on écrire un prénom ou un message ?', 'Oui : prénom, âge, « Joyeux anniversaire », message en lettres dorées ou topper personnalisé. Précisez-le dans votre demande.'),
        ('Les parts en vitrine sont-elles les mêmes que les gâteaux sur commande ?', 'Oui, même génoise et mêmes crèmes. La vitrine permet justement de goûter un parfum avant de commander un gâteau entier.'),
    ]
    corps = f'''
{heros_page(r, et, 'Le gâteau signature', 'Le layer cake, <em>gâteau signature</em> de la maison',
            'Des couches de génoise moelleuse, de crème onctueuse et de garniture généreuse, sous un décor à votre image : drip, fleurs fraîches, chiffre, feuille d\'or. C\'est le gâteau qui a fait la réputation d\'Elo.',
            actions_devis(r, 'anniversaire'), 'rose-fleurs',
            ['Formats 4/6, 6/8 et 10/12 parts', 'Neuf parfums au choix, et des créations de saison', 'Personnalisation : prénom, âge, couleurs, thème', 'À goûter à la part en vitrine'])}

<section class="section creme">
 <div class="conteneur decoupe">
  <div class="scene-decoupe" role="button" tabindex="0" aria-label="Couper une part du layer cake">{decoupe_svg()}</div>
  <div>
   <p class="surtitre" data-r>Parfums</p>
   <h2 class="mots">{mots('Neuf parfums, <em>une seule exigence</em>')}</h2>
   <p data-r style="--d:2">Cliquez sur un parfum pour voir l'intérieur : <b data-nom-parfum>Fraise</b>.</p>
   <div class="puces" data-r style="--d:3">{parfums_puces()}</div>
   <div class="compo-couches" data-r style="--d:4">
    <div><span class="c" style="background:#f0dbb2"></span><b>Génoise</b><span>moelleuse et légère</span></div>
    <div><span class="c" style="background:#fbf3ea"></span><b>Crème</b><span>onctueuse</span></div>
    <div><span class="c" style="background:#d9475b"></span><b>Garniture</b><span>généreuse</span></div>
   </div>
   <div class="actions" style="margin-top:22px"><button class="btn contour" type="button" data-couper aria-pressed="false">{ico("parts")}<span>Couper une part</span></button></div>
  </div>
 </div>
</section>

<section class="section">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Formats & prix</p><h2 class="mots">{mots('Le bon format <em>pour chaque tablée</em>')}</h2>
  <p class="chapo" data-r>Prix de départ relevés sur nos dernières offres : le tarif final dépend du décor choisi. Les gâteaux à étages sont sur devis.</p></div>
  <div class="grille g4">{cartes}</div>
 </div>
</section>

<section class="section lin">
 <div class="conteneur duo">
  <div>
   <p class="surtitre" data-r>Combien de parts ?</p>
   <h2 class="mots">{mots('Trouvez la <em>bonne taille</em>')}</h2>
   <p data-r style="--d:2">Indiquez le nombre d'invités : on vous conseille le format et un budget de départ. S'il y a d'autres desserts au menu, prévoyez un peu moins de parts.</p>
   <p data-r style="--d:3"><a class="lien-fleche" href="{r}tarifs/">Tous les tarifs {ico("fleche")}</a></p>
  </div>
  <div data-r="d">{outil_parts(r)}</div>
 </div>
</section>

<section class="section">
 <div class="conteneur duo inverse">
  <div class="duo-photos" data-r="d">{photo(r, "drip-chocolat", "(max-width: 900px) 55vw, 30vw")}{photo(r, "part-layer", "(max-width: 900px) 45vw, 25vw")}</div>
  <div>
   <p class="surtitre" data-r>La carte des parfums</p>
   <h2 class="mots">{mots('À chacun <em>son préféré</em>')}</h2>
   <ul class="liste-sobre" data-r style="--d:2">{lp}</ul>
  </div>
 </div>
</section>

{faq_html(faq)}
{cartes_liens(r, ['anniversaire-enfant', 'cupcakes-mignardises', 'composer-mon-gateau'], classe='section')}
{appel(r)}
'''
    ecrire('layer-cakes', page(r, ch, "Layer cake personnalisé à Marseille, dès 40 € | Les Douceurs d'Elo",
                               "Layer cakes personnalisés à Marseille : génoise moelleuse, 9 parfums (chocolat-Nutella, fraise, pistache, Oreo…), "
                               "formats 4/6 à 10/12 parts dès 40 €. Calculateur de parts et décors sur-mesure.",
                               corps, [schema_fil(et), schema_faq(faq), schema_service('Layer cakes personnalisés', 'Layer cakes sur-mesure, neuf parfums, formats 4/6 à 10/12 parts.', ch)],
                               js=('parts',), actif='layer-cakes'), '0.9')


# ================================================================== cupcakes & mignardises
def cupcakes():
    r, ch = '../', 'cupcakes-mignardises/'
    et = [('Cupcakes & mignardises', None)]
    prods = [
        ('vitrine-cupcakes', 'Boîte de 10 cupcakes', '25 €', 'Chocolat-Nutella, fraise, framboise, spéculoos ou Oreo : composez votre boîte, glaçage aux couleurs de la fête.'),
        ('princesse', 'Box layer cake + cupcakes', 'dès 45 €', 'Un layer cake 4/6 parts et 6 cupcakes assortis : le coffret qui fait plaisir à coup sûr.'),
        ('vitrine-gourmande', 'Plateau de 20 mignardises', '20 €', 'Un assortiment de petites bouchées pour les réceptions, les ftours et les pots d\'équipe.'),
        ('tiramisu', 'Tiramisu maison', '15 € les 4', 'En barquettes individuelles, parfum au choix : un dessert qui se partage sans façon.'),
        ('verrines', 'Desserts individuels', 'en vitrine', 'Verrines et desserts du moment, à emporter selon l\'arrivage du jour.'),
        ('parts-layer', 'Parts de layer cake', '4 € la part', 'Pour goûter tous les parfums avant de commander votre gâteau.'),
    ]
    cartes = ''.join(f'<div class="carte carte-photo" data-r style="--d:{i % 3}"><div class="cp-img">{photo(r, p, "(max-width: 640px) 100vw, 33vw")}</div>'
                     f'<div class="cp-txt"><h3>{t}</h3><p>{d}</p><span class="prix">{px}</span></div></div>' for i, (p, t, px, d) in enumerate(prods))
    autres = [('cupcake', 'Popcakes', 'Des bouchées de gâteau en sucette, enrobées et décorées : les enfants adorent.'),
              ('etincelle', 'Magnum cakes', 'Le gâteau en forme de glace, enrobé de chocolat : effet garanti sur une sweet table.'),
              ('crayon', 'Sablés personnalisés', 'Prénoms, initiales, logos ou messages sur des sablés décorés, à offrir aux invités.')]
    c2 = ''.join(f'<div class="carte" data-r style="--d:{i}"><div class="ic-carte">{ico(ic)}</div><h3>{t}</h3><p>{d}</p></div>' for i, (ic, t, d) in enumerate(autres))
    corps = f'''
{heros_page(r, et, 'Petites douceurs', 'Cupcakes, mignardises & <em>petites douceurs</em>',
            'Boîtes de cupcakes, box layer cake, plateaux de mignardises, tiramisu, popcakes et sablés personnalisés : les formats qui se partagent, s\'offrent et se dégustent en une bouchée.',
            actions_devis(r, 'autre', 'Bonjour Elo ! Je souhaite commander des cupcakes / mignardises. '), 'vitrine-cupcakes',
            ['Parfums : chocolat-Nutella, fraise, framboise, spéculoos, Oreo', 'Glaçages aux couleurs de votre fête', 'Formules box et plateaux prêts à offrir', 'Offres de saison (Ramadan, diplômes, fêtes)'])}

<section class="section">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">La carte</p><h2 class="mots">{mots('Nos <em>classiques</em>')}</h2>
  <p class="chapo" data-r>Prix relevés sur nos dernières offres, susceptibles d'évoluer selon les saisons et les promotions du moment.</p></div>
  <div class="grille g3">{cartes}</div>
 </div>
</section>

<section class="section creme">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Pour les sweet tables</p><h2 class="mots">{mots('Les bouchées <em>qui font sensation</em>')}</h2></div>
  <div class="grille g3">{c2}</div>
 </div>
</section>

<section class="section">
 <div class="conteneur duo">
  <div class="photo-cadre" data-r="g">{photo(r, "vitrine-parts", "(max-width: 900px) 90vw, 45vw")}</div>
  <div>
   <p class="surtitre" data-r>Idées d'occasions</p>
   <h2 class="mots">{mots('Une boîte pour <em>chaque moment</em>')}</h2>
   <ul class="liste-sobre" data-r style="--d:2">
    <li><b>Ftour du Ramadan</b><span>Tiramisu, mignardises, box layer</span></li>
    <li><b>Goûter de classe</b><span>Cupcakes ou popcakes aux couleurs du thème</span></li>
    <li><b>Pot de bureau</b><span>Plateaux de mignardises</span></li>
    <li><b>Cadeau de remerciement</b><span>Boîte de cupcakes personnalisée</span></li>
    <li><b>Diplôme, réussite</b><span>Box layer cake + cupcakes</span></li>
   </ul>
   <p data-r style="margin-top:20px"><a class="lien-fleche" href="{r}calendrier-des-fetes/">Voir le calendrier des fêtes {ico("fleche")}</a></p>
  </div>
 </div>
</section>

{cartes_liens(r, ['sweet-table-evenements', 'gateaux-entreprises', 'boutique'])}
{appel(r, 'Une envie <em>de douceurs</em> ?', 'Indiquez les quantités, les parfums et la date : Elo vous confirme la commande et le prix.', 'Bonjour Elo ! Je souhaite commander des cupcakes / mignardises. ')}
'''
    ecrire('cupcakes-mignardises', page(r, ch, "Cupcakes, mignardises & tiramisu à Marseille | Les Douceurs d'Elo",
                                        "Boîtes de 10 cupcakes (25 €), box layer cake + cupcakes, plateaux de 20 mignardises, tiramisu, popcakes et sablés "
                                        "personnalisés à Marseille 15e. Commande et retrait en boutique.",
                                        corps, [schema_fil(et), schema_service('Cupcakes et mignardises', 'Boîtes de cupcakes, plateaux de mignardises, tiramisu, popcakes.', ch)],
                                        actif='cupcakes-mignardises'), '0.8')


# ================================================================== sweet tables & fêtes
def sweet():
    r, ch = '../', 'sweet-table-evenements/'
    et = [('Sweet tables & fêtes', None)]
    evts = [
        ('noeud-bleu', 'Baby shower & gender reveal', 'Bleu ciel, rose poudré ou les deux : un gâteau surprise et une table douce pour accueillir bébé.'),
        ('fleurs-bleues', 'Baptême & naissance', 'Décor tout en délicatesse, fleurs en sucre, prénom en lettres dorées.'),
        ('perles-or', 'Fiançailles & henné', 'Blanc et or, perles et dorure : l\'élégance pour les grandes étapes.'),
        ('costume-vert', 'Aïd, Ramadan & fêtes religieuses', 'Gâteaux « Eid Mubarak », plateaux de mignardises et sweet tables pour recevoir.'),
        ('rose-fleurs', 'Anniversaires adultes', '18, 30, 40, 50 ans : chiffre doré, roses fraîches, thème sur-mesure.'),
        ('foret-enchantee', 'Gâteaux 3D & sculptés', 'Livre, costume, objet fétiche : pour les projets qui sortent de l\'ordinaire.'),
    ]
    cartes = ''.join(f'<div class="carte carte-photo" data-r style="--d:{i % 3}"><div class="cp-img">{photo(r, p, "(max-width: 640px) 100vw, 33vw")}</div>'
                     f'<div class="cp-txt"><h3>{t}</h3><p>{d}</p></div></div>' for i, (p, t, d) in enumerate(evts))
    compo = [('gateau', 'La pièce maîtresse', 'Layer cake ou gâteau à étages, au centre de la table.'),
             ('cupcake', 'Cupcakes & popcakes', 'Faciles à attraper, déclinés dans vos couleurs.'),
             ('etincelle', 'Magnum cakes & sablés', 'Personnalisés aux prénoms ou au thème, parfaits en cadeau d\'invité.'),
             ('boite', 'Mignardises & tiramisu', 'Pour varier les textures et les plaisirs.')]
    c2 = ''.join(f'<div class="carte" data-r style="--d:{i}"><div class="ic-carte">{ico(ic)}</div><h3>{t}</h3><p>{d}</p></div>' for i, (ic, t, d) in enumerate(compo))
    corps = f'''
{heros_page(r, et, 'Sweet tables & fêtes de famille', 'Sweet tables & <em>fêtes de famille</em>',
            'Baby shower, baptême, fiançailles, Aïd, diplôme ou anniversaire : un buffet de desserts harmonisé, du gâteau central aux cupcakes, popcakes et sablés personnalisés.',
            actions_devis(r, 'evenement', 'Bonjour Elo ! Je prépare un événement et je souhaite un devis pour une sweet table. '), 'noeud-bleu',
            ['Un thème et une palette de couleurs cohérents', 'Des quantités calculées selon vos invités', 'Gâteau central + bouchées individuelles', 'Elo transmet aussi la sweet table en atelier'])}

<section class="section">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Événements</p><h2 class="mots">{mots('Toutes les raisons <em>de se réunir</em>')}</h2></div>
  <div class="grille g3">{cartes}</div>
 </div>
</section>

<section class="section creme">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Composition</p><h2 class="mots">{mots('Une sweet table <em>réussie</em>')}</h2>
  <p class="chapo" data-r>En complément du gâteau, comptez en moyenne 3 à 5 bouchées sucrées par invité. Elo ajuste la composition selon l'heure, la durée de la fête et le reste du menu.</p></div>
  <div class="grille g4">{c2}</div>
  <p class="centre" style="margin-top:30px" data-r><a class="lien-fleche" href="{r}conseils/reussir-sa-sweet-table/">Guide : réussir sa sweet table {ico("fleche")}</a></p>
 </div>
</section>

{etapes_html('Votre fête, <em>clé en main</em>', 'Organisation')}
{cartes_liens(r, ['gateaux-mariage', 'cupcakes-mignardises', 'calendrier-des-fetes'])}
{appel(r, 'Votre fête <em>mérite le meilleur</em>', 'Type d\'événement, date, nombre d\'invités, couleurs : envoyez vos idées, Elo vous propose une sweet table sur-mesure.', 'Bonjour Elo ! Je prépare un événement et je souhaite un devis pour une sweet table. ')}
'''
    ecrire('sweet-table-evenements', page(r, ch, "Sweet table, baby shower, baptême & Aïd à Marseille | Les Douceurs d'Elo",
                                          "Sweet tables et gâteaux pour baby showers, baptêmes, fiançailles, henné, Aïd et anniversaires à Marseille : "
                                          "gâteau central, cupcakes, popcakes, magnum cakes et sablés personnalisés.",
                                          corps, [schema_fil(et), schema_service('Sweet tables et gâteaux d\'événements', 'Buffets de desserts et gâteaux pour fêtes de famille.', ch)],
                                          actif='sweet-table-evenements'), '0.8')


# ================================================================== galerie
def galerie():
    r, ch = '../', 'creations/'
    et = [('Galerie', None)]
    filtres = ''.join(f'<button type="button" class="puce" data-filtre="{i}" aria-pressed="{"true" if i == "tout" else "false"}" style="padding:9px 18px">{E(n)}</button>'
                      for i, n in CATEGORIES_GALERIE)
    figs = ''.join(f'<figure data-cat="{c}">{photo(r, p, "(max-width: 640px) 100vw, 33vw")}<figcaption>{E(l)}</figcaption>{zoom(r, p, l)}</figure>'
                   for p, c, l in GALERIE)
    corps = f'''
{heros_page(r, et, 'Galerie', 'Nos <em>créations</em>', 'Mariages, anniversaires d\'enfants, gâteaux sculptés et vitrine du jour : un aperçu du travail d\'Elo. Cliquez sur une photo pour l\'agrandir.')}
<section class="section serre" style="padding-top:0">
 <div class="conteneur">
  <div class="filtres" data-filtres="#galerie">{filtres}</div>
  <div class="galerie" id="galerie" data-galerie>{figs}</div>
  <div class="encart centre" style="margin-top:40px" data-r>
   <p style="margin:0 0 12px">Les nouveautés sont publiées chaque semaine sur les réseaux de la boutique.</p>
   <div class="actions" style="justify-content:center">
    <a class="btn contour petit-btn" href="{FACEBOOK}" target="_blank" rel="noopener">{ico("fb")}Facebook</a>
    <a class="btn contour petit-btn" href="{SNAPCHAT}" target="_blank" rel="noopener">{ico("snap")}Snapchat</a>
   </div>
  </div>
 </div>
</section>
{appel(r, 'Un coup de cœur <em>dans la galerie</em> ?', 'Envoyez la photo qui vous inspire à Elo : elle l\'adapte à votre événement, à vos couleurs et au nombre de parts.')}
'''
    ecrire('creations', page(r, ch, "Galerie de gâteaux : mariages, anniversaires, layer cakes | Les Douceurs d'Elo",
                             "Galerie des créations de Les Douceurs d'Elo à Marseille : gâteaux de mariage, anniversaires d'enfants, gâteaux 3D, "
                             "layer cakes, cupcakes et vitrine de la boutique.",
                             corps, [schema_fil(et)], actif='creations'), '0.8')


# ================================================================== configurateur
def composer():
    r, ch = '../', 'composer-mon-gateau/'
    et = [('Composer mon gâteau', None)]
    occ = [('anniversaire', 'Anniversaire'), ('anniversaire-enfant', 'Anniversaire enfant'), ('mariage', 'Mariage'),
           ('entreprise', 'Entreprise'), ('naissance', 'Baby shower / naissance'), ('aid', 'Aïd / fête religieuse'),
           ('diplome', 'Diplôme'), ('autre', 'Autre')]
    r_occ = ''.join(f'<label><input type="radio" name="occasion" value="{v}" data-lib="{E(l)}"{" checked" if i == 0 else ""}><span>{E(l)}</span></label>' for i, (v, l) in enumerate(occ))
    r_fmt = ''.join(f'<label><input type="radio" name="format" value="{i}" data-lib="{E(n)}"{" checked" if i == "layer68" else ""}><span>{E(n)}<small>{E(p)}{" · dès " + str(px) + " €" if px else " · sur devis"}</small></span></label>'
                    for i, n, p, px, _, _ in FORMATS)
    r_parf = ''.join(f'<label><input type="radio" name="parfum" value="{i}" data-lib="{E(n)}"{" checked" if i == "fraise" else ""}><span style="flex-direction:row;align-items:center;gap:8px"><i style="width:16px;height:16px;border-radius:50%;background:conic-gradient({g} 0 120deg,{c} 0 240deg,{f} 0)"></i>{E(n)}</span></label>'
                     for i, n, g, c, f in PARFUMS)
    fin = [('lisse', 'Crème lisse'), ('drip', 'Drip (coulure)'), ('naked', 'Naked cake')]
    r_fin = ''.join(f'<label><input type="radio" name="finition" value="{v}" data-lib="{l}"{" checked" if i == 0 else ""}><span>{l}</span></label>' for i, (v, l) in enumerate(fin))
    r_te = ''.join(f'<label title="{l}"><input type="radio" name="teinte" value="{v}" data-lib="{l}"{" checked" if i == 0 else ""}><span style="background:{v}"><span class="sr">{l}</span></span></label>' for i, (v, l) in enumerate(TEINTES))
    r_ac = ''.join(f'<label title="{l}"><input type="radio" name="accent" value="{v}" data-lib="{l}"{" checked" if i == 0 else ""}><span style="background:{v}"><span class="sr">{l}</span></span></label>' for i, (v, l) in enumerate(ACCENTS))
    dec = [('fleurs', 'Fleurs'), ('or', 'Feuille d\'or'), ('perles', 'Perles'), ('fruits', 'Fruits rouges'), ('rosettes', 'Rosettes de crème')]
    r_dec = ''.join(f'<label><input type="checkbox" name="deco" value="{v}" data-lib="{E(l)}"{" checked" if v == "rosettes" else ""}><span>{E(l)}</span></label>' for v, l in dec)
    corps = f'''
{heros_page(r, et, 'Configurateur', 'Composez <em>votre gâteau</em>', 'Format, parfum, finition, couleurs et décor : votre gâteau prend forme en direct. Une fois satisfait, envoyez le récapitulatif à Elo par WhatsApp ou SMS pour recevoir un devis.')}
<section class="section serre" style="padding-top:0">
 <div class="conteneur">
  <div class="atelier" id="atelier">
   <div class="atelier-scene">
    <div class="rendu" aria-live="polite"></div>
    <div class="bilan">
     <div class="estimation"><span>Estimation</span><b data-prix>dès 50 €</b></div>
     <p class="resume" data-resume></p>
    </div>
   </div>
   <form class="panneau" id="form-atelier">
    <fieldset class="etape-outil"><legend><i>1</i>L'occasion</legend><div class="choix">{r_occ}</div></fieldset>
    <fieldset class="etape-outil"><legend><i>2</i>Le format</legend><div class="choix">{r_fmt}</div></fieldset>
    <fieldset class="etape-outil"><legend><i>3</i>Le parfum</legend><div class="choix">{r_parf}</div></fieldset>
    <fieldset class="etape-outil"><legend><i>4</i>La finition</legend><div class="choix">{r_fin}</div></fieldset>
    <fieldset class="etape-outil"><legend><i>5</i>La teinte</legend><div class="choix couleurs">{r_te}</div></fieldset>
    <fieldset class="etape-outil"><legend><i>6</i>Couleur d'accent</legend><div class="choix couleurs">{r_ac}</div></fieldset>
    <fieldset class="etape-outil"><legend><i>7</i>Le décor</legend><div class="choix">{r_dec}</div></fieldset>
    <fieldset class="etape-outil"><legend><i>8</i>Personnalisation</legend>
     <div class="champs">
      <div class="champ"><label for="texte">Texte (prénom, message)</label><input type="text" id="texte" name="texte" maxlength="22" placeholder="Joyeux anniversaire"></div>
      <div class="champ" data-bloc-bougie><label for="bougie">Chiffre (âge)</label><input type="text" id="bougie" name="bougie" inputmode="numeric" maxlength="2" placeholder="30"></div>
     </div>
    </fieldset>
    <fieldset class="etape-outil"><legend><i>9</i>Pour quand ?</legend>
     <div class="champs">
      <div class="champ"><label for="date">Date souhaitée</label><input type="date" id="date" name="date"></div>
      <div class="champ"><label for="prenom">Votre prénom</label><input type="text" id="prenom" name="prenom" maxlength="40" autocomplete="given-name"></div>
     </div>
     <div class="champ" style="margin-top:14px"><label for="details">Précisions (thème, nombre d'invités, allergies…)</label><textarea id="details" name="details" maxlength="600" placeholder="Ex. : thème jungle, 15 invités, retrait samedi vers 15h"></textarea></div>
    </fieldset>
    <div class="actions">
     <button class="btn wa" type="submit">{ico("bulle")}Envoyer sur WhatsApp</button>
     <button class="btn contour" type="button" data-sms>{ico("discussion")}Par SMS</button>
     <button class="btn contour" type="button" data-copier>{ico("copier")}Copier</button>
     <button class="lien-fleche" type="button" data-hasard style="background:none;border:0;cursor:pointer">{ico("des")}Idée surprise</button>
    </div>
    <p class="note-bas">L'aperçu est une illustration : Elo vous propose ensuite un décor détaillé et un prix précis. Rien n'est enregistré sur ce site.</p>
   </form>
  </div>
 </div>
</section>
{etapes_html(classe='section creme')}
'''
    ecrire('composer-mon-gateau', page(r, ch, "Composer mon gâteau en ligne : configurateur & devis | Les Douceurs d'Elo",
                                       "Composez votre gâteau personnalisé en ligne : format, parfum, finition, couleurs et décor, avec aperçu en direct. "
                                       "Envoyez votre projet à Les Douceurs d'Elo (Marseille) pour un devis gratuit.",
                                       corps, [schema_fil(et)], js=('gateau', 'atelier'), actif='composer-mon-gateau'), '0.9')


# ================================================================== tarifs
def tarifs():
    r, ch = '../', 'tarifs/'
    et = [('Tarifs', None)]
    blocs = ''.join(f'<div class="tarifs-bloc" data-r><h3>{E(t)}</h3>' + ''.join(
        f'<div class="tarif"><b>{E(n)}</b><span class="p">{E(p)}</span><small>{E(d)}</small></div>' for n, p, d in items) + '</div>'
        for t, items in TARIFS)
    corps = f'''
{heros_page(r, et, 'Tarifs', 'Des prix <em>clairs</em>, un devis gratuit', 'Voici les prix de départ relevés sur nos dernières offres. Le tarif final dépend du décor, de la taille et des finitions : Elo vous envoie toujours un devis précis avant de valider.')}
<section class="section serre" style="padding-top:0">
 <div class="conteneur duo" style="align-items:start">
  <div>{blocs}<p class="note-bas">Prix TTC indicatifs, susceptibles d'évoluer selon les saisons, les promotions et la complexité du décor. Seul le devis fait foi.</p></div>
  <div style="position:sticky;top:calc(var(--hdr) + 20px)" data-r="d">
   <p class="surtitre">Combien de parts ?</p>
   <h2 class="mots" style="font-size:clamp(1.9rem,3.4vw,2.6rem)">{mots('Le bon format <em>en un clin d\'œil</em>')}</h2>
   {outil_parts(r)}
  </div>
 </div>
</section>
{cartes_liens(r, ['composer-mon-gateau', 'layer-cakes', 'gateaux-mariage'])}
{appel(r)}
'''
    ecrire('tarifs', page(r, ch, "Tarifs : layer cake dès 40 €, cupcakes, pièces montées | Les Douceurs d'Elo",
                          "Prix indicatifs des gâteaux Les Douceurs d'Elo à Marseille : layer cake dès 40 €, box layer + cupcakes dès 45 €, "
                          "boîte de 10 cupcakes 25 €, mignardises, pièces montées sur devis. Calculateur de parts.",
                          corps, [schema_fil(et)], js=('parts',), actif='tarifs'), '0.8')


# ================================================================== boutique
def boutique():
    r, ch = '../', 'boutique/'
    et = [('La boutique', None)]
    corps = f'''
{heros_page(r, et, 'Marseille 15e', 'La boutique <em>et sa vitrine</em>', 'Au 3 avenue de la Viste, la vitrine se garnit chaque jour de parts de layer cake, de cupcakes, de tiramisu et des boxes du moment. C\'est aussi ici que vous récupérez vos commandes.',
            f'<a class="btn or" href="{MAPS_ITI}" target="_blank" rel="noopener">{ico("lieu")}Itinéraire</a><a class="btn contour" href="tel:{TEL_LIEN}">{ico("tel")}{TEL}</a>', 'vitrine',
            ['Ouvert du mardi au dimanche, de 12h à 20h', 'Parts, cupcakes et desserts à emporter', 'Retrait des gâteaux personnalisés', 'Conseils et prises de commande sur place'])}

<section class="section creme">
 <div class="conteneur duo" style="align-items:start">
  <div>
   <p class="surtitre" data-r>Horaires</p>
   <h2 class="mots">{mots('Quand <em>passer</em> ?')}</h2>
   <p data-r><span class="statut">Mardi – dimanche, 12h – 20h</span></p>
   <div data-r style="--d:2">{horaires_html()}</div>
   <p class="note-bas" style="margin-top:14px">Horaires susceptibles de varier les jours fériés et pendant les congés : un appel ou un message avant de vous déplacer de loin, et vous êtes sûr de trouver porte ouverte.</p>
  </div>
  <div>
   <p class="surtitre" data-r>Accès</p>
   <h2 class="mots">{mots('Nous <em>trouver</em>')}</h2>
   <div data-r style="--d:2">{plan_html(r)}</div>
   <div class="infos-boutique" style="margin-top:22px" data-r>
    <div class="ligne-info"><span class="ic">{ico("lieu")}</span><div><b>{ADRESSE}, {CP} {VILLE}</b>Quartier de la Viste, à côté du parc Brégante · <a href="{MAPS}" target="_blank" rel="noopener">Voir sur Google Maps</a></div></div>
    <div class="ligne-info"><span class="ic">{ico("tel")}</span><div><b><a href="tel:{TEL_LIEN}">{TEL}</a></b>Appel, SMS ou WhatsApp</div></div>
   </div>
  </div>
 </div>
</section>

<section class="section">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">En vitrine</p><h2 class="mots">{mots('Ce que vous y <em>trouverez</em>')}</h2>
  <p class="chapo" data-r>La sélection change selon les jours et les saisons. Pour être sûr de trouver votre parfum préféré, réservez par message.</p></div>
  <div class="grille g4" data-galerie>
   {''.join(f'<div class="carte carte-photo" data-r style="--d:{i}"><div class="cp-img" style="position:relative">{photo(r, p, "(max-width: 640px) 100vw, 25vw")}{zoom(r, p, t)}</div><div class="cp-txt"><h3>{t}</h3><p>{d}</p></div></div>'
            for i, (p, t, d) in enumerate([('vitrine-parts', 'Parts de layer cake', 'Chocolat, fraise, citron, spéculoos…'), ('vitrine-cupcakes', 'Cupcakes', 'À l\'unité ou en boîte'), ('tiramisu', 'Tiramisu', 'Maison, en barquettes'), ('drip-chocolat', 'Gâteaux prêts à emporter', 'Selon l\'arrivage du jour')]))}
  </div>
  <div class="encart or" style="margin-top:34px" data-r><b>Vous nous connaissiez avenue des Chartreux ?</b> La boutique vous accueille désormais au {ADRESSE}, {CP} {VILLE}. Même pâtissière, mêmes recettes.</div>
 </div>
</section>

{avis_carrousel(r, 'Une adresse <em>recommandée</em>')}
{appel(r, 'Réservez <em>votre gâteau</em>', 'Pour une commande personnalisée, contactez Elo : elle vous conseille et vous donne un rendez-vous de retrait.')}
'''
    sch = dict(SCHEMA_BOUTIQUE)
    ecrire('boutique', page(r, ch, "Boutique avenue de la Viste, Marseille 15e : horaires & accès | Les Douceurs d'Elo",
                            "Pâtisserie Les Douceurs d'Elo, 3 avenue de la Viste, 13015 Marseille. Ouvert du mardi au dimanche de 12h à 20h : "
                            "parts de layer cake, cupcakes, tiramisu et retrait des commandes.",
                            corps, [schema_fil(et), sch], actif='boutique'), '0.8')


# ================================================================== ateliers
def ateliers():
    r, ch = '../', 'ateliers-cake-design/'
    et = [('Ateliers cake design', None)]
    wa_liste = 'Bonjour Elo ! Je souhaite être prévenu(e) des prochaines dates d\'ateliers cake design. Prénom : '
    ats = [
        ('gateau', 'Atelier layer cake', 'sur demande', 'Monter un layer cake de A à Z : génoise, garnissage, lissage de la crème et décor. Idéal pour débuter ou se perfectionner.',
         ['Génoise et montage en couches', 'Lissage et finitions nettes', 'Décor : drip, fleurs, toppers']),
        ('etincelle', 'Atelier sweet table', 'dès 150 € la journée', 'Une journée pour réaliser une sweet table complète sur un thème au choix (Aïd, amour, couleur, sirène…).',
         ['Cupcakes', 'Magnum cakes', 'Sablés personnalisés et popcakes']),
    ]
    cartes = ''.join(f'''<div class="carte" data-r style="--d:{i}"><div class="ic-carte">{ico(ic)}</div><h3>{t}</h3><span class="prix" style="margin:0 0 12px">{p}</span><p>{d}</p>
<ul class="atouts" style="margin-top:16px">{''.join(f'<li>{ico("check")}<span>{x}</span></li>' for x in l)}</ul></div>''' for i, (ic, t, p, d, l) in enumerate(ats))
    faq = [
        ('Faut-il avoir un niveau particulier ?', 'Non : les ateliers sont pensés pour les passionnés comme pour les débutants. Elo adapte les conseils au niveau de chacun.'),
        ('Combien de participants par atelier ?', 'Les groupes sont volontairement petits (la dernière session sweet table comptait 5 places) pour que chacun pratique et soit accompagné.'),
        ('Où ont lieu les ateliers ?', f'À la boutique, au {ADRESSE}, {CP} {VILLE}.'),
        ('Repart-on avec ses réalisations ?', 'Oui, vous emportez tout ce que vous avez réalisé pendant l\'atelier.'),
        ('Comment connaître les prochaines dates ?', 'Elles sont annoncées sur Snapchat et Facebook. Le plus simple : inscrivez-vous sur la liste d\'attente par WhatsApp, Elo vous prévient en priorité.'),
    ]
    corps = f'''
{heros_page(r, et, 'Apprendre avec Elo', 'Ateliers <em>cake design</em> à Marseille', 'Envie de réaliser vous-même de beaux gâteaux ? Elo partage ses techniques en petit groupe : layer cake, cupcakes, magnum cakes, popcakes, sablés décorés et sweet tables.',
            f'<a class="btn wa" href="{wa(wa_liste)}" target="_blank" rel="noopener">{ico("bulle")}Rejoindre la liste d\'attente</a><a class="btn contour" href="{SNAPCHAT}" target="_blank" rel="noopener">{ico("snap")}Suivre les annonces</a>',
            'part-layer', ['Petits groupes, beaucoup de pratique', 'Vous repartez avec vos réalisations', 'Thèmes de saison : Aïd, Saint-Valentin, couleurs…', 'Dans la boutique de l\'avenue de la Viste'])}
<section class="section">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">Les formules</p><h2 class="mots">{mots('Deux ateliers, <em>mille idées</em>')}</h2></div>
  <div class="grille g2">{cartes}</div>
  <p class="note-bas" style="margin-top:18px">Tarifs et programmes indiqués d'après les dernières sessions ; chaque nouvelle date est annoncée avec son programme.</p>
 </div>
</section>
<section class="section creme">
 <div class="conteneur duo">
  <div class="photo-cadre arc" data-r="g">{photo(r, "vitrine-cupcakes", "(max-width: 900px) 90vw, 45vw")}</div>
  <div>
   <p class="surtitre" data-r>Une idée cadeau</p>
   <h2 class="mots">{mots('Offrez un atelier <em>gourmand</em>')}</h2>
   <p data-r style="--d:2">Anniversaire, enterrement de vie de jeune fille, sortie entre amies ou activité d'équipe : un atelier cake design est un cadeau original qui laisse de beaux souvenirs (et de bons gâteaux). Contactez Elo pour organiser une session privée.</p>
   <a class="btn or" data-r href="{wa('Bonjour Elo ! Je souhaite organiser / offrir un atelier cake design. ')}" target="_blank" rel="noopener">{ico("cadeau")}Organiser une session</a>
  </div>
 </div>
</section>
{faq_html(faq, classe='section')}
{appel(r, 'Prêt·e à mettre <em>la main à la pâte</em> ?', 'Inscrivez-vous sur la liste d\'attente : vous serez prévenu·e en priorité des prochaines dates.', wa_liste)}
'''
    ecrire('ateliers-cake-design', page(r, ch, "Ateliers & formation cake design à Marseille | Les Douceurs d'Elo",
                                        "Ateliers cake design en petit groupe à Marseille 15e : layer cake, sweet table (cupcakes, magnum cakes, popcakes, sablés). "
                                        "Vous repartez avec vos réalisations. Liste d'attente par WhatsApp.",
                                        corps, [schema_fil(et), schema_faq(faq)], actif='ateliers-cake-design'), '0.7')


# ================================================================== avis
def avis():
    r, ch = '../', 'avis/'
    et = [('Avis clients', None)]
    cartes = ''.join(f'<figure class="avis-carte" data-r style="--d:{i % 2}"><blockquote>{E(t)}</blockquote><figcaption><span><b>{E(n)}</b> · {E(c)}</span>{etoiles()}</figcaption></figure>'
                     for i, (n, c, t) in enumerate(AVIS))
    themes = ''.join(f'<span class="pastille">{E(t)}</span>' for t in THEMES_AVIS)
    corps = f'''
{heros_page(r, et, 'Avis Google', f'{NOTE} sur 5, <em>{NB_AVIS} avis</em>', 'Des parents, des mariés, des entreprises : ils ont commandé chez Elo et l\'ont fait savoir. Voici quelques extraits, cités tels quels.')}
<section class="section serre" style="padding-top:0">
 <div class="conteneur">
  <div class="centre" data-r style="margin-bottom:34px"><p class="note-geante" style="color:var(--cacao)"><span data-compte="{NOTE}">{NOTE}</span><small style="color:var(--or)"> / 5</small></p><p>{etoiles()}</p>
   <p class="petit">Les sujets qui reviennent le plus dans les avis :</p><div class="autres-univers" style="margin-top:10px">{themes}</div></div>
  <div class="grille g2 avis-liste">{cartes}</div>
  <div class="encart centre" style="margin-top:40px" data-r>
   <p style="margin:0 0 12px">Vous avez goûté nos gâteaux ? Votre avis aide d'autres familles à nous découvrir.</p>
   <div class="actions" style="justify-content:center"><a class="btn or" href="{MAPS}" target="_blank" rel="noopener">{etoiles(1)}Laisser un avis sur Google</a><a class="btn contour" href="{MAPS}" target="_blank" rel="noopener">Lire tous les avis</a></div>
  </div>
 </div>
</section>
{appel(r)}
'''
    ecrire('avis', page(r, ch, f"Avis clients : {NOTE}/5 sur Google | Les Douceurs d'Elo, Marseille",
                        f"Les clients de Les Douceurs d'Elo à Marseille donnent {NOTE}/5 sur {NB_AVIS} avis Google : gâteaux d'anniversaire, layer cakes, "
                        "réactivité et générosité. Extraits d'avis.",
                        corps, [schema_fil(et)], actif='avis'), '0.6')


# ================================================================== calendrier
def calendrier():
    r, ch = '../', 'calendrier-des-fetes/'
    et = [('Calendrier des fêtes', None)]
    corps = f'''
{heros_page(r, et, 'Calendrier des fêtes', 'Ne ratez plus <em>une occasion</em>', 'Fête des mères, Aïd, Noël, Saint-Valentin, diplômes : les prochaines dates à retenir, la date idéale pour commander, et des rappels à ajouter à votre agenda en un clic.')}
<section class="section serre" style="padding-top:0">
 <div class="conteneur etroit">
  <ol class="occasions" id="occasions" style="list-style:none;padding:0;margin:0"><li class="encart">Activez JavaScript pour afficher les prochaines dates.</li></ol>
  <p class="note-bas" style="margin-top:16px">Les dates des fêtes musulmanes sont estimées et peuvent varier d'un jour selon l'observation de la lune.</p>
 </div>
</section>
<section class="section creme">
 <div class="conteneur duo">
  <div>
   <p class="surtitre" data-r>Mon carnet d'anniversaires</p>
   <h2 class="mots">{mots('Les dates qui comptent, <em>rappelées chaque année</em>')}</h2>
   <p data-r style="--d:2">Anniversaire des enfants, de maman, anniversaire de mariage : ajoutez la date à votre agenda avec une alerte quelques jours avant. Le fichier est créé sur votre appareil, rien n'est envoyé ni enregistré.</p>
  </div>
  <form class="panneau carte" id="form-carnet" data-r="d">
   <div class="champ"><label for="type">C'est…</label><select id="type" name="type"><option value="anniv">Un anniversaire</option><option value="mariage">Un anniversaire de mariage</option><option value="fete">Une fête (prénom)</option></select></div>
   <div class="champs">
    <div class="champ"><label for="qui">Prénom(s)</label><input type="text" id="qui" name="qui" maxlength="30" required placeholder="Maman, Adam…"></div>
    <div class="champ"><label for="quand">Date</label><input type="date" id="quand" name="quand" required></div>
   </div>
   <div class="champ"><label for="delai-c">Me prévenir</label><select id="delai-c" name="delai"><option value="7">7 jours avant</option><option value="14" selected>14 jours avant</option><option value="21">3 semaines avant</option></select></div>
   <button class="btn" type="submit">{ico("calendrier")}Ajouter à mon agenda</button>
  </form>
 </div>
</section>
{cartes_liens(r, ['layer-cakes', 'cupcakes-mignardises', 'composer-mon-gateau'], classe='section')}
{appel(r)}
'''
    ecrire('calendrier-des-fetes', page(r, ch, "Calendrier des fêtes & rappels gâteaux | Les Douceurs d'Elo, Marseille",
                                        "Prochaines fêtes (fête des mères, Aïd, Noël, Saint-Valentin, diplômes) avec la date idéale pour commander votre gâteau "
                                        "à Marseille, et rappels d'anniversaire à ajouter à votre agenda.",
                                        corps, [schema_fil(et)], js=('calendrier',), actif='calendrier-des-fetes'), '0.6')


# ================================================================== FAQ
FAQ_GENERALE = [
    ('Commandes', [
        ('Comment passer commande ?', 'Par téléphone au 06 29 68 81 04, par WhatsApp, via le <a href="../composer-mon-gateau/">configurateur</a> ou le <a href="../contact/">formulaire de devis</a>, ou directement à la boutique. Elo vous répond avec des conseils et un devis.'),
        ('Combien de temps à l\'avance faut-il commander ?', 'Pour un gâteau personnalisé, comptez idéalement une à deux semaines. Pour un mariage ou un gros événement, plusieurs mois. Et pour une urgence, appelez : une solution est parfois possible en quelques jours.'),
        ('Un acompte est-il demandé ?', 'Pour les commandes personnalisées, un acompte peut être demandé pour bloquer la date et lancer la réalisation. Les modalités sont précisées sur votre devis.'),
        ('Puis-je envoyer une photo d\'inspiration ?', 'Oui, c\'est même recommandé. Elo l\'adapte à votre thème, à vos couleurs et au nombre de parts.'),
    ]),
    ('Gâteaux & parfums', [
        ('Quels parfums proposez-vous ?', 'Chocolat-Nutella, fraise, framboise, spéculoos, Oreo, pistache, chocolat « Dubaï », mangue et caramel beurre salé, ainsi que des parfums de saison.'),
        ('Faites-vous des gâteaux sans gluten ou sans lactose ?', 'Les recettes contiennent gluten, œufs et produits laitiers, et l\'atelier manipule des fruits à coque. Pour toute allergie ou intolérance, parlez-en à Elo avant de commander.'),
        ('Comment conserver mon gâteau ?', 'Au réfrigérateur dans sa boîte, à sortir 20 à 30 minutes avant de servir. Il se déguste idéalement dans les 48 heures.'),
    ]),
    ('Retrait & paiement', [
        ('Où récupérer ma commande ?', f'À la boutique, au {ADRESSE}, {CP} {VILLE}, du mardi au dimanche entre 12h et 20h, à l\'horaire convenu.'),
        ('Livrez-vous ?', 'Les commandes se retirent en boutique. Pour un mariage ou un événement important, la livraison peut être étudiée : précisez-le dans votre demande.'),
        ('Faites-vous des factures pour les entreprises ?', 'Oui, sur simple demande, au nom de votre société.'),
    ]),
]


def faq():
    r, ch = '../', 'faq/'
    et = [('Questions fréquentes', None)]
    blocs, tout = '', []
    for t, items in FAQ_GENERALE:
        tout += items
        d = ''.join(f'<details data-r><summary>{E(q)}</summary><div class="rep"><p>{a}</p></div></details>' for q, a in items)
        blocs += f'<h2 style="font-size:2rem;margin-top:1.4em">{E(t)}</h2><div class="faq">{d}</div>'
    corps = f'''
{heros_page(r, et, 'Bon à savoir', 'Questions <em>fréquentes</em>', 'Commandes, délais, parfums, allergies, retrait : les réponses aux questions que l\'on pose le plus souvent à Elo.')}
<section class="section serre" style="padding-top:0"><div class="conteneur etroit">{blocs}</div></section>
{appel(r, 'Une autre <em>question</em> ?', 'Elo vous répond par téléphone, SMS ou WhatsApp, du mardi au dimanche.')}
'''
    ecrire('faq', page(r, ch, "Questions fréquentes : commande, délais, parfums | Les Douceurs d'Elo",
                       "Comment commander un gâteau chez Les Douceurs d'Elo à Marseille ? Délais, acompte, parfums, allergies, conservation, retrait "
                       "et factures : toutes les réponses.",
                       corps, [schema_fil(et), schema_faq(tout)], actif='faq'), '0.6')


# ================================================================== contact
def contact():
    r, ch = '../', 'contact/'
    et = [('Contact & devis', None)]
    occ = [('anniversaire', 'Anniversaire'), ('anniversaire-enfant', 'Anniversaire enfant'), ('mariage', 'Mariage'), ('entreprise', 'Entreprise'),
           ('evenement', 'Baby shower, baptême, fiançailles'), ('aid', 'Aïd / Ramadan'), ('atelier', 'Atelier cake design'), ('autre', 'Autre demande')]
    o = ''.join(f'<option value="{v}">{E(l)}</option>' for v, l in occ)
    po = '<option value="">Je ne sais pas encore</option>' + ''.join(f'<option>{E(n)}</option>' for _, n, *_ in PARFUMS)
    corps = f'''
{heros_page(r, et, 'Devis gratuit', 'Parlons de <em>votre gâteau</em>', 'Remplissez ces quelques champs : votre demande s\'ouvre dans WhatsApp (ou par SMS), prête à être envoyée à Elo. Réponse rapide, conseils et devis sans engagement.')}
<section class="section serre" style="padding-top:0">
 <div class="conteneur duo" style="align-items:start">
  <form class="panneau carte" id="form-devis" novalidate>
   <div class="champs">
    <div class="champ"><label for="occasion">Occasion</label><select id="occasion" name="occasion">{o}</select></div>
    <div class="champ"><label for="date-c">Date de l'événement</label><input type="date" id="date-c" name="date"></div>
   </div>
   <div class="champs">
    <div class="champ"><label for="parts">Nombre de personnes</label><input type="number" id="parts" name="parts" min="1" max="1000" placeholder="20"></div>
    <div class="champ"><label for="parfum">Parfum</label><select id="parfum" name="parfum">{po}</select></div>
   </div>
   <div class="champ"><label for="retrait">Retrait</label><select id="retrait" name="retrait"><option value="boutique">Retrait à la boutique</option><option value="livraison">J'aimerais étudier une livraison</option></select></div>
   <div class="champ"><label for="message">Votre idée</label><textarea id="message" name="message" maxlength="800" required placeholder="Thème, couleurs, texte à inscrire, photo d'inspiration à envoyer ensuite…"></textarea></div>
   <div class="champs">
    <div class="champ"><label for="prenom-c">Prénom</label><input type="text" id="prenom-c" name="prenom" required autocomplete="given-name"></div>
    <div class="champ"><label for="tel-c">Téléphone</label><input type="tel" id="tel-c" name="telephone" autocomplete="tel" placeholder="06…"></div>
   </div>
   <div class="actions">
    <button class="btn wa" type="submit">{ico("bulle")}Envoyer sur WhatsApp</button>
    <button class="btn contour" type="button" data-sms>{ico("discussion")}Envoyer par SMS</button>
   </div>
   <button class="lien-fleche" type="button" data-apercu style="background:none;border:0;cursor:pointer;justify-self:start">Voir le message</button>
   <pre class="encart" data-apercu-zone hidden style="white-space:pre-wrap;font-family:var(--sans);margin:0"></pre>
   <p class="note-bas">Aucune donnée n'est enregistrée par ce site : le message est simplement préparé dans votre application.</p>
  </form>
  <div>
   <div class="infos-boutique" data-r="d">
    <div class="ligne-info"><span class="ic">{ico("tel")}</span><div><b><a href="tel:{TEL_LIEN}">{TEL}</a></b>Appel, SMS ou WhatsApp</div></div>
    <div class="ligne-info"><span class="ic">{ico("lieu")}</span><div><b>{ADRESSE}, {CP} {VILLE}</b><a href="{MAPS_ITI}" target="_blank" rel="noopener">Itinéraire</a></div></div>
    <div class="ligne-info"><span class="ic">{ico("horloge")}</span><div><b>Mardi – dimanche, 12h – 20h</b><span class="statut">Fermé le lundi</span></div></div>
    <div class="ligne-info"><span class="ic">{ico("fb")}</span><div><b>Réseaux</b><a href="{FACEBOOK}" target="_blank" rel="noopener">Facebook</a> · <a href="{SNAPCHAT}" target="_blank" rel="noopener">Snapchat @lesdouceursdelo</a></div></div>
   </div>
   <div style="margin-top:28px" data-r>{plan_html(r)}</div>
  </div>
 </div>
</section>
{etapes_html(classe='section creme')}
'''
    ecrire('contact', page(r, ch, "Contact & devis gratuit | Les Douceurs d'Elo, pâtisserie à Marseille 15e",
                           "Demandez un devis gratuit à Les Douceurs d'Elo : gâteau de mariage, anniversaire, entreprise. 06 29 68 81 04, WhatsApp, "
                           "3 avenue de la Viste, 13015 Marseille.",
                           corps, [schema_fil(et), SCHEMA_BOUTIQUE], js=('contact',), actif='contact'), '0.8')


# ================================================================== mentions légales
def mentions():
    r, ch = '../', 'mentions-legales/'
    et = [('Mentions légales', None)]
    corps = f'''
{heros_page(r, et, 'Informations', 'Mentions <em>légales</em>', 'Informations relatives à l\'éditeur du site et à l\'utilisation de vos données.')}
<section class="section serre" style="padding-top:0"><div class="conteneur prose">
<h2>Éditeur du site</h2>
<p><b>{E(NOM)}</b><br>{ADRESSE}, {CP} {VILLE}<br>Téléphone : {TEL}</p>
<p>Raison sociale, forme juridique, numéro SIRET et nom du responsable de la publication : <i>à compléter par l'exploitante</i>.</p>
<h2>Hébergement</h2>
<p>GitHub Pages, GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p>
<h2>Données personnelles</h2>
<p>Ce site ne collecte ni ne stocke aucune donnée personnelle. Les formulaires (devis, configurateur, simulateurs) préparent simplement un message qui s'ouvre dans votre application WhatsApp ou SMS : c'est vous qui choisissez de l'envoyer. Les fichiers de rappel d'agenda (.ics) et les aperçus de logo sont créés sur votre appareil, sans transfert.</p>
<p>La carte Google Maps n'est chargée que si vous cliquez sur « Afficher la carte » ; Google peut alors déposer ses propres cookies, selon sa politique de confidentialité. Les polices de caractères sont fournies par Google Fonts.</p>
<h2>Photos</h2>
<p>Les photos présentent des créations de {E(NOM)}, issues de la fiche Google de la boutique (dont des photos partagées par des clients dans leurs avis) et des publications de la boutique. Les extraits d'avis sont cités tels qu'ils ont été publiés sur Google.</p>
<h2>Prix</h2>
<p>Les prix affichés sont indicatifs et relevés sur les offres publiées par la boutique ; seul le devis transmis par {E(NOM)} fait foi.</p>
</div></section>
'''
    ecrire('mentions-legales', page(r, ch, "Mentions légales | Les Douceurs d'Elo", "Mentions légales et politique de confidentialité du site Les Douceurs d'Elo.",
                                    corps, [schema_fil(et)], robots='noindex, follow'), '0.2')


# ================================================================== conseils
def conseils():
    r, ch = '../', 'conseils/'
    et = [('Conseils', None)]
    cartes = ''.join(f'<a class="carte carte-photo" href="{a["slug"]}/" data-r style="--d:{i % 3}"><div class="cp-img">{photo(r, a["photo"], "(max-width: 640px) 100vw, 33vw")}</div>'
                     f'<div class="cp-txt"><p class="surtitre" style="margin-bottom:.5em">{E(a["rubrique"])} · {a["lecture"]} min</p><h3>{E(a["titre"])}</h3><p>{E(a["resume"])}</p></div></a>'
                     for i, a in enumerate(articles.ARTICLES))
    corps = f'''
{heros_page(r, et, 'Le journal', 'Conseils <em>de pâtissière</em>', 'Combien de parts prévoir, quand commander, comment transporter un layer cake ou réussir une sweet table : les réponses d\'Elo, pour des fêtes sans stress.')}
<section class="section serre" style="padding-top:0"><div class="conteneur"><div class="grille g3">{cartes}</div></div></section>
{appel(r)}
'''
    ecrire('conseils', page(r, ch, "Conseils gâteaux : parts, délais, transport, sweet table | Les Douceurs d'Elo",
                            "Guides pratiques de Les Douceurs d'Elo : combien de parts pour un mariage, quand commander son gâteau, transporter un layer cake, "
                            "choisir un thème d'anniversaire, réussir une sweet table.",
                            corps, [schema_fil(et)], actif='conseils'), '0.6')
    for a in articles.ARTICLES:
        r2, ch2 = '../../', f'conseils/{a["slug"]}/'
        et2 = [('Conseils', 'conseils/'), (a['titre'], None)]
        autres = [x for x in articles.ARTICLES if x['slug'] != a['slug']][:3]
        liens = ''.join(f'<a class="carte carte-photo" href="../{x["slug"]}/" data-r style="--d:{i}"><div class="cp-img">{photo(r2, x["photo"], "(max-width: 640px) 100vw, 33vw")}</div>'
                        f'<div class="cp-txt"><h3>{E(x["titre"])}</h3><p>{E(x["resume"])}</p></div></a>' for i, x in enumerate(autres))
        corps2 = f'''
<section class="heros-page simple">
 <div class="conteneur etroit">
  {fil(r2, et2)}
  <p class="surtitre" data-r>{E(a["rubrique"])}</p>
  <h1 class="mots" style="font-size:clamp(2.3rem,5vw,4rem)">{mots(a["h1"])}</h1>
  <p class="chapo" data-r style="--d:2">{a["chapo"]}</p>
  <p class="meta-article" data-r style="--d:3"><span>Par Elo, Les Douceurs d'Elo</span><span>·</span><span>{a["lecture"]} min de lecture</span></p>
 </div>
</section>
<section class="section serre" style="padding-top:0">
 <article class="conteneur prose">
  <figure>{photo(r2, a["photo"], "(max-width: 760px) 100vw, 720px")}<figcaption>{E(PHOTOS[a["photo"]][0])}</figcaption></figure>
  {a["corps"].replace("{r}", r2)}
  <div class="encart or" style="margin-top:2em"><b>Besoin d'un conseil personnalisé ?</b> Écrivez à Elo sur <a href="{wa(WA_DEFAUT)}" target="_blank" rel="noopener">WhatsApp</a> ou appelez le <a href="tel:{TEL_LIEN}">{TEL}</a>.</div>
 </article>
</section>
<section class="section creme"><div class="conteneur"><div class="tete-section"><p class="surtitre">À lire aussi</p><h2 class="mots">{mots('D\'autres <em>conseils</em>')}</h2></div><div class="grille g3">{liens}</div></div></section>
{appel(r2)}
'''
        sch = {'@context': 'https://schema.org', '@type': 'BlogPosting', 'headline': a['titre'], 'description': a['desc'],
               'image': SITE + f'img/photos/{a["photo"]}-{960 if PHOTOS[a["photo"]][1] else 480}.webp', 'inLanguage': 'fr-FR',
               'datePublished': MAJ, 'dateModified': MAJ, 'author': {'@type': 'Person', 'name': 'Elo'},
               'publisher': {'@id': SITE + '#boutique'}, 'mainEntityOfPage': SITE + ch2}
        ecrire(f'conseils/{a["slug"]}', page(r2, ch2, a['titre'] + " | Les Douceurs d'Elo", a['desc'], corps2,
                                              [schema_fil(et2), sch], actif='conseils'), '0.6')


# ================================================================== fichiers annexes
def annexes():
    fmts = [{'id': i, 'nom': n, 'parts': p, 'prix': px, 'etages': e, 'cupcakes': c} for i, n, p, px, e, c in FORMATS]
    d = {'site': SITE, 'tel': TEL, 'telLien': TEL_LIEN, 'whatsapp': WHATSAPP, 'horaires': HORAIRES, 'jours': JOURS,
         'parfums': PARFUMS, 'formats': fmts}
    ecrire_brut('js/donnees.js', '/* Généré par _outils/generer.py : ne pas modifier à la main. */\n'
                'window.ELO = Object.assign(window.ELO || {}, ' + json.dumps(d, ensure_ascii=False) + ');\n')
    urls = ''.join(f'<url><loc>{SITE}{c}</loc><lastmod>{MAJ}</lastmod><priority>{p}</priority></url>\n'
                   for c, p in PAGES if 'mentions' not in c)
    ecrire_brut('sitemap.xml', f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    ecrire_brut('robots.txt', f'User-agent: *\nAllow: /\n\nSitemap: {SITE}sitemap.xml\n')


if __name__ == '__main__':
    for f in (accueil, mariage, entreprises, enfants, layer, cupcakes, sweet, galerie, composer, tarifs, boutique,
              ateliers, avis, calendrier, faq, contact, conseils, mentions):
        f()
    annexes()
    print(f'{len(PAGES)} pages générées.')
