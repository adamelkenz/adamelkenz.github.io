/* Beauty by Léna — l'atelier : un nuancier de cinq capsules qui se vernit
   selon la forme, la base, la finition et la couleur du bout choisies. */
(function () {
  var scene = document.querySelector('.atelier-presentoir');
  if (!scene) return;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* Formes : contour d'une capsule de 100 de large, cuticule en y=0, pointe vers le haut.
     cote : hauteur où le bord droit rejoint la pointe ; pointe : tracé de droite à gauche ; sourire : ligne de la french. */
  var FORMES = {
    amande:    { nom: 'Amande',    cote: 100, sourire: 150, pointe: 'C50,-150 20,-196 0,-200 C-20,-196 -50,-150 -50,-100' },
    carre:     { nom: 'Carré',     cote: 178, sourire: 148, pointe: 'Q50,-190 38,-190 L-38,-190 Q-50,-190 -50,-178' },
    ballerine: { nom: 'Ballerine', cote: 110, sourire: 150, pointe: 'C50,-150 32,-184 28,-198 Q26,-203 19,-203 L-19,-203 Q-26,-203 -28,-198 C-32,-184 -50,-150 -50,-110' },
    stiletto:  { nom: 'Stiletto',  cote: 80,  sourire: 160, pointe: 'C50,-140 10,-212 0,-224 C-10,-212 -50,-140 -50,-80' },
    ovale:     { nom: 'Ovale',     cote: 120, sourire: 138, pointe: 'C50,-168 28,-186 0,-186 C-28,-186 -50,-168 -50,-120' }
  };
  var BASES = {
    lacte:    { nom: 'Rose lacté',   c: '#f5d9d5', o: '#e4b9b4' },
    nude:     { nom: 'Nude rosé',    c: '#e9bcb3', o: '#d29a90' },
    lait:     { nom: 'Blanc lait',   c: '#fbf6f1', o: '#e2d8d0' },
    rouge:    { nom: 'Rouge cerise', c: '#b0162f', o: '#7d0c1f' },
    bordeaux: { nom: 'Bordeaux',     c: '#6e1b2d', o: '#43091a' },
    noir:     { nom: 'Noir laqué',   c: '#1d1517', o: '#070505' }
  };
  var BOUTS = {
    // adj : « french … » ; m : « baby boomer … » ; pl : « pointes … »
    blanc:    { nom: 'Blanc',    adj: 'blanche',     m: 'blanc',       pl: 'blanches',    c: '#fffaf6' },
    bordeaux: { nom: 'Bordeaux', adj: 'bordeaux',    m: 'bordeaux',    pl: 'bordeaux',    c: '#6e1b2d' },
    noir:     { nom: 'Noir',     adj: 'noire',       m: 'noir',        pl: 'noires',      c: '#141011' },
    rose:     { nom: 'Rose',     adj: 'rose poudré', m: 'rose poudré', pl: 'rose poudré', c: '#e2aca8' },
    or:       { nom: 'Or',       adj: 'dorée',       m: 'doré',        pl: 'dorées',      c: '#c9a26a' }
  };
  var FINITIONS = {
    french:     { nom: 'French',       bout: true },
    pois:       { nom: 'French à pois', bout: true },
    babyboomer: { nom: 'Baby boomer',  bout: true },
    paillettes: { nom: 'Paillettes',   bout: true },
    chrome:     { nom: 'Chrome nacré', bout: false },
    uni:        { nom: 'Uni',          bout: false }
  };
  var DOIGTS = [
    { x: 74,  y: 312, r: -14, s: .74 },
    { x: 172, y: 300, r: -6,  s: .86 },
    { x: 280, y: 296, r: 0,   s: .92 },
    { x: 388, y: 300, r: 6,   s: .86 },
    { x: 486, y: 312, r: 14,  s: .74 }
  ];
  var etat = { forme: 'amande', base: 'lacte', finition: 'french', bout: 'blanc' };
  var compteur = 0;

  function contour(f) {
    return 'M50,-10 L50,-' + f.cote + ' ' + f.pointe + ' L-50,-10 C-50,16 50,16 50,-10 Z';
  }
  function sourire(f) {
    var y = -f.sourire;
    return 'M-80,-260 H80 V' + (y + 44) + ' C80,' + (y - 26) + ' -80,' + (y - 26) + ' -80,' + (y + 44) + ' Z';
  }
  function el(nom, attrs, parent) {
    var n = document.createElementNS(NS, nom);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function eclaircir(hex, t) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function m(c) { return Math.round(c + (255 - c) * t); }
    return 'rgb(' + m(r) + ',' + m(g) + ',' + m(b) + ')';
  }

  function dessiner(svg) {
    var id = 'n' + (++compteur);
    var f = FORMES[etat.forme], b = BASES[etat.base], fin = etat.finition, bo = BOUTS[etat.bout];
    while (svg.lastChild && svg.lastChild.nodeName !== 'title') svg.removeChild(svg.lastChild);
    var defs = el('defs', {}, svg);
    el('path', { id: id + '-forme', d: contour(f) }, defs);
    var cp = el('clipPath', { id: id + '-clip' }, defs);
    el('use', { href: '#' + id + '-forme' }, cp);
    var cpb = el('clipPath', { id: id + '-bout' }, defs);
    el('path', { d: sourire(f) }, cpb);

    // relief : plus sombre à la cuticule et sur les bords
    var lg = el('linearGradient', { id: id + '-relief', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    el('stop', { offset: 0, 'stop-color': '#000', 'stop-opacity': .22 }, lg);
    el('stop', { offset: .22, 'stop-color': '#000', 'stop-opacity': 0 }, lg);
    el('stop', { offset: .78, 'stop-color': '#000', 'stop-opacity': 0 }, lg);
    el('stop', { offset: 1, 'stop-color': '#000', 'stop-opacity': .26 }, lg);
    var base = el('linearGradient', { id: id + '-base', x1: 0, y1: 1, x2: 0, y2: 0 }, defs);
    el('stop', { offset: 0, 'stop-color': b.o }, base);
    el('stop', { offset: .35, 'stop-color': b.c }, base);
    el('stop', { offset: 1, 'stop-color': eclaircir(b.c, .12) }, base);
    if (fin === 'babyboomer') {
      var bb = el('linearGradient', { id: id + '-bb', gradientUnits: 'userSpaceOnUse', x1: 0, y1: -40, x2: 0, y2: -(f.sourire + 30) }, defs);
      el('stop', { offset: 0, 'stop-color': bo.c, 'stop-opacity': 0 }, bb);
      el('stop', { offset: 1, 'stop-color': bo.c, 'stop-opacity': 1 }, bb);
    }
    if (fin === 'chrome') {
      var ch = el('linearGradient', { id: id + '-chrome', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
      [['#ffffff', .0, .75], ['#f6d8e8', .3, .55], ['#d9d4f2', .5, .35], ['#fff6e4', .72, .7], ['#ffffff', 1, .3]].forEach(function (s) {
        el('stop', { offset: s[1], 'stop-color': s[0], 'stop-opacity': s[2] }, ch);
      });
    }

    DOIGTS.forEach(function (d, k) {
      var porte = el('g', { transform: 'translate(' + d.x + ' ' + d.y + ') rotate(' + d.r + ') scale(' + d.s + ')' }, svg);
      var g = el('g', { class: 'ongle-g', style: '--penche:' + (d.r * 0.2) + 'deg;transition-delay:' + (k * 40) + 'ms' }, porte);
      // ombre portée
      el('use', { href: '#' + id + '-forme', fill: '#000', opacity: .35, transform: 'translate(5 9)', style: 'filter:blur(6px)' }, g);
      var c = el('g', { 'clip-path': 'url(#' + id + '-clip)' }, g);
      el('rect', { x: -60, y: -240, width: 120, height: 270, fill: 'url(#' + id + '-base)' }, c);
      if (fin === 'french' || fin === 'pois' || fin === 'paillettes') {
        var tip = el('g', { 'clip-path': 'url(#' + id + '-bout)' }, c);
        el('rect', { x: -60, y: -240, width: 120, height: 270, fill: bo.c }, tip);
        if (fin === 'pois') {
          var pois = etat.bout === 'blanc' ? '#6e1b2d' : '#fffaf6';
          for (var rang = 0, py = -230; py < -f.sourire + 40; py += 15, rang++) {
            for (var px = -54; px < 56; px += 17) {
              el('circle', { cx: px + (rang % 2 ? 8 : 0), cy: py, r: 3.1, fill: pois }, tip);
            }
          }
        }
        if (fin === 'paillettes') {
          for (var n = 0; n < 46; n++) {
            var sx = -50 + Math.random() * 100, sy = -230 + Math.random() * (230 - f.sourire + 40);
            el('circle', { cx: sx.toFixed(1), cy: sy.toFixed(1), r: (0.8 + Math.random() * 2).toFixed(1), fill: Math.random() < .6 ? '#f6e3b8' : '#ffffff', class: 'paillette-svg', style: 'animation-delay:' + (Math.random() * 2.4).toFixed(2) + 's' }, tip);
          }
        }
      }
      if (fin === 'babyboomer') el('rect', { x: -60, y: -240, width: 120, height: 270, fill: 'url(#' + id + '-bb)' }, c);
      if (fin === 'chrome') el('rect', { x: -60, y: -240, width: 120, height: 270, fill: 'url(#' + id + '-chrome)', style: 'mix-blend-mode:screen' }, c);
      el('rect', { x: -50, y: -240, width: 100, height: 270, fill: 'url(#' + id + '-relief)' }, c);
      // reflet de top coat
      el('path', { d: 'M-22,-20 C-30,-70 -28,-120 -14,-' + (f.cote + 34), stroke: '#fff', 'stroke-opacity': .55, 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none', style: 'filter:blur(1.2px)' }, c);
      el('path', { d: 'M24,-28 C28,-60 28,-90 24,-110', stroke: '#fff', 'stroke-opacity': .22, 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, c);
      el('use', { href: '#' + id + '-forme', fill: 'none', stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1 }, g);
    });
  }

  function texteLook() {
    var f = FORMES[etat.forme].nom, b = BASES[etat.base].nom, bo = BOUTS[etat.bout];
    var fin = {
      french: 'french ' + bo.adj, pois: 'french ' + bo.adj + ' à pois', babyboomer: 'baby boomer ' + bo.m,
      paillettes: 'pointes ' + bo.pl + ' pailletées', chrome: 'effet chrome nacré', uni: 'uni'
    }[etat.finition];
    return f + ' · ' + b + ' · ' + fin;
  }
  var resume = document.querySelector('.atelier-resume');
  function majResume() {
    var t = texteLook().split(' · ');
    resume.innerHTML = t[0] + ' · ' + t[1] + ' · <em>' + t[2] + '</em>';
    document.querySelector('.choix-bout').classList.toggle('inactif', !FINITIONS[etat.finition].bout);
  }

  /* rendu avec le coup de pinceau */
  var actuel = scene.querySelector('.nuancier');
  var pinceau = scene.querySelector('.pinceau');
  dessiner(actuel);
  majResume();
  function revernir() {
    majResume();
    if (calme) { dessiner(actuel); return; }
    var neuf = actuel.cloneNode(false);
    var titre = actuel.querySelector('title');
    if (titre) neuf.appendChild(titre.cloneNode(true));
    dessiner(neuf);
    neuf.classList.add('nouveau');
    scene.insertBefore(neuf, pinceau);
    var ancien = actuel;
    actuel = neuf;
    pinceau.classList.remove('passe'); void pinceau.offsetWidth; pinceau.classList.add('passe');
    neuf.addEventListener('animationend', function fini(e) {
      if (e.target !== neuf) return;
      neuf.removeEventListener('animationend', fini);
      if (ancien.parentNode) ancien.remove();
      neuf.classList.remove('nouveau');
      // une capsule plus ancienne encore à l'écran (changements rapides) : on nettoie
      scene.querySelectorAll('.nuancier').forEach(function (s) { if (s !== actuel && !s.classList.contains('nouveau')) s.remove(); });
    });
  }

  /* pastilles de choix */
  function icone(f) {
    return '<svg class="forme-icone" viewBox="-55 -230 110 250" aria-hidden="true"><path d="' + contour(f) + '"/></svg>';
  }
  function remplir(nom, source, rendu) {
    var boite = document.querySelector('[data-choix="' + nom + '"]');
    Object.keys(source).forEach(function (cle) {
      var lab = document.createElement('label');
      lab.innerHTML = '<input type="radio" name="' + nom + '" value="' + cle + '"' + (etat[nom] === cle ? ' checked' : '') + '><span>' + rendu(source[cle]) + '</span>';
      boite.appendChild(lab);
    });
    boite.addEventListener('change', function (e) { etat[nom] = e.target.value; revernir(); });
  }
  remplir('forme', FORMES, function (f) { return icone(f) + f.nom; });
  remplir('base', BASES, function (b) { return '<span class="teinte" style="background:' + b.c + '"></span>' + b.nom; });
  remplir('finition', FINITIONS, function (f) { return f.nom; });
  remplir('bout', BOUTS, function (b) { return '<span class="teinte" style="background:' + b.c + '"></span>' + b.nom; });

  function choisir(nom, valeur) {
    etat[nom] = valeur;
    var r = document.querySelector('input[name="' + nom + '"][value="' + valeur + '"]');
    if (r) r.checked = true;
  }
  document.querySelector('[data-hasard]').addEventListener('click', function (e) {
    function un(o) { var k = Object.keys(o); return k[(Math.random() * k.length) | 0]; }
    choisir('forme', un(FORMES));
    choisir('base', un(BASES));
    choisir('finition', un(FINITIONS));
    var bout = un(BOUTS);
    if (bout === etat.base) bout = 'blanc';
    choisir('bout', bout);
    revernir();
    if (window.paillettesEclat) { var r = scene.getBoundingClientRect(); window.paillettesEclat(r.left + r.width / 2, r.top + r.height / 2, 30); }
  });

  document.querySelector('[data-reserver-look]').addEventListener('click', function () {
    var b = BASES[etat.base], bo = BOUTS[etat.bout];
    var aBout = FINITIONS[etat.finition].bout;
    window.dispatchEvent(new CustomEvent('lena:look', { detail: {
      texte: texteLook(),
      pastille: aBout ? 'linear-gradient(' + bo.c + ' 0 32%, ' + b.c + ' 32%)' : b.c
    } }));
  });
})();
