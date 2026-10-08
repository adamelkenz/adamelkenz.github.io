/* Rameau de pommier interactif : la souris (ou le doigt) bouscule les feuilles,
   les pommes se balancent, et une branche secouée trop fort perd une feuille.
   Petite physique à ressorts, sans dépendance. */
(function () {
  'use strict';

  var svg = document.querySelector('.hero-art .branch');
  if (!svg || !svg.getScreenCTM) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var NS = 'http://www.w3.org/2000/svg';
  var tree = svg.querySelector('.tree');
  var BASE = { x: 70, y: 548 };      // pied du rameau, pivot de l'ensemble
  var REACH = 95;                    // rayon d'influence du curseur (unités SVG)

  // Chaque élément mobile : feuille, fleur ou pomme, avec son pivot.
  var parts = [].map.call(svg.querySelectorAll('.lf, .ap'), function (g) {
    var o = g.getAttribute('data-o').split(',').map(Number);
    var isApple = g.classList.contains('ap');
    var box = g.getBBox();
    return {
      g: g, ox: o[0], oy: o[1],
      // centre de masse approximatif : sert à savoir où « toucher » la feuille
      cx: box.x + box.width / 2, cy: box.y + box.height / 2,
      a: 0, v: 0,
      k: isApple ? 0.018 : 0.05,      // raideur du ressort
      d: isApple ? 0.965 : 0.9,       // amortissement
      gain: isApple ? 0.9 : 0.55,
      phase: Math.random() * Math.PI * 2,
      leaf: g.classList.contains('leaf'),
      gone: false
    };
  });

  var trunk = { a: 0, v: 0, target: 0 };
  var mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0, inside: false };
  var falling = [];
  var fallLayer = document.createElementNS(NS, 'g');
  fallLayer.setAttribute('class', 'falling');
  svg.appendChild(fallLayer);

  function toSvg(e) {
    var m = svg.getScreenCTM();
    if (!m) return null;
    var p = svg.createSVGPoint();
    p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(m.inverse());
  }

  function onMove(e) {
    var p = toSvg(e);
    if (!p) return;
    var now = performance.now();
    var dt = Math.max(8, now - (mouse.t || now - 16));
    if (mouse.inside) {
      // vitesse lissée, en unités SVG par image (~16 ms)
      mouse.vx = mouse.vx * 0.5 + ((p.x - mouse.x) / dt * 16) * 0.5;
      mouse.vy = mouse.vy * 0.5 + ((p.y - mouse.y) / dt * 16) * 0.5;
    }
    mouse.x = p.x; mouse.y = p.y; mouse.t = now; mouse.inside = true;
    trunk.target = Math.max(-1, Math.min(1, (p.x - 210) / 260)) * 3.2;
    wake();
  }
  function onLeave() { mouse.inside = false; mouse.vx = mouse.vy = 0; trunk.target = 0; }

  // Un tapotement (mobile) donne une pichenette aux feuilles proches.
  function onDown(e) {
    var p = toSvg(e);
    if (!p) return;
    parts.forEach(function (s) {
      var dx = s.cx - p.x, dy = s.cy - p.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < REACH) s.v += (dx > 0 ? 1 : -1) * (1 - dist / REACH) * 4;
    });
    wake();
  }

  // Le curseur qui passe à travers une feuille lui applique un couple :
  // r × v, r étant le bras de levier depuis le pivot.
  function push(s) {
    if (!mouse.inside) return;
    var dx = mouse.x - s.cx, dy = mouse.y - s.cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > REACH) return;
    var rx = mouse.x - s.ox, ry = mouse.y - s.oy;
    var r2 = Math.max(rx * rx + ry * ry, 400);
    var torque = (rx * mouse.vy - ry * mouse.vx) / r2;          // radians / image
    var fall = 1 - dist / REACH;
    s.v += torque * 57.3 * s.gain * fall * fall;
    // secousse franche sur une feuille : elle se détache
    var speed = Math.abs(mouse.vx) + Math.abs(mouse.vy);
    if (s.leaf && !s.gone && speed > 26 && dist < 40 && falling.length < 4 && Math.random() < 0.35) drop(s);
  }

  function drop(s) {
    s.gone = true;
    var clone = s.g.cloneNode(true);
    clone.removeAttribute('class');
    clone.setAttribute('class', 'fall-leaf');
    fallLayer.appendChild(clone);
    s.g.style.opacity = '0';
    falling.push({
      el: clone, s: s, t: 0,
      x: 0, y: 0, rot: s.a,
      vx: mouse.vx * 0.25, vy: -1,
      spin: (Math.random() - 0.5) * 6,
      sway: 0.6 + Math.random() * 0.8
    });
    // la feuille repousse quelques secondes plus tard
    setTimeout(function () {
      s.gone = false;
      s.a = -40; s.v = 0;
      s.g.style.transition = 'opacity 1.6s ease';
      s.g.style.opacity = '1';
      setTimeout(function () { s.g.style.transition = ''; }, 1700);
    }, 6000);
  }

  var running = false, visible = true, last = 0;
  function wake() { if (!running && visible) { running = true; last = 0; requestAnimationFrame(frame); } }

  function frame(t) {
    if (!visible) { running = false; return; }
    var step = last ? Math.min((t - last) / 16.7, 3) : 1;
    last = t;
    var time = t / 1000;
    var wind = Math.sin(time * 0.9) * 0.6 + Math.sin(time * 2.3) * 0.25;

    // tronc : suit doucement le curseur, plus un peu de vent
    trunk.v += ((trunk.target + wind * 0.5) - trunk.a) * 0.02 * step;
    trunk.v *= Math.pow(0.9, step);
    trunk.a += trunk.v * step;
    tree.setAttribute('transform', 'rotate(' + trunk.a.toFixed(3) + ' ' + BASE.x + ' ' + BASE.y + ')');

    parts.forEach(function (s) {
      push(s);
      var rest = Math.sin(time * 1.7 + s.phase) * 1.4 * (0.6 + 0.4 * wind) - trunk.v * 2;
      s.v += (rest - s.a) * s.k * step;
      s.v *= Math.pow(s.d, step);
      s.v = Math.max(-14, Math.min(14, s.v));
      s.a += s.v * step;
      s.a = Math.max(-55, Math.min(55, s.a));
      s.g.setAttribute('transform', 'rotate(' + s.a.toFixed(2) + ' ' + s.ox + ' ' + s.oy + ')');
    });
    // la vitesse du curseur retombe s'il s'arrête
    mouse.vx *= 0.85; mouse.vy *= 0.85;

    for (var i = falling.length - 1; i >= 0; i--) {
      var f = falling[i];
      f.t += step;
      f.vy = Math.min(f.vy + 0.06 * step, 1.6);
      f.vx = f.vx * 0.97 + Math.sin(f.t / 18) * 0.12 * f.sway;
      f.x += f.vx * step; f.y += f.vy * step;
      f.rot += (f.spin + Math.sin(f.t / 14) * 3) * step * 0.4;
      var op = Math.max(0, 1 - Math.max(0, f.t - 120) / 80);
      f.el.setAttribute('transform', 'translate(' + f.x.toFixed(1) + ' ' + f.y.toFixed(1) + ') rotate(' + f.rot.toFixed(1) + ' ' + f.s.cx + ' ' + f.s.cy + ')');
      f.el.style.opacity = op;
      if (op <= 0) { f.el.remove(); falling.splice(i, 1); }
    }
    requestAnimationFrame(frame);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      visible = e[0].isIntersecting && !document.hidden;
      if (visible) wake();
    }).observe(svg);
  }
  document.addEventListener('visibilitychange', function () { visible = !document.hidden; if (visible) wake(); });

  // On écoute toute la zone du dessin, pas seulement les traits.
  var zone = svg.closest('.hero-art');
  zone.addEventListener('pointermove', onMove);
  zone.addEventListener('pointerleave', onLeave);
  zone.addEventListener('pointerdown', onDown);
  wake();
})();
