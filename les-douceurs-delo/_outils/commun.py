# -*- coding: utf-8 -*-
"""Éléments communs : icônes, gabarit de page (tête, en-tête, menu, pied), composants réutilisables."""
import html
import json
import re
from urllib.parse import quote

from donnees import *  # noqa: F401,F403

E = html.escape
VERSION = '3'
NBSP = ' '
FONTS = ('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500'
         '&family=Jost:wght@300;400;500&family=Pinyon+Script&display=swap')

# ------------------------------------------------------------------ icônes
_I = {
    'fleche': '<path d="M5 12h14M13 6l6 6-6 6"/>',
    'tel': '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    'bulle': '<path d="M4 20l1.3-3.9A8.2 8.2 0 1 1 8.2 19z"/><path d="M9.2 8.8c.3 2.6 3 5.3 5.8 5.8l1-1.6-2.1-1-.9.8a4.6 4.6 0 0 1-2-2l.8-.9-1-2.1z"/>',
    'lieu': '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    'horloge': '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    'calendrier': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    'check': '<path d="M5 12.5l4.5 4.5L19 7"/>',
    'alliances': '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M10 6l2-3 2 3"/>',
    'gateau': '<path d="M4 21h16M5 21v-7h14v7M5 16.5c2.3 1.6 4.7 1.6 7 0s4.7-1.6 7 0M12 14v-4"/><path d="M12 7.5a1.5 1.5 0 0 1-1.5-1.5C10.5 5 12 3 12 3s1.5 2 1.5 3A1.5 1.5 0 0 1 12 7.5z"/>',
    'cupcake': '<path d="M6 13h12l-2 8H8zM10 13l.5 8M14 13l-.5 8"/><path d="M5 13a3 3 0 0 1 1-5.6A4.2 4.2 0 0 1 12 5a4.2 4.2 0 0 1 6 2.4A3 3 0 0 1 19 13"/>',
    'mallette': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12.5h18"/>',
    'ballon': '<path d="M12 15c3.5 0 6-3 6-6.5S15.3 3 12 3 6 5 6 8.5 8.5 15 12 15zM12 15l-1 1.6h2zM12 16.6c0 2.2-2 2.2-2 4.4"/>',
    'cadeau': '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3.5 8 4.2 8 8 12 8zM12 8s1.5-4.5 4-3.8S16 8 12 8z"/>',
    'toque': '<path d="M7 18h10v3H7zM6 14a4 4 0 0 1 1.5-7.7A5 5 0 0 1 12 3a5 5 0 0 1 4.5 3.3A4 4 0 0 1 18 14v4H6z"/>',
    'etincelle': '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    'crayon': '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
    'discussion': '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    'coeur': '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
    'haut': '<path d="M12 19V5M6 11l6-6 6 6"/>',
    'gauche': '<path d="M15 5l-7 7 7 7"/>',
    'droite': '<path d="M9 5l7 7-7 7"/>',
    'chevron': '<path d="M6 9l6 6 6-6"/>',
    'livre': '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7"/>',
    'boite': '<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>',
    'copier': '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    'des': '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r=".9" fill="currentColor"/><circle cx="15" cy="15" r=".9" fill="currentColor"/><circle cx="12" cy="12" r=".9" fill="currentColor"/>',
    'fleur': '<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5C12 6 14 4 12 3c-2 1 0 3 0 6.5zM14.5 12c3.5 0 5.5 2 6.5 0-1-2-3 0-6.5 0zM12 14.5c0 3.5-2 5.5 0 6.5 2-1 0-3 0-6.5zM9.5 12C6 12 4 10 3 12c1 2 3 0 6.5 0z"/>',
    'feuille_or': '<path d="M4 18c0-8 6-13 16-14-1 10-6 16-14 16H4zM4 20l8-8"/>',
    'parts': '<path d="M3 17l9-12 9 12zM3 17v3h18v-3M7.5 11h9"/>',
    'utilisateurs': '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
    'chrono': '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2h5M19 5l1.5 1.5"/>',
    'note': '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
}
_PLEIN = {
    'etoile': '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    'fb': '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/>',
    'snap': ('<path d="M12 3c3 0 5 2.2 5 5v2.8l1.8.6c.5.2.5.8 0 1l-1.4.7c.6 1.5 1.8 2.6 3.2 3 .4.1.4.6 0 .8-.8.4-1.9.5-2.6.8-.3.6-.3 1.5-1.2 1.5'
             '-.7 0-1.5-.5-3-.5-1.8 0-2.6 1.3-4 1.3s-2.2-1.3-4-1.3c-1.5 0-2.3.5-3 .5-.9 0-.9-.9-1.2-1.5-.7-.3-1.8-.4-2.6-.8-.4-.2-.4-.7 0-.8 '
             '1.4-.4 2.6-1.5 3.2-3l-1.4-.7c-.5-.2-.5-.8 0-1L7 10.8V8c0-2.8 2-5 5-5z"/>'),
}


def ico(nom, cls=''):
    c = f' class="{cls}"' if cls else ''
    if nom in _PLEIN:
        return f'<svg{c} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{_PLEIN[nom]}</svg>'
    return (f'<svg{c} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true">{_I[nom]}</svg>')


def etoiles(n=5):
    return '<span class="etoiles" aria-hidden="true">' + ico('etoile') * n + '</span>'


LOGO = ('<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30.5" fill="none" stroke="currentColor" '
        'stroke-width=".8" opacity=".35"/><circle cx="32" cy="32" r="26.5" fill="none" stroke="#b48a4e" stroke-width="1.2"/>'
        '<path fill="currentColor" fill-rule="evenodd" d="M20.5 17.5h12C42.6 17.5 49 23.6 49 32s-6.4 14.5-16.5 14.5h-12v-1.4l2.8-.7'
        'V19.6l-2.8-.7zm7.6 2.4v24.2h4c7 0 11.3-4.8 11.3-12.1s-4.3-12.1-11.3-12.1z"/><path fill="#b48a4e" d="M47.5 13.5l1.3 2.6 '
        '2.6 1.3-2.6 1.3-1.3 2.6-1.3-2.6-2.6-1.3 2.6-1.3z"/></svg>')


def mots(texte):
    """Découpe un titre en mots animés (garde <em>…</em> et <span…>…</span> entiers)."""
    jetons = re.findall(r'<(em|span)\b[^>]*>.*?</\1>|<br>|\S+', texte)
    brut = re.finditer(r'<(em|span)\b[^>]*>.*?</\1>|<br>|\S+', texte)
    out, i = [], 0
    for m in brut:
        t = m.group(0)
        if t == '<br>':
            out.append('<br>')
            continue
        out.append(f'<span class="m"><span style="--i:{i}">{t}</span></span>')
        i += 1
    del jetons
    return ' '.join(out).replace(' <br> ', '<br>')


def photo(r, nom, sizes='(max-width: 760px) 100vw, 50vw', cls='', charge='lazy', alt=None, extra=''):
    alt_txt, hd, ratio = PHOTOS[nom]
    alt_txt = alt_txt if alt is None else alt
    h = round(480 / ratio)
    src = f'{r}img/photos/{nom}-480.webp'
    srcset = f' srcset="{src} 480w, {r}img/photos/{nom}-960.webp 960w" sizes="{sizes}"' if hd else ''
    c = f' class="{cls}"' if cls else ''
    prio = ' fetchpriority="high"' if charge == 'eager' else ''
    return (f'<img{c} src="{src}"{srcset} width="480" height="{h}" alt="{E(alt_txt)}" loading="{charge}" '
            f'decoding="async"{prio}{extra}>')


def grande(r, nom):
    return f'{r}img/photos/{nom}-{960 if PHOTOS[nom][1] else 480}.webp'


def zoom(r, nom, legende):
    return (f'<button class="zoom" type="button" data-grand="{grande(r, nom)}" data-alt="{E(PHOTOS[nom][0])}" '
            f'data-legende="{E(legende)}"><span class="sr">Agrandir : {E(legende)}</span></button>')


def wa(texte):
    return f'https://wa.me/{WHATSAPP}?text={quote(texte)}'


WA_DEFAUT = "Bonjour Elo ! Je souhaiterais un devis pour un gâteau. "

# ------------------------------------------------------------------ navigation
CREATIONS = [
    ('gateaux-mariage', 'Gâteaux de mariage', 'Pièces montées, wedding cakes', 'perles-or'),
    ('gateaux-entreprises', 'Entreprises', 'Séminaires, cocktails, cadeaux', 'vitrine-cupcakes'),
    ('anniversaire-enfant', 'Anniversaires d\'enfants', 'Thèmes, chiffres, cupcakes', 'jungle'),
    ('layer-cakes', 'Layer cakes', 'Le gâteau signature', 'rose-fleurs'),
    ('cupcakes-mignardises', 'Cupcakes & mignardises', 'Boîtes, plateaux, tiramisu', 'tiramisu'),
    ('sweet-table-evenements', 'Sweet tables & fêtes', 'Baby shower, Aïd, baptême', 'noeud-bleu'),
]
NAV = [
    ('composer-mon-gateau', 'Composer'),
    ('creations', 'Galerie'),
    ('tarifs', 'Tarifs'),
    ('boutique', 'La boutique'),
    ('ateliers-cake-design', 'Ateliers'),
    ('conseils', 'Conseils'),
]


def horaires_html():
    li = []
    for j, (nom, h) in enumerate(zip(JOURS, HORAIRES)):
        v = 'Fermé' if not h else f'{h[0].replace(":00", "")}h – {h[1].replace(":00", "")}h'.replace(':', 'h')
        li.append(f'<li data-j="{j}"><span>{nom}</span><span>{v}</span></li>')
    return '<ul class="horaires">' + ''.join(li) + '</ul>'


def tete_html(r, titre, desc, chemin, schemas, image='img/partage.jpg', robots='index, follow, max-image-preview:large'):
    url = SITE + chemin
    fonts = FONTS.replace('&', '&amp;')
    sch = ''.join(f'<script type="application/ld+json">{json.dumps(s, ensure_ascii=False, separators=(",", ":"))}</script>\n'
                  for s in schemas)
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(titre)}</title>
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="#fbf7f1">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="{E(NOM)}">
<meta property="og:title" content="{E(titre)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}{image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="FR-13">
<meta name="geo.placename" content="{VILLE}">
<meta name="geo.position" content="{LAT};{LON}">
<link rel="icon" type="image/svg+xml" href="{r}img/favicon.svg">
<link rel="apple-touch-icon" href="{r}img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="{fonts}" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="{fonts}"></noscript>
<link rel="stylesheet" href="{r}css/style.css?v={VERSION}">
<script>(function(d){{d.classList.add('js');try{{if(!sessionStorage.getItem('elo-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('intro');}}catch(e){{}}}})(document.documentElement);window.ELO={{racine:'{r}'}};</script>
<!-- Généré par _outils/generer.py : modifiez les données (_outils/donnees.py) ou les textes, pas ce fichier. -->
{sch}</head>
'''


def entete(r, actif=''):
    sous = ''.join(
        f'<a href="{r}{s}/"{" aria-current=\"page\"" if actif == s else ""}>'
        f'<img src="{r}img/photos/{p}-480.webp" alt="" width="44" height="44" loading="lazy"><span><b>{E(t)}</b>'
        f'<span>{E(d)}</span></span></a>' for s, t, d, p in CREATIONS)
    liens = ''.join(f'<li><a href="{r}{s}/"{" aria-current=\"page\"" if actif == s else ""}>{E(t)}</a></li>' for s, t in NAV)
    mm_crea = ''.join(f'<a href="{r}{s}/">{E(t)}</a>' for s, t, d, p in CREATIONS)
    mm = ''.join(f'<li><a href="{r}{s}/">{E(t)}<small>{E(n)}</small></a></li>' for s, t, n in [
        ('composer-mon-gateau', 'Composer mon gâteau', 'Outil'), ('creations', 'Galerie', 'Photos'),
        ('tarifs', 'Tarifs', 'Prix indicatifs'), ('boutique', 'La boutique', 'Horaires & accès'),
        ('ateliers-cake-design', 'Ateliers cake design', 'Apprendre'), ('calendrier-des-fetes', 'Calendrier des fêtes', 'Rappels'),
        ('avis', 'Avis clients', f'{NOTE}/5'), ('conseils', 'Conseils', 'Guides'), ('contact', 'Contact & devis', 'Gratuit')])
    return f'''<body>
<a class="saut" href="#contenu">Aller au contenu</a>
<div class="intro-rideau" aria-hidden="true"><svg viewBox="0 0 64 64"><circle class="trace" cx="32" cy="32" r="26.5" fill="none" stroke="#b48a4e" stroke-width="1"/><path class="lettre" fill="#2e211b" fill-rule="evenodd" d="M20.5 17.5h12C42.6 17.5 49 23.6 49 32s-6.4 14.5-16.5 14.5h-12v-1.4l2.8-.7V19.6l-2.8-.7zm7.6 2.4v24.2h4c7 0 11.3-4.8 11.3-12.1s-4.3-12.1-11.3-12.1z"/></svg><p>Les Douceurs d'Elo</p></div>
<header class="entete">
 <div class="conteneur">
  <a class="marque" href="{r}" aria-label="{E(NOM)}, accueil">{LOGO}<span class="marque-txt"><b>Les Douceurs</b><i>d'Elo</i></span></a>
  <nav class="nav" aria-label="Navigation principale">
   <ul>
    <li class="a-sous"><button class="sous-btn" type="button" aria-expanded="false">Créations {ico("chevron")}</button><div class="sous">{sous}</div></li>
    {liens}
   </ul>
  </nav>
  <div class="entete-cta">
   <a class="tel-hdr" href="tel:{TEL_LIEN}">{ico("tel")}{TEL}</a>
   <a class="btn petit-btn aimant" href="{r}contact/">Demander un devis</a>
   <button class="burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="menu-mobile"><span></span><span></span><span></span></button>
  </div>
 </div>
</header>
<div class="menu-mobile" id="menu-mobile">
 <ul>
  <li><a href="{r}">Accueil<small>Les Douceurs d'Elo</small></a></li>
  <li><span class="sr">Créations</span><div class="mm-grille">{mm_crea}</div></li>
  {mm}
 </ul>
 <div class="mm-pied">
  <a class="btn or" href="{r}contact/">Demander un devis</a>
  <a class="btn contour" href="tel:{TEL_LIEN}">{ico("tel")}Appeler Elo</a>
  <p class="petit centre">{ADRESSE}, {CP} {VILLE} · <span class="statut">Mardi – dimanche, 12h – 20h</span></p>
 </div>
</div>
'''


def pied(r):
    crea = ''.join(f'<li><a href="{r}{s}/">{E(t)}</a></li>' for s, t, d, p in CREATIONS)
    maison = ''.join(f'<li><a href="{r}{s}/">{E(t)}</a></li>' for s, t in [
        ('composer-mon-gateau', 'Composer mon gâteau'), ('creations', 'Galerie'), ('tarifs', 'Tarifs'),
        ('ateliers-cake-design', 'Ateliers cake design'), ('calendrier-des-fetes', 'Calendrier des fêtes'),
        ('avis', 'Avis clients'), ('conseils', 'Conseils'), ('faq', 'Questions fréquentes'), ('contact', 'Contact')])
    return f'''<footer class="pied">
 <div class="conteneur">
  <div class="pied-grille">
   <div>
    <a class="marque" href="{r}">{LOGO}<span class="marque-txt"><b>Les Douceurs</b><i>d'Elo</i></span></a>
    <p>Pâtisserie et cake design à Marseille : gâteaux de mariage, layer cakes, cupcakes, sweet tables et commandes d'entreprise, réalisés à la main par Elo.</p>
    <div class="reseaux">
     <a href="{FACEBOOK}" target="_blank" rel="noopener" aria-label="Facebook de Les Douceurs d'Elo">{ico("fb")}</a>
     <a href="{SNAPCHAT}" target="_blank" rel="noopener" aria-label="Snapchat de Les Douceurs d'Elo">{ico("snap")}</a>
     <a href="{wa(WA_DEFAUT)}" target="_blank" rel="noopener" aria-label="WhatsApp">{ico("bulle")}</a>
    </div>
   </div>
   <div><h3>Créations</h3><ul>{crea}</ul></div>
   <div><h3>La maison</h3><ul>{maison}</ul></div>
   <div>
    <h3>La boutique</h3>
    <p><a href="{MAPS}" target="_blank" rel="noopener">{ADRESSE}<br>{CP} {VILLE}</a><br><a href="tel:{TEL_LIEN}">{TEL}</a></p>
    <p><span class="statut">Mardi – dimanche, 12h – 20h</span></p>
    {horaires_html()}
   </div>
  </div>
  <div class="pied-bas">
   <span>© <span data-annee>2026</span> {E(NOM)} · Marseille</span>
   <span><a href="{r}mentions-legales/">Mentions légales</a> · <a href="{r}sitemap.xml">Plan du site</a></span>
  </div>
 </div>
</footer>
<nav class="barre-mobile" aria-label="Actions rapides">
 <a href="tel:{TEL_LIEN}">{ico("tel")}Appeler</a>
 <a href="{wa(WA_DEFAUT)}" target="_blank" rel="noopener">{ico("bulle")}WhatsApp</a>
 <a class="principal" href="{r}composer-mon-gateau/">{ico("gateau")}Mon gâteau</a>
</nav>
<button class="retour-haut" type="button" aria-label="Revenir en haut de la page">{ico("haut")}</button>
'''


def page(r, chemin, titre, desc, corps, schemas=(), js=(), actif='', image='img/partage.jpg', robots=None):
    scripts = ''.join(f'<script src="{r}js/{j}.js?v={VERSION}" defer></script>\n' for j in ('donnees', 'site') + tuple(js))
    kw = {'robots': robots} if robots else {}
    return (tete_html(r, titre, desc, chemin, list(schemas), image=image, **kw) + entete(r, actif)
            + f'<main id="contenu">\n{corps}\n</main>\n' + pied(r) + scripts + '</body>\n</html>\n')


# ------------------------------------------------------------------ composants
def fil(r, etapes):
    li = [f'<li><a href="{r}">Accueil</a></li>']
    for i, (t, lien) in enumerate(etapes):
        li.append(f'<li><a href="{r}{lien}">{E(t)}</a></li>' if lien else f'<li aria-current="page">{E(t)}</li>')
    return '<ol class="fil">' + ''.join(li) + '</ol>'


def schema_fil(etapes):
    items = [{'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': SITE}]
    for i, (t, lien) in enumerate(etapes, start=2):
        items.append({'@type': 'ListItem', 'position': i, 'name': t, **({'item': SITE + lien} if lien else {})})
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': items}


def heros_page(r, etapes, surtitre, h1, chapo, actions='', photo_nom=None, atouts=None):
    at = ''
    if atouts:
        at = '<ul class="atouts">' + ''.join(f'<li>{ico("check")}<span>{a}</span></li>' for a in atouts) + '</ul>'
    if not photo_nom:
        return f'''<section class="heros-page simple">
 <div class="conteneur etroit">
  {fil(r, etapes)}
  <p class="surtitre" data-r>{surtitre}</p>
  <h1 class="mots">{mots(h1)}</h1>
  <p class="chapo" data-r style="--d:2">{chapo}</p>
  {f'<div class="actions" data-r style="--d:3;justify-content:center">{actions}</div>' if actions else ''}
 </div>
</section>'''
    return f'''<section class="heros-page">
 <div class="conteneur duo">
  <div>
   {fil(r, etapes)}
   <p class="surtitre" data-r>{surtitre}</p>
   <h1 class="mots">{mots(h1)}</h1>
   <p class="chapo" data-r style="--d:2">{chapo}</p>
   <div data-r style="--d:3">{at}</div>
   <div class="actions" data-r style="--d:4">{actions}</div>
  </div>
  <div class="arche" data-r="z" style="--d:2">{photo(r, photo_nom, "(max-width: 900px) 80vw, 460px", charge="eager")}</div>
 </div>
</section>'''


def actions_devis(r, occasion='', texte_wa=WA_DEFAUT, composer=True):
    q = f'?occasion={occasion}' if occasion else ''
    a = f'<a class="btn or aimant" href="{r}composer-mon-gateau/{q}">{ico("gateau")}Composer mon gâteau</a>' if composer else ''
    return (a + f'<a class="btn wa" href="{wa(texte_wa)}" target="_blank" rel="noopener">{ico("bulle")}WhatsApp</a>'
            f'<a class="btn contour" href="tel:{TEL_LIEN}">{ico("tel")}{TEL}</a>')


def appel(r, titre='Votre prochain événement mérite <em>son gâteau</em>',
          texte='Racontez votre projet à Elo : date, nombre d\'invités, thème, envies. Vous recevez des conseils et un devis gratuit, sans engagement.',
          texte_wa=WA_DEFAUT):
    return f'''<section class="section sombre appel">
 <div class="appel-orn" aria-hidden="true"><svg viewBox="0 0 200 200"><g fill="none" stroke="currentColor" stroke-width=".6">{''.join(f'<ellipse cx="100" cy="100" rx="96" ry="34" transform="rotate({a} 100 100)"/>' for a in range(0, 180, 20))}</g></svg></div>
 <div class="conteneur">
  <p class="surtitre centre" data-r>Devis gratuit</p>
  <h2 class="mots">{mots(titre)}</h2>
  <p class="chapo centre" data-r style="--d:2;margin-inline:auto">{texte}</p>
  <div class="actions" data-r style="--d:3">
   <a class="btn or aimant" href="{r}contact/">{ico("crayon")}Demander un devis</a>
   <a class="btn wa" href="{wa(texte_wa)}" target="_blank" rel="noopener">{ico("bulle")}Écrire sur WhatsApp</a>
   <a class="btn contour-clair" href="tel:{TEL_LIEN}">{ico("tel")}{TEL}</a>
  </div>
 </div>
</section>'''


def faq_html(items, titre='Questions fréquentes', surtitre='Bon à savoir', classe='section creme'):
    d = ''.join(f'<details data-r style="--d:{min(i, 5)}"><summary>{E(q)}</summary><div class="rep"><p>{a}</p></div></details>'
                for i, (q, a) in enumerate(items))
    return f'''<section class="{classe}">
 <div class="conteneur etroit">
  <div class="tete-section centre"><p class="surtitre">{surtitre}</p><h2 class="mots">{mots(titre)}</h2></div>
  <div class="faq">{d}</div>
 </div>
</section>'''


def schema_faq(items):
    return {'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
        {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': re.sub('<[^>]+>', '', a)}}
        for q, a in items]}


ETAPES = [
    ('discussion', 'Racontez', 'Votre événement, la date, le nombre d\'invités et vos idées : par téléphone, WhatsApp ou formulaire.'),
    ('crayon', 'On imagine', 'Elo vous conseille sur le format, les parfums et le décor, puis vous envoie un devis clair.'),
    ('toque', 'Elo réalise', 'Votre gâteau est préparé à la main pour la date convenue, décor compris.'),
    ('cadeau', 'Vous savourez', 'Retrait à la boutique, prêt à faire briller les yeux de vos invités.'),
]


def etapes_html(titre='Commander, <em>simplement</em>', surtitre='Comment ça marche', classe='section'):
    e = ''.join(f'<div class="etape" style="--d:{i}"><div class="rond">{ico(ic)}</div><div><h3>{t}</h3><p>{p}</p></div></div>'
                for i, (ic, t, p) in enumerate(ETAPES))
    return f'''<section class="{classe}">
 <div class="conteneur">
  <div class="tete-section centre"><p class="surtitre">{surtitre}</p><h2 class="mots">{mots(titre)}</h2></div>
  <div class="etapes"><span class="progres"></span>{e}</div>
 </div>
</section>'''


def avis_carrousel(r, titre='Ils en parlent <em>mieux que nous</em>'):
    cartes = ''.join(
        f'<figure class="avis-carte{" actif" if i == 0 else ""}"><blockquote>{E(t)}</blockquote>'
        f'<figcaption><span><b>{E(n)}</b> · {E(c)}</span>{etoiles()}</figcaption></figure>'
        for i, (n, c, t) in enumerate(AVIS))
    pts = ''.join(f'<span{" class=\"actif\"" if i == 0 else ""}></span>' for i in range(len(AVIS)))
    themes = ''.join(f'<span>{E(t)}</span>' for t in THEMES_AVIS)
    return f'''<section class="section sombre">
 <div class="conteneur avis-zone">
  <div>
   <p class="surtitre">Avis Google</p>
   <h2 class="mots">{mots(titre)}</h2>
   <p class="note-geante" data-r><span data-compte="{NOTE}">{NOTE}</span><small> / 5</small></p>
   <p>{etoiles()} &nbsp;<span data-compte="{NB_AVIS}">{NB_AVIS}</span> avis sur Google</p>
   <p class="petit" style="color:#bfae97">Les mots qui reviennent le plus :</p>
   <div class="themes-avis">{themes}</div>
   <p style="margin-top:24px"><a class="lien-fleche" style="color:var(--or-clair)" href="{r}avis/">Lire les avis {ico("fleche")}</a></p>
  </div>
  <div class="carrousel" aria-roledescription="carrousel" aria-label="Avis de clients">
   <div class="carrousel-piste">{cartes}</div>
   <div class="carrousel-nav"><button class="prec" type="button" aria-label="Avis précédent">{ico("gauche")}</button><button class="suiv" type="button" aria-label="Avis suivant">{ico("droite")}</button><div class="points">{pts}</div></div>
  </div>
 </div>
</section>'''


def plan_html(r):
    q = quote(f"Les Douceurs d'Elo, {ADRESSE}, {CP} {VILLE}")
    return f'''<div class="carte-plan">
 <svg class="plan-dessin" viewBox="0 0 400 300" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
  <rect width="400" height="300" fill="#efe5d7"/>
  <path d="M-10 250 C80 200 120 220 190 150 S300 60 420 40" stroke="#fff" stroke-width="18" fill="none"/>
  <path d="M170 -10 C180 80 200 140 196 320" stroke="#fff" stroke-width="12" fill="none"/>
  <path d="M-10 120 L420 170" stroke="#fff" stroke-width="7" fill="none"/>
  <path d="M60 -10 L120 320 M300 -10 L280 320" stroke="#fff" stroke-width="5" fill="none"/>
  <path d="M60 60 C90 40 140 60 150 90 C120 120 70 110 60 60Z" fill="#cfd9c3"/>
  <path d="M230 210 C260 190 320 200 330 240 C300 270 240 260 230 210Z" fill="#cfd9c3"/>
  <g transform="translate(196 140)"><circle r="28" fill="#b48a4e" opacity=".18"/><path d="M0 8 C-12 -4 -14 -10 -14 -16 a14 14 0 0 1 28 0 c0 6 -2 12 -14 24z" fill="#2e211b"/><circle cy="-16" r="5" fill="#d9bd8c"/></g>
 </svg>
 <div class="plan-voile">
  <div><button class="btn clair" type="button" data-plan="https://maps.google.com/maps?q={q}&amp;z=16&amp;output=embed">{ico("lieu")}Afficher la carte</button>
  <p>La carte Google se charge uniquement si vous le demandez.</p></div>
 </div>
</div>'''


def boutique_bloc(r, titre='La boutique de <em>l\'avenue de la Viste</em>', avec_photo=True):
    ph = f'<div class="photo-cadre" data-r="g">{photo(r, "vitrine-large", "(max-width: 900px) 100vw, 50vw")}</div>' if avec_photo else plan_html(r)
    return f'''<section class="section">
 <div class="conteneur duo">
  {ph}
  <div>
   <p class="surtitre" data-r>Marseille 15e</p>
   <h2 class="mots">{mots(titre)}</h2>
   <p data-r style="--d:2">Pas de commande ? Poussez la porte : la vitrine propose chaque jour des parts de layer cake, des cupcakes, du tiramisu et les boxes du moment. C'est aussi là que vous récupérez vos gâteaux personnalisés.</p>
   <div class="infos-boutique" data-r style="--d:3">
    <div class="ligne-info"><span class="ic">{ico("lieu")}</span><div><b>{ADRESSE}, {CP} {VILLE}</b><a href="{MAPS_ITI}" target="_blank" rel="noopener">Itinéraire</a> · à côté du parc Brégante</div></div>
    <div class="ligne-info"><span class="ic">{ico("tel")}</span><div><b><a href="tel:{TEL_LIEN}">{TEL}</a></b>Appel, SMS ou WhatsApp</div></div>
    <div class="ligne-info"><span class="ic">{ico("horloge")}</span><div><b>Mardi – dimanche, 12h – 20h</b><span class="statut">Fermé le lundi</span></div></div>
   </div>
   <div class="actions" data-r style="--d:4;margin-top:26px"><a class="btn contour" href="{r}boutique/">Horaires & accès {ico("fleche")}</a></div>
  </div>
 </div>
</section>'''


def cartes_liens(r, slugs, titre='À découvrir <em>aussi</em>', surtitre='Nos autres créations', classe='section creme'):
    d = {s: (t, dd, p) for s, t, dd, p in CREATIONS}
    d.update({
        'composer-mon-gateau': ('Composer mon gâteau', 'Le configurateur en ligne', 'rose-2-ans'),
        'creations': ('La galerie', 'Toutes nos créations', 'foret-enchantee'),
        'calendrier-des-fetes': ('Calendrier des fêtes', 'Ne ratez plus une occasion', 'perles-or'),
        'ateliers-cake-design': ('Ateliers cake design', 'Apprendre avec Elo', 'part-layer'),
        'tarifs': ('Tarifs', 'Prix indicatifs & parts', 'parts-layer'),
        'boutique': ('La boutique', 'Vitrine, horaires, accès', 'vitrine'),
    })
    c = ''.join(f'<a class="carte carte-photo" href="{r}{s}/" data-r style="--d:{i}"><div class="cp-img">{photo(r, d[s][2], "(max-width: 640px) 100vw, 33vw")}</div>'
                f'<div class="cp-txt"><h3>{E(d[s][0])}</h3><p>{E(d[s][1])}</p></div></a>' for i, s in enumerate(slugs))
    return f'''<section class="{classe}">
 <div class="conteneur">
  <div class="tete-section"><p class="surtitre">{surtitre}</p><h2 class="mots">{mots(titre)}</h2></div>
  <div class="grille g3">{c}</div>
 </div>
</section>'''


def parfums_puces(attr='data-parfum', actif='fraise'):
    return ''.join(f'<button type="button" class="puce" {attr}="{i}" aria-pressed="{"true" if i == actif else "false"}" '
                   f'style="--c1:{g};--c2:{c};--c3:{f}"><i></i>{E(n)}</button>' for i, n, g, c, f in PARFUMS)


def decoupe_svg():
    """Layer cake coupé en deux : la moitié avant glisse pour révéler les couches."""
    p = next(x for x in PARFUMS if x[0] == 'fraise')
    g, c, f = p[2], p[3], p[4]
    creme = '#fbf3ea'
    # couches de la coupe (y de 158 à 374)
    couches, y, etiq = [], 158, []
    for k, (nom, h) in enumerate([('g', 40), ('c', 26), ('f', 22), ('g', 40), ('c', 26), ('f', 22), ('g', 40)]):
        col = {'g': g, 'c': c, 'f': f}[nom]
        couches.append(f'<rect class="couche {nom}" x="88" y="{y}" width="344" height="{h}" fill="{col}" style="fill:{col}"/>')
        if k < 3:
            lib = {'g': 'GÉNOISE', 'c': 'CRÈME', 'f': 'GARNITURE'}[nom]
            larg = 14 + len(lib) * 7.4
            etiq.append(f'<g transform="translate({34 + k * 6} {y + h / 2 - 8:.0f})"><rect width="{larg:.0f}" height="16" rx="8" fill="#fffdf9" opacity=".92"/>'
                        f'<text x="{larg / 2:.0f}" y="11.5" text-anchor="middle" font-family="Jost, sans-serif" font-size="9.5" letter-spacing="1.4" fill="#2e211b">{lib}</text></g>')
        y += h
    miettes = ''.join(f'<circle cx="{x}" cy="{yy}" r="1.3" fill="#000" opacity=".08"/>' for x, yy in
                      [(120, 180), (170, 200), (260, 175), (330, 192), (400, 185), (140, 290), (220, 300), (300, 285), (380, 298), (200, 345), (330, 350)])
    rosettes = ''.join(f'<g transform="translate({x} {yy})"><circle r="10" fill="#fff"/><circle r="6" cy="-4" fill="#fffaf2"/><path d="M-7 0a7 7 0 1 1 11 -4" stroke="#eadfce" stroke-width="1.4" fill="none"/></g>'
                       for x, yy in [(130, 120), (175, 112), (225, 108), (275, 108), (325, 112), (370, 120)])
    fraises_av = ''.join(f'<g transform="translate({x} {yy})"><path d="M0 -9 C8 -9 10 -2 6 6 C4 10 1 12 0 12 C-1 12 -4 10 -6 6 C-10 -2 -8 -9 0 -9Z" fill="#c8313f"/><path d="M-6 -9 L0 -6 L6 -9 L3 -12 L0 -10 L-3 -12Z" fill="#4f7d3a"/></g>'
                         for x, yy in [(150, 176), (210, 186), (270, 189), (330, 184), (385, 172)])
    perles = ''.join(f'<circle cx="{x}" cy="{150 + 44 * (1 - ((x - 260) / 180) ** 2) ** .5 - 6:.1f}" r="3" fill="#d9bd8c"/>' for x in range(96, 430, 16))
    return f'''<svg viewBox="0 0 520 480" role="img" aria-label="Layer cake coupé : génoise, crème et garniture">
 <defs>
  <linearGradient id="dc-sh" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".14"/><stop offset=".25" stop-color="#000" stop-opacity="0"/><stop offset=".65" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
  <radialGradient id="dc-pl" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ddd5ca"/></radialGradient>
 </defs>
 <ellipse cx="260" cy="430" rx="250" ry="34" fill="#2e211b" opacity=".1"/>
 <ellipse cx="260" cy="392" rx="232" ry="52" fill="url(#dc-pl)" stroke="#d6cdc1"/>
 <path d="M28 392 v6 a232 52 0 0 0 464 0 v-6" fill="#d6cdc1"/>
 <!-- moitié arrière -->
 <g class="arriere">
 <path d="M80 150 A180 44 0 0 1 440 150 Z" fill="#fffaf3"/>
 {rosettes}
 <rect x="80" y="150" width="360" height="232" fill="{creme}"/>
 {''.join(couches)}
 {miettes}
 <rect x="80" y="150" width="8" height="232" fill="{creme}"/><rect x="432" y="150" width="8" height="232" fill="{creme}"/>
 <rect x="80" y="150" width="360" height="8" fill="#fffaf3"/>
 <g class="etiquettes">{''.join(etiq)}</g>
 </g>
 <ellipse class="ombre-tranche" cx="260" cy="400" rx="180" ry="40" fill="#2e211b"/>
 <!-- moitié avant (la tranche) -->
 <g class="tranche">
  <path d="M80 150 V380 A180 44 0 0 0 440 380 V150 A180 44 0 0 1 80 150 Z" fill="{creme}"/>
  <path d="M80 150 V380 A180 44 0 0 0 440 380 V150 A180 44 0 0 1 80 150 Z" fill="url(#dc-sh)"/>
  <path d="M80 150 A180 44 0 0 0 440 150 Z" fill="#fffaf3"/>
  <path d="M80 150 A180 44 0 0 0 440 150" fill="none" stroke="#efe3d2" stroke-width="2"/>
  {fraises_av}
  {perles}
  <path d="M96 300 C150 312 210 318 260 318 S370 312 424 300" stroke="#d9bd8c" stroke-width="1.2" fill="none" opacity=".8"/>
  <text x="260" y="350" text-anchor="middle" font-family="Pinyon Script, cursive" font-size="30" fill="#b48a4e">Douceurs d'Elo</text>
 </g>
</svg>'''
