"""Génère le carnet (articles SEO) du site Barbershop49.

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

URL = "https://adamelkenz.github.io/barbershop49/"
MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août",
        "septembre", "octobre", "novembre", "décembre"]


def e(s):
    return html.escape(s, quote=True)


def date_fr(iso):
    y, m, d = iso.split("-")
    return f"{int(d)} {MOIS[int(m) - 1]} {y}"


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def topbar(prefix):
    return f"""<header class="topbar">
  <div class="wrap">
    <a class="logo" href="{prefix}" aria-label="Barbershop49, accueil">
      <img src="{prefix}img/poteau.svg" alt="" width="34" height="34">
      <span>Barbershop<b>49</b></span>
    </a>
    <nav class="nav" aria-label="Navigation principale">
      <a href="{prefix}#tarifs">Tarifs</a>
      <a href="{prefix}#lexique">Lexique</a>
      <a href="{prefix}carnet/">Carnet</a>
      <a href="{prefix}#infos">Infos</a>
      <a class="btn btn-petit" href="{prefix}#infos" data-resa>Réserver</a>
    </nav>
  </div>
</header>"""


def pied(prefix):
    return f"""<footer class="pied">
  <div class="wrap">
    <div>
      <div class="grand">Barbershop 49</div>
      <p>Barbier à Angers · quartier gare Saint-Laud</p>
    </div>
    <nav aria-label="Liens de pied de page">
      <a href="{prefix}">Accueil</a>
      <a href="{prefix}carnet/">Carnet</a>
      <a href="{prefix}mentions-legales/">Mentions légales</a>
    </nav>
  </div>
</footer>
<script src="{prefix}js/site.js?v=2" defer></script>
<script src="{prefix}js/poteau.js?v=2" defer></script>
</body>
</html>
"""


def head(titre, description, canonical, prefix, og_type, ld):
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(titre)}</title>
<meta name="description" content="{e(description)}">
<meta name="theme-color" content="#0e0d0c">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{canonical}">
<meta property="og:type" content="{og_type}">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Barbershop49">
<meta property="og:title" content="{e(titre)}">
<meta property="og:description" content="{e(description)}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{URL}img/partage.jpg">
<meta name="geo.region" content="FR-49">
<link rel="icon" type="image/svg+xml" href="{prefix}img/poteau.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=Monoton&display=swap">
<link rel="stylesheet" href="{prefix}css/style.css?v=2">
<script>document.documentElement.className = 'js';</script>
<script type="application/ld+json">
{json.dumps(ld, ensure_ascii=False, indent=1)}
</script>
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
"""


SALON = {"@type": "HairSalon", "@id": URL + "#salon", "name": "Barbershop49", "url": URL}


def page_article(i, a):
    n = i + 1
    url = f"{URL}carnet/{a['slug']}/"
    prefix = "../../"
    corps = a["corps"].strip()
    toc = []

    def ancre(m):
        t = re.sub("<[^>]+>", "", m.group(1))
        toc.append((slugify(t), t))
        return f'<h2 id="{slugify(t)}">{m.group(1)}</h2>'
    corps = re.sub(r"<h2>(.*?)</h2>", ancre, corps)
    lies = [ARTICLES[(i + k) % len(ARTICLES)] for k in (1, 2, 3)]

    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "BlogPosting", "@id": url + "#article", "headline": a["titre"],
         "description": a["description"], "datePublished": DATE, "dateModified": DATE,
         "inLanguage": "fr-FR", "mainEntityOfPage": url, "author": {"@id": URL + "#salon"},
         "publisher": {"@id": URL + "#salon"},
         "about": ["Barbier", "Coiffure homme", "Angers"]},
        SALON,
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
    lies_html = "\n".join(f'<li><a href="../{x["slug"]}/">{e(x["titre"])}</a></li>' for x in lies)

    out = head(f"{a['titre']} | Barbershop49 Angers", a["description"], url, prefix, "article", ld)
    out += topbar(prefix) + f"""
<main id="contenu" class="page-carnet">
  <div class="wrap">
  <nav class="ariane" aria-label="Fil d'Ariane"><a href="{prefix}">Accueil</a><span>/</span><a href="../">Carnet</a><span>/</span>{e(a['court'])}</nav>
  <div class="art-grid">
    <article>
      <header class="art-head">
        <div class="meta">Carnet · N° {n:02d}</div>
        <h1>{e(a['titre'])}</h1>
        <p class="infos-art"><time datetime="{DATE}">{date_fr(DATE)}</time> · {a['lecture']} min de lecture · par l'équipe Barbershop49</p>
        <p class="chapeau">{e(a['chapeau'])}</p>
      </header>
      <nav class="sommaire" aria-label="Dans cet article"><p>Dans cet article</p><ol>
{toc_html}
<li><a href="#questions">Questions fréquentes</a></li>
      </ol></nav>
      <div class="corps">
{corps}
      </div>
      <section class="faq" id="questions" aria-labelledby="t-questions">
        <h2 id="t-questions">Questions fréquentes</h2>
{faq_html}
      </section>
      <aside class="cta-art">
        <p>Prêt pour le fauteuil ?</p>
        <a class="btn" href="{prefix}#infos" data-resa>Prendre rendez-vous</a>
      </aside>
    </article>
    <aside class="art-side">
      <div class="bloc"><p>À lire aussi</p><ul>
{lies_html}
      </ul></div>
      <div class="bloc"><p>Le salon</p><ul>
<li><a href="{prefix}#tarifs">Prestations &amp; tarifs</a></li>
<li><a href="{prefix}#lexique">Lexique du barbier</a></li>
<li><a href="{prefix}#infos">Horaires &amp; accès</a></li>
      </ul></div>
    </aside>
  </div>
  </div>
</main>
""" + pied(prefix)
    return out


def cartes(prefix_articles, niveau_titre="h3"):
    items = []
    for i, a in enumerate(ARTICLES):
        items.append(f"""    <li class="carte-art monte">
      <a href="{prefix_articles}{a['slug']}/">
        <span class="meta">N° {i + 1:02d} · {a['lecture']} min</span>
        <{niveau_titre}>{e(a['titre'])}</{niveau_titre}>
        <p>{e(a['chapeau'])}</p>
        <span class="lire">Lire l'article <span aria-hidden="true">→</span></span>
      </a>
    </li>""")
    return '<ol class="carnet-cards">\n' + "\n".join(items) + "\n  </ol>"


def page_index():
    url = URL + "carnet/"
    prefix = "../"
    titre = "Carnet du barbier : conseils coupe, dégradé et barbe | Barbershop49 Angers"
    desc = "Conseils de barbier à Angers : choisir son dégradé, entretenir sa barbe, la coupe selon la forme du visage, le rasage à l'ancienne."
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "Blog", "@id": url + "#carnet", "name": "Carnet du barbier", "url": url,
         "inLanguage": "fr-FR", "publisher": {"@id": URL + "#salon"},
         "blogPost": [{"@type": "BlogPosting", "headline": a["titre"],
                       "url": f"{url}{a['slug']}/", "datePublished": DATE} for a in ARTICLES]},
        SALON,
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Accueil", "item": URL},
            {"@type": "ListItem", "position": 2, "name": "Carnet", "item": url}]},
    ]}
    out = head(titre, desc, url, prefix, "website", ld)
    out += topbar(prefix) + f"""
<main id="contenu" class="page-carnet">
  <div class="wrap">
  <nav class="ariane" aria-label="Fil d'Ariane"><a href="{prefix}">Accueil</a><span>/</span>Carnet</nav>
  <header class="tete">
    <div class="num">Le carnet</div>
    <h1 style="font-size:clamp(2.8rem,7vw,5rem);margin:8px 0 14px">Conseils du barbier</h1>
    <p>Ce qu'on explique tous les jours au fauteuil, écrit noir sur blanc : dégradés, barbe, morphologie, rasage.</p>
  </header>
  {cartes("", "h2")}
  </div>
</main>
""" + pied(prefix)
    return out


def ecrire(chemin, contenu):
    os.makedirs(os.path.dirname(chemin), exist_ok=True)
    with open(chemin, "w", encoding="utf-8") as f:
        f.write(contenu)


def main():
    ecrire(os.path.join(SITE, "carnet", "index.html"), page_index())
    for i, a in enumerate(ARTICLES):
        ecrire(os.path.join(SITE, "carnet", a["slug"], "index.html"), page_article(i, a))

    p = os.path.join(SITE, "index.html")
    h = open(p, encoding="utf-8").read()
    if "CARNET:DEBUT" not in h:
        sys.exit("Marqueurs CARNET:DEBUT / CARNET:FIN absents de index.html")
    bloc = "<!-- CARNET:DEBUT (généré par _outils/carnet.py) -->\n  " + cartes("carnet/") + "\n  <!-- CARNET:FIN -->"
    ecrire(p, re.sub(r"<!-- CARNET:DEBUT.*?<!-- CARNET:FIN -->", lambda m: bloc, h, flags=re.S))

    urls = [URL, URL + "carnet/"] + [f"{URL}carnet/{a['slug']}/" for a in ARTICLES] + [URL + "mentions-legales/"]
    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sm += "".join(f"  <url><loc>{u}</loc><lastmod>{DATE}</lastmod></url>\n" for u in urls)
    sm += "</urlset>\n"
    ecrire(os.path.join(SITE, "sitemap.xml"), sm)
    print(f"{len(ARTICLES)} articles, {len(urls)} URL dans le sitemap")


if __name__ == "__main__":
    main()
