/* Passion Coiffure by Yasmine — le cerisier de l'accueil (dessiné à chaque visite, toujours le même)
   et la pluie de pétales qui traverse tout le site. */
(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROSES = ['#fbd3df', '#f8c2d3', '#fde4ec', '#f4a9c1', '#f9cad8', '#ee93b1', '#fff0f4'];

  /* ---------------- le cerisier ----------------
     L'arbre est généré une fois en SVG (texte), puis affiché comme 4 images superposées :
     les branches et trois couches de fleurs. Le navigateur ne le dessine qu'une fois ;
     la pousse et le balancement ne sont que des transformations, gérées par la carte graphique. */
  var hote = document.getElementById('sakura');
  var fleursPos = []; // positions des fleurs (repère du dessin) : les pétales s'en détachent
  var VB_L = 640, VB_H = 620;              // repère du dessin (= cadre de #sakura)
  var MX = 100, MH = 60, L = VB_L + 2 * MX, H = VB_H + MH; // marge autour : les fleurs débordent du cadre

  if (hote) {
    var graine = 11;
    var rnd = function () { graine = (graine * 16807) % 2147483647; return (graine - 1) / 2147483646; };
    var entre = function (a, b) { return a + rnd() * (b - a); };
    var f1 = function (n) { return Math.round(n * 10) / 10; };

    // une fleur = un seul tracé (5 pétales échancrés) + un cœur : peu de formes à peindre
    var fleurD = '';
    for (var k = 0; k < 5; k++) {
      var a = k * Math.PI * 2 / 5, co = Math.cos(a), si = Math.sin(a);
      var pt = function (x, y) { return f1(x * co - y * si) + ' ' + f1(x * si + y * co); };
      fleurD += 'M' + pt(0, 0) + 'C' + pt(-5, -3) + ' ' + pt(-7, -10) + ' ' + pt(-3.6, -14.5) + 'L' + pt(0, -12.2) + 'L' + pt(3.6, -14.5) + 'C' + pt(7, -10) + ' ' + pt(5, -3) + ' ' + pt(0, 0) + 'Z';
    }
    var tete = '<svg xmlns="http://www.w3.org/2000/svg" width="' + L + '" height="' + H + '" viewBox="' + -MX + ' ' + -MH + ' ' + L + ' ' + H + '">';
    var defsFleur = '<defs><g id="fl"><path d="' + fleurD + '"/><circle r="2.8" fill="#fff6f8"/><circle r="1.3" fill="#d4547f"/></g></defs>';
    var branches = [], couches = [[], [], []];

    var fleurir = function (x, y, dense) {
      var n = dense ? Math.round(entre(3, 5)) : Math.round(entre(0, 2));
      for (var i = 0; i < n; i++) {
        var fx = x + entre(-16, 16), fy = y + entre(-14, 10);
        couches[Math.floor(rnd() * 3)].push('<use href="#fl" fill="' + ROSES[Math.floor(rnd() * ROSES.length)] + '" transform="translate(' + f1(fx) + ' ' + f1(fy) + ') rotate(' + Math.round(entre(0, 72)) + ') scale(' + entre(.6, 1.2).toFixed(2) + ')"/>');
        fleursPos.push([fx, fy]);
      }
      if (dense && rnd() < .5) couches[2].push('<circle cx="' + f1(x + entre(-12, 12)) + '" cy="' + f1(y + entre(-10, 8)) + '" r="' + entre(2, 3.2).toFixed(1) + '" fill="#e2729a"/>');
    };

    var branche = function (x, y, ang, lon, ep, prof) {
      var x2 = x + Math.cos(ang) * lon, y2 = y + Math.sin(ang) * lon;
      var dec = entre(-.2, .2) * lon;
      var cx = (x + x2) / 2 + Math.cos(ang + Math.PI / 2) * dec, cy = (y + y2) / 2 + Math.sin(ang + Math.PI / 2) * dec;
      branches.push('<path d="M' + f1(x) + ' ' + f1(y) + 'Q' + f1(cx) + ' ' + f1(cy) + ' ' + f1(x2) + ' ' + f1(y2) + '" stroke-width="' + ep.toFixed(1) + '"/>');
      if (prof >= 7 || lon < 13) { fleurir(x2, y2, true); return; }
      if (prof >= 4) fleurir((x + x2) / 2, (y + y2) / 2, false);
      var n = prof === 0 ? 3 : (rnd() < .3 ? 3 : 2);
      for (var i = 0; i < n; i++) {
        var ecart = prof === 0 ? .62 : entre(.32, .58);
        var an = n === 2 ? ang + (i ? ecart : -ecart) : ang + (i - 1) * ecart;
        an += entre(-.12, .12);
        // le cerisier s'étale en ombrelle : les branches s'écartent peu à peu de la verticale
        an += (Math.cos(an) >= 0 ? .07 : -.07) * Math.min(prof, 3);
        if (an > -0.15) an = -0.15; if (an < -Math.PI + .15) an = -Math.PI + .15;
        branche(x2, y2, an, lon * entre(.7, .84), Math.max(ep * .64, 1.3), prof + 1);
      }
    };
    branche(322, 606, -Math.PI / 2 - .06, 150, 30, 0); // tronc légèrement penché

    var images = [
      tete + '<defs><linearGradient id="e" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#7b4357"/><stop offset=".55" stop-color="#5e2f42"/><stop offset="1" stop-color="#8d5568"/></linearGradient>' +
        '<radialGradient id="o"><stop offset="0" stop-color="#e79ab4" stop-opacity=".45"/><stop offset="1" stop-color="#e79ab4" stop-opacity="0"/></radialGradient></defs>' +
        '<ellipse cx="320" cy="604" rx="230" ry="20" fill="url(#o)"/><g fill="none" stroke="url(#e)" stroke-linecap="round">' + branches.join('') + '</g></svg>'
    ];
    couches.forEach(function (c) { images.push(tete + defsFleur + c.join('') + '</svg>'); });

    var noms = ['branches', 'fleurs f1', 'fleurs f2', 'fleurs f3'], attentes = [];
    images.forEach(function (src, i) {
      var img = new Image();
      img.alt = ''; img.className = 'couche ' + noms[i]; img.decoding = 'async';
      img.src = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml' }));
      attentes.push(img.decode ? img.decode().catch(function () {}) : Promise.resolve());
      hote.appendChild(img);
    });
    // la pousse ne démarre qu'une fois les images prêtes, pour rester fluide
    Promise.all(attentes).then(function () {
      requestAnimationFrame(function () { hote.classList.add('pret'); document.dispatchEvent(new Event('sakura:pret')); });
    });

    // l'arbre ne se balance que s'il est visible
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { hote.classList.toggle('repos', !es[0].isIntersecting); }).observe(hote);
    }

    window.SakuraArbre = {
      // une fleur au hasard, en coordonnées de la fenêtre (null si l'arbre est hors écran)
      point: function () {
        if (!fleursPos.length || !hote.classList.contains('pret')) return null;
        var r = hote.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return null;
        var f = fleursPos[Math.floor(Math.random() * fleursPos.length)];
        return { x: r.left + f[0] / VB_L * r.width, y: r.top + f[1] / VB_H * r.height };
      }
    };
  }

  /* ---------------- la pluie de pétales ----------------
     Chaque couleur de pétale est dessinée une seule fois dans une petite image ; à chaque
     trame on ne fait que la poser (drawImage) avec la bonne position, rotation et inclinaison. */
  var c = document.getElementById('petales');
  if (!c || !c.getContext || calme) { if (c) c.style.display = 'none'; return; }
  var ctx = c.getContext('2d');
  var W, H, dpr, petales = [], vent = .25, sourisX = -9999, sourisY = -9999, dernierY = window.scrollY, vitesseScroll = 0;
  var T = 10, S = 26, sprites = []; // taille de référence du pétale et de son image (px CSS)

  function hasard(a, b) { return a + Math.random() * (b - a); }

  function preparerSprites() {
    sprites = ROSES.map(function (coul) {
      var e = document.createElement('canvas'), k = e.width = e.height = Math.ceil(S * dpr), g = e.getContext('2d');
      g.scale(dpr, dpr); g.translate(S / 2, S / 2);
      g.fillStyle = coul;
      g.beginPath();
      g.moveTo(0, T);
      g.bezierCurveTo(-T * .95, T * .35, -T * .75, -T * .8, -T * .24, -T);
      g.lineTo(0, -T * .72);
      g.lineTo(T * .24, -T);
      g.bezierCurveTo(T * .75, -T * .8, T * .95, T * .35, 0, T);
      g.fill();
      g.globalAlpha = .5; g.fillStyle = '#fff';
      g.beginPath(); g.ellipse(-T * .18, -T * .1, T * .18, T * .45, -.3, 0, 6.28); g.fill();
      return e;
    });
  }

  function taille() {
    var ancien = dpr;
    dpr = Math.min(window.devicePixelRatio || 1, 1.5); // des pétales flous n'ont pas besoin de plus
    W = window.innerWidth; H = window.innerHeight;
    c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    if (dpr !== ancien) preparerSprites();
  }
  function combien() { return Math.round(Math.max(16, Math.min(42, W * H / 30000))); }

  function nouveau(p, auDebut) {
    p = p || {};
    var src = !auDebut && window.SakuraArbre && Math.random() < .5 ? window.SakuraArbre.point() : null;
    if (src) { p.x = src.x; p.y = src.y; }
    else { p.x = hasard(-W * .2, W); p.y = auDebut ? hasard(-H * .1, H) : hasard(-60, -15); }
    p.s = hasard(.5, 1.05);           // taille
    p.vy = hasard(.35, .85);          // chute
    p.vx = hasard(-.15, .35);
    p.rot = hasard(0, 6.28); p.vr = hasard(-.025, .025);
    p.flip = hasard(0, 6.28); p.vf = hasard(.025, .06);
    p.osc = hasard(0, 6.28); p.amp = hasard(.3, 1.1);
    p.prof = hasard(.6, 1.15);         // profondeur (parallaxe au défilement)
    p.img = Math.floor(Math.random() * ROSES.length);
    p.a = hasard(.7, .95);
    p.ephemere = false; p.vie = 0; p.dx = 0; p.dy = 0;
    return p;
  }

  function dessine(p) {
    var k = dpr * p.s, co = Math.cos(p.rot) * k, si = Math.sin(p.rot) * k, f = .35 + .65 * Math.abs(Math.cos(p.flip));
    ctx.setTransform(co, si, -si * f, co * f, p.x * dpr, p.y * dpr);
    ctx.globalAlpha = p.ephemere ? p.a * Math.min(1, p.vie / 40) : p.a;
    ctx.drawImage(sprites[p.img], -S / 2, -S / 2, S, S);
  }

  var precedent = 0, actif = false, demarre = false;
  function boucle(maintenant) {
    if (!actif) return;
    var dt = precedent ? Math.min(3, (maintenant - precedent) / 16.67) : 1; precedent = maintenant;
    vitesseScroll *= .9;
    vent += (.25 + Math.min(2.2, Math.abs(vitesseScroll) * .05) - vent) * .03 * dt;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);

    for (var i = petales.length - 1; i >= 0; i--) {
      var p = petales[i];
      p.osc += .02 * dt; p.flip += p.vf * dt; p.rot += p.vr * dt;
      if (p.dx || p.dy) { var fr = Math.pow(.96, dt); p.dx *= fr; p.dy *= fr; if (Math.abs(p.dx) + Math.abs(p.dy) < .01) p.dx = p.dy = 0; }
      p.x += (p.vx + vent * p.prof + Math.sin(p.osc) * p.amp * .6 + p.dx) * dt;
      p.y += (p.vy * p.prof + Math.cos(p.osc * .7) * .15 + p.dy) * dt;
      // la souris écarte doucement les pétales
      var ex = p.x - sourisX, ey = p.y - sourisY, d2 = ex * ex + ey * ey;
      if (d2 < 8100) { var d = Math.sqrt(d2) || 1, fo = (90 - d) / 90 * .9; p.dx += ex / d * fo; p.dy += ey / d * fo; }
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

  function lancer() {
    if (demarre) return;
    demarre = true;
    taille(); remplir();
    c.classList.add('visible');
    if (!document.hidden) { actif = true; precedent = 0; requestAnimationFrame(boucle); }
  }
  // les pétales arrivent quand l'arbre a fleuri, pour laisser toute la place à sa pousse
  document.addEventListener('sakura:pret', function () { setTimeout(lancer, 1100); });
  setTimeout(lancer, hote ? 3500 : 300);

  var attente;
  window.addEventListener('resize', function () { if (!demarre) return; clearTimeout(attente); attente = setTimeout(function () { taille(); remplir(); }, 150); });
  window.addEventListener('scroll', function () {
    var y = window.scrollY, dy = y - dernierY; dernierY = y;
    if (!actif) return;
    vitesseScroll += dy;
    for (var i = 0; i < petales.length; i++) petales[i].y -= dy * .18 * petales[i].prof; // légère parallaxe
  }, { passive: true });
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', function (e) { sourisX = e.clientX; sourisY = e.clientY; }, { passive: true });
    document.addEventListener('pointerleave', function () { sourisX = sourisY = -9999; });
  }
  document.addEventListener('visibilitychange', function () {
    if (!demarre) return;
    var etait = actif;
    actif = !document.hidden;
    if (actif && !etait) { precedent = 0; requestAnimationFrame(boucle); }
  });

  window.Sakura = {
    // une gerbe de pétales qui s'envole d'un point (sens : 1 vers la droite, 0 dans toutes les directions)
    eclat: function (x, y, n, sens) {
      lancer();
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
