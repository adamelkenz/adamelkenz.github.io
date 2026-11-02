# -*- coding: utf-8 -*-
"""Génère toutes les pages du site Coiffure au Rendez-Vous.

    cd coiffure-au-rendez-vous && python3 _outils/generer.py

Les données (tarifs, coordonnées, photos) sont dans donnees.py, les textes des pages dans pages.py.
"""
import html
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from donnees import *  # noqa: E402,F401,F403
import pages  # noqa: E402

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VERSION = '1'
NBSP = ' '
E = html.escape


# ---------------------------------------------------------------- formats
def prix(p):
    return f'{p:,}'.replace(',', NBSP) + NBSP + '€'


def duree(m):
    h, mn = divmod(m, 60)
    if h and mn:
        return f'{h}{NBSP}h{NBSP}{mn:02d}'
    if h:
        return f'{h}{NBSP}h'
    return f'{mn}{NBSP}min'


def presta(pid):
    return next(p for p in PRESTATIONS if p['id'] == pid)


def prestas_de(slug):
    return [p for p in PRESTATIONS if p['cat'] == slug or p.get('aussi') == slug]


def categorie(slug):
    return next(c for c in CATEGORIES if c['slug'] == slug)


def des_prix(slug):
    return min(p['prix'] for p in prestas_de(slug))


def img(r, nom, sizes, cls='', charge='lazy', alt=None, extra=''):
    alt_txt, grand = PHOTOS[nom]
    alt_txt = alt_txt if alt is None else alt
    src = f'{r}img/photos/{nom}-480.webp'
    srcset = f'{src} 480w' + (f', {r}img/photos/{nom}-960.webp 960w' if grand else '')
    c = f' class="{cls}"' if cls else ''
    prio = ' fetchpriority="high"' if charge == 'eager' else ''
    return (f'<img{c} src="{src}" srcset="{srcset}" sizes="{sizes}" width="480" height="600" '
            f'alt="{E(alt_txt)}" loading="{charge}" decoding="async"{prio}{extra}>')


def wa_lien(message):
    from urllib.parse import quote
    return f'https://wa.me/{WHATSAPP}?text={quote(message)}'


# ---------------------------------------------------------------- éléments communs
FONTS = ('https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,300;125,400;125,500'
         '&family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;1,6..96,400;1,6..96,500'
         '&family=Montserrat:wght@300;400;500;600&display=swap')


def tete_html(r, titre, desc, chemin, schema, robots='index, follow, max-image-preview:large', precharge=''):
    url = SITE + chemin
    fonts = FONTS.replace('&', '&amp;')
    sch = ''.join(f'<script type="application/ld+json">\n{json.dumps(s, ensure_ascii=False, indent=1)}\n</script>\n'
                  for s in schema)
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(titre)}</title>
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="#0b0a0a">
<meta name="robots" content="{robots}">
<link rel="canonical" href="{url}">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="{NOM}">
<meta property="og:title" content="{E(titre)}">
<meta property="og:description" content="{E(desc)}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}img/partage.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Coiffure au Rendez-Vous, coiffeuse diplômée à Évry-Courcouronnes : poses de perruque et tissages réalisés à l'institut">
<meta name="twitter:card" content="summary_large_image">
<meta name="geo.region" content="FR-91">
<meta name="geo.placename" content="{VILLE}">
<meta name="geo.position" content="{LAT};{LON}">
<link rel="icon" type="image/svg+xml" href="{r}img/favicon.svg">
<link rel="apple-touch-icon" href="{r}img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="{fonts}" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="{fonts}"></noscript>
{precharge}<link rel="stylesheet" href="{r}css/style.css?v={VERSION}">
<script>(function(d){{d.classList.add('js');try{{if(!sessionStorage.getItem('crv-intro')&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.classList.add('intro');}}catch(e){{}}}})(document.documentElement);</script>
<!-- Généré par _outils/generer.py : modifiez les données (_outils/donnees.py) ou les textes (_outils/pages.py), pas ce fichier. -->
{sch}</head>
'''


def entete(r, actif=''):
    sous = ''.join(
        f'<li><a href="{r}{c["slug"]}/"{" aria-current=\"page\"" if actif == c["slug"] else ""}>'
        f'<span class="sm-photo">{img(r, c["photo"], "56px", alt="")}</span>'
        f'<span class="sm-texte"><strong>{E(c["nom"])}</strong><small>{E(c["resume"])}</small></span>'
        f'<span class="sm-prix">dès {prix(des_prix(c["slug"]))}</span></a></li>'
        for c in CATEGORIES)
    mob = ''.join(f'<li><a href="{r}{c["slug"]}/"><span>{E(c["nom"])}</span><small>dès {prix(des_prix(c["slug"]))}</small></a></li>'
                  for c in CATEGORIES)
    return f'''<a class="evitement" href="#contenu">Aller au contenu</a>
<div class="curseur" aria-hidden="true"><span class="curseur-point"></span><span class="curseur-anneau"><span class="curseur-texte"></span></span></div>
<header class="entete" data-entete>
  <a class="marque" href="{r or './'}" aria-label="{NOM}, accueil">
    <svg class="marque-logo" viewBox="0 0 759 227" aria-hidden="true" focusable="false"><use href="{r}img/marque.svg#wm"/></svg>
  </a>
  <nav class="nav" aria-label="Navigation principale">
    <ul class="nav-liste">
      <li class="nav-deroulant" data-deroulant>
        <button class="nav-lien" type="button" aria-expanded="false" aria-controls="sous-menu">Prestations<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4l4 4 4-4"/></svg></button>
        <div class="sous-menu" id="sous-menu"><ul>{sous}</ul></div>
      </li>
      <li><a class="nav-lien" href="{r}#diplomee">La coiffeuse</a></li>
      <li><a class="nav-lien" href="{r}#galerie">Galerie</a></li>
      <li><a class="nav-lien" href="{r}#acces">Accès</a></li>
    </ul>
  </nav>
  <a class="bouton bouton-plein entete-rdv" href="{r}reserver/" data-magnetique><span>Réserver</span></a>
  <button class="burger" type="button" aria-expanded="false" aria-controls="menu-mobile" aria-label="Ouvrir le menu"><span></span><span></span></button>
</header>
<div class="menu-mobile" id="menu-mobile" data-menu-mobile>
  <nav aria-label="Menu mobile">
    <p class="menu-titre">Prestations</p>
    <ul class="menu-prestations">{mob}</ul>
    <ul class="menu-liens">
      <li><a href="{r}#diplomee">La coiffeuse diplômée</a></li>
      <li><a href="{r}#galerie">Galerie</a></li>
      <li><a href="{r}reserver/">Réserver</a></li>
      <li><a href="{r}#acces">Accès</a></li>
    </ul>
    <p class="menu-contact"><a href="tel:{TEL_INTL}">{TEL}</a><a href="{INSTAGRAM}" rel="noopener" target="_blank">{INSTAGRAM_NOM}</a></p>
  </nav>
  <svg class="menu-mono" viewBox="0 0 200 200" aria-hidden="true"><use href="{r}img/marque.svg#mono"/></svg>
</div>
'''


def pied(r):
    cats = ''.join(f'<li><a href="{r}{c["slug"]}/">{E(c["nom"])}</a></li>' for c in CATEGORIES)
    return f'''<footer class="pied">
  <div class="conteneur">
    <a class="pied-marque" href="{r or './'}" aria-label="{NOM}, accueil">
      <svg viewBox="0 0 759 227" aria-hidden="true"><use href="{r}img/marque.svg#wm"/></svg>
    </a>
    <p class="pied-devise">Institut de beauté capillaire · <em>coiffeuse diplômée</em></p>
    <div class="pied-grille">
      <div>
        <p class="pied-titre">L'institut</p>
        <address>{ADRESSE}<br>{CP} {VILLE}</address>
        <p>Uniquement sur rendez-vous</p>
        <p><a href="{MAPS}" rel="noopener" target="_blank">Itinéraire</a></p>
      </div>
      <div>
        <p class="pied-titre">Prestations</p>
        <ul>{cats}</ul>
      </div>
      <div>
        <p class="pied-titre">Contact</p>
        <ul>
          <li><a href="tel:{TEL_INTL}">{TEL}</a></li>
          <li><a href="https://wa.me/{WHATSAPP}" rel="noopener" target="_blank">WhatsApp</a></li>
          <li><a href="{INSTAGRAM}" rel="noopener" target="_blank">Instagram {INSTAGRAM_NOM}</a></li>
          <li><a href="{r}reserver/">Prendre rendez-vous</a></li>
        </ul>
      </div>
    </div>
    <div class="pied-bas">
      <span>© <span data-annee>2026</span> {NOM} · Coiffeuse diplômée à {VILLE}</span>
      <a href="{r}mentions-legales/">Mentions légales</a>
    </div>
  </div>
</footer>
<div class="barre-mobile" data-barre-mobile>
  <a href="tel:{TEL_INTL}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5l2.6.4 1.2 3.6-1.8 1.4a12 12 0 0 0 6.5 6.5l1.4-1.8 3.6 1.2.4 2.6c-.1 1.2-1.1 2.1-2.3 2.1C10 19.5 4.5 14 4.5 5.8c0-1.2.9-2.2 2.1-2.3z"/></svg>Appeler</a>
  <a href="https://wa.me/{WHATSAPP}" rel="noopener" target="_blank"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-3.8A8 8 0 1 1 8 19z"/></svg>WhatsApp</a>
  <a class="barre-rdv" href="{r}reserver/">Réserver</a>
</div>
'''


def scripts(r, liste):
    return ''.join(f'<script src="{r}js/{s}.js?v={VERSION}" defer></script>\n' for s in liste)


def fin(r, liste):
    return f'{pied(r)}{scripts(r, liste)}</body>\n</html>\n'


# ---------------------------------------------------------------- blocs réutilisables
def ruban(mots, cls=''):
    items = ''.join(f'<span>{E(m)}</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0c1 6 4 9 10 10-6 1-9 4-10 10-1-6-4-9-10-10 6-1 9-4 10-10z"/></svg>' for m in mots)
    return f'<div class="ruban {cls}" data-ruban aria-hidden="true"><div class="ruban-piste"><div class="ruban-groupe">{items}</div><div class="ruban-groupe">{items}</div></div></div>\n'


def sceau(r, texte, cls=''):
    return f'''<div class="sceau {cls}" data-sceau aria-hidden="true">
  <svg viewBox="0 0 200 200">
    <defs><path id="cercle-{cls or 'a'}" d="M100 100m-78 0a78 78 0 1 1 156 0a78 78 0 1 1-156 0"/></defs>
    <g class="sceau-tour"><text><textPath href="#cercle-{cls or 'a'}" textLength="482">{E(texte)}</textPath></text></g>
    <circle cx="100" cy="100" r="58" class="sceau-rond"/>
    <use href="{r}img/marque.svg#mono" x="62" y="62" width="76" height="76"/>
  </svg>
</div>'''


def titre_section(sur, titre, intro='', cls=''):
    i = f'<p class="section-intro revele">{intro}</p>' if intro else ''
    return f'<div class="section-tete {cls}"><p class="surtitre revele">{sur}</p><h2 class="section-titre" data-lignes>{titre}</h2>{i}</div>'


def faq_html(items, titre='Questions <em>fréquentes</em>', sur='FAQ'):
    q = ''.join(f'<details class="faq-item revele"><summary><span>{E(a)}</span><i aria-hidden="true"></i></summary>'
                f'<div class="faq-reponse"><p>{b}</p></div></details>' for a, b in items)
    return f'''<section class="faq" id="faq">
  <div class="conteneur faq-grille">
    {titre_section(sur, titre)}
    <div class="faq-liste">{q}</div>
  </div>
</section>
'''


def faq_schema(items):
    import re
    return {'@context': 'https://schema.org', '@type': 'FAQPage',
            'mainEntity': [{'@type': 'Question', 'name': a,
                            'acceptedAnswer': {'@type': 'Answer', 'text': re.sub('<[^>]+>', '', b)}}
                           for a, b in items]}


def cta_rdv(r, titre='Prête pour votre <em>rendez-vous</em> ?', texte=None):
    texte = texte or f'Choisissez votre prestation, indiquez la date souhaitée : votre demande part en un geste sur WhatsApp ou par SMS.'
    return f'''<section class="cta-rdv">
  {ruban(['Prendre rendez-vous'] * 4, 'ruban-grand')}
  <div class="conteneur cta-rdv-contenu">
    <h2 class="section-titre" data-lignes>{titre}</h2>
    <p class="revele">{texte}</p>
    <div class="hero-actions revele">
      <a class="bouton bouton-plein" href="{r}reserver/" data-magnetique><span>Réserver en ligne</span></a>
      <a class="bouton bouton-ligne" href="tel:{TEL_INTL}"><span>{TEL}</span></a>
    </div>
  </div>
</section>
'''


def carte_tarif(r, p, page_slug=''):
    note = f'<p class="tarif-note">{E(p["note"])}</p>' if p.get('note') else ''
    jours = f' · {p["jours"]}' if p.get('jours') else ''
    lien = f'{r}reserver/?p={p["id"]}'
    return f'''<article class="tarif revele" data-tilt-leger id="{p['id']}">
  <div class="tarif-haut"><h3>{E(p['nom'])}</h3><p class="tarif-prix">{prix(p['prix'])}</p></div>
  <p class="tarif-duree"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>{duree(p['duree'])}{jours}</p>
  <p class="tarif-desc">{E(p['desc'])}</p>{note}
  <a class="tarif-lien" href="{lien}"><span>Réserver</span><svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h22M17 1l5 5-5 5"/></svg></a>
</article>'''


def etapes_html(titre, etapes, sur='Le déroulé'):
    li = ''.join(f'<li class="etape" data-etape><span class="etape-num">{i + 1:02d}</span><div><h3>{E(a)}</h3><p>{b}</p></div></li>'
                 for i, (a, b) in enumerate(etapes))
    return f'''<section class="etapes">
  <div class="conteneur etapes-grille">
    {titre_section(sur, titre)}
    <div class="etapes-corps" data-etapes>
      <svg class="etapes-meche" viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden="true"><path d="M20 0 C 34 120, 6 220, 20 340 S 34 560, 20 680 S 6 880, 20 1000" pathLength="1"/></svg>
      <ol>{li}</ol>
    </div>
  </div>
</section>
'''


def aussi_html(r, exclure):
    cartes = ''.join(f'''<a class="aussi-carte revele" href="{r}{c['slug']}/" data-curseur="Voir">
  <span class="aussi-photo">{img(r, c['photo'], '(max-width: 700px) 70vw, 300px')}</span>
  <span class="aussi-nom">{E(c['nom'])}</span><span class="aussi-prix">dès {prix(des_prix(c['slug']))}</span>
</a>''' for c in CATEGORIES if c['slug'] != exclure)
    return f'''<section class="aussi">
  <div class="conteneur">
    {titre_section('Découvrir aussi', 'Les autres <em>prestations</em>')}
    <div class="aussi-piste" data-glisse>{cartes}</div>
  </div>
</section>
'''


# ---------------------------------------------------------------- schéma de tête (vue de dessus)
CX, CY, RX, RY = 160, 205, 118, 150


def _demi_largeur(y, rx=RX, ry=RY):
    t = (y - CY) / ry
    return rx * math.sqrt(max(0, 1 - t * t))


def _meches(y0, y1, pas=21):
    d = []
    y = y0
    while y <= y1:
        w = _demi_largeur(y) - 12
        d.append(f'M{CX - w:.0f} {y:.0f}Q{CX} {y + 12:.0f} {CX + w:.0f} {y:.0f}')
        y += pas
    return ''.join(d)


def _nattes():
    d = []
    for x in (96, 118, 139, 160, 181, 202, 224):
        h = RY * math.sqrt(max(0, 1 - ((x - CX) / RX) ** 2))
        d.append(f'M{x} {CY - h + 16:.0f}L{x} {CY + h - 16:.0f}')
    return ''.join(d)


def schema_tete(zones):
    """SVG de la tête vue de dessus ; un groupe par zone (closure, frontal, wig, ouvert, ferme, ponytail, flip)."""
    g = []
    if 'wig' in zones:
        g.append(f'<g class="zone" data-zone="wig"><ellipse class="z-fond" cx="{CX}" cy="{CY}" rx="{RX - 5}" ry="{RY - 5}"/>'
                 f'<ellipse class="z-trait" cx="{CX}" cy="{CY}" rx="{RX + 7}" ry="{RY + 7}" pathLength="1"/>'
                 f'<path class="z-detail" d="{_meches(80, 330, 26)}"/></g>')
    if 'closure' in zones:
        g.append('<g class="zone" data-zone="closure"><rect class="z-fond" x="122" y="70" width="76" height="76" rx="8"/>'
                 '<rect class="z-trait" x="122" y="70" width="76" height="76" rx="8" pathLength="1"/>'
                 '<path class="z-raie" d="M160 76V140" pathLength="1"/>'
                 f'<path class="z-detail" d="{_meches(160, 330)}"/></g>')
    if 'frontal' in zones:
        o_rx, o_ry, i_rx, i_ry = RX - 4, RY - 4, RX - 44, RY - 44
        d = (f'M{CX - o_rx} {CY}A{o_rx} {o_ry} 0 0 1 {CX + o_rx} {CY}L{CX + i_rx} {CY}'
             f'A{i_rx} {i_ry} 0 0 0 {CX - i_rx} {CY}Z')
        g.append(f'<g class="zone" data-zone="frontal"><path class="z-fond" d="{d}"/><path class="z-trait" d="{d}" pathLength="1"/>'
                 '<path class="z-raie" d="M160 60V150" pathLength="1"/>'
                 f'<path class="z-detail" d="{_meches(215, 330)}"/></g>')
    if 'ouvert' in zones:
        d = 'M160 62C214 62 222 98 222 120C222 150 196 162 160 162C124 162 98 150 98 120C98 98 106 62 160 62Z'
        g.append(f'<g class="zone" data-zone="ouvert"><path class="z-fond" d="{d}"/><path class="z-trait z-pointille" d="{d}" pathLength="1"/>'
                 '<path class="z-raie" d="M160 66V158" pathLength="1"/>'
                 f'<path class="z-detail" d="{_meches(180, 330)}"/></g>')
    if 'ferme' in zones:
        g.append(f'<g class="zone" data-zone="ferme"><ellipse class="z-fond" cx="{CX}" cy="{CY}" rx="{RX - 5}" ry="{RY - 5}"/>'
                 f'<ellipse class="z-trait" cx="{CX}" cy="{CY}" rx="{RX - 5}" ry="{RY - 5}" pathLength="1"/>'
                 f'<path class="z-detail" d="{_meches(78, 334, 19)}"/></g>')
    if 'flip' in zones:
        g.append(f'<g class="zone" data-zone="flip"><ellipse class="z-fond" cx="{CX}" cy="{CY}" rx="{RX - 5}" ry="{RY - 5}"/>'
                 f'<path class="z-detail" d="{_meches(150, 334, 21)}"/>'
                 '<path class="z-raie z-raie-mobile" d="M160 64V170" pathLength="1"/>'
                 '<path class="z-fleche" d="M120 182q40 26 80 0M194 174l6 8-9 3M126 174l-6 8 9 3"/></g>')
    if 'ponytail' in zones:
        rayons = []
        for k in range(14):
            a = math.pi * 2 * k / 14
            x = CX + (RX - 10) * math.cos(a)
            y = CY + (RY - 10) * math.sin(a)
            rayons.append(f'M{x:.0f} {y:.0f}L{CX} 292')
        g.append(f'<g class="zone" data-zone="ponytail"><ellipse class="z-fond" cx="{CX}" cy="{CY}" rx="{RX - 5}" ry="{RY - 5}"/>'
                 f'<path class="z-detail" d="{"".join(rayons)}"/>'
                 f'<circle class="z-trait" cx="{CX}" cy="292" r="15" pathLength="1"/><circle class="z-noeud" cx="{CX}" cy="292" r="6"/></g>')
    return f'''<svg class="tete" viewBox="0 0 320 400" role="img" aria-label="Schéma d'une tête vue de dessus, visage en haut">
  <path class="tete-nez" d="M148 44L160 28L172 44"/>
  <text class="tete-legende" x="160" y="16" text-anchor="middle">VISAGE</text>
  <text class="tete-legende" x="160" y="396" text-anchor="middle">NUQUE</text>
  <path class="tete-oreille" d="M44 182C26 190 26 236 44 244M276 182C294 190 294 236 276 244"/>
  <ellipse class="tete-crane" cx="{CX}" cy="{CY}" rx="{RX}" ry="{RY}"/>
  <path class="tete-nattes" d="{_nattes()}"/>
  {''.join(g)}
</svg>'''


def zones_html(r, cles, titre, intro, sur='Choisir sa technique'):
    data = pages.ZONES
    boutons = ''.join(f'<button type="button" class="zone-choix" data-choix="{k}" aria-pressed="{"true" if i == 0 else "false"}">'
                      f'<span>{E(data[k]["nom"])}</span></button>' for i, k in enumerate(cles))
    panneaux = []
    for i, k in enumerate(cles):
        z = data[k]
        liens = ''.join(f'<li><a href="{r}{presta(pid)["cat"]}/#{pid}">'
                        f'<span>{E(presta(pid)["nom"])}</span><strong>{prix(presta(pid)["prix"])}</strong></a></li>'
                        for pid in z['prestations'])
        panneaux.append(f'<div class="zone-panneau" data-panneau="{k}"{"" if i == 0 else " hidden"}>'
                        f'<h3>{E(z["nom"])}</h3><p>{z["texte"]}</p><ul class="zone-prix">{liens}</ul></div>')
    return f'''<section class="zones" id="quelle-pose">
  <div class="conteneur zones-grille" data-zones>
    <div class="zones-texte">
      {titre_section(sur, titre, intro)}
      <div class="zone-choix-liste" role="group" aria-label="Techniques">{boutons}</div>
      <div class="zone-panneaux" aria-live="polite">{''.join(panneaux)}</div>
    </div>
    <div class="zones-visuel revele">
      <div class="zones-cercle">{schema_tete(cles)}</div>
    </div>
  </div>
</section>
'''


# ---------------------------------------------------------------- schémas JSON-LD
def schema_salon():
    offres = [{'@type': 'Offer', 'price': p['prix'], 'priceCurrency': 'EUR',
               'itemOffered': {'@type': 'Service', 'name': p['nom'], 'description': p['desc']}}
              for p in PRESTATIONS]
    return {
        '@context': 'https://schema.org', '@type': 'HairSalon', '@id': SITE + '#institut',
        'name': NOM,
        'description': "Institut de beauté capillaire tenu par une coiffeuse diplômée à Évry-Courcouronnes : pose de "
                       "perruque, confection de perruque à la machine, tissage, ponytail, nattes, brushing et "
                       "formations professionnelles.",
        'url': SITE, 'telephone': TEL_INTL,
        'logo': SITE + 'img/apple-touch-icon.png',
        'image': [SITE + 'img/partage.jpg'] + [f'{SITE}img/photos/{n}-960.webp' for n in
                                                ('pose-body-wave', 'confection-meche', 'ponytail-demi-tete')],
        'priceRange': '20 € – 180 €',
        'paymentAccepted': 'Espèces, PayPal',
        'address': {'@type': 'PostalAddress', 'streetAddress': ADRESSE, 'postalCode': CP,
                    'addressLocality': VILLE, 'addressRegion': 'Île-de-France', 'addressCountry': 'FR'},
        'geo': {'@type': 'GeoCoordinates', 'latitude': LAT, 'longitude': LON},
        'hasMap': MAPS,
        'sameAs': [INSTAGRAM, 'https://www.coiffureaurendezvous.com/'],
        'areaServed': [VILLE, 'Corbeil-Essonnes', 'Ris-Orangis', 'Lisses', 'Bondoufle', 'Grigny', 'Villabé', 'Essonne'],
        'knowsAbout': ['Pose de perruque', 'Lace frontal', 'Closure', 'Confection de perruque', 'Tissage',
                       'Ponytail', 'Nattes', 'Brushing'],
        'hasOfferCatalog': {'@type': 'OfferCatalog', 'name': 'Prestations', 'itemListElement': offres},
    }


def schema_ariane(nom, slug):
    return {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
        {'@type': 'ListItem', 'position': 1, 'name': 'Accueil', 'item': SITE},
        {'@type': 'ListItem', 'position': 2, 'name': nom, 'item': f'{SITE}{slug}/'}]}


def schema_service(cat, texte):
    return {'@context': 'https://schema.org', '@type': 'Service', 'name': cat['nom'], 'serviceType': cat['nom'],
            'description': texte, 'url': f'{SITE}{cat["slug"]}/',
            'provider': {'@id': SITE + '#institut'}, 'areaServed': VILLE,
            'offers': [{'@type': 'Offer', 'name': p['nom'], 'price': p['prix'], 'priceCurrency': 'EUR'}
                       for p in prestas_de(cat['slug'])]}


# ---------------------------------------------------------------- écriture
def ecrire(chemin, contenu):
    complet = os.path.join(RACINE, chemin)
    os.makedirs(os.path.dirname(complet), exist_ok=True)
    with open(complet, 'w', encoding='utf-8') as f:
        f.write(contenu)
    print('écrit', chemin, len(contenu))


def donnees_js():
    data = {
        'tel': TEL, 'telIntl': TEL_INTL, 'whatsapp': WHATSAPP, 'nom': NOM,
        'politique': POLITIQUE,
        'categories': [{'slug': c['slug'], 'nom': c['nom']} for c in CATEGORIES],
        'prestations': [{k: p[k] for k in ('id', 'cat', 'nom', 'prix', 'duree') if k in p} | (
            {'jours': p['jours']} if 'jours' in p else {}) | ({'note': p['note']} if 'note' in p else {})
                        for p in PRESTATIONS],
    }
    return ('/* Généré par _outils/generer.py depuis _outils/donnees.py : ne pas modifier à la main. */\n'
            f'window.CRV = {json.dumps(data, ensure_ascii=False, indent=1)};\n')


def sitemap():
    urls = [('', '1.0')] + [(c['slug'] + '/', '0.8') for c in CATEGORIES] + [('reserver/', '0.7')]
    corps = ''.join(f'  <url><loc>{SITE}{u}</loc><lastmod>{MAJ}</lastmod><priority>{p}</priority></url>\n'
                    for u, p in urls)
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + corps + '</urlset>\n')


def main():
    ctx = dict(globals())
    ecrire('index.html', pages.accueil(ctx))
    for c in CATEGORIES:
        ecrire(f'{c["slug"]}/index.html', pages.page_prestation(ctx, c['slug']))
    ecrire('reserver/index.html', pages.reserver(ctx))
    ecrire('mentions-legales/index.html', pages.mentions(ctx))
    ecrire('js/donnees.js', donnees_js())
    ecrire('sitemap.xml', sitemap())
    ecrire('robots.txt', f'User-agent: *\nAllow: /\nSitemap: {SITE}sitemap.xml\n')


if __name__ == '__main__':
    main()
