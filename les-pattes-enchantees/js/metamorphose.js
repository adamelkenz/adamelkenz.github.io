/* Les Pattes Enchantées — la métamorphose : on toilette le chien ébouriffé avec la baguette magique.
   La baguette suit la souris (ou le doigt), efface le pelage sale dans un masque SVG, fait voler boue, poils,
   bulles et étoiles selon l'étape ; à la fin le chien s'ébroue, les étoiles tourbillonnent, pouf ! il est
   tout propre et un chapeau de sorcière lui tombe sur la tête. */
(function () {
  var scene = document.querySelector('[data-scene]');
  if (!scene) return;
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var svg = scene.querySelector('svg.chien'), traces = svg.querySelector('[data-traces]');
  var corps = svg.querySelector('[data-corps]');
  var pupilles = [].slice.call(svg.querySelectorAll('[data-pupilles]'));
  var paupieres = [].slice.call(svg.querySelectorAll('[data-paupiere]'));
  var mouche = svg.querySelector('[data-mouche]');
  var baguette = scene.querySelector('[data-baguette]');
  var cv = scene.querySelector('[data-scene-canvas]'), ctx = cv.getContext('2d');
  var astuce = scene.querySelector('[data-astuce]'), tadaa = scene.querySelector('[data-tadaa]');
  var jauge = document.querySelector('[data-jauge]'), jaugeTxt = document.querySelector('[data-jauge-texte]');
  var etats = [].slice.call(document.querySelectorAll('[data-etats] li'));
  var btnSort = document.querySelector('[data-sort]'), btnEncore = document.querySelector('[data-encore]');
  var NS = 'http://www.w3.org/2000/svg', RAYON = 30, PAS = 12, SEUIL = .6;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  tadaa.setAttribute('role', 'status');
  if (!calme) scene.classList.add('baguette-active');

  /* ---------- la grille du pelage à brosser ---------- */
  var formes = [].slice.call(svg.querySelectorAll('.hirsute path')).filter(function (p) {
    var f = p.getAttribute('fill'); return f && f !== 'none' && f.charAt(0) === '#' && p.closest('g[stroke="none"]') === null;
  });
  var boites = formes.map(function (p) { return p.getBBox(); });
  var cases = [];
  for (var y = 60; y < 430; y += PAS) {
    for (var x = 70; x < 380; x += PAS) {
      var dedans = formes.some(function (p, i) {
        var b = boites[i];
        if (x < b.x || x > b.x + b.width || y < b.y || y > b.y + b.height) return false;
        try { return p.isPointInFill(new DOMPoint(x, y)); }
        catch (e) { var pt = svg.createSVGPoint(); pt.x = x; pt.y = y; return p.isPointInFill(pt); }
      });
      if (dedans) cases.push({ x: x, y: y, ok: false });
    }
  }
  var brossees = 0, fini = false, enCours = false, dernier = null, minuteurs = [];

  /* ---------- géométrie ---------- */
  var W = 0, H = 0, rect = null;
  function majRect() { rect = scene.getBoundingClientRect(); }
  function svgVersScene(x, y) {
    var m = svg.getScreenCTM(); if (!rect) majRect();
    return { x: m.a * x + m.c * y + m.e - rect.left, y: m.b * x + m.d * y + m.f - rect.top };
  }
  function sceneVersSvg(x, y) {
    if (!rect) majRect();
    var pt = svg.createSVGPoint(); pt.x = x + rect.left; pt.y = y + rect.top;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }
  function taille(w, h) {
    W = w; H = h; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); majRect();
  }
  if ('ResizeObserver' in window) new ResizeObserver(function (es) { var r = es[0].contentRect; taille(r.width + 0, r.height + 0); }).observe(scene);
  else taille(scene.offsetWidth, scene.offsetHeight);
  window.addEventListener('scroll', function () { rect = null; }, { passive: true });
  window.addEventListener('resize', function () { rect = null; });

  /* ---------- progression ---------- */
  function progression() { return cases.length ? brossees / cases.length / SEUIL : 1; }
  function maj() {
    var pct = fini ? 100 : Math.min(100, Math.round(progression() * 100));
    jauge.style.setProperty('--v', pct / 100);
    jauge.setAttribute('aria-valuenow', pct);
    jaugeTxt.textContent = pct;
    etats.forEach(function (li) { li.classList.toggle('fait', pct >= +li.getAttribute('data-seuil')); });
    svg.style.setProperty('--entrain', Math.min(1, pct / 100).toFixed(2));
    if (!enCours && pct >= 100) termine();
  }

  /* ---------- particules ---------- */
  var parts = [];
  function ajoute(o) { if (calme) return; if (parts.length > 320) parts.shift(); o.age = 0; o.rot = o.rot || Math.random() * 6; parts.push(o); }
  function hasard(a, b) { return a + Math.random() * (b - a); }
  var STYLES = {
    boue: function (x, y) { ajoute({ t: 'boue', x: x, y: y, vx: hasard(-2.5, 2.5), vy: hasard(-4, -1.5), g: .28, r: hasard(2, 4.5), vie: 55 }); },
    poil: function (x, y) { ajoute({ t: 'poil', x: x, y: y, vx: hasard(-1.5, 1.5), vy: hasard(-2, -.5), g: .05, r: hasard(7, 12), vr: hasard(-.15, .15), vie: 80, c: Math.random() < .5 ? '#cdbca3' : '#b9a68c' }); },
    bulle: function (x, y) { ajoute({ t: 'bulle', x: x, y: y, vx: hasard(-.8, .8), vy: hasard(-2.2, -.8), g: -.01, r: hasard(4, 11), vie: hasard(50, 90), ph: Math.random() * 6 }); },
    etoile: function (x, y, fort) { var a = Math.random() * 6.3, v = hasard(1, fort ? 6 : 3); ajoute({ t: 'etoile', x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, g: .06, r: hasard(4, fort ? 10 : 7), vr: hasard(-.2, .2), vie: hasard(40, 70), c: ['#ffd27a', '#f07c1b', '#fff3df', '#ffb35c'][(Math.random() * 4) | 0] }); },
    goutte: function (x, y) { var a = Math.random() * 6.3, v = hasard(4, 9); ajoute({ t: 'goutte', x: x + Math.cos(a) * 50, y: y + Math.sin(a) * 70, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, g: .32, r: hasard(2.5, 5), vie: 45 }); },
    coeur: function (x, y) { ajoute({ t: 'coeur', x: x, y: y, vx: hasard(-.6, .6), vy: hasard(-2.2, -1.2), g: -.005, r: hasard(7, 13), vie: 100, ph: Math.random() * 6, c: Math.random() < .6 ? '#ff7f9a' : '#f07c1b' }); },
    spirale: function (cx, cy, i, n) { ajoute({ t: 'spirale', cx: cx, cy: cy, a: i / n * Math.PI * 2, d: Math.max(W, H) * hasard(.45, .6), r: hasard(4, 8), vie: 999, c: i % 3 ? '#ffd27a' : '#f07c1b' }); }
  };
  function etoile(r) {
    ctx.beginPath();
    for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4, rr = i % 2 ? r * .34 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
  }
  function coeur(r) {
    ctx.beginPath(); ctx.moveTo(0, r * .35);
    ctx.bezierCurveTo(-r * 1.1, -r * .45, -r * .45, -r * 1.2, 0, -r * .5);
    ctx.bezierCurveTo(r * .45, -r * 1.2, r * 1.1, -r * .45, 0, r * .35);
    ctx.fill();
  }
  function dessineParts() {
    ctx.clearRect(0, 0, W, H);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i]; p.age++;
      if (p.t === 'spirale') {
        p.a += .16; p.d *= .935;
        p.x = p.cx + Math.cos(p.a) * p.d; p.y = p.cy + Math.sin(p.a) * p.d * .8;
        if (p.d < 8) { parts.splice(i, 1); continue; }
      } else {
        if (p.age > p.vie) { parts.splice(i, 1); continue; }
        p.vx *= .98; p.vy = p.vy * .98 + p.g; p.x += p.vx; p.y += p.vy;
        if (p.vr) p.rot += p.vr;
      }
      var k = p.t === 'spirale' ? 1 : 1 - p.age / p.vie;
      ctx.save(); ctx.translate(p.x, p.y);
      switch (p.t) {
        case 'boue':
          ctx.globalAlpha = Math.min(1, k * 2); ctx.fillStyle = '#7a5a3e';
          ctx.beginPath(); ctx.arc(0, 0, p.r, 0, 7); ctx.fill(); break;
        case 'poil':
          ctx.globalAlpha = Math.min(1, k * 2); ctx.rotate(p.rot); ctx.strokeStyle = p.c; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-p.r / 2, 0); ctx.quadraticCurveTo(0, -p.r / 3, p.r / 2, 0); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(-p.r / 2, 3); ctx.quadraticCurveTo(0, -p.r / 3 + 3, p.r / 2, 3); ctx.stroke(); break;
        case 'bulle':
          var pop = p.age > p.vie - 6 ? 1 + (p.age - p.vie + 6) * .12 : 1;
          ctx.translate(Math.sin(p.age * .12 + p.ph) * 4, 0); ctx.globalAlpha = p.age > p.vie - 6 ? k * 4 : .9;
          ctx.fillStyle = 'rgba(190, 225, 255, .18)'; ctx.strokeStyle = 'rgba(255, 255, 255, .85)'; ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.arc(0, 0, p.r * pop, 0, 7); ctx.fill(); ctx.stroke();
          ctx.fillStyle = 'rgba(255, 255, 255, .9)'; ctx.beginPath(); ctx.arc(-p.r * .35, -p.r * .35, p.r * .22, 0, 7); ctx.fill(); break;
        case 'etoile':
          ctx.globalAlpha = Math.min(1, k * 1.8) * (.7 + .3 * Math.sin(p.age * .6)); ctx.rotate(p.rot); ctx.fillStyle = p.c;
          etoile(p.r * (.4 + .6 * k)); break;
        case 'goutte':
          ctx.globalAlpha = Math.min(1, k * 2); ctx.rotate(Math.atan2(p.vy, p.vx)); ctx.fillStyle = '#bfe3ff';
          ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.8, p.r, 0, 0, 7); ctx.fill(); break;
        case 'coeur':
          ctx.translate(Math.sin(p.age * .08 + p.ph) * 6, 0); ctx.globalAlpha = Math.min(1, k * 2); ctx.fillStyle = p.c;
          coeur(p.r * Math.min(1, p.age / 12)); break;
        case 'spirale':
          ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.shadowColor = '#ffd27a'; ctx.shadowBlur = 10; etoile(p.r); break;
      }
      ctx.restore();
    }
  }
  function emetSelonEtape(x, y) {
    if (calme) return;
    var p = progression();
    if (p < .3) { STYLES.boue(x, y); if (Math.random() < .7) STYLES.poil(x, y); if (Math.random() < .3) STYLES.boue(x, y); }
    else if (p < .55) { STYLES.bulle(x, y); if (Math.random() < .5) STYLES.bulle(x, y); }
    else if (p < .8) { STYLES.etoile(x, y); if (Math.random() < .4) STYLES.bulle(x, y); }
    else { STYLES.etoile(x, y); STYLES.etoile(x, y); if (Math.random() < .12) STYLES.coeur(x, y); }
  }

  /* ---------- le brossage ---------- */
  var ressort = { a: 0, v: 0 };
  function brosse(sx, sy) {
    if (fini || enCours) return;
    var p = sceneVersSvg(sx, sy);
    if (dernier && Math.hypot(p.x - dernier.x, p.y - dernier.y) < 9) return;
    var dx = dernier ? p.x - dernier.x : 0;
    dernier = { x: p.x, y: p.y };
    var c = document.createElementNS(NS, 'circle');
    c.setAttribute('cx', p.x.toFixed(1)); c.setAttribute('cy', p.y.toFixed(1)); c.setAttribute('r', RAYON);
    traces.appendChild(c);
    var nouvelles = 0;
    for (var i = 0; i < cases.length; i++) {
      var k = cases[i];
      if (!k.ok && (k.x - p.x) * (k.x - p.x) + (k.y - p.y) * (k.y - p.y) <= RAYON * RAYON) { k.ok = true; brossees++; nouvelles++; }
    }
    if (nouvelles) { emetSelonEtape(sx, sy); ressort.v += Math.max(-1.2, Math.min(1.2, dx * .05)); }
    else if (Math.random() < .3) STYLES.etoile(sx, sy);
    astuce.classList.add('cache');
    maj();
  }

  /* ---------- la baguette ---------- */
  var mode = 'demo', bg = { x: 0, y: 0, tx: 0, ty: 0, rot: 0, montree: false }, appuye = false, cacheBaguette;
  function montreBaguette(oui) { bg.montree = oui; scene.classList.toggle('baguette-visible', oui); }
  function posePointeur(e) {
    if (!rect) majRect();
    bg.tx = e.clientX - rect.left; bg.ty = e.clientY - rect.top;
  }
  function premierContact() {
    if (mode === 'demo') { mode = 'main'; bg.x = bg.tx; bg.y = bg.ty; }
  }
  scene.addEventListener('pointerenter', function (e) {
    if (e.pointerType !== 'mouse' || calme || mode === 'auto') return;
    posePointeur(e); premierContact(); montreBaguette(true);
  });
  scene.addEventListener('pointerleave', function (e) {
    dernier = null;
    if (e.pointerType === 'mouse' && mode === 'main') montreBaguette(false);
  });
  svg.addEventListener('pointerdown', function (e) {
    if (mode === 'auto') return;
    appuye = true;
    if (svg.setPointerCapture) svg.setPointerCapture(e.pointerId);
    posePointeur(e); premierContact();
    if (!calme) { clearTimeout(cacheBaguette); montreBaguette(true); bg.x = bg.tx; bg.y = bg.ty; }
    brosse(bg.tx, bg.ty);
  });
  scene.addEventListener('pointermove', function (e) {
    if (mode === 'auto') return;
    if (e.pointerType !== 'mouse' && !appuye) return;
    posePointeur(e); premierContact();
    if (!calme && e.pointerType === 'mouse') montreBaguette(true);
    if (svg.contains(e.target) || appuye) brosse(bg.tx, bg.ty);
    else dernier = null;
  });
  ['pointerup', 'pointercancel'].forEach(function (t) {
    svg.addEventListener(t, function (e) {
      appuye = false; dernier = null;
      if (e.pointerType !== 'mouse' && mode === 'main') { clearTimeout(cacheBaguette); cacheBaguette = setTimeout(function () { montreBaguette(false); }, 700); }
    });
  });

  /* ---------- le bouton : la baguette fait le tour du chien toute seule ---------- */
  var chemin = [], etapeChemin = 0;
  btnSort.addEventListener('click', function () {
    if (fini || enCours || mode === 'auto') return;
    if (calme) { termine(); return; }
    chemin = [];
    var ligne = 0;
    for (var yy = 84; yy <= 412; yy += 36, ligne++) {
      var g = 84 + (ligne % 2) * 8, d = 330 - (ligne % 2) * 8;
      chemin.push(ligne % 2 ? [d, yy] : [g, yy], ligne % 2 ? [g, yy] : [d, yy]);
    }
    chemin = chemin.map(function (p) { return svgVersScene(p[0], p[1]); });
    etapeChemin = 0; mode = 'auto'; dernier = null;
    bg.x = chemin[0].x - 60; bg.y = chemin[0].y - 60; bg.tx = bg.x; bg.ty = bg.y;
    montreBaguette(true); astuce.classList.add('cache');
  });

  /* ---------- la grande transformation ---------- */
  function plus(ms, f) { minuteurs.push(setTimeout(f, ms)); }
  function termine() {
    if (enCours || fini) return;
    enCours = true;
    var avaitFocus = document.activeElement === btnSort;
    astuce.classList.add('cache');
    btnSort.disabled = true;
    var centre = function () { return svgVersScene(200, 270); };
    var finale = function () {
      fini = true; enCours = false; btnSort.disabled = false;
      tadaa.hidden = false;
      btnSort.hidden = true; btnEncore.hidden = false;
      if (avaitFocus) btnEncore.focus();
      maj();
    };
    if (calme) {
      svg.classList.add('fini', 'chapeau'); scene.classList.add('fini');
      if (mode === 'auto') { mode = 'main'; montreBaguette(false); }
      finale(); return;
    }
    if (mode === 'auto') { mode = 'main'; montreBaguette(false); }
    // 1. il s'ébroue : les gouttes volent
    svg.classList.add('ebroue');
    var c = centre();
    for (var i = 0; i < 6; i++) plus(i * 90, function () { for (var j = 0; j < 7; j++) STYLES.goutte(c.x, c.y); });
    // 2. les étoiles tourbillonnent autour de lui
    plus(650, function () { svg.classList.remove('ebroue'); var c2 = centre(); for (var j = 0; j < 34; j++) STYLES.spirale(c2.x, c2.y, j, 34); });
    // 3. pouf ! éclair et nuage de fumée
    plus(1450, function () {
      svg.classList.add('pouf');
      var c3 = centre();
      for (var j = 0; j < 30; j++) STYLES.etoile(c3.x, c3.y, true);
      if (window.Magie && rect) window.Magie.eclat(c3.x + rect.left, c3.y + rect.top, 26);
    });
    plus(1560, function () { svg.classList.add('fini'); scene.classList.add('fini'); });
    // 4. le chapeau de sorcière tombe sur sa tête
    plus(2050, function () { svg.classList.add('chapeau'); });
    plus(2700, function () {
      var t = svgVersScene(250, 60);
      for (var j = 0; j < 12; j++) STYLES.etoile(t.x, t.y);
      var c4 = centre(); for (var h = 0; h < 7; h++) STYLES.coeur(c4.x + hasard(-90, 90), c4.y + hasard(-40, 60));
      finale();
    });
  }

  function recommence() {
    minuteurs.forEach(clearTimeout); minuteurs = [];
    fini = false; enCours = false; brossees = 0; dernier = null; parts = [];
    cases.forEach(function (k) { k.ok = false; });
    while (traces.firstChild) traces.removeChild(traces.firstChild);
    svg.classList.remove('fini', 'chapeau', 'pouf', 'ebroue'); scene.classList.remove('fini');
    tadaa.hidden = true; astuce.classList.remove('cache');
    btnSort.hidden = false; btnSort.disabled = false; btnEncore.hidden = true;
    mode = 'main';
    maj();
    btnSort.focus();
  }
  btnEncore.addEventListener('click', recommence);

  /* ---------- l'animation (tourne seulement quand la scène est visible) ---------- */
  var visible = false, boucle = 0, t0 = performance.now(), clignote = t0 + 2500, regard = { x: 0, y: 0 }, mo = { x: 290, y: 110 };
  function tick(now) {
    boucle = 0;
    var t = (now - t0) / 1000;

    // la baguette
    if (mode === 'demo' && !calme) {
      // petite démonstration : elle danse au-dessus du chien
      var d = svgVersScene(200 + Math.sin(t * 1.1) * 120, 230 + Math.sin(t * 2.2) * 110);
      bg.tx = d.x; bg.ty = d.y; if (!bg.montree) { bg.x = d.x; bg.y = d.y; montreBaguette(true); }
      if (Math.random() < .35) STYLES.etoile(bg.x, bg.y);
    } else if (mode === 'auto') {
      var cible = chemin[etapeChemin];
      if (cible) {
        var vx = cible.x - bg.x, vy = cible.y - bg.y, dist = Math.hypot(vx, vy), pas = Math.max(9, W / 34);
        if (dist <= pas) { bg.x = cible.x; bg.y = cible.y; etapeChemin++; }
        else { bg.x += vx / dist * pas; bg.y += vy / dist * pas; }
        bg.tx = bg.x; bg.ty = bg.y;
        brosse(bg.x, bg.y);
        if (Math.random() < .5) STYLES.etoile(bg.x, bg.y);
      } else { mode = 'main'; if (!fini && !enCours) termine(); }
    }
    var ax = bg.x, ay = bg.y;
    if (mode !== 'auto') { bg.x += (bg.tx - bg.x) * .45; bg.y += (bg.ty - bg.y) * .45; }
    var vit = bg.x - ax;
    bg.rot += (Math.max(-28, Math.min(28, vit * 2.2)) - bg.rot) * .2;
    baguette.style.transform = 'translate(' + bg.x.toFixed(1) + 'px,' + bg.y.toFixed(1) + 'px) rotate(' + bg.rot.toFixed(1) + 'deg)';

    // le chien gigote quand on le brosse (ressort amorti)
    ressort.v += -ressort.a * .12; ressort.v *= .82; ressort.a += ressort.v;
    ressort.a = Math.max(-7, Math.min(7, ressort.a));
    corps.setAttribute('transform', 'rotate(' + ressort.a.toFixed(2) + ' 200 410)');

    // ses yeux suivent la baguette
    var sv = bg.montree ? sceneVersSvg(bg.x, bg.y) : { x: 200 + Math.sin(t * .7) * 60, y: 170 };
    var ex = sv.x - 200, ey = sv.y - 166, l = Math.hypot(ex, ey) || 1, f = Math.min(3.4, l / 25);
    regard.x += (ex / l * f - regard.x) * .25; regard.y += (ey / l * f - regard.y) * .25;
    var tr = 'translate(' + regard.x.toFixed(2) + ' ' + regard.y.toFixed(2) + ')';
    pupilles.forEach(function (g) { g.setAttribute('transform', tr); });

    // il cligne des yeux de temps en temps
    if (now > clignote) {
      var k = (now - clignote) / 160;
      var h = k < 1 ? 24 * Math.sin(k * Math.PI) : 0;
      paupieres.forEach(function (r) { r.setAttribute('y', 154); r.setAttribute('height', h.toFixed(1)); });
      if (k >= 1) clignote = now + 2500 + Math.random() * 3000;
    }

    // la mouche tourne autour de sa tête… et fuit la baguette
    if (!fini) {
      var bx = 200 + Math.sin(t * 1.3) * 120 + Math.sin(t * 3.1) * 14, by = 120 + Math.sin(t * 2.1) * 40 + Math.cos(t * 4.3) * 10;
      if (bg.montree) {
        var fx = bx - sv.x, fy = by - sv.y, fd = Math.hypot(fx, fy);
        if (fd < 90) { bx += fx / (fd || 1) * (90 - fd); by += fy / (fd || 1) * (90 - fd); }
      }
      mo.x += (bx - mo.x) * .2; mo.y += (by - mo.y) * .2;
      var sens = Math.cos(t * 1.3) > 0 ? 1 : -1;
      mouche.setAttribute('transform', 'translate(' + mo.x.toFixed(1) + ' ' + mo.y.toFixed(1) + ') scale(' + sens + ' 1)');
    }

    dessineParts();
    if (visible || parts.length) boucle = requestAnimationFrame(tick);
  }
  function lance() { if (!boucle) boucle = requestAnimationFrame(tick); }

  if (calme) {
    mouche.setAttribute('transform', 'translate(290 110)');
    montreBaguette(false);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting; rect = null;
      if (visible && !calme) lance();
    }, { threshold: .15 }).observe(scene);
  } else if (!calme) { visible = true; lance(); }
  maj();
})();
