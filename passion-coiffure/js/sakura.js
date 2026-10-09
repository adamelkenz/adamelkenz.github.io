/* Passion Coiffure by Yasmine — le cerisier de l'accueil (dessiné à chaque visite, toujours le même)
   et la pluie de pétales qui traverse tout le site. */
(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROSES = ['#fbd3df', '#f8c2d3', '#fde4ec', '#f4a9c1', '#f9cad8', '#ee93b1', '#fff0f4'];

  /* ---------------- le cerisier ---------------- */
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.getElementById('sakura');
  var fleursPos = []; // positions des fleurs (repère du dessin) : les pétales s'en détachent

  function el(nom, attrs, parent) {
    var e = document.createElementNS(NS, nom);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  if (svg) {
    var graine = 11;
    var rnd = function () { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; };
    var entre = function (a, b) { return a + rnd() * (b - a); };

    var defs = el('defs', {}, svg);
    defs.innerHTML =
      '<linearGradient id="ecorce" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#7b4357"/><stop offset=".55" stop-color="#5e2f42"/><stop offset="1" stop-color="#8d5568"/></linearGradient>' +
      '<radialGradient id="ombre-sol"><stop offset="0" stop-color="#e79ab4" stop-opacity=".45"/><stop offset="1" stop-color="#e79ab4" stop-opacity="0"/></radialGradient>' +
      '<g id="fl"><path id="pt" d="M0 0C-5-3-7-10-3.6-14.5L0-12.2L3.6-14.5C7-10 5-3 0 0Z"/>' +
      '<use href="#pt" transform="rotate(72)"/><use href="#pt" transform="rotate(144)"/><use href="#pt" transform="rotate(216)"/><use href="#pt" transform="rotate(288)"/>' +
      '<circle r="2.6" fill="#fff6f8"/><g fill="#d4547f"><circle cx="0" cy="-4.2" r=".9"/><circle cx="4" cy="-1.3" r=".9"/><circle cx="2.5" cy="3.4" r=".9"/><circle cx="-2.5" cy="3.4" r=".9"/><circle cx="-4" cy="-1.3" r=".9"/></g></g>';

    if (calme) svg.classList.add('statique'); // arbre déjà en fleurs, sans pousse ni balancement
    el('ellipse', { cx: 320, cy: 604, rx: 230, ry: 20, fill: 'url(#ombre-sol)', class: 'sol' }, svg);
    var arbre = el('g', {}, svg);
    var MAX = 7, DEBUT = 0.3;

    var fleurir = function (parent, x, y, t, dense) {
      var n = dense ? Math.round(entre(4, 7)) : Math.round(entre(1, 3));
      for (var i = 0; i < n; i++) {
        var fx = x + entre(-16, 16), fy = y + entre(-14, 10), sc = entre(.55, 1.15);
        var g = el('g', { transform: 'translate(' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ') rotate(' + entre(0, 72).toFixed(0) + ') scale(' + sc.toFixed(2) + ')' }, parent);
        var u = el('use', { href: '#fl', class: 'fleur', fill: ROSES[Math.floor(rnd() * ROSES.length)] }, g);
        u.style.animationDelay = (t + entre(0, .6)).toFixed(2) + 's';
        fleursPos.push([fx, fy]);
      }
      if (rnd() < .6) { // un bouton plus foncé
        var gb = el('g', { transform: 'translate(' + (x + entre(-12, 12)).toFixed(1) + ' ' + (y + entre(-10, 8)).toFixed(1) + ')' }, parent);
        el('circle', { r: entre(2, 3.2).toFixed(1), fill: '#e2729a', class: 'bouton' }, gb).style.animationDelay = (t + .3).toFixed(2) + 's';
      }
    };

    var branche = function (parent, x, y, ang, lon, ep, prof, t) {
      var x2 = x + Math.cos(ang) * lon, y2 = y + Math.sin(ang) * lon;
      var dec = entre(-.2, .2) * lon;
      var cx = (x + x2) / 2 + Math.cos(ang + Math.PI / 2) * dec, cy = (y + y2) / 2 + Math.sin(ang + Math.PI / 2) * dec;
      var g = el('g', {}, parent);
      if (prof >= 1 && prof <= 3) {
        g.setAttribute('class', 'sway');
        g.style.transformOrigin = x.toFixed(1) + 'px ' + y.toFixed(1) + 'px';
        g.style.animationDuration = entre(5, 9).toFixed(1) + 's';
        g.style.animationDelay = (-entre(0, 9)).toFixed(1) + 's';
      }
      var duree = .35 + lon / 260;
      var p = el('path', { d: 'M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'Q' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + x2.toFixed(1) + ' ' + y2.toFixed(1), 'stroke-width': ep.toFixed(1), pathLength: 1, class: 'tige' }, g);
      p.style.animationDelay = t.toFixed(2) + 's';
      p.style.animationDuration = duree.toFixed(2) + 's';
      var fin = t + duree * .9;

      if (prof >= MAX || lon < 13) { fleurir(g, x2, y2, fin, true); return; }
      if (prof >= 4) fleurir(g, (x + x2) / 2, (y + y2) / 2, fin, false);

      var n = prof === 0 ? 3 : (rnd() < .3 ? 3 : 2);
      for (var i = 0; i < n; i++) {
        var ecart = prof === 0 ? .62 : entre(.32, .58);
        var a = n === 2 ? ang + (i ? ecart : -ecart) : ang + (i - 1) * ecart;
        a += entre(-.12, .12);
        // le cerisier s'étale en ombrelle : les branches s'écartent peu à peu de la verticale
        a += (Math.cos(a) >= 0 ? .07 : -.07) * Math.min(prof, 3);
        if (a > -0.15) a = -0.15; if (a < -Math.PI + .15) a = -Math.PI + .15;
        branche(g, x2, y2, a, lon * entre(.7, .84), Math.max(ep * .64, 1.3), prof + 1, fin - .05);
      }
    };

    // tronc légèrement penché
    branche(arbre, 322, 606, -Math.PI / 2 - .06, 150, 30, 0, DEBUT);

    // l'arbre ne se balance que s'il est visible
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { svg.classList.toggle('repos', !es[0].isIntersecting); }).observe(svg);
    }

    window.SakuraArbre = {
      // une fleur au hasard, en coordonnées de la fenêtre (null si l'arbre est hors écran)
      point: function () {
        if (!fleursPos.length) return null;
        var r = svg.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return null;
        var f = fleursPos[Math.floor(Math.random() * fleursPos.length)];
        var vb = svg.viewBox.baseVal;
        return { x: r.left + f[0] / vb.width * r.width, y: r.top + f[1] / vb.height * r.height };
      }
    };
  }

  /* ---------------- la pluie de pétales ---------------- */
  var c = document.getElementById('petales');
  if (!c || !c.getContext || calme) { if (c) c.style.display = 'none'; return; }
  var ctx = c.getContext('2d');
  var W, H, dpr, petales = [], vent = .25, ventCible = .25, sourisX = -9999, sourisY = -9999, dernierY = window.scrollY, vitesseScroll = 0;

  function taille() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function combien() { return Math.round(Math.max(18, Math.min(56, W * H / 26000))); }
  function hasard(a, b) { return a + Math.random() * (b - a); }

  function nouveau(p, auDebut) {
    p = p || {};
    var src = !auDebut && window.SakuraArbre && Math.random() < .5 ? window.SakuraArbre.point() : null;
    if (src) { p.x = src.x; p.y = src.y; }
    else { p.x = hasard(-W * .2, W); p.y = auDebut ? hasard(-H * .1, H) : hasard(-60, -15); }
    p.t = hasard(5, 10.5);            // taille
    p.vy = hasard(.35, .85);          // chute
    p.vx = hasard(-.15, .35);
    p.rot = hasard(0, 6.28); p.vr = hasard(-.025, .025);
    p.flip = hasard(0, 6.28); p.vf = hasard(.025, .06);
    p.osc = hasard(0, 6.28); p.amp = hasard(.3, 1.1);
    p.prof = hasard(.6, 1.15);         // profondeur (parallaxe au défilement)
    p.c = ROSES[Math.floor(Math.random() * ROSES.length)];
    p.a = hasard(.7, .95);
    p.ephemere = false; p.vie = 0; p.dx = 0; p.dy = 0;
    return p;
  }

  function dessine(p) {
    var t = p.t;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, .35 + .65 * Math.abs(Math.cos(p.flip)));
    ctx.globalAlpha = p.ephemere ? p.a * Math.min(1, p.vie / 40) : p.a;
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.moveTo(0, t);
    ctx.bezierCurveTo(-t * .95, t * .35, -t * .75, -t * .8, -t * .24, -t);
    ctx.lineTo(0, -t * .72);
    ctx.lineTo(t * .24, -t);
    ctx.bezierCurveTo(t * .75, -t * .8, t * .95, t * .35, 0, t);
    ctx.fill();
    ctx.globalAlpha *= .5;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-t * .18, -t * .1, t * .18, t * .45, -.3, 0, 6.28);
    ctx.fill();
    ctx.restore();
  }

  var precedent = performance.now(), actif = true;
  function boucle(maintenant) {
    if (!actif) return;
    var dt = Math.min(3, (maintenant - precedent) / 16.67); precedent = maintenant;
    vitesseScroll *= .9;
    ventCible = .25 + Math.min(2.2, Math.abs(vitesseScroll) * .05);
    vent += (ventCible - vent) * .03 * dt;
    ctx.clearRect(0, 0, W, H);

    for (var i = petales.length - 1; i >= 0; i--) {
      var p = petales[i];
      p.osc += .02 * dt; p.flip += p.vf * dt; p.rot += p.vr * dt;
      p.dx *= Math.pow(.96, dt); p.dy *= Math.pow(.96, dt);
      p.x += (p.vx + vent * p.prof + Math.sin(p.osc) * p.amp * .6 + p.dx) * dt;
      p.y += (p.vy * p.prof + Math.cos(p.osc * .7) * .15 + p.dy) * dt;
      // la souris écarte doucement les pétales
      var ex = p.x - sourisX, ey = p.y - sourisY, d2 = ex * ex + ey * ey;
      if (d2 < 8100) { var d = Math.sqrt(d2) || 1, f = (90 - d) / 90 * .9; p.dx += ex / d * f; p.dy += ey / d * f; }
      if (p.ephemere) p.vie -= dt;
      if (p.y > H + 30 || p.x > W + 40 || p.x < -W * .3 || p.y < -H * .5 || (p.ephemere && p.vie <= 0)) {
        if (p.ephemere) { petales.splice(i, 1); continue; }
        nouveau(p, false);
      }
      dessine(p);
    }
    requestAnimationFrame(boucle);
  }

  function remplir() {
    var n = combien();
    var stables = petales.filter(function (p) { return !p.ephemere; });
    while (stables.length < n) { var q = nouveau(null, true); petales.push(q); stables.push(q); }
    while (stables.length > n) { var r = stables.pop(); petales.splice(petales.indexOf(r), 1); }
  }

  taille(); remplir();
  requestAnimationFrame(boucle);

  var attente;
  window.addEventListener('resize', function () { clearTimeout(attente); attente = setTimeout(function () { taille(); remplir(); }, 150); });
  window.addEventListener('scroll', function () {
    var y = window.scrollY, dy = y - dernierY; dernierY = y;
    vitesseScroll += dy;
    for (var i = 0; i < petales.length; i++) petales[i].y -= dy * .18 * petales[i].prof; // légère parallaxe
  }, { passive: true });
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) { sourisX = e.clientX; sourisY = e.clientY; });
    document.addEventListener('pointerleave', function () { sourisX = sourisY = -9999; });
  }
  document.addEventListener('visibilitychange', function () {
    actif = !document.hidden;
    if (actif) { precedent = performance.now(); requestAnimationFrame(boucle); }
  });

  window.Sakura = {
    // une gerbe de pétales qui s'envole d'un point (sens : 1 vers la droite, 0 dans toutes les directions)
    eclat: function (x, y, n, sens) {
      for (var i = 0; i < (n || 14); i++) {
        var p = nouveau(null, true);
        p.x = x + hasard(-6, 6); p.y = y + hasard(-6, 6);
        var a = sens ? hasard(-.5, .4) : hasard(0, 6.28), v = hasard(3, sens ? 11 : 6);
        p.dx = Math.cos(a) * v; p.dy = Math.sin(a) * v - (sens ? 0 : 1.5);
        p.ephemere = true; p.vie = hasard(140, 240);
        petales.push(p);
      }
    },
    // un coup de vent qui pousse tous les pétales à l'écran
    rafale: function (force) {
      for (var i = 0; i < petales.length; i++) { petales[i].dx += hasard(.6, 1) * force; petales[i].dy -= hasard(0, .5) * force; }
    }
  };
})();
