/* Allô P'tites Pattes — « À vous de brosser » : un petit chien ébouriffé à démêler
   à la souris ou au doigt. Chaque poil se souvient du coup de brosse reçu et finit
   par se coucher dans le sens du poil ; les nœuds sautent au bout de quelques passages. */
(function () {
  var canvas = document.querySelector('[data-brosse]');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s) { return document.querySelector(s); }
  var jaugeTxt = $('[data-jauge-txt]'), jauge = $('[data-jauge]'), noeudsTxt = $('[data-noeuds]');
  var fin = $('[data-fin]'), astuce = $('[data-astuce]'), btnAuto = $('[data-auto]');

  var DW = 1000, DH = 640, TAU = Math.PI * 2;
  var PQ = { x: 292, y: 322 }; // la queue remue autour de ce point

  function fixe(a) { return function () { return a; }; }
  function radial(cx, cy) { return function (x, y) { return Math.atan2(y - cy, x - cx); }; }

  // palettes : ébouriffé (terne) → brossé (clair et brillant)
  var PAL = [
    { t: ['#cdb08a', '#bfa07a', '#d9bf99', '#b8966d'], c: ['#f1e0c3', '#f9ecd6', '#e7d2b0', '#fffaf0'] }, // crème
    { t: ['#b9814f', '#a87245', '#c48f5f', '#9c683f'], c: ['#dca06a', '#e9b680', '#d0915a', '#f3c99a'] }, // abricot (oreille)
    { t: ['#ab8d69', '#9d805f', '#b79a75', '#94785a'], c: ['#d9c4a3', '#e2cfb1', '#cfb894', '#ead9bf'] }  // côté ombre
  ];

  // les zones du pelage : ellipse, palette, longueur des poils, sens du poil une fois brossé
  var ZONES = [
    { x: 255, y: 292, rx: 44, ry: 24, rot: -.75, pal: 0, l: [20, 28], queue: true, sens: fixe(-2.27) },
    { x: 212, y: 236, rx: 58, ry: 56, pal: 0, l: [26, 40], queue: true, sens: radial(212, 236) },
    { x: 345, y: 470, rx: 38, ry: 86, pal: 2, l: [18, 26], sens: fixe(Math.PI / 2 + .06) },
    { x: 610, y: 470, rx: 38, ry: 86, pal: 2, l: [18, 26], sens: fixe(Math.PI / 2) },
    { x: 470, y: 378, rx: 232, ry: 122, pal: 0, l: [26, 38], sens: fixe(Math.PI / 2 + .55) },
    { x: 292, y: 478, rx: 42, ry: 80, pal: 0, l: [18, 26], sens: fixe(Math.PI / 2 + .08) },
    { x: 662, y: 478, rx: 42, ry: 80, pal: 0, l: [18, 26], sens: fixe(Math.PI / 2 - .04) },
    { x: 642, y: 368, rx: 96, ry: 112, pal: 0, l: [26, 36], sens: fixe(Math.PI / 2 - .12) },
    { x: 690, y: 286, rx: 72, ry: 86, rot: .35, pal: 0, l: [24, 34], sens: fixe(Math.PI / 2 + .25) },
    { x: 748, y: 205, rx: 112, ry: 100, pal: 0, l: [24, 34], sens: radial(748, 215) },
    { x: 738, y: 128, rx: 78, ry: 52, pal: 0, l: [26, 38], sens: radial(738, 150) },
    { x: 852, y: 240, rx: 58, ry: 42, pal: 0, l: [14, 20], sens: radial(825, 238) },
    { x: 694, y: 262, rx: 46, ry: 90, rot: .18, pal: 1, l: [30, 44], sens: fixe(Math.PI / 2 + .12) }
  ];
  var NOEUDS = [[392, 352], [520, 420], [612, 326], [212, 232], [694, 296], [742, 126], [292, 486], [470, 296]];

  var poils = [], parZone = [], grille = {}, CELL = 50, noeuds = [];
  var miettes = [], textes = [], etoiles = [];
  var dpr = 1, cw = 0, ch = 0, s = 1, ox = 0, oy = 0;
  var actif = false, enVue = false, tPrec = 0, dernierCoup = -1e9, dejaBrosse = false, fini = false, tFini = 0;
  var couverture = 0, angleQueue = 0, pct = -1;
  var pointeur = null, dernier = null, appuye = false, angBrosse = Math.PI * .85;
  var auto = null;

  function cle(gx, gy) { return gx + ',' + gy; }
  function creePoils() {
    poils = []; parZone = []; grille = {};
    var densite = canvas.clientWidth && canvas.clientWidth < 520 ? .0074 : .0098;
    ZONES.forEach(function (z, zi) {
      var n = Math.round(Math.PI * z.rx * z.ry * densite), liste = [];
      var co = Math.cos(z.rot || 0), si = Math.sin(z.rot || 0);
      for (var i = 0; i < n; i++) {
        var r = Math.sqrt(Math.random()) * .97, t = Math.random() * TAU;
        var lx = Math.cos(t) * r * z.rx, ly = Math.sin(t) * r * z.ry;
        var x = z.x + lx * co - ly * si, y = z.y + lx * si + ly * co;
        var aC = z.sens(x, y) + (Math.random() - .5) * .25;
        var kT = (Math.random() < .5 ? -1 : 1) * (.55 + Math.random() * .8);
        var p = {
          x: x, y: y, ton: (Math.random() * 4) | 0,
          l: z.l[0] + Math.random() * (z.l[1] - z.l[0]),
          aC: aC, aT: 0, kT: kT, kC: (kT > 0 ? 1 : -1) * .14,
          a: 0, k: kT, c: 0, aB: 0, tB: -1e9
        };
        ebouriffe(p);
        p.a = p.aT;
        liste.push(p); poils.push(p);
        var k = cle(Math.floor(x / CELL), Math.floor(y / CELL));
        (grille[k] || (grille[k] = [])).push(p);
      }
      parZone.push(liste);
    });
  }
  function ebouriffe(p) {
    p.aT = p.aC + (Math.random() - .5) * 5.2;
    p.kT = (Math.random() < .5 ? -1 : 1) * (.55 + Math.random() * .8);
    p.c = 0; p.tB = -1e9;
  }
  function creeNoeuds() {
    noeuds = NOEUDS.map(function (n) {
      var pts = [], tours = 3.2, rot = Math.random() * TAU;
      for (var k = 0; k <= 44; k++) {
        var u = k / 44, ang = rot + u * TAU * tours, ray = 15 * (.25 + .75 * Math.sin(u * Math.PI)) + (Math.random() - .5) * 4;
        pts.push([Math.cos(ang) * ray, Math.sin(ang) * ray * .8]);
      }
      return { x: n[0], y: n[1], pv: 1, vivant: true, pts: pts, pal: n[0] === 694 ? 1 : 0, secoue: 0 };
    });
  }

  // couleurs mélangées, gardées en cache
  var CACHE = {};
  function hex(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function teinte(pal, ton, niv) {
    var k = pal * 100 + ton * 10 + niv;
    if (CACHE[k]) return CACHE[k];
    var a = hex(PAL[pal].t[ton]), b = hex(PAL[pal].c[ton]), u = niv / 5;
    return (CACHE[k] = 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * u) + ',' + Math.round(a[1] + (b[1] - a[1]) * u) + ',' + Math.round(a[2] + (b[2] - a[2]) * u) + ')');
  }
  function ecart(b, a) { var d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
  function melange(a, b, u) { return a + ecart(b, a) * u; }
  function distSeg(px, py, x0, y0, dx, dy, d2) {
    var u = ((px - x0) * dx + (py - y0) * dy) / d2; u = u < 0 ? 0 : u > 1 ? 1 : u;
    return Math.hypot(px - (x0 + u * dx), py - (y0 + u * dy));
  }

  /* ---------- le coup de brosse ---------- */
  function brosse(x0, y0, x1, y1, force) {
    var dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy);
    if (d < .5) return;
    var R = 58, ab = Math.atan2(dy, dx), pas = Math.min(d, 45), now = performance.now(), d2 = d * d;
    var gx0 = Math.floor((Math.min(x0, x1) - R) / CELL), gx1 = Math.floor((Math.max(x0, x1) + R) / CELL);
    var gy0 = Math.floor((Math.min(y0, y1) - R) / CELL), gy1 = Math.floor((Math.max(y0, y1) + R) / CELL);
    for (var gx = gx0; gx <= gx1; gx++) for (var gy = gy0; gy <= gy1; gy++) {
      var cel = grille[cle(gx, gy)];
      if (!cel) continue;
      for (var i = 0; i < cel.length; i++) {
        var p = cel[i], ds = distSeg(p.x, p.y, x0, y0, dx, dy, d2);
        if (ds >= R) continue;
        var w = 1 - ds / R; w = w * w * (3 - 2 * w);
        p.c = Math.min(1, p.c + w * pas * .0105 * force);
        p.aB = ab; p.tB = now;
      }
    }
    noeuds.forEach(function (n) {
      if (!n.vivant) return;
      var ds = distSeg(n.x, n.y, x0, y0, dx, dy, d2);
      if (ds < 50) {
        n.pv -= (1 - ds / 50) * pas * .0075 * force;
        n.secoue = 1;
        if (n.pv <= 0) saute(n);
      }
    });
    angBrosse = melange(angBrosse, ab + Math.PI, .25);
    dernierCoup = now;
    if (!dejaBrosse) { dejaBrosse = true; if (astuce) astuce.classList.add('cache'); }
    bilan();
    reveille();
  }

  function saute(n) {
    n.vivant = false;
    for (var i = 0; i < 12; i++) {
      var a = Math.random() * TAU, v = 140 + Math.random() * 220;
      miettes.push({ x: n.x, y: n.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 140, a: Math.random() * TAU, va: (Math.random() - .5) * 14, t: 0, pal: n.pal, l: 10 + Math.random() * 10 });
    }
    textes.push({ x: n.x, y: n.y - 24, t: 0, txt: ['pop !', 'zip !', 'hop !', 'tchac !'][(Math.random() * 4) | 0] });
  }

  function bilan() {
    var somme = 0;
    for (var i = 0; i < poils.length; i++) somme += poils[i].c;
    couverture = poils.length ? somme / poils.length : 0;
    var restants = noeuds.filter(function (n) { return n.vivant; }).length;
    var prog = fini ? 1 : Math.min(.99, couverture * .72 + (1 - restants / noeuds.length) * .28);
    var p = Math.floor(prog * 100);
    if (p !== pct) {
      pct = p;
      if (jaugeTxt) jaugeTxt.textContent = p + ' %';
      if (jauge) jauge.style.width = p + '%';
    }
    if (noeudsTxt) noeudsTxt.textContent = restants === 0 ? 'Plus aucun nœud !' : restants + (restants > 1 ? ' nœuds à défaire' : ' nœud à défaire');
    if (!fini && restants === 0 && couverture > .84) termine();
  }

  function termine() {
    fini = true; tFini = performance.now();
    pct = -1; bilan();
    etoiles = [];
    for (var i = 0; i < 16; i++) {
      var a = Math.random() * TAU, r = 1 + Math.random() * .25;
      etoiles.push({ x: 540 + Math.cos(a) * 380 * r, y: 300 + Math.sin(a) * 230 * r, t0: Math.random() * 1.2, taille: 8 + Math.random() * 12 });
    }
    if (fin) fin.hidden = false;
    if (astuce) astuce.classList.add('cache');
    reveille();
  }

  function recommence() {
    auto = null;
    fini = false;
    poils.forEach(ebouriffe);
    creeNoeuds();
    miettes = []; textes = []; etoiles = [];
    if (fin) fin.hidden = true;
    pct = -1; bilan();
    reveille();
  }

  /* ---------- l'animation ---------- */
  function image(t) {
    if (!actif) return;
    var dt = Math.min(.05, (t - (tPrec || t)) / 1000); tPrec = t;
    var k = 1 - Math.pow(.78, dt * 60), mouvement = 0;

    // brossage automatique : une brosse virtuelle suit un chemin
    if (auto) {
      var reste = 2400 * dt;
      while (reste > 0 && auto.i < auto.chemin.length - 1) {
        var A = auto.pos, B = auto.chemin[auto.i + 1], dd = Math.hypot(B[0] - A[0], B[1] - A[1]);
        if (dd <= reste) { brosse(A[0], A[1], B[0], B[1], 2.2); auto.pos = [B[0], B[1]]; auto.i++; reste -= dd; }
        else {
          var u = reste / dd, P = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u];
          brosse(A[0], A[1], P[0], P[1], 2.2); auto.pos = P; reste = 0;
        }
      }
      if (auto.i >= auto.chemin.length - 1) { auto = null; if (!fini) termine(); }
    }

    for (var i = 0; i < poils.length; i++) {
      var p = poils[i];
      if (fini && p.c < 1) p.c = Math.min(1, p.c + dt * .9);
      var sc = p.c * p.c * (3 - 2 * p.c);
      var cible = melange(p.aT, p.aC, sc);
      var frais = 1 - (t - p.tB) / 450;
      if (frais > 0) cible = melange(cible, p.aB, .7 * frais);
      var da = ecart(cible, p.a); p.a += da * k;
      var dk = (p.kT + (p.kC - p.kT) * sc) - p.k; p.k += dk * k;
      var m = Math.abs(da) + Math.abs(dk);
      if (m > mouvement) mouvement = m;
    }
    for (var j = miettes.length - 1; j >= 0; j--) {
      var mi = miettes[j];
      mi.t += dt; mi.vy += 620 * dt; mi.x += mi.vx * dt; mi.y += mi.vy * dt; mi.a += mi.va * dt;
      if (mi.t > .9) miettes.splice(j, 1);
    }
    for (var q = textes.length - 1; q >= 0; q--) { textes[q].t += dt; if (textes[q].t > 1) textes.splice(q, 1); }
    noeuds.forEach(function (n) { n.secoue = Math.max(0, n.secoue - dt * 4); });

    dessine(t);

    var heureux = t - dernierCoup < 700;
    var continuer = mouvement > .002 || miettes.length || textes.length || heureux || fini || auto || (!dejaBrosse && !calme) || Math.abs(angleQueue) > .002;
    if (continuer && enVue) requestAnimationFrame(image);
    else actif = false;
  }
  function reveille() {
    if (actif || !enVue) { if (!enVue) dessine(performance.now()); return; }
    actif = true; tPrec = 0;
    requestAnimationFrame(image);
  }

  /* ---------- le dessin ---------- */
  function rondRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function table() {
    var bas = (ch - oy) / s + 10;
    ctx.fillStyle = 'rgba(44,60,74,.16)';
    ctx.beginPath(); ctx.ellipse(480, 566, 330, 16, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2c3c4a';
    ctx.fillRect(214, 578, 20, bas - 578); ctx.fillRect(766, 578, 20, bas - 578);
    ctx.fillStyle = '#46596a'; rondRect(130, 560, 740, 24, 12); ctx.fill();
    ctx.fillStyle = '#b4573a'; rondRect(170, 553, 660, 12, 6); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(150, 563, 700, 3);
  }
  function dessine(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * ox, dpr * oy);
    table();

    var heureux = t - dernierCoup < 700;
    var cibleQ = fini ? Math.sin(t / 110) * .22 : (heureux ? Math.sin(t / 150) * .1 : 0);
    angleQueue += (cibleQ - angleQueue) * .2;
    var cq = Math.cos(angleQueue), sq = Math.sin(angleQueue);
    var lw = Math.max(1.15 / s, 2.4);
    ctx.lineCap = 'round';

    for (var zi = 0; zi < ZONES.length; zi++) {
      var z = ZONES[zi], liste = parZone[zi], enQueue = !!z.queue;
      // sous-couche de la zone
      ctx.save();
      if (enQueue) { ctx.translate(PQ.x, PQ.y); ctx.rotate(angleQueue); ctx.translate(-PQ.x, -PQ.y); }
      ctx.fillStyle = teinte(z.pal, 1, Math.round(couverture * 4));
      ctx.beginPath(); ctx.ellipse(z.x, z.y, z.rx * .84, z.ry * .84, z.rot || 0, 0, TAU); ctx.fill();
      ctx.restore();
      // les poils, groupés par teinte
      var groupes = {};
      for (var i = 0; i < liste.length; i++) {
        var p = liste[i], g = p.ton * 6 + Math.round(p.c * 5);
        (groupes[g] || (groupes[g] = [])).push(p);
      }
      ctx.lineWidth = lw;
      for (var cleG in groupes) {
        var gr = groupes[cleG], cg = +cleG;
        ctx.strokeStyle = teinte(z.pal, (cg / 6) | 0, cg % 6);
        ctx.beginPath();
        for (var j = 0; j < gr.length; j++) {
          var q = gr[j], x = q.x, y = q.y, a = q.a;
          if (enQueue) { var rx = x - PQ.x, ry = y - PQ.y; x = PQ.x + rx * cq - ry * sq; y = PQ.y + rx * sq + ry * cq; a += angleQueue; }
          var ca = Math.cos(a), sa = Math.sin(a), l = q.l, kk = q.k * l * .5;
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + ca * l * .5 - sa * kk, y + sa * l * .5 + ca * kk, x + ca * l, y + sa * l);
        }
        ctx.stroke();
      }
    }

    // les nœuds
    noeuds.forEach(function (n) {
      if (!n.vivant) return;
      var e = .45 + .55 * Math.max(0, n.pv), sx = n.secoue ? Math.sin(t / 22) * 3 * n.secoue : 0;
      ctx.save();
      ctx.translate(n.x + sx, n.y);
      ctx.scale(e, e);
      ctx.strokeStyle = n.pal ? '#7d5232' : '#9a7650';
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      n.pts.forEach(function (pt, i) { if (i) ctx.lineTo(pt[0], pt[1]); else ctx.moveTo(pt[0], pt[1]); });
      ctx.stroke();
      ctx.strokeStyle = n.pal ? '#a46b3e' : '#b8966d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (var k = 0; k < 7; k++) { var a = k * .9 + 1; ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 10); ctx.lineTo(Math.cos(a + .5) * 22, Math.sin(a + .5) * 18); }
      ctx.stroke();
      ctx.restore();
    });

    visage(t, heureux || fini);
    if (fini) noeudRuban(t);

    // touffes qui s'envolent et petits « pop ! »
    ctx.lineWidth = 3;
    miettes.forEach(function (m) {
      ctx.globalAlpha = 1 - m.t / .9;
      ctx.strokeStyle = teinte(m.pal, 0, 0);
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.quadraticCurveTo(m.x + Math.cos(m.a) * m.l * .5 + 4, m.y + Math.sin(m.a) * m.l * .5, m.x + Math.cos(m.a) * m.l, m.y + Math.sin(m.a) * m.l);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    textes.forEach(function (x) {
      ctx.globalAlpha = 1 - x.t;
      ctx.font = '400 34px "Gochi Hand", cursive';
      ctx.fillStyle = '#b4573a';
      ctx.fillText(x.txt, x.x, x.y - x.t * 50);
    });
    ctx.globalAlpha = 1;

    // étoiles du brushing parfait
    if (fini) {
      var dtF = (t - tFini) / 1000;
      etoiles.forEach(function (e) {
        var v = dtF - e.t0;
        if (v < 0) return;
        var al = v < .4 ? v / .4 : .55 + .45 * Math.sin(v * 3 + e.t0 * 5);
        etoile(e.x, e.y, e.taille * (v < .4 ? .5 + v * 1.25 : 1), al);
      });
    }

    // la brosse : celle du visiteur, celle du mode automatique, ou l'indice du début
    if (auto) dessineBrosse(auto.pos[0], auto.pos[1], angBrosse, 1);
    else if (pointeur) dessineBrosse(pointeur.x, pointeur.y, angBrosse, 1);
    else if (!dejaBrosse && !calme) {
      var u = t / 1000;
      var hx = 470 + Math.sin(u * 1.4) * 170, hy = 370 + Math.sin(u * 2.8) * 26;
      // le manche suit la brosse : à gauche quand elle va vers la droite, et inversement
      dessineBrosse(hx, hy, (Math.cos(u * 1.4) > 0 ? Math.PI : 0) + Math.sin(u * 2.8) * .15, .5);
    }
  }

  function visage(t, heureux) {
    ctx.save();
    ctx.lineCap = 'round';
    if (heureux) {
      ctx.strokeStyle = '#2c3c4a'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(792, 208, 13, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
      ctx.fillStyle = 'rgba(232,129,110,.38)';
      ctx.beginPath(); ctx.ellipse(816, 238, 20, 11, 0, 0, TAU); ctx.fill();
    } else {
      var cligne = (t % 4300) < 130;
      ctx.fillStyle = '#2c3c4a';
      ctx.beginPath(); ctx.ellipse(792, 200, 11.5, cligne ? 2 : 13.5, 0, 0, TAU); ctx.fill();
      if (!cligne) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(796, 194, 4.2, 0, TAU); ctx.fill(); }
    }
    // truffe
    ctx.fillStyle = '#2c3c4a';
    ctx.beginPath(); ctx.ellipse(902, 226, 20, 15, -.15, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath(); ctx.ellipse(896, 220, 6, 3.4, -.3, 0, TAU); ctx.fill();
    // bouche, et la langue quand il est content
    if (heureux) {
      ctx.fillStyle = '#e07f78';
      ctx.beginPath(); ctx.ellipse(884, 268, 9, 12, .15, 0, TAU); ctx.fill();
    }
    ctx.strokeStyle = '#2c3c4a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(899, 241); ctx.quadraticCurveTo(896, 262, 870, 261); ctx.stroke();
    ctx.restore();
  }
  function noeudRuban(t) {
    var v = Math.min(1, (t - tFini) / 500), e = v < 1 ? 1.25 * Math.sin(v * Math.PI * .75) / Math.sin(Math.PI * .75) : 1;
    e = Math.max(0, Math.min(1.25, e));
    ctx.save();
    ctx.translate(740, 84); ctx.scale(e, e); ctx.rotate(Math.sin(t / 400) * .05);
    ctx.fillStyle = '#b4573a'; ctx.strokeStyle = '#7c3622'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-30, -26, -36, 0); ctx.quadraticCurveTo(-30, 24, 0, 0); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -26, 36, 0); ctx.quadraticCurveTo(30, 24, 0, 0); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-4, 4); ctx.lineTo(-14, 26); ctx.moveTo(4, 4); ctx.lineTo(16, 24); ctx.stroke();
    ctx.fillStyle = '#d97a5b'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function etoile(x, y, r, al) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, al));
    ctx.translate(x, y);
    ctx.fillStyle = '#f1d68b';
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4, rr = i % 2 ? r * .32 : r;
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function dessineBrosse(x, y, ang, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y); ctx.rotate(ang);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2c3c4a'; ctx.lineWidth = 4;
    ctx.fillStyle = '#fffdf9'; rondRect(20, -8, 70, 16, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#c98544'; rondRect(-30, -26, 54, 52, 13); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2c3c4a';
    for (var bx = -20; bx <= 14; bx += 8.5) for (var by = -16; by <= 16; by += 8) { ctx.beginPath(); ctx.arc(bx, by, 1.9, 0, TAU); ctx.fill(); }
    ctx.restore();
  }

  /* ---------- mesures ---------- */
  function mesure() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cw = canvas.clientWidth; ch = canvas.clientHeight;
    if (!cw || !ch) return;
    canvas.width = Math.round(cw * dpr); canvas.height = Math.round(ch * dpr);
    // sur petit écran, on cadre plus serré autour du chien
    var serre = cw < 600, vx = serre ? 110 : 0, vy = serre ? 46 : 0, vw = serre ? 840 : DW, vh = serre ? 560 : DH;
    s = Math.min(cw / vw, ch / vh);
    ox = (cw - vw * s) / 2 - vx * s; oy = (ch - vh * s) * .85 - vy * s;
    dessine(performance.now());
  }
  function versDessin(e) {
    var r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left - ox) / s, y: (e.clientY - r.top - oy) / s };
  }

  /* ---------- la souris brosse au survol, le doigt en glissant ---------- */
  canvas.addEventListener('pointerdown', function (e) {
    if (auto) return;
    appuye = true;
    pointeur = dernier = versDessin(e);
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* rien */ }
    reveille();
  });
  canvas.addEventListener('pointermove', function (e) {
    if (auto) return;
    var p = versDessin(e);
    pointeur = p;
    if ((e.pointerType === 'mouse' || appuye) && dernier) brosse(dernier.x, dernier.y, p.x, p.y, 1);
    dernier = p;
    reveille();
  });
  function relache(e) {
    appuye = false;
    if (e.pointerType !== 'mouse') { pointeur = null; dernier = null; }
    reveille();
  }
  canvas.addEventListener('pointerup', relache);
  canvas.addEventListener('pointercancel', relache);
  canvas.addEventListener('pointerleave', function () { pointeur = null; dernier = null; appuye = false; reveille(); });

  if (btnAuto) btnAuto.addEventListener('click', function () {
    if (fini) recommence();
    if (calme) {
      poils.forEach(function (p) { p.c = 1; p.a = p.aC; p.k = p.kC; });
      noeuds.forEach(function (n) { n.vivant = false; });
      termine(); dessine(performance.now());
      return;
    }
    var chemin = [];
    for (var y = 104, sens = 1; y <= 560; y += 34, sens = -sens) {
      chemin.push(sens > 0 ? [130, y] : [940, y]);
      chemin.push(sens > 0 ? [940, y] : [130, y]);
    }
    auto = { chemin: chemin, i: 0, pos: chemin[0].slice() };
    if (!dejaBrosse) { dejaBrosse = true; if (astuce) astuce.classList.add('cache'); }
    reveille();
  });
  document.querySelectorAll('[data-reset]').forEach(function (b) { b.addEventListener('click', recommence); });

  creePoils();
  creeNoeuds();
  mesure();
  bilan();
  if ('ResizeObserver' in window) new ResizeObserver(mesure).observe(canvas);
  else window.addEventListener('resize', mesure);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      enVue = es[0].isIntersecting;
      if (enVue) reveille(); else actif = false;
    }, { rootMargin: '60px 0px' }).observe(canvas);
  } else { enVue = true; reveille(); }
  // la police manuscrite des « pop ! » peut arriver après le premier dessin
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { dessine(performance.now()); });
})();
