/* Secret de Femme — fonds vivants, discrets :
   - une lueur poudrée qui suit la souris (ou dérive doucement sur téléphone) ;
   - les veines de marbre de l'accueil qui se dessinent puis suivent légèrement le pointeur ;
   - quelques paillettes dorées qui flottent et s'écartent au passage du pointeur.
   Rien ne bouge avec « réduire les animations », tout se met en pause hors de l'écran,
   et rien ne démarre avant que la page ait fini de se charger. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (document.readyState === 'complete') setTimeout(demarre, 700);
  else window.addEventListener('load', function () { setTimeout(demarre, 700); });

  function demarre() {
  var souris = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in window;
  var visibles = new Set();

  function surveille(el, rappel) {
    if (!io) { visibles.add(el); return; }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) visibles.add(el); else visibles.delete(el);
        if (rappel) rappel(e.isIntersecting);
      });
    }, { rootMargin: '80px 0px' }).observe(el);
  }

  // ---------- lueur qui suit le pointeur ----------
  // un seul petit élément par section, déplacé par transform : rien à recalculer dans la section
  var sections = [].slice.call(document.querySelectorAll('.fond-vivant'));
  var lueurs = sections.map(function (s) {
    var l = document.createElement('span');
    l.className = 'lueur';
    l.setAttribute('aria-hidden', 'true');
    s.insertBefore(l, s.firstChild);
    surveille(s);
    return l;
  });
  function place(l, x, y) { l.style.transform = 'translate3d(' + (x | 0) + 'px,' + (y | 0) + 'px,0)'; }
  if (souris) {
    sections.forEach(function (s, i) {
      var l = lueurs[i], prevu = false, x = 0, y = 0;
      s.addEventListener('pointermove', function (e) {
        var o = (l.offsetParent || s).getBoundingClientRect();
        x = e.clientX - o.left; y = e.clientY - o.top;
        if (!prevu) { prevu = true; requestAnimationFrame(function () { prevu = false; place(l, x, y); l.classList.add('on'); }); }
      });
      s.addEventListener('pointerleave', function () { l.classList.remove('on'); });
    });
  }
  // téléphone : la lueur se promène lentement dans les sections visibles
  function promene(t) {
    var k = t / 1000;
    sections.forEach(function (s, i) {
      if (!visibles.has(s)) return;
      place(lueurs[i], s.clientWidth * (0.5 + 0.34 * Math.sin(k * 0.21 + i)), s.clientHeight * (0.45 + 0.3 * Math.sin(k * 0.17 + i * 2)));
    });
    requestAnimationFrame(promene);
  }

  if (!souris) { lueurs.forEach(function (l) { l.classList.add('on'); }); requestAnimationFrame(promene); }

  // ---------- veines de l'accueil : parallaxe légère ----------
  var veines = document.querySelector('.hero-veines');
  if (veines) {
    var couches = [].slice.call(veines.querySelectorAll('[data-profondeur]'));
    var cible = { x: 0, y: 0 }, pos = { x: 0, y: 0 }, actif = false;
    var hero = document.querySelector('.hero');
    surveille(hero, function (v) { if (v && !actif) { actif = true; requestAnimationFrame(bouge); } });
    if (souris) {
      window.addEventListener('pointermove', function (e) {
        cible.x = e.clientX / window.innerWidth - 0.5;
        cible.y = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
    }
    var bouge = function () {
      if (!visibles.has(hero)) { actif = false; return; }
      if (!souris) {
        var k = performance.now() / 1000;
        cible.x = Math.sin(k * 0.15) * 0.35; cible.y = Math.cos(k * 0.11) * 0.25;
      }
      pos.x += (cible.x - pos.x) * 0.05; pos.y += (cible.y - pos.y) * 0.05;
      var defile = Math.min(window.scrollY, window.innerHeight) * 0.08;
      couches.forEach(function (c) {
        var p = +c.getAttribute('data-profondeur');
        c.style.transform = 'translate(' + (pos.x * p).toFixed(2) + 'px,' + (pos.y * p - defile * p / 22).toFixed(2) + 'px)';
      });
      requestAnimationFrame(bouge);
    };
  }

  // ---------- paillettes dorées ----------
  [].slice.call(document.querySelectorAll('canvas[data-paillettes]')).forEach(function (cv) {
    var ctx = cv.getContext('2d');
    if (!ctx) return;
    var nb = +cv.getAttribute('data-paillettes') || 20;
    var nuit = !!cv.closest('.fond-nuit');
    var teintes = nuit ? ['232,200,143', '233,184,180', '255,240,220'] : ['201,154,87', '201,154,87', '215,156,168'];
    var w = 0, h = 0, dpr = 1, pts = [], ptr = { x: -999, y: -999 }, enCours = false;

    function taille() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function nouvelle(p, partout) {
      p.x = Math.random() * w;
      p.y = partout ? Math.random() * h : h + 10;
      p.r = 0.6 + Math.random() * 1.6;
      p.v = 0.08 + Math.random() * 0.22;
      p.phase = Math.random() * 6.28;
      p.c = teintes[(Math.random() * teintes.length) | 0];
      p.dx = 0; p.dy = 0;
      return p;
    }
    taille();
    for (var i = 0; i < nb; i++) pts.push(nouvelle({}, true));
    window.addEventListener('resize', taille, { passive: true });

    var zone = cv.parentElement;
    if (souris) {
      zone.addEventListener('pointermove', function (e) {
        var r = cv.getBoundingClientRect();
        ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top;
      });
      zone.addEventListener('pointerleave', function () { ptr.x = ptr.y = -999; });
    }

    function dessine(t) {
      if (!visibles.has(cv) || document.hidden) { enCours = false; return; }
      ctx.clearRect(0, 0, w, h);
      var k = t / 1000;
      pts.forEach(function (p) {
        p.y -= p.v;
        p.x += Math.sin(k * 0.6 + p.phase) * 0.15;
        // s'écarte doucement du pointeur
        var ex = p.x - ptr.x, ey = p.y - ptr.y, d2 = ex * ex + ey * ey;
        if (d2 < 9000) { var f = (1 - d2 / 9000) * 0.9; p.dx += ex / 60 * f; p.dy += ey / 60 * f; }
        p.dx *= 0.92; p.dy *= 0.92;
        var x = p.x + p.dx * 8, y = p.y + p.dy * 8;
        if (p.y < -10) nouvelle(p, false);
        var a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(k * 1.4 + p.phase));
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + p.c + ',' + a.toFixed(3) + ')';
        ctx.arc(x, y, p.r, 0, 6.2832);
        ctx.fill();
      });
      requestAnimationFrame(dessine);
    }
    var lance = function () { if (!enCours && visibles.has(cv) && !document.hidden) { enCours = true; requestAnimationFrame(dessine); } };
    surveille(cv, function (v) { if (v) { taille(); lance(); } });
    document.addEventListener('visibilitychange', lance);
  });
  }
})();
