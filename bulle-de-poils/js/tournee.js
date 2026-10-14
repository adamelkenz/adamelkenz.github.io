/* Bulle de poils — la tournée : carte des 30 km autour de Mouzeuil-Saint-Martin et recherche de commune. */
(function () {
  if (typeof COMMUNES === 'undefined') return;
  var RAYON = 30, LIMITE = 34; // au-delà de 30 km et jusqu'à 34 : « en bordure », à confirmer
  var LAT0 = 46.4662715, LON0 = -0.9826554;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function norme(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[-'’]/g, ' ').replace(/\bste\b/g, 'sainte').replace(/\bst\b/g, 'saint').replace(/\s+/g, ' ').trim();
  }
  // anciens noms des communes regroupées, et raccourcis courants
  var ALIAS = {
    'fontenay': 'Fontenay-le-Comte',
    'sainte hermine': 'Saint-Jean-d\'Hermine', 'saint jean de beugne': 'Saint-Jean-d\'Hermine',
    'mareuil sur lay': 'Mareuil-sur-Lay-Dissais', 'mareuil': 'Mareuil-sur-Lay-Dissais', 'dissais': 'Mareuil-sur-Lay-Dissais',
    'velluire': 'Les Velluire-sur-Vendée', 'le poire sur velluire': 'Les Velluire-sur-Vendée',
    'nieul sur l autise': 'Rives-d\'Autise', 'oulmes': 'Rives-d\'Autise',
    'doix': 'Doix lès Fontaines', 'fontaines': 'Doix lès Fontaines',
    'auzay': 'Auchay-sur-Vendée', 'chaix': 'Auchay-sur-Vendée',
    'l aiguillon sur mer': 'L\'Aiguillon-la-Presqu\'île', 'la faute sur mer': 'L\'Aiguillon-la-Presqu\'île',
    'mouzeuil': 'Mouzeuil-Saint-Martin'
  };
  var index = {};
  var liste = COMMUNES.map(function (c) {
    var o = { nom: c[0], cp: c[1], km: c[2], cle: norme(c[0]) };
    o.x = (c[4] - LON0) * Math.cos(LAT0 * Math.PI / 180) * 111.32;
    o.y = -(c[3] - LAT0) * 110.574;
    index[o.cle] = o;
    return o;
  });
  function etat(km) { return km <= RAYON ? 'dedans' : km <= LIMITE ? 'bord' : 'dehors'; }
  function kmFr(km) { return km < 2 ? 'moins de 2 km' : 'environ ' + String(Math.round(km)).replace('.', ',') + ' km'; }

  // trouve une commune : nom exact, ancien nom, code postal, ou début de nom
  function trouve(texte) {
    var t = norme(texte || '');
    if (!t) return { vide: true };
    if (ALIAS[t]) return { commune: index[norme(ALIAS[t])] };
    if (index[t]) return { commune: index[t] };
    if (/^\d{5}$/.test(t)) {
      var parCp = liste.filter(function (c) { return c.cp === t; });
      return parCp.length === 1 ? { commune: parCp[0] } : { cp: t, liste: parCp };
    }
    if (t.length < 3) return { rien: true };
    var debut = liste.filter(function (c) { return c.cle.indexOf(t) === 0; });
    if (debut.length === 1) return { commune: debut[0], devine: true };
    var dedans = debut.length ? debut : liste.filter(function (c) { return c.cle.indexOf(t) > -1; });
    if (dedans.length === 1) return { commune: dedans[0], devine: true };
    return dedans.length ? { suggestions: dedans.slice(0, 6) } : { rien: true };
  }
  window.ZONE = { trouve: trouve, etat: etat, kmFr: kmFr, RAYON: RAYON };

  // liste de suggestions des champs « commune »
  var dl = document.querySelector('[data-liste-communes]');
  if (dl) {
    var frag = document.createDocumentFragment();
    liste.slice().sort(function (a, b) { return a.nom.localeCompare(b.nom, 'fr'); }).forEach(function (c) {
      var o = document.createElement('option'); o.value = c.nom; frag.appendChild(o);
    });
    dl.appendChild(frag);
  }

  /* ---------- la carte ---------- */
  var svg = document.querySelector('[data-carte-svg]');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  var gPoints = svg.querySelector('[data-points]'), gEtiq = svg.querySelector('[data-etiquettes]');
  var trajet = svg.querySelector('[data-trajet]'), voyageur = svg.querySelector('[data-voyageur]');
  gPoints.setAttribute('aria-hidden', 'true');
  var CONNUES = ['Luçon', 'Fontenay-le-Comte', 'Nalliers', 'Mareuil-sur-Lay-Dissais', 'Chantonnay', 'Marans', 'Chaillé-les-Marais', 'Saint-Jean-d\'Hermine', 'Maillezais', 'Saint-Michel-en-l\'Herm', 'La Châtaigneraie', 'L\'Hermenault', 'Benet'];
  var NOMS_COURTS = { 'Mareuil-sur-Lay-Dissais': 'Mareuil-sur-Lay', 'Saint-Jean-d\'Hermine': 'Sainte-Hermine', 'Saint-Michel-en-l\'Herm': 'St-Michel-en-l\'Herm' };
  function el(nom, attrs) {
    var e = document.createElementNS(NS, nom);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  // quelques étiquettes se placent à côté ou sous leur point pour ne pas chevaucher Mouzeuil
  var PLACES = { 'Nalliers': 'gauche', 'Chaillé-les-Marais': 'dessous', 'Luçon': 'dessous' };
  function etiquette(c, classe) {
    var place = PLACES[c.nom], x = c.x, y = c.y - 1.5;
    if (place === 'gauche') { x -= 1.3; y = c.y + .6; }
    if (place === 'dessous') y = c.y + 2.6;
    var t = el('text', { x: x.toFixed(2), y: y.toFixed(2), class: 'etiq' + (place === 'gauche' ? ' gauche' : '') + (classe ? ' ' + classe : '') });
    t.textContent = NOMS_COURTS[c.nom] || c.nom;
    gEtiq.appendChild(t);
    return t;
  }
  liste.forEach(function (c) {
    if (c.nom === 'Mouzeuil-Saint-Martin') return; // c'est la maison de Mary, au centre
    var g = el('g', { class: 'pt ' + etat(c.km), transform: 'translate(' + c.x.toFixed(2) + ' ' + c.y.toFixed(2) + ')' });
    g.appendChild(el('circle', { class: 'pt-halo', r: 1.6 }));
    g.appendChild(el('circle', { class: 'pt-onde', r: 1.2 }));
    g.appendChild(el('circle', { class: 'pt-cercle', r: c.km <= RAYON ? .72 : .6 }));
    var titre = el('title', {}); titre.textContent = c.nom + ' · ' + kmFr(c.km); g.appendChild(titre);
    g.addEventListener('click', function () { choisir(c, true); });
    c.point = g;
    gPoints.appendChild(g);
    if (CONNUES.indexOf(c.nom) > -1) c.etiq = etiquette(c);
  });
  var mary = el('text', { x: 0, y: 4.9, class: 'etiq mary' }); mary.textContent = 'Mouzeuil-St-Martin';
  gEtiq.appendChild(mary);

  /* ---------- le verdict ---------- */
  var champ = document.querySelector('[data-commune]'), verdict = document.querySelector('[data-verdict]');
  var choisie = null, etiqTemp = null, animation = null;

  function echappe(s) { return s.replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }
  function afficheVerdict(classe, titre, texte, avecBouton) {
    verdict.className = 'verdict ' + (classe || '');
    verdict.innerHTML = '<p class="verdict-titre">' + titre + '</p><p>' + texte + '</p>' +
      (avecBouton ? '<a class="btn" href="#rendez-vous" data-vers-rdv>Préparer mon rendez-vous</a>' : '');
    if (!calme && classe) { void verdict.offsetWidth; verdict.classList.add('pop'); }
  }

  function vole(c) {
    // la petite bulle part de Mouzeuil et rejoint la commune
    var mx = c.x / 2, my = c.y / 2, d = Math.hypot(c.x, c.y) || 1;
    var cx = mx - c.y / d * d * .25, cy = my + c.x / d * d * .25;
    trajet.setAttribute('d', 'M0 0Q' + cx.toFixed(2) + ' ' + cy.toFixed(2) + ' ' + c.x.toFixed(2) + ' ' + c.y.toFixed(2));
    if (animation) cancelAnimationFrame(animation);
    voyageur.hidden = false;
    var L = trajet.getTotalLength(), t0 = null, duree = calme ? 0 : 500 + d * 22;
    var pose = function (p) {
      var pt = trajet.getPointAtLength(L * p);
      voyageur.setAttribute('transform', 'translate(' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2) + ')');
      trajet.style.opacity = String(Math.min(1, p * 2));
    };
    if (!duree) { pose(1); return; }
    var pas = function (t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / duree);
      pose(p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
      if (p < 1) animation = requestAnimationFrame(pas);
    };
    animation = requestAnimationFrame(pas);
  }

  function choisir(c, depuisCarte) {
    if (choisie && choisie.point) choisie.point.classList.remove('choisi');
    if (etiqTemp) { etiqTemp.remove(); etiqTemp = null; }
    choisie = c;
    if (depuisCarte && champ) champ.value = c.nom;
    if (c.nom === 'Mouzeuil-Saint-Martin') {
      voyageur.hidden = true; trajet.setAttribute('d', '');
      afficheVerdict('dedans', 'Vous êtes chez Mary !', 'Mouzeuil-Saint-Martin, c\'est le point de départ de la tournée. Le rendez-vous est tout trouvé.', true);
      return;
    }
    if (c.point) {
      c.point.classList.add('choisi');
      gPoints.appendChild(c.point); // au premier plan
      if (!c.etiq) etiqTemp = etiquette(c);
    }
    vole(c);
    var e = etat(c.km), nom = echappe(c.nom);
    if (e === 'dedans') afficheVerdict('dedans', 'Oui, je passe à ' + nom + ' !', nom + ' (' + c.cp + ') est à ' + kmFr(c.km) + ' de Mouzeuil-Saint-Martin à vol d\'oiseau, dans ma zone de tournée.', true);
    else afficheVerdict('bord', nom + ', en bordure de zone', nom + ' (' + c.cp + ') est à ' + kmFr(c.km) + ' de Mouzeuil-Saint-Martin à vol d\'oiseau, juste au-delà des 30 km. Appelez-moi au <a data-tel href="tel:' + TOILETTEUSE.tel + '">' + TOILETTEUSE.telAffiche + '</a> : on regarde ensemble si c\'est possible.', false);
  }

  function chercher(depuisEntree) {
    var r = trouve(champ.value);
    if (r.vide) {
      afficheVerdict('', 'Où habitez-vous ?', 'Le résultat s\'affiche ici, avec la distance depuis Mouzeuil-Saint-Martin.');
      return;
    }
    if (r.commune) {
      // déjà affichée : on ne redessine pas (le champ perd le focus au clic sur « Préparer mon rendez-vous »)
      if (r.commune === choisie) return;
      if (!r.devine || depuisEntree) { if (r.devine) champ.value = r.commune.nom; choisir(r.commune); }
      return;
    }
    if (r.liste && r.liste.length) {
      afficheVerdict('dedans', 'Code postal ' + r.cp, 'Communes de ma tournée avec ce code postal : ' + r.liste.map(function (c) {
        return '<button type="button" class="lien-commune" data-commune-rapide="' + echappe(c.nom) + '">' + echappe(c.nom) + '</button>';
      }).join(', ') + '.');
      return;
    }
    if (r.suggestions) {
      if (!depuisEntree) return;
      afficheVerdict('', 'Vous vouliez dire…', r.suggestions.map(function (c) {
        return '<button type="button" class="lien-commune" data-commune-rapide="' + echappe(c.nom) + '">' + echappe(c.nom) + '</button>';
      }).join(' · '));
      return;
    }
    if (depuisEntree || norme(champ.value).length >= 5) {
      afficheVerdict('dehors', 'Je ne trouve pas cette commune', 'Elle semble hors de ma zone des 30 km autour de Mouzeuil-Saint-Martin, ou bien son nom est écrit autrement. Le plus simple : appelez-moi au <a data-tel href="tel:' + TOILETTEUSE.tel + '">' + TOILETTEUSE.telAffiche + '</a>.', false);
    }
  }
  if (champ) {
    champ.addEventListener('input', function () { chercher(false); });
    champ.addEventListener('change', function () { chercher(true); });
    champ.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); chercher(true); } });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-commune-rapide]');
    if (b) {
      var c = index[norme(b.getAttribute('data-commune-rapide'))];
      if (c) { if (champ) champ.value = c.nom; choisir(c); }
      return;
    }
    if (e.target.closest('[data-vers-rdv]') && choisie && window.RDV) window.RDV.commune(choisie.nom);
  });
})();
