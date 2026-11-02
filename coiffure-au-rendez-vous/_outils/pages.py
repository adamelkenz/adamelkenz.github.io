# -*- coding: utf-8 -*-
"""Textes et gabarits des pages. Les helpers (img, prix, entete…) viennent de generer.py via ctx."""
from types import SimpleNamespace
from urllib.parse import quote

# ---------------------------------------------------------------- techniques du schéma de tête
ZONES = {
    'closure': dict(nom='Closure', prestations=['pose-closure', 'tissage-closure'],
                    texte="Une petite base en lace posée sur le dessus de la tête, là où se trouve la raie. "
                          "Discrète et rapide à poser, elle dessine une raie naturelle, au milieu ou sur le côté."),
    'frontal': dict(nom='Lace frontal', prestations=['pose-lace-frontal', 'tissage-lace-frontal', 'ponytail-lace-frontal'],
                    texte="La lace suit toute la ligne frontale, d'une oreille à l'autre. Elle recrée une naissance de "
                          "cheveux naturelle et permet de dégager le visage, de coiffer en arrière, de changer de raie."),
    'wig': dict(nom='Perruque complète', prestations=['pose-wig-exterieure', 'confection-pose-frontal'],
                texte="La perruque se pose sur une base de nattes plates : vos cheveux restent protégés dessous, et "
                      "la perruque se retire sans rien abîmer."),
    'ouvert': dict(nom='Tissage ouvert', prestations=['tissage-ouvert'],
                   texte="Les mèches sont cousues sur des nattes, et une partie de vos cheveux reste dehors pour couvrir "
                         "les coutures et se fondre dans les mèches."),
    'ferme': dict(nom='Tissage fermé', prestations=['tissage-ferme'],
                  texte="Tous vos cheveux sont nattés puis entièrement recouverts par les mèches : rien ne dépasse, vos "
                        "cheveux sont protégés le temps de la pose."),
    'flip': dict(nom='Flip over', prestations=['flip-over'],
                 texte="Un tissage pensé pour bouger : la chevelure se retourne et la raie passe d'un côté à l'autre, "
                       "pour varier les coiffures sans refaire la pose."),
    'ponytail': dict(nom='Ponytail', prestations=['ponytail-simple', 'ponytail-demi-tete'],
                     texte="Vos cheveux sont plaqués et rassemblés, puis la queue de cheval est allongée avec des mèches "
                           "pour une ponytail nette et pleine de volume."),
}

FAQ_ACCUEIL = [
    ("Faut-il verser un acompte pour réserver ?",
     "Oui. Un acompte de 30 % du montant de la prestation confirme votre réservation. Il est déduit du total le jour "
     "du rendez-vous et n'est pas remboursé en cas d'annulation."),
    ("Quels moyens de paiement acceptez-vous ?", "Le règlement se fait en espèces ou via PayPal."),
    ("Que se passe-t-il si j'arrive en retard ?",
     "Un retard de 15 minutes est toléré. Au-delà, le rendez-vous est annulé et l'acompte n'est pas remboursé."),
    ("Comment déplacer ou annuler un rendez-vous ?",
     "Prévenez au minimum 48 heures à l'avance, par téléphone ou WhatsApp au 07 62 74 78 82."),
    ("Puis-je venir avec ma propre perruque ?",
     "Oui : choisissez la prestation « Pose wig extérieure » (80 €). La perruque doit être déposée à l'institut "
     "5 jours avant le rendez-vous, sans quoi le rendez-vous est annulé."),
    ("Proposez-vous des mèches et des perruques ?",
     "Oui, l'institut vous invite à choisir parmi ses mèches et perruques de qualité. Les perruques confectionnées "
     "par Coiffure au Rendez-Vous se posent avec les prestations « Pose closure » et « Pose lace frontal »."),
    ("La coiffeuse est-elle diplômée ?",
     "Oui. Coiffure au Rendez-Vous est tenu par une coiffeuse diplômée, qui transmet aussi ses techniques lors de "
     "formations professionnelles : tissage, confection, pose lace et ponytail."),
    ("Où se trouve l'institut ?",
     "Au 8 rue Montespan, 91000 Évry-Courcouronnes, dans le quartier des Loges. L'institut reçoit uniquement sur "
     "rendez-vous."),
]


def _photos_pile(g, r, noms):
    cartes = ''.join(f'<figure class="pile-carte" data-pile-carte>{g.img(r, n, "(max-width: 900px) 70vw, 380px", charge="eager" if i == 0 else "lazy")}</figure>'
                     for i, n in enumerate(noms))
    return f'''<div class="pile" data-pile>
  <div class="pile-cartes">{cartes}</div>
  <button class="pile-suivante" type="button" data-pile-suivante><span>Photo suivante</span><svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h22M17 1l5 5-5 5"/></svg></button>
</div>'''


# ================================================================= ACCUEIL
def accueil(ctx):
    g = SimpleNamespace(**ctx)
    r = ''
    P = g.POLITIQUE
    lignes = ''
    for i, c in enumerate(g.CATEGORIES):
        lignes += f'''<a class="index-ligne revele" href="{c['slug']}/" data-photo="img/photos/{c['photo']}-480.webp" data-curseur="Découvrir">
  <span class="index-num">{i + 1:02d}</span>
  <span class="index-vignette">{g.img(r, c['photo'], '72px', alt='')}</span>
  <span class="index-nom">{g.E(c['nom'])}</span>
  <span class="index-resume">{g.E(c['resume'])}</span>
  <span class="index-prix">dès {g.prix(g.des_prix(c['slug']))}</span>
  <span class="index-fleche" aria-hidden="true"><svg viewBox="0 0 24 12"><path d="M0 6h22M17 1l5 5-5 5"/></svg></span>
</a>'''
    galerie = ''
    for i, (n, f) in enumerate(g.GALERIE):
        galerie += (f'<figure class="galerie-item" data-filtre="{f}"><button type="button" class="galerie-bouton" data-ouvrir="{i}" '
                    f'aria-label="Agrandir la photo : {g.E(g.PHOTOS[n][0])}" data-curseur="Voir" '
                    f'data-grande="img/photos/{n}-{"960" if g.PHOTOS[n][1] else "480"}.webp">'
                    f'{g.img(r, n, "(max-width: 700px) 62vw, 300px")}</button></figure>')
    filtres = ''.join(f'<button type="button" class="filtre" data-filtrer="{k}" aria-pressed="{"true" if k == "tout" else "false"}">{v}</button>'
                      for k, v in g.FILTRES)
    form = ''.join(f'<li class="revele"><a href="formations/#{p["id"]}"><span>{g.E(p["nom"].replace("Formation ", "")[:1].upper() + p["nom"].replace("Formation ", "")[1:])}</span>'
                   f'<em>{p["jours"]}</em><strong>{g.prix(p["prix"])}</strong></a></li>'
                   for p in g.PRESTATIONS if p['cat'] == 'formations')
    schema = [g.schema_salon(), g.faq_schema(FAQ_ACCUEIL)]
    pre = ('<link rel="preload" as="image" href="img/video/showreel-poster.webp">\n')
    out = g.tete_html(r, 'Coiffure au Rendez-Vous | Coiffeuse diplômée à Évry-Courcouronnes, pose perruque et tissage',
                      "Coiffeuse diplômée à Évry-Courcouronnes (91) : pose de perruque closure et lace frontal, "
                      "confection de perruque à la machine, tissage, ponytail, nattes et brushing. Sur rendez-vous.",
                      '', schema, precharge=pre)
    out += '<body class="page-accueil">\n'
    out += f'''<div class="rideau" data-rideau aria-hidden="true">
  <div class="rideau-pan rideau-g"></div><div class="rideau-pan rideau-d"></div>
  <svg class="rideau-mono" viewBox="0 0 200 200"><use class="rm-g" href="img/marque.svg#mono-g"/><use class="rm-d" href="img/marque.svg#mono-d"/><use class="rm-m" href="img/marque.svg#mono-m"/></svg>
  <p class="rideau-texte">Coiffure au Rendez-Vous</p>
</div>
'''
    out += g.entete(r)
    out += f'''<main id="contenu">
<section class="hero" id="accueil">
  <canvas class="meches" data-meches aria-hidden="true"></canvas>
  <div class="conteneur hero-grille">
    <div class="hero-texte">
      <p class="surtitre hero-surtitre"><span class="pastille-diplome"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l1.9 1.4 2.3-.1.7 2.2 1.9 1.3-.8 2.2.8 2.2-1.9 1.3-.7 2.2-2.3-.1L8 14.5l-1.9-1.4-2.3.1-.7-2.2-1.9-1.3.8-2.2-.8-2.2 1.9-1.3.7-2.2 2.3.1z"/><path d="M5.4 8.2l1.8 1.7 3.4-3.6"/></svg>Coiffeuse diplômée</span><span>{g.VILLE}</span></p>
      <h1 class="hero-titre">
        <span class="sr">Coiffure au Rendez-Vous, coiffeuse diplômée à {g.VILLE}</span>
        <svg class="wordmark" viewBox="0 0 759 227" aria-hidden="true" focusable="false" data-wordmark>
          <use class="wm-g" href="img/marque.svg#wm-g"/><use class="wm-d" href="img/marque.svg#wm-d"/><use class="wm-m" href="img/marque.svg#wm-m"/><use class="wm-t" href="img/marque.svg#wm-t"/>
        </svg>
      </h1>
      <p class="hero-accroche">Institut de beauté capillaire qui prône <em>l'excellence</em> et le <em>savoir-faire</em>.</p>
      <p class="hero-intro">Pose perruque, confection à la machine, tissage, ponytail&nbsp;: chaque prestation est réalisée sur rendez-vous, par une coiffeuse diplômée.</p>
      <div class="hero-actions">
        <a class="bouton bouton-plein" href="reserver/" data-magnetique><span>Prendre rendez-vous</span></a>
        <a class="bouton bouton-ligne" href="#prestations"><span>Nos prestations</span></a>
      </div>
    </div>
    <div class="hero-visuel">
      <div class="hero-cadre" data-tilt>
        <video class="hero-video" src="img/video/showreel.mp4" poster="img/video/showreel-poster.webp" autoplay muted loop playsinline preload="metadata" aria-label="Vidéo des réalisations de Coiffure au Rendez-Vous : poses de perruque lisses, ondulées et ponytail"></video>
        <button class="video-pause" type="button" data-video-pause aria-label="Mettre la vidéo en pause"><span></span><span></span></button>
      </div>
      {g.sceau(r, 'COIFFEUSE DIPLÔMÉE ✦ COIFFURE AU RENDEZ-VOUS ✦ ', 'hero-sceau')}
    </div>
  </div>
  <a class="hero-defiler" href="#manifeste" aria-label="Faire défiler vers la suite"><span></span></a>
</section>
{g.ruban(['Pose perruque', 'Tissage', 'Ponytail', 'Confection', 'Lace frontal', 'Closure', 'Flip over', 'Formations'])}
<section class="manifeste" id="manifeste">
  <div class="conteneur">
    <p class="surtitre revele">Notre promesse</p>
    <p class="manifeste-texte" data-mots>Coiffure au Rendez-Vous met un point d'honneur à promouvoir la confiance en soi, veillant à ce que chaque cliente quitte l'institut revitalisée et épanouie.</p>
  </div>
</section>

<section class="diplomee section-claire" id="diplomee">
  <div class="conteneur">
    <div class="diplomee-haut">
      {g.titre_section('Le savoir-faire', 'Coiffeuse <em>diplômée</em>, avant tout.', "Derrière chaque pose, il y a un diplôme de coiffure et des heures de pratique. Être diplômée, c'est connaître le cheveu avant de le transformer&nbsp;: sa structure, le cuir chevelu, la tension juste d'une natte, l'hygiène d'un geste répété cent fois.")}
      <div class="diplomee-visuel revele">
        <div class="diplomee-photo" data-tilt>{g.img(r, 'shooting', '(max-width: 900px) 80vw, 420px')}</div>
        <div class="diplomee-badge"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l1.9 1.4 2.3-.1.7 2.2 1.9 1.3-.8 2.2.8 2.2-1.9 1.3-.7 2.2-2.3-.1L8 14.5l-1.9-1.4-2.3.1-.7-2.2-1.9-1.3.8-2.2-.8-2.2 1.9-1.3.7-2.2 2.3.1z"/><path d="M5.4 8.2l1.8 1.7 3.4-3.6"/></svg><span>Diplômée<br><small>en coiffure</small></span></div>
        {g.sceau(r, 'SAVOIR-FAIRE ✦ EXCELLENCE ✦ CONFIANCE ✦ ', 'diplomee-sceau')}
      </div>
    </div>
    <ul class="piliers">
      <li class="pilier revele" data-tilt-leger><span class="pilier-num">01</span><h3>Diplômée en coiffure</h3><p>Une formation professionnelle qui garantit ce qui ne se voit pas&nbsp;: diagnostic du cheveu, respect du cuir chevelu, règles d'hygiène.</p></li>
      <li class="pilier revele" data-tilt-leger><span class="pilier-num">02</span><h3>Formatrice</h3><p>Elle transmet ses techniques en formation&nbsp;: tissage, confection, pose lace et ponytail. On n'enseigne bien que ce que l'on maîtrise.</p></li>
      <li class="pilier revele" data-tilt-leger><span class="pilier-num">03</span><h3>Confection maison</h3><p>Les perruques sont confectionnées à la machine puis personnalisées&nbsp;: blanchiment des nœuds, customisation, styling.</p></li>
      <li class="pilier revele" data-tilt-leger><span class="pilier-num">04</span><h3>Vos cheveux protégés</h3><p>Une natte trop serrée fatigue la racine. Une coiffeuse diplômée sait doser la tension pour préserver vos cheveux sous la pose.</p></li>
    </ul>
    <dl class="chiffres">
      <div class="revele"><dt><span data-compte="15">15</span></dt><dd>prestations</dd></div>
      <div class="revele"><dt><span data-compte="5">5</span></dt><dd>formations professionnelles</dd></div>
      <div class="revele"><dt><span data-compte="100">100</span>&nbsp;%</dt><dd>sur rendez-vous</dd></div>
    </dl>
  </div>
</section>

<section class="prestations" id="prestations">
  <div class="conteneur">
    {g.titre_section('La carte', 'Nos <em>prestations</em>', 'Six univers, une même exigence. Survolez, puis entrez dans le détail de chaque technique, ses tarifs et son déroulé.')}
    <div class="index" data-index>
      {lignes}
      <div class="index-apercu" aria-hidden="true"><img alt="" src="img/photos/pose-body-wave-480.webp" width="480" height="600"></div>
    </div>
  </div>
</section>

{g.zones_html(r, ['closure', 'frontal', 'wig', 'ouvert', 'ferme', 'ponytail'], 'Closure, frontal, ouvert… <em>quelle pose pour vous&nbsp;?</em>', "Touchez une technique pour voir la zone qu'elle couvre sur la tête, vue de dessus.")}

<section class="galerie" id="galerie">
  <div class="conteneur galerie-tete">
    {g.titre_section('Réalisations', 'Les <em>réalisations</em>', 'Poses, tissages, ponytails et confections réalisés à l\'institut. Glissez pour parcourir, touchez une photo pour l\'agrandir.')}
    <div class="galerie-filtres" role="group" aria-label="Filtrer les photos">{filtres}</div>
  </div>
  <div class="galerie-piste" data-galerie data-curseur="Glisser" tabindex="0" aria-label="Galerie de réalisations, faites défiler horizontalement">{galerie}</div>
  <div class="conteneur galerie-bas">
    <div class="galerie-progression" aria-hidden="true"><span data-galerie-barre></span></div>
    <div class="galerie-nav">
      <button type="button" class="rond" data-galerie-prec aria-label="Photos précédentes"><svg viewBox="0 0 24 12" aria-hidden="true"><path d="M24 6H2M7 1L2 6l5 5"/></svg></button>
      <button type="button" class="rond" data-galerie-suiv aria-label="Photos suivantes"><svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h22M17 1l5 5-5 5"/></svg></button>
    </div>
    <a class="lien-souligne" href="{g.INSTAGRAM}" rel="noopener" target="_blank">Plus de réalisations sur Instagram {g.INSTAGRAM_NOM}</a>
  </div>
  <dialog class="visionneuse" data-visionneuse aria-label="Photo agrandie">
    <figure><img alt="" data-visionneuse-img><figcaption data-visionneuse-legende></figcaption></figure>
    <button type="button" class="rond visionneuse-fermer" data-visionneuse-fermer aria-label="Fermer"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14"/></svg></button>
    <button type="button" class="rond visionneuse-prec" data-visionneuse-prec aria-label="Photo précédente"><svg viewBox="0 0 24 12" aria-hidden="true"><path d="M24 6H2M7 1L2 6l5 5"/></svg></button>
    <button type="button" class="rond visionneuse-suiv" data-visionneuse-suiv aria-label="Photo suivante"><svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h22M17 1l5 5-5 5"/></svg></button>
  </dialog>
</section>

<section class="formations-accroche section-claire">
  <div class="conteneur formations-grille">
    <div>
      {g.titre_section('Transmettre', 'Se former auprès d\'une <em>coiffeuse diplômée</em>', "Cinq formations professionnelles, en une ou deux journées complètes, pour apprendre étape par étape les techniques de l'institut.")}
      <a class="bouton bouton-sombre revele" href="formations/" data-magnetique><span>Voir les formations</span></a>
    </div>
    <ul class="formations-liste">{form}</ul>
  </div>
</section>

<section class="politique" id="politique">
  <div class="conteneur">
    {g.titre_section('Bon à savoir', 'Avant de <em>réserver</em>', "Quelques règles simples, pour que chaque rendez-vous commence à l'heure et se passe sereinement.")}
    <ul class="regles">
      <li class="regle revele"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="12" y="4" width="20" height="38" rx="4" pathLength="1"/><path d="M19 37h6" pathLength="1"/><rect x="22" y="20" width="22" height="14" rx="2" pathLength="1"/><path d="M22 25h22" pathLength="1"/></svg><h3>Acompte</h3><p><strong>{P['acompte_pct']}&nbsp;%</strong> du montant de la prestation à la réservation, déduit du total le jour J.</p></li>
      <li class="regle revele"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="14" width="36" height="24" rx="3" pathLength="1"/><path d="M6 21h36M12 31h10" pathLength="1"/><circle cx="34" cy="30" r="3" pathLength="1"/></svg><h3>Paiement</h3><p>En <strong>espèces</strong> ou via <strong>PayPal</strong>.</p></li>
      <li class="regle revele"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="25" r="17" pathLength="1"/><path d="M24 15v10l6 4M20 4h8" pathLength="1"/></svg><h3>Retard</h3><p><strong>{P['retard_min']}&nbsp;minutes</strong> tolérées. Au-delà, le rendez-vous est annulé et l'acompte n'est pas remboursé.</p></li>
      <li class="regle revele"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="6" y="9" width="36" height="33" rx="3" pathLength="1"/><path d="M6 18h36M15 4v9M33 4v9M18 30l5 5 9-10" pathLength="1"/></svg><h3>Annulation</h3><p>Au minimum <strong>{P['annulation_h']}&nbsp;heures</strong> à l'avance.</p></li>
    </ul>
    <p class="politique-note revele"><strong>Perruque extérieure&nbsp;:</strong> pour une pose ou une repose d'une perruque qui n'a pas été confectionnée par l'institut, déposez-la <strong>{P['depot_perruque_j']}&nbsp;jours avant</strong> votre rendez-vous. <a href="pose-perruque/#calcul-depot">Calculer ma date de dépôt</a></p>
  </div>
</section>

{g.cta_rdv(r)}

<section class="acces" id="acces">
  <div class="conteneur acces-grille">
    <div class="acces-texte">
      {g.titre_section('Accès', 'Au <em>rendez-vous</em>, à Évry')}
      <address class="acces-adresse revele">{g.ADRESSE}<br>{g.CP} {g.VILLE}</address>
      <p class="revele">Dans le {g.QUARTIER}. L'institut reçoit <strong>uniquement sur rendez-vous</strong>&nbsp;: pensez à réserver votre créneau avant de venir.</p>
      <ul class="acces-liens revele">
        <li><a class="bouton bouton-ligne" href="{g.MAPS}" rel="noopener" target="_blank"><span>Google Maps</span></a></li>
        <li><a class="bouton bouton-ligne" href="https://waze.com/ul?ll={g.LAT},{g.LON}&amp;navigate=yes" rel="noopener" target="_blank"><span>Waze</span></a></li>
        <li><a class="bouton bouton-ligne" href="https://maps.apple.com/?ll={g.LAT},{g.LON}&amp;q=Coiffure%20au%20Rendez-Vous" rel="noopener" target="_blank"><span>Plans</span></a></li>
      </ul>
      <ul class="acces-contact revele">
        <li><span>Téléphone</span><a href="tel:{g.TEL_INTL}">{g.TEL}</a></li>
        <li><span>WhatsApp</span><a href="https://wa.me/{g.WHATSAPP}" rel="noopener" target="_blank">Écrire un message</a></li>
        <li><span>Instagram</span><a href="{g.INSTAGRAM}" rel="noopener" target="_blank">{g.INSTAGRAM_NOM}</a></li>
      </ul>
    </div>
    <div class="acces-carte revele" data-carte>
      <iframe title="Plan d'accès : 8 rue Montespan, Évry-Courcouronnes" loading="lazy" referrerpolicy="no-referrer"
        src="https://www.openstreetmap.org/export/embed.html?bbox=2.4296%2C48.6303%2C2.4444%2C48.6376&amp;layer=mapnik"></iframe>
      <div class="acces-epingle" aria-hidden="true"><svg viewBox="0 0 200 200"><use href="img/marque.svg#mono"/></svg></div>
      <p class="acces-credit">© <a href="https://www.openstreetmap.org/copyright" rel="noopener" target="_blank">OpenStreetMap</a></p>
    </div>
  </div>
</section>

{g.faq_html(FAQ_ACCUEIL)}
</main>
'''
    out += g.fin(r, ['site', 'meches', 'zones', 'galerie'])
    return out


# ================================================================= PAGES DE PRESTATION
CALCUL_DEPOT = '''<div class="calcul revele" id="calcul-depot" data-calcul-depot>
  <div>
    <p class="calcul-titre">Quand déposer ma perruque&nbsp;?</p>
    <label class="champ"><span>Date de mon rendez-vous</span><input type="date" data-calcul-date></label>
  </div>
  <output class="calcul-resultat" data-calcul-sortie aria-live="polite">Choisissez la date de votre rendez-vous&nbsp;: la date limite de dépôt s'affiche ici.</output>
</div>'''


def _bloc_pose(g, r):
    return f'''<section class="duo">
  <div class="conteneur">
    {g.titre_section('Bien choisir', 'Perruque de l\'institut ou <em>perruque extérieure</em>&nbsp;?')}
    <div class="duo-grille">
      <article class="duo-carte revele" data-tilt-leger>
        <p class="duo-etiquette">Confectionnée par l'institut</p>
        <h3>Pose closure · Pose lace frontal</h3>
        <p>Pour une pose de qualité, Coiffure au Rendez-Vous vous invite à choisir parmi ses mèches et perruques. La perruque est confectionnée à l'institut, puis posée&nbsp;: <strong>dès {g.prix(50)}</strong>.</p>
        <a class="lien-souligne" href="{r}confection-perruque/">Découvrir la confection</a>
      </article>
      <article class="duo-carte revele" data-tilt-leger>
        <p class="duo-etiquette">Vous apportez votre perruque</p>
        <h3>Pose wig extérieure</h3>
        <p>Pour la pose ou la repose d'une perruque qui n'a pas été confectionnée par l'institut, choisissez la «&nbsp;Pose wig extérieure&nbsp;» (<strong>{g.prix(80)}</strong>) et déposez votre perruque <strong>5&nbsp;jours avant</strong> le rendez-vous. Sans dépôt, le rendez-vous est annulé.</p>
        {CALCUL_DEPOT}
      </article>
    </div>
  </div>
</section>
'''


def _atelier(g, r, mode):
    textures = [('lisse', 'Lisse'), ('wave', 'Body wave'), ('boucle', 'Bouclée')]
    couleurs = [('noir', 'Noir naturel', '#efe6df'), ('chocolat', 'Brun chocolat', '#a97f62'),
                ('miel', 'Blond miel', '#d8b07a'), ('bordeaux', 'Bordeaux', '#a5434f'), ('meches', 'Mèches blondes', '#efe6df')]
    tex = ''.join(f'<label class="puce"><input type="radio" name="texture-{mode}" value="{k}"{" checked" if k == ("wave" if mode == "complet" else "lisse") else ""}><span>{v}</span></label>' for k, v in textures)
    svg = f'''<svg class="atelier-svg" viewBox="0 0 400 560" aria-hidden="true">
      <g class="atelier-reperes" data-reperes></g>
      <path class="silhouette" d="M200 92c-34 0-62 34-62 80 0 50 30 88 62 88s62-38 62-88c0-46-28-80-62-80z"/>
      <path class="silhouette" d="M178 252c0 18-2 32-6 42-40 8-82 24-104 52-12 16-18 44-20 72M222 252c0 18 2 32 6 42 40 8 82 24 104 52 12 16 18 44 20 72"/>
      <g data-cheveux></g>
      <path class="atelier-base" data-base d="M152 112q48-46 96 0"/>
    </svg>'''
    if mode == 'styling':
        return f'''<section class="atelier atelier-styling" id="styling">
  <div class="conteneur atelier-grille" data-atelier="styling">
    <div class="atelier-visuel revele">{svg}</div>
    <div class="atelier-controles">
      {g.titre_section('Brushing & styling', 'Lisse, wavy ou <em>bouclé</em>&nbsp;?', "Le brushing & styling redonne forme à vos cheveux ou à votre perruque. Choisissez une allure pour la voir prendre forme.")}
      <fieldset class="champ-groupe revele"><legend>Allure</legend><div class="puces">{tex}</div></fieldset>
      <a class="bouton bouton-plein revele" href="{r}reserver/?p=brushing-styling" data-magnetique><span>Réserver un brushing · {g.prix(40)}</span></a>
    </div>
  </div>
</section>
'''
    coul = ''.join(f'<label class="puce puce-couleur"><input type="radio" name="couleur" value="{k}"{" checked" if k == "noir" else ""} data-teinte="{h}"><span><i style="--teinte:{h}"></i>{v}</span></label>' for k, v, h in couleurs)
    return f'''<section class="atelier" id="atelier">
  <div class="conteneur atelier-grille" data-atelier="complet">
    <div class="atelier-visuel revele">
      {svg}
      <p class="atelier-mesure"><strong data-longueur-texte>18"</strong><span data-repere>poitrine</span></p>
    </div>
    <form class="atelier-controles" data-atelier-form>
      {g.titre_section("L'atelier", 'Imaginez votre <em>perruque</em>', "Base, texture, longueur, couleur&nbsp;: dessinez votre projet, il part tel quel sur WhatsApp. L'institut vous conseille et vous confirme ce qui est réalisable selon les mèches disponibles.")}
      <fieldset class="champ-groupe revele"><legend>Base</legend><div class="puces">
        <label class="puce"><input type="radio" name="base" value="frontal" checked><span>Lace frontal</span></label>
        <label class="puce"><input type="radio" name="base" value="closure"><span>Closure</span></label>
      </div></fieldset>
      <fieldset class="champ-groupe revele"><legend>Texture</legend><div class="puces">{tex}</div></fieldset>
      <label class="champ champ-curseur revele"><span>Longueur <output data-longueur-sortie>18 pouces</output></span>
        <input type="range" name="longueur" min="10" max="30" step="2" value="18" data-longueur></label>
      <fieldset class="champ-groupe revele"><legend>Couleur</legend><div class="puces">{coul}</div></fieldset>
      <label class="champ revele"><span>Précisions (raie, coupe, date souhaitée…)</span><textarea name="notes" rows="2" placeholder="Ex. : raie sur le côté, pour le 14 décembre"></textarea></label>
      <div class="atelier-envoi revele">
        <a class="bouton bouton-plein" data-atelier-whatsapp href="https://wa.me/{g.WHATSAPP}" rel="noopener" target="_blank" data-magnetique><span>Envoyer mon projet sur WhatsApp</span></a>
        <p class="atelier-prix">Confection lace frontal + pose&nbsp;: <strong>{g.prix(180)}</strong></p>
      </div>
    </form>
  </div>
</section>
'''


def _guide_tissage(g, r):
    def res(pid):
        p = g.presta(pid)
        return (f'<div class="guide-resultat" data-guide-etape="r-{pid}" hidden><p class="guide-sur">Notre conseil</p>'
                f'<h3>{g.E(p["nom"])}</h3><p>{g.E(p["desc"])}</p><p class="guide-prix">{g.prix(p["prix"])} · {g.duree(p["duree"])}</p>'
                f'<div class="hero-actions"><a class="bouton bouton-plein" href="{r}reserver/?p={pid}"><span>Réserver</span></a>'
                f'<button type="button" class="bouton bouton-ligne" data-guide-recommencer><span>Recommencer</span></button></div></div>')
    return f'''<section class="guide section-claire" id="guide">
  <div class="conteneur guide-grille" data-guide>
    {g.titre_section('En deux questions', 'Quel <em>tissage</em> choisir&nbsp;?', "Répondez, on vous oriente. Le choix final se fait toujours avec la coiffeuse, selon vos cheveux.")}
    <div class="guide-carte revele">
      <div class="guide-etape" data-guide-etape="q1">
        <p class="guide-sur">Question 1 sur 2</p>
        <h3>Souhaitez-vous laisser une partie de vos cheveux dehors&nbsp;?</h3>
        <div class="guide-choix">
          <button type="button" class="guide-bouton" data-aller="r-tissage-ouvert"><strong>Oui</strong><span>Mes cheveux du dessus se fondent dans les mèches</span></button>
          <button type="button" class="guide-bouton" data-aller="q2"><strong>Non</strong><span>Je veux que tout soit couvert et protégé</span></button>
        </div>
      </div>
      <div class="guide-etape" data-guide-etape="q2" hidden>
        <p class="guide-sur">Question 2 sur 2</p>
        <h3>Quelle raie, quelle ligne frontale&nbsp;?</h3>
        <div class="guide-choix">
          <button type="button" class="guide-bouton" data-aller="r-tissage-ferme"><strong>Peu importe</strong><span>Un tissage entièrement fermé</span></button>
          <button type="button" class="guide-bouton" data-aller="r-tissage-closure"><strong>Une raie dessinée</strong><span>Au milieu ou sur le côté, sur le dessus</span></button>
          <button type="button" class="guide-bouton" data-aller="r-tissage-lace-frontal"><strong>Toute la ligne frontale</strong><span>Coiffer en arrière, dégager le visage</span></button>
          <button type="button" class="guide-bouton" data-aller="r-flip-over"><strong>Une raie qui bouge</strong><span>Passer d'un côté à l'autre</span></button>
        </div>
      </div>
      {''.join(res(p) for p in ['tissage-ouvert', 'tissage-ferme', 'tissage-closure', 'tissage-lace-frontal', 'flip-over'])}
    </div>
  </div>
</section>
'''


def _ponytail(g, r):
    opts = [('ponytail-simple', 'Simple'), ('ponytail-frange', 'Frange'), ('ponytail-demi-tete', 'Demi-tête'),
            ('ponytail-lace-frontal', 'Lace frontal')]
    puces = ''.join(f'<label class="puce"><input type="radio" name="version" value="{k}"{" checked" if i == 0 else ""} '
                    f'data-prix="{g.prix(g.presta(k)["prix"])}" data-duree="{g.duree(g.presta(k)["duree"])}" data-nom="{g.E(g.presta(k)["nom"])}"><span>{v}</span></label>'
                    for i, (k, v) in enumerate(opts))
    return f'''<section class="studio" id="studio">
  <div class="conteneur studio-grille" data-ponytail>
    <div class="studio-visuel revele">
      <svg class="studio-svg" viewBox="0 0 400 470" aria-hidden="true">
        <g data-pt-lache></g>
        <path class="silhouette" d="M268 128c-10-30-38-52-74-54-52-2-94 40-94 96 0 34 12 60 34 82 10 10 14 24 14 40v68"/>
        <path class="silhouette" d="M268 128c6 14 10 26 10 36 8 12 16 22 20 34-6 4-12 6-16 6 4 6 4 12 0 16 4 4 2 10-4 12 2 12-4 20-18 20-14 0-22 6-22 18v60"/>
        <path class="silhouette" d="M148 360c-40 10-80 26-100 50M238 332c30 8 70 20 100 40"/>
        <path class="studio-cuir" d="M266 124C256 94 228 72 194 72C140 70 96 112 96 170C96 204 108 230 134 254C150 240 160 226 172 222C186 218 196 196 210 180C222 168 236 162 244 150C252 140 260 132 266 124Z"/>
        <path class="silhouette" d="M208 184c-12-6-22 4-20 18 2 12 10 22 20 22"/>
        <g data-pt-plaques></g>
        <path class="studio-lace" data-pt-lace d="M268 122C258 136 248 148 236 160C226 170 216 178 208 184"/>
        <g data-pt-frange></g>
        <g data-pt-queue></g>
        <ellipse class="studio-elastique" data-pt-elastique rx="7" ry="13"/>
      </svg>
    </div>
    <form class="studio-controles">
      {g.titre_section('Le studio', 'Composez votre <em>ponytail</em>', "Choisissez la version, réglez la hauteur&nbsp;: le prix et la durée s'affichent. Indiquez la hauteur voulue dans votre demande de rendez-vous.")}
      <fieldset class="champ-groupe revele"><legend>Version</legend><div class="puces">{puces}</div></fieldset>
      <label class="champ champ-curseur revele"><span>Hauteur <output data-pt-hauteur-texte>haute</output></span>
        <input type="range" min="0" max="100" value="70" data-pt-hauteur></label>
      <div class="studio-resultat revele" aria-live="polite">
        <p><span data-pt-nom>Ponytail simple</span><strong data-pt-prix>{g.prix(50)}</strong></p>
        <p class="studio-duree">Durée&nbsp;: <span data-pt-duree>{g.duree(90)}</span></p>
        <a class="bouton bouton-plein" data-pt-reserver href="{r}reserver/?p=ponytail-simple" data-magnetique><span>Réserver cette ponytail</span></a>
      </div>
    </form>
  </div>
</section>
'''


def _nattes_bloc(g, r):
    return f'''<section class="duo">
  <div class="conteneur">
    {g.titre_section('La base', 'Pourquoi des <em>nattes</em> sous la perruque&nbsp;?')}
    <div class="duo-grille duo-trois">
      <article class="duo-carte revele" data-tilt-leger><p class="duo-etiquette">01</p><h3>Une base plate</h3><p>Des nattes fines et régulières donnent une surface lisse&nbsp;: la perruque se pose à plat, sans bosse ni relief.</p></article>
      <article class="duo-carte revele" data-tilt-leger><p class="duo-etiquette">02</p><h3>Un tombé naturel</h3><p>Bien maintenue, la perruque suit la forme de votre tête et la lace se fond mieux sur la ligne frontale.</p></article>
      <article class="duo-carte revele" data-tilt-leger><p class="duo-etiquette">03</p><h3>Vos cheveux protégés</h3><p>Rassemblés et nattés, vos cheveux naturels sont à l'abri des frottements le temps de la pose.</p></article>
    </div>
  </div>
</section>
'''


def _formations_bloc(g, r):
    choix = [('formation-pose-lace', 'Poser des perruques'), ('formation-confection', 'Confectionner des perruques'),
             ('formation-confection-pose', 'Confectionner et poser'), ('formation-tissage', 'Réaliser des tissages'),
             ('formation-ponytail', 'Réaliser des ponytails')]
    b = ''.join(f'<button type="button" class="guide-bouton" data-formation-cible="{k}"><strong>{v}</strong></button>' for k, v in choix)
    return f'''<section class="guide section-claire" id="trouver">
  <div class="conteneur guide-grille">
    {g.titre_section('Trouver sa formation', 'Vous voulez apprendre à…', "Touchez votre objectif&nbsp;: la formation correspondante s'illumine dans la liste.")}
    <div class="guide-carte revele"><div class="guide-choix guide-choix-liste" data-formations-guide>{b}</div></div>
  </div>
</section>
'''


PAGES = {
    'pose-perruque': dict(
        titre='Pose <em>perruque</em>',
        meta=('Pose de perruque à Évry-Courcouronnes : closure, lace frontal, wig | Coiffure au Rendez-Vous',
              "Pose de perruque closure (50 €), lace frontal (60 €) ou perruque extérieure (80 €) à Évry-Courcouronnes, "
              "par une coiffeuse diplômée. Préparation, fondu de la lace et styling."),
        intro="Closure, lace frontal ou perruque que vous apportez&nbsp;: la pose est réalisée par une coiffeuse diplômée, "
              "de la préparation de vos cheveux jusqu'au styling final, pour un résultat naturel qui tient.",
        pile=['pose-body-wave', 'pose-lisse-raie', 'pose-glamour'],
        zones=(['closure', 'frontal', 'wig'], 'Closure ou <em>lace frontal</em>&nbsp;?',
               "Deux bases, deux résultats. Touchez une technique pour voir la zone qu'elle couvre."),
        special=_bloc_pose,
        etapes=('Une pose, <em>quatre temps</em>', [
            ('Préparation', "Vos cheveux sont nattés à plat pour une base fine et régulière. Pas encore nattée&nbsp;? Ajoutez les "
                            "<a href=\"../nattes-brushing/\">nattes sous perruque</a> à votre rendez-vous."),
            ('Ajustement', "La perruque est placée et ajustée à votre tête, puis la lace est découpée au ras de votre ligne frontale."),
            ('Fondu de la lace', "Nœuds blanchis, lace fondue&nbsp;: la naissance des cheveux devient invisible."),
            ('Styling', "Lisse, wavy, boucles, raie au milieu ou sur le côté&nbsp;: la coiffure est finie selon l'allure que vous voulez."),
        ]),
        faq=[
            ("Closure ou lace frontal, que choisir ?",
             "La closure couvre uniquement le dessus de la tête, là où se trouve la raie : elle est discrète et rapide à "
             "poser (1 h 30). La lace frontal suit toute la ligne frontale d'une oreille à l'autre : elle permet de dégager "
             "le visage, de coiffer en arrière et de changer de raie (2 h)."),
            ("Puis-je apporter ma propre perruque ?",
             "Oui, avec la prestation « Pose wig extérieure » (80 €, 2 h). La perruque doit être déposée à l'institut "
             "5 jours avant le rendez-vous, sinon le rendez-vous est annulé."),
            ("Dois-je venir avec les cheveux déjà nattés ?",
             "Pas forcément : ajoutez la prestation « Nattes sous perruque » (20 €, 1 h) pour que la base soit réalisée à l'institut."),
            ("Comment entretenir ma perruque entre deux rendez-vous ?",
             "Démêlez-la des pointes vers les racines, dormez avec un foulard ou sur une taie en satin et limitez la chaleur. "
             "Pour lui redonner forme, réservez un brushing & styling (40 €)."),
            ("Faut-il verser un acompte ?",
             "Oui, 30 % du montant de la prestation, déduit du total le jour du rendez-vous. Il n'est pas remboursé en cas d'annulation."),
        ]),
    'confection-perruque': dict(
        titre='Confection <em>perruque</em>',
        meta=('Confection de perruque lace frontal à Évry-Courcouronnes | Coiffure au Rendez-Vous',
              "Perruque lace frontal confectionnée à la machine, personnalisée puis posée par une coiffeuse diplômée à "
              "Évry-Courcouronnes : 180 € confection + pose. Dessinez votre projet en ligne."),
        intro="Votre perruque est confectionnée à la machine par l'institut, personnalisée, puis posée et coiffée. "
              "Une pièce faite pour votre tête, votre style, votre quotidien.",
        pile=['confection-meche', 'confection-carre', 'confection-boucles'],
        special=lambda g, r: _atelier(g, r, 'complet'),
        etapes=('De la mèche à la <em>pose</em>', [
            ('Le choix', "Texture, longueur, couleur&nbsp;: on définit ensemble votre perruque, parmi les mèches de l'institut."),
            ('La confection à la machine', "Les mèches sont cousues à la machine, rang après rang, avec la lace frontal."),
            ('La customisation', "Blanchiment des nœuds, ligne frontale travaillée, coupe et mise en forme&nbsp;: la perruque devient la vôtre."),
            ('La pose et le styling', "La perruque est posée à l'institut et coiffée&nbsp;: vous repartez prête."),
        ]),
        faq=[
            ("Quelle différence avec une perruque achetée toute faite ?",
             "Une perruque confectionnée est montée pour vous : la base, la texture, la longueur et la ligne frontale sont "
             "choisies et travaillées en fonction de votre tête et de l'allure recherchée."),
            ("Puis-je choisir la longueur, la texture et la couleur ?",
             "Oui, c'est tout l'intérêt de la confection. Les possibilités dépendent des mèches disponibles : décrivez votre "
             "projet avec l'atelier ci-dessus, il part sur WhatsApp et l'institut vous conseille."),
            ("Combien coûte une confection ?",
             "La confection d'une perruque lace frontal avec sa pose est à 180 €. Pour une confection seule, envoyez votre "
             "demande sur WhatsApp au 07 62 74 78 82."),
            ("Combien de temps dure le rendez-vous de pose ?",
             "Comptez environ 2 h pour la pose et le styling de votre perruque confectionnée."),
            ("Puis-je apprendre à confectionner des perruques ?",
             "Oui, l'institut propose une formation confection perruque (500 €, une journée) et une formation confection + "
             "pose (1 000 €, deux journées)."),
        ]),
    'tissage': dict(
        titre='<em>Tissage</em>',
        meta=('Tissage à Évry-Courcouronnes : ouvert, fermé, closure, lace frontal | Coiffure au Rendez-Vous',
              "Tissage ouvert (70 €), fermé (90 €), closure (100 €), lace frontal (150 €) ou flip over (70 €) à "
              "Évry-Courcouronnes, par une coiffeuse diplômée. Quel tissage choisir ? Réponse en deux questions."),
        intro="Ouvert, fermé, closure, lace frontal ou flip over&nbsp;: le tissage, c'est l'art de coudre des mèches sur une "
              "base de nattes. Une technique de coiffeuse, qui demande précision et patience.",
        pile=['tissage-rouge', 'tissage-boucle', 'tissage-body-wave'],
        zones=(['ouvert', 'ferme', 'closure', 'frontal', 'flip'], 'Cinq tissages, <em>cinq rendus</em>',
               "Touchez une technique pour voir comment elle se construit sur la tête, vue de dessus."),
        special=_guide_tissage,
        etapes=('Un tissage, <em>pas à pas</em>', [
            ('Les nattes', "Vos cheveux sont nattés selon le schéma adapté au tissage choisi&nbsp;: c'est la fondation de tout le reste."),
            ('La couture', "Les mèches sont cousues rang par rang sur les nattes, à plat, pour un volume régulier."),
            ('La finition', "Selon la technique&nbsp;: cheveux laissés dehors, closure, lace frontal ou fermeture complète."),
            ('Coupe & styling', "Le tissage est coupé, fondu et coiffé pour un rendu naturel."),
        ]),
        faq=[
            ("Tissage ouvert ou fermé ?",
             "Le tissage ouvert laisse une partie de vos cheveux dehors pour un rendu très naturel ; il faut alors que vos "
             "cheveux se fondent avec les mèches. Le tissage fermé recouvre tout : vos cheveux sont entièrement protégés."),
            ("Qu'est-ce que le flip over ?",
             "C'est une technique de tissage pensée pour retourner la chevelure : la raie passe d'un côté à l'autre, pour "
             "varier les coiffures sans refaire la pose."),
            ("Combien de temps garder un tissage ?",
             "Les professionnels recommandent généralement de ne pas dépasser 6 à 8 semaines, pour laisser respirer le cuir "
             "chevelu et préserver vos cheveux. Demandez conseil lors de votre rendez-vous."),
            ("Le tissage abîme-t-il les cheveux ?",
             "Bien posé, non : c'est même une coiffure protectrice. Le risque vient de nattes trop serrées ou d'un tissage "
             "gardé trop longtemps, d'où l'intérêt de confier sa tête à une coiffeuse diplômée."),
            ("Combien de temps dure un tissage ?",
             "De 2 h (tissage ouvert) à 3 h (tissage fermé, lace frontal ou flip over). Le tissage closure demande 2 h 30."),
        ]),
    'ponytail': dict(
        titre='<em>Ponytail</em>',
        meta=('Ponytail à Évry-Courcouronnes : simple, frange, demi-tête, lace frontal | Coiffure au Rendez-Vous',
              "Ponytail simple (50 €), frange (60 €), demi-tête (70 €) ou lace frontal (120 €) à Évry-Courcouronnes, par une "
              "coiffeuse diplômée. Composez votre ponytail en ligne."),
        intro="Haute, basse, avec frange ou en demi-tête&nbsp;: une queue de cheval nette, plaquée et pleine de volume, "
              "allongée avec des mèches pour la longueur.",
        pile=['ponytail-chignon', 'ponytail-demi-tete'],
        special=_ponytail,
        etapes=('Une ponytail, <em>quatre gestes</em>', [
            ('Le plaquage', "Vos cheveux sont lissés et plaqués pour une base parfaitement nette."),
            ("L'attache", "La queue de cheval est fixée à la hauteur choisie&nbsp;: basse, au milieu ou haute."),
            ('Les mèches', "Les mèches sont ajoutées pour la longueur et le volume."),
            ('La finition', "Frange, demi-tête ou lace frontal selon la version choisie, puis styling."),
        ]),
        faq=[
            ("Quelle différence entre une ponytail simple et une ponytail demi-tête ?",
             "La ponytail simple rassemble tous les cheveux. La demi-tête, c'est le « half up, half down » : le dessus est "
             "attaché, la longueur reste lâchée."),
            ("Pourquoi choisir une ponytail lace frontal ?",
             "La lace frontal recrée toute la ligne frontale : idéal pour des contours parfaitement dessinés, ou pour "
             "ménager vos bords."),
            ("Combien de temps dure le rendez-vous ?",
             "1 h pour la ponytail frange, 1 h 30 pour la ponytail simple, 2 h pour la demi-tête et 3 h pour la version lace frontal."),
            ("Puis-je choisir la hauteur ?",
             "Bien sûr : basse, au milieu ou haute. Précisez-la dans votre demande de rendez-vous."),
        ]),
    'nattes-brushing': dict(
        titre='Nattes <em>&amp;</em> brushing',
        meta=('Nattes sous perruque et brushing à Évry-Courcouronnes | Coiffure au Rendez-Vous',
              "Nattes sous perruque (20 €) et brushing & styling (40 €) à Évry-Courcouronnes, par une coiffeuse diplômée : "
              "une base plate pour votre pose, une perruque remise en forme."),
        intro="Les finitions qui changent tout&nbsp;: une base de nattes plate pour une pose impeccable, et un brushing pour "
              "redonner forme et mouvement à vos cheveux ou à votre perruque.",
        pile=['nattes-ondulees', 'longue-ondulee', 'pose-lisse'],
        special=lambda g, r: _nattes_bloc(g, r) + _atelier(g, r, 'styling'),
        etapes=('Les nattes, <em>étape par étape</em>', [
            ('Le démêlage', "Vos cheveux sont démêlés soigneusement, des pointes vers les racines."),
            ('Les séparations', "Des raies nettes et régulières dessinent le schéma des nattes."),
            ('Le nattage', "Nattes plaquées, fines et à plat, avec une tension maîtrisée."),
            ('Prête pour la pose', "La base est plate et propre&nbsp;: la perruque peut se poser."),
        ]),
        faq=[
            ("Les nattes sont-elles nécessaires avant une pose de perruque ?",
             "Une base de nattes plates est recommandée pour que la perruque se pose bien à plat et que vos cheveux soient "
             "protégés. Si vos cheveux ne sont pas déjà nattés, ajoutez cette prestation (20 €, 1 h) à votre rendez-vous."),
            ("Puis-je réserver un brushing pour ma perruque ?",
             "Oui : le brushing & styling (40 €, 1 h) redonne forme à une perruque comme à vos cheveux : lissage, "
             "ondulations ou boucles."),
            ("Peut-on combiner nattes, pose et brushing ?",
             "Oui, sélectionnez plusieurs prestations dans le formulaire de réservation : le total et la durée se calculent "
             "automatiquement."),
        ]),
    'formations': dict(
        titre='<em>Formations</em>',
        meta=('Formations coiffure : tissage, confection, pose lace, ponytail | Coiffure au Rendez-Vous',
              "Formations professionnelles auprès d'une coiffeuse diplômée à Évry-Courcouronnes : tissage (550 €), confection "
              "perruque (500 €), pose lace (500 €), confection + pose (1 000 €), ponytail (400 €)."),
        intro="Apprenez les techniques de l'institut auprès d'une coiffeuse diplômée&nbsp;: tissage, confection à la "
              "machine, pose lace et ponytail, en une ou deux journées complètes.",
        pile=['lace-frontal', 'pose-ondulee', 'confection-ombre'],
        special=_formations_bloc,
        etapes=('Ce que vous <em>apprenez</em>', [
            ('Les étapes, une à une', "Coiffure au Rendez-Vous vous montre chaque étape de la technique choisie, de la préparation à la finition."),
            ('Les gestes de pro', "Couture des mèches, confection à la machine, blanchiment des nœuds, customisation, pose&nbsp;: les techniques qui font la différence, selon la formation."),
            ('Le styling', "Les tactiques de styling réalisables sur une pose, pour un résultat professionnel."),
        ], 'Le programme'),
        faq=[
            ("Combien de temps dure une formation ?",
             "Une journée complète pour les formations tissage, confection perruque, pose lace et ponytail ; deux journées "
             "pour la formation confection + pose perruque."),
            ("Quel est le programme de la formation confection + pose ?",
             "Les étapes d'une confection complète de perruque à la machine, les techniques de pose (blanchiment des nœuds, "
             "customisation, pose) et le styling réalisable sur une pose perruque."),
            ("Comment réserver une formation ?",
             "Depuis la page Réserver, en sélectionnant la formation, ou directement sur WhatsApp au 07 62 74 78 82. "
             "Un acompte de 30 % confirme votre place."),
        ]),
}


def _carte_devis(g):
    msg = "Bonjour, je souhaite un devis pour la confection d'une perruque (sans pose)."
    return f'''<article class="tarif tarif-devis revele" data-tilt-leger id="confection-seule">
  <div class="tarif-haut"><h3>Confection seule</h3><p class="tarif-prix">Sur devis</p></div>
  <p class="tarif-duree"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>Délai précisé à la demande</p>
  <p class="tarif-desc">Votre perruque confectionnée à la machine par l'institut, sans la pose. Décrivez votre projet avec l'atelier ci-dessous ou directement sur WhatsApp.</p>
  <a class="tarif-lien" href="{g.wa_lien(msg)}" rel="noopener" target="_blank"><span>Demander un devis</span><svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h22M17 1l5 5-5 5"/></svg></a>
</article>'''


def page_prestation(ctx, slug):
    g = SimpleNamespace(**ctx)
    r = '../'
    c = g.categorie(slug)
    d = PAGES[slug]
    ps = g.prestas_de(slug)
    texte_plat = d['intro'].replace('&nbsp;', ' ')
    schema = [g.schema_ariane(c['nom'], slug), g.schema_service(c, texte_plat), g.faq_schema(d['faq'])]
    out = g.tete_html(r, d['meta'][0], d['meta'][1], f'{slug}/', schema)
    out += f'<body class="page-prestation page-{slug}">\n' + g.entete(r, slug)
    durees = sorted({p['duree'] for p in ps})
    if slug == 'formations':
        dur_txt = '1 à 2 journées'
    else:
        dur_txt = g.duree(durees[0]) + (f' – {g.duree(durees[-1])}' if len(durees) > 1 else '')
    nb = len(ps) + (1 if slug == 'confection-perruque' else 0)
    faits = (f'<li><strong>dès {g.prix(g.des_prix(slug))}</strong><span>tarif</span></li>'
             f'<li><strong>{dur_txt}</strong><span>durée</span></li>'
             f'<li><strong>{nb}</strong><span>{("formation" if slug == "formations" else "formule") + ("s" if nb > 1 else "")}</span></li>')
    premier = ps[0]['id']
    msg = f'Bonjour, je souhaite des informations sur la prestation « {c["nom"]} ».'
    out += f'''<main id="contenu">
<section class="page-hero">
  <canvas class="meches meches-discret" data-meches aria-hidden="true"></canvas>
  <div class="conteneur page-hero-grille">
    <div class="page-hero-texte">
      <nav class="ariane" aria-label="Fil d'Ariane"><a href="../">Accueil</a><span aria-hidden="true">/</span><span aria-current="page">{g.E(c['nom'])}</span></nav>
      <p class="surtitre"><span class="pastille-diplome"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5l1.9 1.4 2.3-.1.7 2.2 1.9 1.3-.8 2.2.8 2.2-1.9 1.3-.7 2.2-2.3-.1L8 14.5l-1.9-1.4-2.3.1-.7-2.2-1.9-1.3.8-2.2-.8-2.2 1.9-1.3.7-2.2 2.3.1z"/><path d="M5.4 8.2l1.8 1.7 3.4-3.6"/></svg>Coiffeuse diplômée</span><span>{"Formation professionnelle" if slug == "formations" else "Prestation"}</span></p>
      <h1 class="page-titre" data-lignes>{d['titre']}</h1>
      <p class="page-intro">{d['intro']}</p>
      <ul class="page-faits">{faits}</ul>
      <div class="hero-actions">
        <a class="bouton bouton-plein" href="../reserver/?p={premier}" data-magnetique><span>Réserver</span></a>
        <a class="bouton bouton-ligne" href="{g.wa_lien(msg)}" rel="noopener" target="_blank"><span>Question sur WhatsApp</span></a>
      </div>
    </div>
    {_photos_pile(g, r, d['pile'])}
  </div>
</section>
<section class="tarifs" id="tarifs">
  <div class="conteneur">
    {g.titre_section('Tarifs', 'Les <em>formules</em>' if slug != 'formations' else 'Les <em>programmes</em>', 'Tarifs et durées indicatives. Un acompte de 30&nbsp;% confirme la réservation.')}
    <div class="tarifs-grille">{''.join(g.carte_tarif(r, p) for p in ps)}{_carte_devis(g) if slug == 'confection-perruque' else ''}</div>
  </div>
</section>
'''
    if d.get('zones'):
        cles, t, i = d['zones']
        out += g.zones_html(r, cles, t, i)
    out += d['special'](g, r)
    titre_e, etapes = d['etapes'][0], d['etapes'][1]
    out += g.etapes_html(titre_e, etapes, *(d['etapes'][2:] or []))
    out += g.faq_html(d['faq'])
    out += g.aussi_html(r, slug)
    out += g.cta_rdv(r)
    out += '</main>\n'
    js = ['site', 'meches']
    if d.get('zones'):
        js.append('zones')
    if slug in ('confection-perruque', 'nattes-brushing'):
        js.append('atelier')
    if slug == 'ponytail':
        js.append('ponytail')
    if slug == 'pose-perruque':
        js += ['donnees', 'rdv']
    out += g.fin(r, js)
    return out


# ================================================================= RÉSERVER
def reserver(ctx):
    g = SimpleNamespace(**ctx)
    r = '../'
    P = g.POLITIQUE
    groupes = ''
    for c in g.CATEGORIES:
        items = [p for p in g.PRESTATIONS if p['cat'] == c['slug']]
        puces = ''.join(f'<label class="puce puce-presta"><input type="checkbox" name="p" value="{p["id"]}">'
                        f'<span><b>{g.E(p["nom"])}</b><em>{g.prix(p["prix"])} · {p.get("jours") or g.duree(p["duree"])}</em></span></label>'
                        for p in items)
        groupes += f'<div class="rdv-groupe"><p class="rdv-cat">{g.E(c["nom"])}</p><div class="puces">{puces}</div></div>'
    schema = [g.schema_ariane('Réserver', 'reserver')]
    out = g.tete_html(r, 'Prendre rendez-vous | Coiffure au Rendez-Vous, Évry-Courcouronnes',
                      "Réservez votre pose perruque, tissage, ponytail ou formation chez Coiffure au Rendez-Vous à "
                      "Évry-Courcouronnes : total, durée et acompte calculés, demande envoyée sur WhatsApp ou par SMS.",
                      'reserver/', schema)
    out += '<body class="page-reserver">\n' + g.entete(r)
    out += f'''<main id="contenu">
<section class="page-hero page-hero-court">
  <canvas class="meches meches-discret" data-meches aria-hidden="true"></canvas>
  <div class="conteneur">
    <nav class="ariane" aria-label="Fil d'Ariane"><a href="../">Accueil</a><span aria-hidden="true">/</span><span aria-current="page">Réserver</span></nav>
    <h1 class="page-titre" data-lignes>Prendre <em>rendez-vous</em></h1>
    <p class="page-intro">Composez votre rendez-vous&nbsp;: le total, la durée et l'acompte se calculent en direct. Votre demande part ensuite sur WhatsApp ou par SMS, et l'institut vous confirme le créneau.</p>
  </div>
</section>
<section class="rdv-section">
  <div class="conteneur rdv-grille">
    <form class="rdv" data-rdv novalidate>
      <fieldset class="rdv-etape">
        <legend><span>01</span>Vos prestations</legend>
        {groupes}
      </fieldset>
      <fieldset class="rdv-etape">
        <legend><span>02</span>Votre date</legend>
        <div class="rdv-ligne">
          <label class="champ"><span>Date souhaitée</span><input type="date" name="date" data-rdv-date></label>
          <fieldset class="champ-groupe"><legend>Moment préféré</legend><div class="puces">
            <label class="puce"><input type="radio" name="moment" value="le matin"><span>Matin</span></label>
            <label class="puce"><input type="radio" name="moment" value="l'après-midi"><span>Après-midi</span></label>
            <label class="puce"><input type="radio" name="moment" value="en fin de journée"><span>Fin de journée</span></label>
            <label class="puce"><input type="radio" name="moment" value="" checked><span>Peu importe</span></label>
          </div></fieldset>
        </div>
      </fieldset>
      <fieldset class="rdv-etape">
        <legend><span>03</span>Vous</legend>
        <div class="rdv-ligne">
          <label class="champ"><span>Prénom</span><input type="text" name="prenom" autocomplete="given-name" placeholder="Votre prénom"></label>
          <label class="champ"><span>Précisions</span><textarea name="notes" rows="2" placeholder="Longueur, texture, perruque à apporter…"></textarea></label>
        </div>
      </fieldset>
    </form>
    <aside class="ticket" data-ticket>
      <div class="ticket-corps">
        <p class="ticket-titre"><svg viewBox="0 0 200 200" aria-hidden="true"><use href="../img/marque.svg#mono"/></svg>Votre rendez-vous</p>
        <ul class="ticket-lignes" data-ticket-lignes><li class="ticket-vide">Sélectionnez une ou plusieurs prestations.</li></ul>
        <dl class="ticket-totaux">
          <div><dt>Durée estimée</dt><dd data-ticket-duree>—</dd></div>
          <div><dt>Total</dt><dd data-ticket-total>—</dd></div>
          <div class="ticket-acompte"><dt>Acompte {P['acompte_pct']}&nbsp;%</dt><dd data-ticket-acompte>—</dd></div>
        </dl>
        <ul class="ticket-dates" data-ticket-dates></ul>
        <details class="ticket-apercu"><summary>Aperçu du message</summary><p data-ticket-message></p></details>
        <div class="ticket-actions">
          <a class="bouton bouton-plein" data-envoi="whatsapp" href="https://wa.me/{g.WHATSAPP}" rel="noopener" target="_blank" aria-disabled="true"><span>Envoyer sur WhatsApp</span></a>
          <a class="bouton bouton-ligne" data-envoi="sms" href="sms:{g.TEL_INTL}" aria-disabled="true"><span>Envoyer par SMS</span></a>
          <button type="button" class="lien-souligne" data-copier>Copier le message</button>
        </div>
        <p class="ticket-note">L'acompte de {P['acompte_pct']}&nbsp;% confirme le rendez-vous&nbsp;; il est déduit du total et non remboursé en cas d'annulation. Paiement en {P['paiement']}.</p>
      </div>
    </aside>
  </div>
</section>
<section class="politique politique-compacte">
  <div class="conteneur">
    {g.titre_section('Politique de réservation', 'Les <em>règles</em> de l\'institut')}
    <ul class="regles">
      <li class="regle revele"><h3>Acompte</h3><p><strong>{P['acompte_pct']}&nbsp;%</strong> du montant à la réservation, déduit du total. Non remboursable en cas d'annulation.</p></li>
      <li class="regle revele"><h3>Paiement</h3><p>En <strong>espèces</strong> ou via <strong>PayPal</strong>.</p></li>
      <li class="regle revele"><h3>Retard</h3><p><strong>{P['retard_min']}&nbsp;minutes</strong> tolérées. Au-delà, le rendez-vous est annulé et l'acompte conservé.</p></li>
      <li class="regle revele"><h3>Annulation</h3><p>Au minimum <strong>{P['annulation_h']}&nbsp;heures</strong> à l'avance, par téléphone ou WhatsApp.</p></li>
    </ul>
    <p class="politique-note revele"><strong>Perruque extérieure&nbsp;:</strong> à déposer à l'institut <strong>{P['depot_perruque_j']}&nbsp;jours avant</strong> le rendez-vous, sans quoi le rendez-vous est annulé.</p>
  </div>
</section>
</main>
'''
    out += g.fin(r, ['site', 'meches', 'donnees', 'rdv'])
    return out


# ================================================================= MENTIONS LÉGALES
def mentions(ctx):
    g = SimpleNamespace(**ctx)
    r = '../'
    out = g.tete_html(r, 'Mentions légales | Coiffure au Rendez-Vous',
                      "Mentions légales du site de Coiffure au Rendez-Vous, institut de coiffure à Évry-Courcouronnes : "
                      "éditeur, hébergement, données personnelles et crédits.", 'mentions-legales/', [],
                      robots='noindex, follow')
    out += '<body class="page-legale">\n' + g.entete(r)
    out += f'''<main id="contenu" class="legal conteneur">
  <h1 class="page-titre">Mentions <em>légales</em></h1>
  <section><h2>Éditeur du site</h2><p>{g.NOM}, institut de beauté capillaire, {g.ADRESSE}, {g.CP} {g.VILLE}. Téléphone&nbsp;: <a href="tel:{g.TEL_INTL}">{g.TEL}</a>.</p></section>
  <section><h2>Hébergement</h2><p>GitHub Pages, GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.</p></section>
  <section><h2>Données personnelles</h2>
    <p>Ce site ne dépose aucun cookie et ne mesure pas l'audience. Les formulaires (réservation, atelier de confection) ne transmettent rien par eux-mêmes&nbsp;: votre message n'est envoyé que si vous choisissez de l'adresser à l'institut, depuis votre propre application WhatsApp ou SMS.</p>
    <p>Pour l'animation d'ouverture, votre navigateur retient le temps de la visite qu'elle a déjà été vue. Le plan d'accès est chargé depuis OpenStreetMap lorsque vous atteignez la section Accès.</p>
  </section>
  <section><h2>Crédits</h2><p>Photographies, vidéo et logo&nbsp;: {g.NOM}. Polices Archivo, Bodoni Moda et Montserrat, sous licence SIL Open Font License. Fond de carte © contributeurs OpenStreetMap.</p></section>
</main>
'''
    out += g.fin(r, ['site'])
    return out
