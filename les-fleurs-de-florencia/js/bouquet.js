/* Composeur de bouquet : chaque choix redessine un bouquet en SVG.
   Les fonctions de dessin (window.DESSIN) servent aussi au calendrier des saisons. */
(function () {
  /* ---------- couleurs ---------- */
  function hexRgb(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  // k < 0 assombrit, k > 0 éclaircit
  function ombre(h, k) {
    var c = hexRgb(h).map(function (v) { return Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k); });
    return '#' + c.map(function (v) { return ('0' + Math.max(0, Math.min(255, v)).toString(16)).slice(-2); }).join('');
  }
  function f(n) { return Math.round(n * 10) / 10; }

  /* ---------- dessins (centrés sur 0,0, rayon r) ---------- */
  var D = {
    rose: function (c, r) {
      var s = '', b = ombre(c, -.2);
      for (var k = 0; k < 5; k++) {
        var a = k * 1.2566 - 1.57;
        s += '<circle cx="' + f(Math.cos(a) * r * .38) + '" cy="' + f(Math.sin(a) * r * .38) + '" r="' + f(r * .62) + '" fill="' + c + '" stroke="' + b + '" stroke-width="' + f(r * .04) + '"/>';
      }
      s += '<circle r="' + f(r * .56) + '" fill="' + ombre(c, -.07) + '"/>';
      s += '<path d="M' + f(-r * .08) + ' 0a' + f(r * .1) + ' ' + f(r * .1) + ' 0 1 1 ' + f(r * .2) + ' 0a' + f(r * .2) + ' ' + f(r * .2) + ' 0 1 1 ' + f(-r * .4) + ' 0a' + f(r * .3) + ' ' + f(r * .3) + ' 0 1 1 ' + f(r * .6) + ' 0" fill="none" stroke="' + ombre(c, -.3) + '" stroke-width="' + f(r * .06) + '" stroke-linecap="round"/>';
      return s;
    },
    pivoine: function (c, r) {
      var s = '', b = ombre(c, -.12), k;
      for (k = 0; k < 9; k++) s += '<ellipse cy="' + f(-r * .48) + '" rx="' + f(r * .42) + '" ry="' + f(r * .5) + '" fill="' + c + '" stroke="' + b + '" stroke-width="' + f(r * .03) + '" transform="rotate(' + (k * 40) + ')"/>';
      for (k = 0; k < 6; k++) s += '<ellipse cy="' + f(-r * .24) + '" rx="' + f(r * .3) + '" ry="' + f(r * .34) + '" fill="' + ombre(c, .1) + '" stroke="' + b + '" stroke-width="' + f(r * .03) + '" transform="rotate(' + (k * 60 + 20) + ')"/>';
      s += '<circle r="' + f(r * .2) + '" fill="' + ombre(c, .25) + '"/>';
      return s;
    },
    renoncule: function (c, r) {
      var s = '', t = [1, .8, .62, .45, .3], b = ombre(c, -.18);
      t.forEach(function (k, i) { s += '<circle r="' + f(r * k) + '" fill="' + (i % 2 ? ombre(c, -.08) : c) + '" stroke="' + b + '" stroke-width="' + f(r * .035) + '"/>'; });
      s += '<circle r="' + f(r * .13) + '" fill="#55663f"/>';
      return s;
    },
    tulipe: function (c, r) {
      var b = ombre(c, -.22);
      return '<path d="M' + f(-r * .58) + ' ' + f(-r * .2) + 'C' + f(-r * .62) + ' ' + f(r * .55) + ' ' + f(-r * .3) + ' ' + f(r * .85) + ' 0 ' + f(r * .85) + 'C' + f(r * .3) + ' ' + f(r * .85) + ' ' + f(r * .62) + ' ' + f(r * .55) + ' ' + f(r * .58) + ' ' + f(-r * .2) + 'L' + f(r * .32) + ' ' + f(-r * .62) + 'L' + f(r * .12) + ' ' + f(-r * .22) + 'L0 ' + f(-r * .75) + 'L' + f(-r * .12) + ' ' + f(-r * .22) + 'L' + f(-r * .32) + ' ' + f(-r * .62) + 'Z" fill="' + c + '" stroke="' + b + '" stroke-width="' + f(r * .05) + '" stroke-linejoin="round"/>' +
        '<path d="M0 ' + f(r * .8) + 'C' + f(-r * .25) + ' ' + f(r * .4) + ' ' + f(-r * .2) + ' 0 0 ' + f(-r * .6) + 'C' + f(r * .2) + ' 0 ' + f(r * .25) + ' ' + f(r * .4) + ' 0 ' + f(r * .8) + '" fill="' + ombre(c, .12) + '" stroke="' + b + '" stroke-width="' + f(r * .04) + '"/>';
    },
    gerbera: function (c, r, coeur) {
      var s = '', b = ombre(c, -.15);
      for (var k = 0; k < 16; k++) s += '<ellipse cy="' + f(-r * .6) + '" rx="' + f(r * .14) + '" ry="' + f(r * .42) + '" fill="' + c + '" stroke="' + b + '" stroke-width="' + f(r * .025) + '" transform="rotate(' + (k * 22.5) + ')"/>';
      s += '<circle r="' + f(r * .36) + '" fill="' + ombre(c, -.25) + '"/><circle r="' + f(r * .26) + '" fill="' + (coeur || '#4b3a22') + '"/>';
      return s;
    },
    dahlia: function (c, r) {
      var s = '', b = ombre(c, -.15);
      [[14, 1, 0], [11, .74, .08], [8, .5, .16]].forEach(function (l) {
        for (var k = 0; k < l[0]; k++) {
          s += '<path d="M0 0C' + f(r * .2 * l[1]) + ' ' + f(-r * .35 * l[1]) + ' ' + f(r * .12 * l[1]) + ' ' + f(-r * .8 * l[1]) + ' 0 ' + f(-r * l[1]) + 'C' + f(-r * .12 * l[1]) + ' ' + f(-r * .8 * l[1]) + ' ' + f(-r * .2 * l[1]) + ' ' + f(-r * .35 * l[1]) + ' 0 0Z" fill="' + ombre(c, l[2]) + '" stroke="' + b + '" stroke-width="' + f(r * .025) + '" transform="rotate(' + f(k * 360 / l[0] + l[1] * 13) + ')"/>';
        }
      });
      return s + '<circle r="' + f(r * .14) + '" fill="' + ombre(c, -.3) + '"/>';
    },
    epi: function (c, r) {
      var s = '<path d="M0 ' + f(r) + 'L0 ' + f(-r * .9) + '" stroke="#6f8a62" stroke-width="' + f(r * .07) + '" stroke-linecap="round"/>';
      for (var k = 0; k < 9; k++) {
        var y = r * .75 - k * r * .2, t = r * (.2 - k * .015), x = (k % 2 ? 1 : -1) * r * .12;
        s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="' + f(t) + '" fill="' + (k % 3 ? c : ombre(c, -.12)) + '"/>';
      }
      return s;
    },
    gypsophile: function (c, r) {
      var s = '', pts = [[0, 0], [.5, -.3], [-.45, -.35], [.3, .45], [-.4, .4], [.05, -.65], [.7, .15], [-.7, .05], [.1, .7]];
      s += '<g stroke="#8aa184" stroke-width="' + f(r * .04) + '">';
      pts.forEach(function (p) { s += '<line x1="0" y1="' + f(r * .9) + '" x2="' + f(p[0] * r) + '" y2="' + f(p[1] * r) + '"/>'; });
      s += '</g>';
      pts.forEach(function (p, i) { s += '<circle cx="' + f(p[0] * r) + '" cy="' + f(p[1] * r) + '" r="' + f(r * (i % 3 ? .13 : .17)) + '" fill="' + (c || '#fffdf8') + '" stroke="#d9d3c4" stroke-width="' + f(r * .03) + '"/>'; });
      return s;
    },
    eucalyptus: function (c, r, baies) {
      var s = '<path d="M0 ' + f(r) + 'C' + f(r * .2) + ' ' + f(r * .3) + ' ' + f(-r * .15) + ' ' + f(-r * .4) + ' 0 ' + f(-r) + '" fill="none" stroke="#6f8a7c" stroke-width="' + f(r * .06) + '" stroke-linecap="round"/>';
      var feuilles = [[.12, .65, .3], [-.12, .35, .28], [.1, .05, .26], [-.1, -.25, .24], [.05, -.55, .22], [-.04, -.85, .18]];
      feuilles.forEach(function (l, i) {
        var x = l[0] * r + (i % 2 ? -1 : 1) * l[2] * r * .9;
        s += '<circle cx="' + f(x) + '" cy="' + f(l[1] * r) + '" r="' + f(l[2] * r) + '" fill="' + (c || '#9db3a4') + '" stroke="' + ombre(c || '#9db3a4', -.2) + '" stroke-width="' + f(r * .025) + '"/>';
        if (baies && i % 2) s += '<circle cx="' + f(l[0] * r) + '" cy="' + f(l[1] * r - r * .05) + '" r="' + f(r * .09) + '" fill="' + baies + '"/>';
      });
      return s;
    }
  };
  window.DESSIN = { fleur: function (type, c, r, opt) { return (D[type] || D.rose)(c, r, opt); }, ombre: ombre };

  /* ---------- données ---------- */
  var FLEURS = {
    rose:       { nom: 'Rose', pluriel: 'roses', sens: 'La rose : l\'amour, sous toutes ses formes.', dessin: 'rose' },
    pivoine:    { nom: 'Pivoine', pluriel: 'pivoines', sens: 'La pivoine : le bonheur et la prospérité.', dessin: 'pivoine' },
    renoncule:  { nom: 'Renoncule', pluriel: 'renoncules', sens: 'La renoncule : « vous êtes rayonnante de charme ».', dessin: 'renoncule' },
    tulipe:     { nom: 'Tulipe', pluriel: 'tulipes', sens: 'La tulipe : une déclaration, un renouveau.', dessin: 'tulipe' },
    gerbera:    { nom: 'Gerbera', pluriel: 'gerberas', sens: 'Le gerbera : la joie et la gaieté.', dessin: 'gerbera' },
    gypsophile: { nom: 'Gypsophile', pluriel: 'gypsophile', sens: 'Le gypsophile : la pureté, un nuage de légèreté.', dessin: 'gypsophile', garniture: true },
    eucalyptus: { nom: 'Eucalyptus', pluriel: 'eucalyptus', sens: 'L\'eucalyptus : la protection et la fraîcheur.', dessin: 'eucalyptus', garniture: true }
  };
  var PALETTES = {
    poudre:    { nom: 'Poudrée', adj: 'poudrée', c: ['#f4c9c6', '#f9e1d8', '#e8a6a8', '#fdf3ea', '#d98f9a'] },
    champetre: { nom: 'Champêtre', adj: 'champêtre', c: ['#f6d77a', '#f2a65a', '#fbf3e4', '#c9a0d6', '#e98a7a'] },
    passion:   { nom: 'Passion', adj: 'passion, rouge profond', c: ['#9e1b32', '#c2334d', '#e2566a', '#7a1027', '#f4d8d8'] },
    blanc:     { nom: 'Blanc pur', adj: 'tout en blanc', c: ['#fbf8f2', '#f3eee2', '#ebe5d6', '#fffdf8', '#e6ead9'] },
    soleil:    { nom: 'Soleil', adj: 'soleil, jaune et orangé', c: ['#f7b733', '#fc8a3a', '#ffd166', '#fff1c1', '#f26b38'] }
  };
  var TAILLES = {
    petit:    { nom: 'Petit', n: 9, note: '9 tiges' },
    moyen:    { nom: 'Moyen', n: 15, note: '15 tiges' },
    genereux: { nom: 'Généreux', n: 23, note: '23 tiges' }
  };
  var PAPIERS = {
    kraft: { nom: 'Kraft', c: '#c9a171', dos: '#b0875a', adj: 'en papier kraft' },
    creme: { nom: 'Crème', c: '#f3e9d6', dos: '#e0d1b6', adj: 'en papier crème' },
    sauge: { nom: 'Sauge', c: '#adc0b2', dos: '#93a898', adj: 'en papier vert sauge' }
  };

  var etat = { fleurs: ['rose', 'pivoine', 'eucalyptus'], palette: 'poudre', taille: 'moyen', papier: 'kraft' };

  var groupe = document.querySelector('.scene-bouquet');
  var resume = document.querySelector('.scene-resume');
  var sens = document.querySelector('.choix-sens');
  if (!groupe) return;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hasard reproductible ---------- */
  function graine(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function generateur(g) {
    return function () {
      g |= 0; g = g + 0x6D2B79F5 | 0;
      var t = Math.imul(g ^ g >>> 15, 1 | g);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- dessin du bouquet ---------- */
  function dessiner() {
    var alea = generateur(graine(JSON.stringify(etat)));
    var taille = TAILLES[etat.taille], pal = PALETTES[etat.palette].c, pap = PAPIERS[etat.papier];
    var principales = etat.fleurs.filter(function (k) { return !FLEURS[k].garniture; });
    var avecEuca = etat.fleurs.indexOf('eucalyptus') > -1, avecGyps = etat.fleurs.indexOf('gypsophile') > -1;
    var n = taille.n;
    var RX = Math.min(150, 66 + n * 3.4), RY = RX * .72, CX = 200, CY = 210, TX = 200, TY = 352;
    var d = 0, pas = calme ? 0 : .035;
    function delai() { var v = d; d += pas; return 'style="--d:' + v.toFixed(2) + 's"'; }

    // positions en spirale (angle d'or), puis tri de l'arrière vers l'avant
    var fleurs = [];
    if (principales.length) {
      for (var i = 0; i < n; i++) {
        var rr = Math.sqrt((i + .5) / n), th = i * 2.39996 + alea() * .3;
        fleurs.push({
          x: CX + Math.cos(th) * rr * RX + (alea() - .5) * 8,
          y: CY + Math.sin(th) * rr * RY - (1 - rr) * 14 + (alea() - .5) * 6,
          r: (n > 18 ? 21 : n > 12 ? 25 : 29) + (alea() - .5) * 6,
          type: principales[Math.floor(alea() * principales.length)],
          c: pal[Math.floor(alea() * pal.length)],
          a: Math.round((alea() - .5) * 60)
        });
      }
    }
    fleurs.sort(function (a, b) { return a.y - b.y; });

    var s = '';
    // papier, côté dos
    s += '<path d="M' + TX + ' 448L' + (TX - RX - 30) + ' ' + (CY - 6) + 'Q' + TX + ' ' + (CY - RY - 70) + ' ' + (TX + RX + 30) + ' ' + (CY - 6) + 'Z" fill="' + pap.dos + '" class="pop" ' + delai() + '/>';
    // eucalyptus en arrière-plan
    if (avecEuca) {
      var ne = Math.round(n * .45) + 3;
      for (var e = 0; e < ne; e++) {
        var ang = -150 + (e / (ne - 1)) * 120 + (alea() - .5) * 12, rad = ang * Math.PI / 180;
        var ex = CX + Math.cos(rad) * (RX * .85), ey = CY + Math.sin(rad) * (RY * .9) - 10;
        var rot = ang + 90;
        s += '<g transform="translate(' + f(ex) + ' ' + f(ey) + ') rotate(' + f(rot) + ')"><g class="pop" ' + delai() + '>' + D.eucalyptus('#9db3a4', 30 + alea() * 10) + '</g></g>';
      }
    }
    // tiges
    s += '<g fill="none" stroke="#5f7a5c" stroke-width="2.2" stroke-linecap="round">';
    fleurs.forEach(function (fl, k) {
      s += '<path pathLength="1" class="pousse" ' + delai() + ' d="M' + f(fl.x) + ' ' + f(fl.y) + 'Q' + f((fl.x + TX) / 2) + ' ' + f((fl.y + TY) / 2 + 10) + ' ' + TX + ' ' + TY + 'L' + f(TX + (k - fleurs.length / 2) * 2.2) + ' ' + (466 + (k % 3) * 4) + '"/>';
    });
    if (!fleurs.length) for (var t = 0; t < 7; t++) s += '<path d="M' + TX + ' ' + TY + 'L' + f(TX + (t - 3) * 2.4) + ' 468"/>';
    s += '</g>';
    // fleurs
    d = Math.max(d - fleurs.length * pas, .15);
    fleurs.forEach(function (fl) {
      s += '<g transform="translate(' + f(fl.x) + ' ' + f(fl.y) + ') rotate(' + fl.a + ')"><g class="pop" ' + delai() + '>' + D[FLEURS[fl.type].dessin](fl.c, fl.r) + '</g></g>';
    });
    // nuages de gypsophile
    if (avecGyps) {
      var ng = Math.round(n * .5) + 2;
      for (var g = 0; g < ng; g++) {
        var th2 = alea() * Math.PI * 2, rr2 = .55 + alea() * .5;
        s += '<g transform="translate(' + f(CX + Math.cos(th2) * rr2 * RX) + ' ' + f(CY + Math.sin(th2) * rr2 * RY - 6) + ')"><g class="pop" ' + delai() + '>' + D.gypsophile('#fffdf8', 15 + alea() * 6) + '</g></g>';
      }
    }
    // papier, côté face, et ruban
    var bas = CY + RY * .62;
    s += '<g class="pop" ' + delai() + '>' +
      '<path d="M' + TX + ' 452L' + f(TX - RX * .78) + ' ' + f(bas) + 'Q' + f(TX - RX * .4) + ' ' + f(bas + 22) + ' ' + TX + ' ' + f(bas + 14) + 'Q' + f(TX + RX * .4) + ' ' + f(bas + 22) + ' ' + f(TX + RX * .78) + ' ' + f(bas) + 'Z" fill="' + pap.c + '"/>' +
      '<path d="M' + TX + ' 452L' + f(TX - RX * .3) + ' ' + f(bas + 18) + 'M' + TX + ' 452L' + f(TX + RX * .32) + ' ' + f(bas + 18) + '" stroke="' + ombre(pap.c, -.12) + '" stroke-width="1.2" fill="none"/>' +
      '</g>';
    s += '<g class="pop" ' + delai() + ' transform-origin="200 392">' +
      '<path d="M200 392C186 380 170 378 168 388C166 398 186 398 200 392ZM200 392C214 380 230 378 232 388C234 398 214 398 200 392Z" fill="#c06676"/>' +
      '<path d="M199 393L188 424M201 393L214 422" stroke="#c06676" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="200" cy="392" r="5" fill="#a5525f"/></g>';
    groupe.innerHTML = s;

    // résumé
    var noms = etat.fleurs.map(function (k) { return FLEURS[k].pluriel; });
    resume.textContent = 'Bouquet ' + taille.nom.toLowerCase() + ' · ' + liste(noms) + ' · palette ' + PALETTES[etat.palette].nom.toLowerCase() + ' · ' + taille.note;
  }
  function liste(t) { return t.length < 2 ? t.join('') : t.slice(0, -1).join(', ') + ' et ' + t[t.length - 1]; }

  /* ---------- commandes ---------- */
  function bouton(cls, cle, html, groupeNom) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = cls; b.dataset.cle = cle; b.dataset.groupe = groupeNom;
    b.innerHTML = html;
    return b;
  }
  var zFleurs = document.querySelector('[data-groupe="fleurs"]');
  Object.keys(FLEURS).forEach(function (k, i) {
    var c = ['#e8a6a8', '#f4c9c6', '#f2a65a', '#c2334d', '#f7b733', '#fffdf8', '#9db3a4'][i];
    var icone = '<svg viewBox="-16 -16 32 32" aria-hidden="true">' + D[FLEURS[k].dessin](c, 13) + '</svg>';
    zFleurs.appendChild(bouton('pastille', k, icone + '<span>' + FLEURS[k].nom + '</span>', 'fleurs'));
  });
  var zPal = document.querySelector('[data-groupe="palette"]');
  Object.keys(PALETTES).forEach(function (k) {
    var p = PALETTES[k];
    zPal.appendChild(bouton('palette', k, '<span class="palette-couleurs" aria-hidden="true">' + p.c.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>' + p.nom, 'palette'));
  });
  var zTaille = document.querySelector('[data-groupe="taille"]');
  Object.keys(TAILLES).forEach(function (k) { zTaille.appendChild(bouton('segment', k, TAILLES[k].nom + '<small>' + TAILLES[k].n + '</small>', 'taille')); });
  var zPapier = document.querySelector('[data-groupe="papier"]');
  Object.keys(PAPIERS).forEach(function (k) { zPapier.appendChild(bouton('segment', k, PAPIERS[k].nom, 'papier')); });

  function synchroniser() {
    document.querySelectorAll('.choix button[data-cle]').forEach(function (b) {
      var g = b.dataset.groupe, k = b.dataset.cle;
      b.setAttribute('aria-pressed', g === 'fleurs' ? etat.fleurs.indexOf(k) > -1 : etat[g] === k);
    });
  }
  document.querySelector('.choix').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-cle]');
    if (!b) return;
    var g = b.dataset.groupe, k = b.dataset.cle;
    if (g === 'fleurs') {
      var i = etat.fleurs.indexOf(k);
      if (i > -1) {
        if (etat.fleurs.length === 1) { sens.textContent = 'Gardez au moins une fleur dans votre bouquet.'; return; }
        etat.fleurs.splice(i, 1);
        sens.textContent = '';
      } else {
        if (etat.fleurs.length >= 4) { sens.textContent = 'Quatre fleurs au maximum : retirez-en une pour en ajouter une autre.'; return; }
        etat.fleurs.push(k);
        sens.textContent = FLEURS[k].sens;
      }
      if (!etat.fleurs.some(function (x) { return !FLEURS[x].garniture; })) sens.textContent = 'Ajoutez une fleur principale pour donner du cœur à votre bouquet.';
    } else {
      etat[g] = k;
    }
    synchroniser();
    dessiner();
  });

  document.querySelector('[data-hasard]').addEventListener('click', function () {
    var cles = Object.keys(FLEURS).filter(function (k) { return !FLEURS[k].garniture; });
    cles.sort(function () { return Math.random() - .5; });
    etat.fleurs = cles.slice(0, 1 + Math.floor(Math.random() * 2));
    if (Math.random() < .7) etat.fleurs.push(Math.random() < .5 ? 'eucalyptus' : 'gypsophile');
    function un(o) { var k = Object.keys(o); return k[Math.floor(Math.random() * k.length)]; }
    etat.palette = un(PALETTES); etat.taille = un(TAILLES); etat.papier = un(PAPIERS);
    sens.textContent = FLEURS[etat.fleurs[0]].sens;
    synchroniser();
    dessiner();
  });

  document.querySelector('[data-demander]').addEventListener('click', function () {
    var t = TAILLES[etat.taille];
    var txt = 'Bonjour,\n\nje souhaiterais un bouquet ' + t.nom.toLowerCase() + ' (environ ' + t.n + ' tiges) de ' +
      liste(etat.fleurs.map(function (k) { return FLEURS[k].pluriel; })) +
      ', dans une palette ' + PALETTES[etat.palette].adj + ', emballé ' + PAPIERS[etat.papier].adj + '.\n\n' +
      'C\'est pour : \nMessage à joindre : ';
    if (window.FLORENCIA) window.FLORENCIA.remplir(txt);
  });

  synchroniser();
  // le premier dessin attend que la section soit visible, pour profiter de l'éclosion
  var scene = document.querySelector('.scene');
  if ('IntersectionObserver' in window && !calme) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { dessiner(); io.disconnect(); } }, { threshold: .3 });
    io.observe(scene);
  } else dessiner();
})();
