/* Secret de Femme — les lianes de marbre, vivantes.
   Chaque liane est une courbe lisse passant par quelques points qui ondulent lentement,
   chacun à son rythme ; le pointeur les écarte doucement, et une goutte de lumière dorée
   (la « sève ») glisse le long de certaines. Les lianes sont dessinées dans :
   - l'accueil (les chemins déjà présents dans le SVG, remplacés par leur version vivante) ;
   - les sections à fond vivant (un SVG ajouté derrière le contenu) ;
   - les filets entre deux sections (.veine).
   Avec « réduire les animations », les lianes sont dessinées une fois, immobiles. */
(function () {
  var calme = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var souris = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var OR = '#c99a57', ROSE = '#d79ca8';

  // [points de base (repère 1440 × 900), couleur, opacité, épaisseur, amplitude, sève ?]
  var ACCUEIL = [
    { p: [[-40, 190], [200, 200], [430, 205], [700, 330], [950, 325], [1200, 260], [1480, 315]], a: 16, seve: true },
    { p: [[1010, -30], [1030, 100], [1040, 260], [990, 420], [970, 560], [985, 720]], a: 14 },
    { p: [[-40, 640], [250, 600], [490, 620], [740, 500], [940, 470], [1200, 560], [1480, 580]], a: 20, seve: true },
    { p: [[160, 940], [260, 780], [410, 660], [420, 520], [510, 380]], a: 14 },
    { p: [[430, 205], [500, 300], [550, 410], [700, 440], [830, 510]], a: 11 }
  ];
  var SECTION = [
    { p: [[-40, 180], [200, 220], [450, 210], [700, 300], [970, 330], [1200, 260], [1480, 300]], c: OR, o: .5, w: 1.5, a: 18, seve: true },
    { p: [[450, 210], [520, 330], [600, 390], [760, 440], [860, 480]], c: OR, o: .32, w: 1, a: 12 },
    { p: [[-40, 600], [260, 580], [520, 585], [760, 470], [1000, 450], [1220, 540], [1480, 520]], c: ROSE, o: .55, w: 2.4, a: 22, seve: true },
    { p: [[1010, 450], [990, 560], [1030, 680], [980, 800], [920, 940]], c: OR, o: .3, w: 1, a: 14 },
    { p: [[160, 940], [260, 820], [430, 690], [440, 560], [540, 420]], c: ROSE, o: .36, w: 1.4, a: 14 },
    { p: [[760, -30], [780, 90], [760, 210], [820, 300]], c: OR, o: .26, w: .9, a: 10 }
  ];
  var FILET = [
    { p: [[-20, 30], [200, 14], [420, 26], [620, 34], [820, 22], [1000, 30], [1220, 14]], c: OR, o: 1, w: 1.4, a: 5, seve: true },
    { p: [[-20, 36], [240, 26], [470, 34], [700, 40], [900, 32], [1100, 26], [1220, 22]], c: '#e9b8b4', o: 1, w: 2.4, a: 5 }
  ];

  var scenes = [];

  function courbe(pts) {
    // Catmull-Rom → Bézier : une courbe douce qui passe par tous les points
    var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) +
        ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) +
        ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
    }
    return d;
  }

  function trait(parent, l, seve) {
    var el = document.createElementNS(NS, 'path');
    el.setAttribute('pathLength', '1');
    if (seve) {
      el.setAttribute('class', 'seve');
    } else {
      el.setAttribute('stroke', l.c);
      el.setAttribute('stroke-opacity', l.o);
      el.setAttribute('stroke-width', l.w);
    }
    parent.appendChild(el);
    return el;
  }

  // prépare une scène : un SVG et ses lianes (chemins existants ou créés)
  function scene(svg, defs, chemins) {
    var s = { svg: svg, lianes: [], ptr: null, visible: !('IntersectionObserver' in window) };
    defs.forEach(function (def, i) {
      var l = {
        base: def.p, a: def.a * 1.45, ph: i * 1.7 + Math.random(), v: 0.45 + Math.random() * 0.3,
        dep: def.p.map(function () { return [0, 0]; }),
        el: chemins ? chemins[i] : trait(svg, def), seve: null, vs: 0.07 + Math.random() * 0.05
      };
      if (def.seve) l.seve = trait(l.el.parentNode, def, true);
      s.lianes.push(l);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { s.visible = es[0].isIntersecting; if (s.visible) lance(); }, { rootMargin: '60px 0px' }).observe(svg);
    }
    if (souris && !calme) {
      var zone = svg.parentNode;
      zone.addEventListener('pointermove', function (e) {
        var m = svg.getScreenCTM();
        if (!m) return;
        var pt = svg.createSVGPoint();
        pt.x = e.clientX; pt.y = e.clientY;
        var q = pt.matrixTransform(m.inverse());
        s.ptr = [q.x, q.y];
      });
      zone.addEventListener('pointerleave', function () { s.ptr = null; });
    }
    scenes.push(s);
    return s;
  }

  function anime(s, t) {
    var R = 190, R2 = R * R;
    s.lianes.forEach(function (l) {
      var pts = l.base.map(function (b, i) {
        // chaque point ondule sur deux axes, décalés : un mouvement de tige, jamais mécanique
        var k = t * l.v + l.ph + i * 1.1;
        var x = b[0] + l.a * 0.55 * Math.sin(k * 0.8 + i * 0.6);
        var y = b[1] + l.a * Math.sin(k) + l.a * 0.35 * Math.sin(k * 2.3 + i);
        // le pointeur écarte la liane, qui revient en douceur
        var cx = 0, cy = 0;
        if (s.ptr) {
          var dx = x - s.ptr[0], dy = y - s.ptr[1], d2 = dx * dx + dy * dy;
          if (d2 < R2 && d2 > 1) { var f = (1 - d2 / R2) * 46 / Math.sqrt(d2); cx = dx * f; cy = dy * f; }
        }
        var dep = l.dep[i];
        dep[0] += (cx - dep[0]) * 0.08; dep[1] += (cy - dep[1]) * 0.08;
        return [x + dep[0], y + dep[1]];
      });
      var d = courbe(pts);
      l.el.setAttribute('d', d);
      if (l.seve) {
        l.seve.setAttribute('d', d);
        l.seve.style.strokeDashoffset = (-((t * l.vs + l.ph) % 1.25)).toFixed(4);
      }
    });
  }

  function prepare() {
    // accueil : on reprend les chemins du SVG statique
    var hero = document.querySelector('.hero-veines');
    if (hero) {
      var chemins = [].slice.call(hero.querySelectorAll('path'));
      if (chemins.length >= ACCUEIL.length) scene(hero, ACCUEIL, chemins.slice(0, ACCUEIL.length));
    }
    // sections : un SVG de lianes derrière le contenu
    [].slice.call(document.querySelectorAll('.fond-vivant:not(.hero)')).forEach(function (sec) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'lianes');
      svg.setAttribute('viewBox', '0 0 1440 900');
      svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
      svg.setAttribute('aria-hidden', 'true');
      sec.insertBefore(svg, sec.firstChild);
      sec.classList.add('a-lianes');
      scene(svg, SECTION);
    });
    // filets entre les sections
    [].slice.call(document.querySelectorAll('.veine')).forEach(function (v) {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 1200 48');
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('aria-hidden', 'true');
      v.appendChild(svg);
      v.classList.add('a-lianes');
      scene(svg, FILET);
    });
  }

  var enCours = false, image = 0;
  function boucle(ms) {
    var t = ms / 1000, vues = 0;
    image++;
    scenes.forEach(function (s) {
      if (!s.visible) return;
      vues++;
      // sur téléphone, une image sur deux suffit à ce rythme lent
      if (souris || image % 2 === 0) anime(s, t);
    });
    if (vues && !document.hidden) requestAnimationFrame(boucle); else enCours = false;
  }
  var pret = false;
  function lance() { if (pret && !calme && !enCours && !document.hidden) { enCours = true; requestAnimationFrame(boucle); } }
  function demarre() { pret = true; lance(); }

  prepare();
  // une première image tout de suite (immobile si « réduire les animations »)
  scenes.forEach(function (s) { anime(s, 0); });
  if (!calme) {
    document.addEventListener('visibilitychange', lance);
    if (document.readyState === 'complete') setTimeout(demarre, 400);
    else window.addEventListener('load', function () { setTimeout(demarre, 400); });
  }
})();
