"""Génère le carnet (articles SEO) du site Clément Sassier Paysage.

    python3 _outils/carnet.py

Produit carnet/index.html, carnet/<slug>/index.html, met à jour sitemap.xml
et le bloc « carnet » de la page d'accueil (entre CARNET:DEBUT et CARNET:FIN).
Pour ajouter un article : une entrée dans articles.py, puis relancer.
"""
import html, json, os, re, sys, unicodedata

ICI = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(ICI)
sys.path.insert(0, ICI)
from articles import ARTICLES, DATE  # noqa: E402
import dessins  # noqa: E402

URL = "https://adamelkenz.github.io/paysage-sassier/"
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
        "septembre", "octobre", "novembre", "décembre"]
ROMAINS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"]


def e(s):
    return html.escape(s, quote=True)


def date_fr(iso):
    y, m, d = iso.split("-")
    return f"{int(d)} {MOIS[int(m) - 1]} {y}"


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def dessin(nom):
    # dessin statique (pas d'animation sur les pages du carnet)
    return getattr(dessins, nom)().replace('class="draw ', 'class="draw is-drawn ')


def masthead(prefix):
    return f"""<header class="masthead">
  <a class="mark" href="{prefix}" aria-label="Clément Sassier Paysage, accueil">
    <svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20,36 C20,26 20,16 22,4 M22,4 C30,10 32,22 20,30 C10,22 12,10 22,4 M20,24 L14,18 M20,18 L26,12 M20,30 L27,22"/></svg>
    <span>C. Sassier <em>paysage</em></span>
  </a>
  <nav aria-label="Sommaire">
    <ol>
      <li><a href="{prefix}#savoir-faire"><span>III</span> Savoir-faire</a></li>
      <li><a href="{prefix}#specimens"><span>IV</span> Réalisations</a></li>
      <li><a href="{prefix}#secteur"><span>VI</span> Secteur</a></li>
      <li><a href="{prefix}carnet/"><span>VII</span> Carnet</a></li>
      <li><a class="nav-devis" href="{prefix}#devis"><span>VIII</span> Devis</a></li>
    </ol>
  </nav>
</header>"""


def colophon(prefix):
    return f"""<footer class="colophon">
  <p class="colo-title">Colophon</p>
  <p>Clément Sassier Paysage — entrepreneur individuel, Triqueville (27500). SIREN 107&nbsp;884&nbsp;181.</p>
  <p>Paysagiste à Triqueville, Pont-Audemer, Beuzeville, Cormeilles, Lieurey et alentours.</p>
  <p><a href="{prefix}">Accueil</a> · <a href="{prefix}carnet/">Carnet</a> · <a href="{prefix}mentions-legales/">Mentions légales</a></p>
</footer>"""


def head(titre, description, canonical, prefix, og_type, ld):
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(titre)}</title>
<meta name="description" content="{e(description)}">
<meta name="theme-color" content="#2F3D26">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="{og_type}">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Clément Sassier Paysage">
<meta property="og:title" content="{e(titre)}">
<meta property="og:description" content="{e(description)}">
<meta property="og:url" content="{canonical}">
<meta name="geo.region" content="FR-27">
<link rel="icon" type="image/svg+xml" href="{prefix}img/feuille.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="{prefix}css/style.css">
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=1)}
</script>
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
"""


ENTREPRISE = {"@type": "LandscapingBusiness", "@id": URL + "#entreprise",
              "name": "Clément Sassier Paysage", "url": URL}
AUTEUR = {"@type": "Person", "name": "Clément Sassier", "jobTitle": "Paysagiste",
          "worksFor": {"@id": URL + "#entreprise"}}


def page_article(i, a):
    n = i + 1
    url = f"{URL}carnet/{a['slug']}/"
    prefix = "../../"
    corps = a["corps"].strip()
    # identifiants des intertitres + sommaire
    toc = []
    def ancre(m):
        t = re.sub("<[^>]+>", "", m.group(1))
        toc.append((slugify(t), t))
        return f'<h2 id="{slugify(t)}">{m.group(1)}</h2>'
    corps = re.sub(r"<h2>(.*?)</h2>", ancre, corps)
    # liens « à lire aussi » : les deux articles suivants, en boucle
    lies = [ARTICLES[(i + k) % len(ARTICLES)] for k in (1, 2)]

    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BlogPosting", "@id": url + "#article", "headline": a["titre"],
         "description": a["description"], "datePublished": DATE, "dateModified": DATE,
         "inLanguage": "fr-FR", "mainEntityOfPage": url, "author": AUTEUR,
         "publisher": {"@id": URL + "#entreprise"},
         "about": ["Paysagiste", "Jardin", "Eure", "Normandie"]},
        ENTREPRISE,
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Accueil", "item": URL},
            {"@type": "ListItem", "position": 2, "name": "Carnet", "item": URL + "carnet/"},
            {"@type": "ListItem", "position": 3, "name": a["court"], "item": url}]},
        {"@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q,
             "acceptedAnswer": {"@type": "Answer", "text": r}} for q, r in a["faq"]]},
    ]}

    toc_html = "\n".join(f'<li><a href="#{s}">{e(t)}</a></li>' for s, t in toc)
    faq_html = "\n".join(
        f"<details><summary>{e(q)}</summary><p>{e(r)}</p></details>" for q, r in a["faq"])
    lies_html = "\n".join(
        f'<li><a href="../{x["slug"]}/"><span class="inv">N° {ARTICLES.index(x) + 1:02d}</span>{e(x["titre"])}</a></li>'
        for x in lies)

    out = head(f"{a['titre']} | Clément Sassier Paysage", a["description"], url, prefix, "article", ld)
    out += masthead(prefix) + f"""
<main id="contenu" class="plate article">
  <nav class="crumbs" aria-label="Fil d'Ariane"><a href="{prefix}">Accueil</a> <span>/</span> <a href="../">Carnet</a> <span>/</span> {e(a['court'])}</nav>
  <div class="art-grid">
    <article>
      <header class="art-head">
        <div class="plate-num">Carnet · Fiche N° {n:02d}</div>
        <h1>{e(a['titre'])}</h1>
        <p class="art-meta"><time datetime="{DATE}">{date_fr(DATE)}</time> · {a['lecture']} min de lecture · par Clément Sassier, paysagiste à Triqueville</p>
        <p class="chapeau">{e(a['chapeau'])}</p>
      </header>
      <nav class="toc" aria-label="Dans cet article"><p>Dans cette fiche</p><ol>
{toc_html}
<li><a href="#questions">Questions fréquentes</a></li>
      </ol></nav>
      <div class="art-body">
{corps}
      </div>
      <section class="faq" id="questions" aria-labelledby="t-questions">
        <h2 id="t-questions">Questions fréquentes</h2>
{faq_html}
      </section>
      <aside class="cta">
        <p class="plate-num">Un projet près de chez vous ?</p>
        <p class="cta-t">Je passe voir votre jardin et je vous fais un devis gratuit.</p>
        <a class="stamp" href="{prefix}#devis">Remplir la fiche de demande</a>
      </aside>
    </article>
    <aside class="art-side">
      <div class="art-art">{dessin(a['dessin'])}</div>
      <dl class="label">
        <div><dt>Fiche</dt><dd>N° {n:02d}</dd></div>
        <div><dt>Sujet</dt><dd>{e(a['court'])}</dd></div>
        <div><dt>Secteur</dt><dd>Pont-Audemer, Risle, Lieuvin</dd></div>
        <div><dt>Leg.</dt><dd>C. Sassier</dd></div>
      </dl>
      <div class="related"><p class="plate-num">À lire aussi</p><ul>
{lies_html}
      </ul></div>
    </aside>
  </div>
</main>
""" + colophon(prefix) + f'\n<script src="{prefix}js/branche.js" defer></script>\n</body>\n</html>\n'
    return out


def cartes(prefix_articles, niveau_titre="h3"):
    items = []
    for i, a in enumerate(ARTICLES):
        r = (-1.1, .8, -.5, 1.2, -.9, .6)[i % 6]
        items.append(f"""    <li class="fiche-card" style="--r:{r}deg">
      <a href="{prefix_articles}{a['slug']}/">
        <span class="inv">Fiche N° {i + 1:02d} · {a['lecture']} min</span>
        <{niveau_titre}>{e(a['titre'])}</{niveau_titre}>
        <p>{e(a['chapeau'])}</p>
        <span class="lire">Lire la fiche <span aria-hidden="true">→</span></span>
      </a>
    </li>""")
    return '<ol class="carnet-cards">\n' + "\n".join(items) + "\n  </ol>"


def page_index():
    url = URL + "carnet/"
    prefix = "../"
    titre = "Carnet du jardinier : conseils de paysagiste en Normandie | Clément Sassier"
    desc = "Conseils de paysagiste pour les jardins de l'Eure et du Pays d'Auge : taille de haies, haie champêtre, pelouse sur sol argileux, vieux pommiers, terrain en friche."
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Blog", "@id": url + "#carnet", "name": "Carnet du jardinier", "url": url,
         "inLanguage": "fr-FR", "publisher": {"@id": URL + "#entreprise"},
         "blogPost": [{"@type": "BlogPosting", "headline": a["titre"],
                       "url": f"{url}{a['slug']}/", "datePublished": DATE} for a in ARTICLES]},
        ENTREPRISE,
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Accueil", "item": URL},
            {"@type": "ListItem", "position": 2, "name": "Carnet", "item": url}]},
    ]}
    out = head(titre, desc, url, prefix, "website", ld)
    out += masthead(prefix) + f"""
<main id="contenu" class="plate">
  <nav class="crumbs" aria-label="Fil d'Ariane"><a href="{prefix}">Accueil</a> <span>/</span> Carnet</nav>
  <header class="plate-head">
    <div class="plate-num">Planche VII</div>
    <h1 class="h2">Carnet du jardinier</h1>
    <p class="plate-intro">Ce que j'apprends dans les jardins de la Risle et du Lieuvin, noté au propre. Des conseils concrets pour l'Eure et le Pays d'Auge.</p>
  </header>
  {cartes("")}
</main>
""" + colophon(prefix) + f'\n<script src="{prefix}js/branche.js" defer></script>\n</body>\n</html>\n'
    return out


def ecrire(chemin, contenu):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, "w", encoding="utf-8") as f:
        f.write(contenu)


def main():
    ecrire(os.path.join(SITE, "carnet", "index.html"), page_index())
    for i, a in enumerate(ARTICLES):
        ecrire(os.path.join(SITE, "carnet", a["slug"], "index.html"), page_article(i, a))

    # bloc carnet de la page d'accueil
    p = os.path.join(SITE, "index.html")
    h = open(p, encoding="utf-8").read()
    bloc = "<!-- CARNET:DEBUT (généré par _outils/carnet.py) -->\n  " + cartes("carnet/") + "\n  <!-- CARNET:FIN -->"
    h2 = re.sub(r"<!-- CARNET:DEBUT.*?<!-- CARNET:FIN -->", lambda m: bloc, h, flags=re.S)
    if h2 == h and "CARNET:DEBUT" not in h:
        sys.exit("Marqueurs CARNET:DEBUT / CARNET:FIN absents de index.html")
    ecrire(p, h2)

    urls = [URL, URL + "carnet/"] + [f"{URL}carnet/{a['slug']}/" for a in ARTICLES] + [URL + "mentions-legales/"]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm += "".join(f"  <url><loc>{u}</loc><lastmod>{DATE}</lastmod></url>\n" for u in urls)
    sm += "</urlset>\n"
    ecrire(os.path.join(SITE, "sitemap.xml"), sm)
    print(f"{len(ARTICLES)} articles, {len(urls)} URL dans le sitemap")


if __name__ == "__main__":
    main()
