/* Rameau de pommier peint, qui longe le bord droit de tout le site.
   - géométrie générée (graine fixe) d'après la mise en page : un tronc le long
     de la marge, une grosse branche qui plonge dans l'illustration d'accueil ;
   - rendu sur un canvas fixe de la taille de l'écran (on ne dessine que la
     partie visible), feuilles et pommes pré-peintes en sprites ;
   - physique à ressorts : le curseur bouscule feuilles, rameaux et pommes,
     une secousse franche fait tomber des feuilles, le défilement les agite ;
   - du haut vers le bas de la page, on traverse les saisons : fleurs, puis
     feuillage plein, pommes, et quelques feuilles qui jaunissent en bas. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.createElement('canvas');
  canvas.className = 'rameau';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var DPR = 1, VW = 0, VH = 0, DOC_H = 0, W = 0;
  var trunk = null, limb = null, twigs = [], leaves = [], apples = [], flowers = [], falling = [];
  var mouse = { x: -1e4, y: -1e4, vx: 0, vy: 0, t: 0, on: false };
  var scrollY = window.scrollY, lastScroll = scrollY;

  /* ---------- hasard reproductible ---------- */
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var R;
  function rr(a, b) { return a + (b - a) * R(); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function mk(w, h) {
    var c = document.createElement('canvas');
    c.width = Math.max(1, Math.ceil(w * DPR)); c.height = Math.max(1, Math.ceil(h * DPR));
    var x = c.getContext('2d'); x.scale(DPR, DPR);
    return { c: c, x: x };
  }

  /* ---------- sprites ---------- */
  // Contour de feuille de pommier : ovale, pointe effilée, bord finement denté.
  function leafPath(x, len, wid, pl, asym) {
    var n = 22, i, t, hw, px, side;
    x.beginPath(); x.moveTo(pl, 0);
    for (side = -1; side <= 1; side += 2) {
      for (i = 1; i <= n; i++) {
        t = side < 0 ? i / n : 1 - i / n;
        hw = wid * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.82)), 0.85) * (1 - 0.12 * t);
        if (t > 0.12 && t < 0.96) hw *= (i % 2 ? 1.035 : 0.985);
        if (side > 0) hw *= asym;
        px = pl + t * (len - pl);
        x.lineTo(px, side * hw);
      }
    }
    x.closePath();
  }

  function leafSprite(len, wid, hue, sat, lig) {
    var pad = 14, w = len + pad * 2, h = wid * 2 + pad * 2;
    var pl = len * 0.16, asym = rr(0.86, 0.96);
    var s = mk(w, h), x = s.x;
    x.translate(pad, h / 2);
    // pétiole
    x.strokeStyle = 'hsl(' + (hue - 25) + ',30%,32%)'; x.lineWidth = 1.4; x.lineCap = 'round';
    x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(pl * 0.5, 0.6, pl + 1, 0); x.stroke();
    // limbe : dégradé de la base vers la pointe
    leafPath(x, len, wid, pl, asym);
    var g = x.createLinearGradient(pl, -wid, len, wid);
    g.addColorStop(0, 'hsl(' + hue + ',' + sat + '%,' + (lig - 7) + '%)');
    g.addColorStop(0.55, 'hsl(' + (hue + 4) + ',' + (sat + 4) + '%,' + lig + '%)');
    g.addColorStop(1, 'hsl(' + (hue + 10) + ',' + (sat + 2) + '%,' + (lig + 9) + '%)');
    x.fillStyle = g; x.fill();
    x.save(); x.clip();
    // moitié inférieure plus sombre : la feuille est légèrement pliée sur sa nervure
    x.fillStyle = 'rgba(18,30,8,.16)'; x.fillRect(pl, 0, len, wid + 2);
    // reflet
    var sh = x.createRadialGradient(pl + (len - pl) * 0.42, -wid * 0.35, 1, pl + (len - pl) * 0.42, -wid * 0.35, wid * 1.3);
    sh.addColorStop(0, 'rgba(255,255,235,.22)'); sh.addColorStop(1, 'rgba(255,255,235,0)');
    x.fillStyle = sh; x.fillRect(0, -wid - 4, len + 4, wid * 2 + 8);
    // nervures secondaires
    x.strokeStyle = 'hsla(' + (hue + 8) + ',' + (sat - 8) + '%,' + (lig + 26) + '%,.32)'; x.lineWidth = 0.6;
    for (var k = 1; k <= 6; k++) {
      var tt = 0.1 + k * 0.12, bx = pl + tt * (len - pl);
      for (var sd = -1; sd <= 1; sd += 2) {
        x.beginPath(); x.moveTo(bx, 0);
        x.quadraticCurveTo(bx + len * 0.06, sd * wid * 0.35, bx + len * 0.13, sd * wid * 0.72 * Math.sin(Math.PI * Math.min(tt + 0.1, 0.95)));
        x.stroke();
      }
    }
    x.restore();
    // nervure médiane
    x.strokeStyle = 'hsla(' + (hue + 10) + ',' + (sat - 10) + '%,' + (lig + 30) + '%,.6)'; x.lineWidth = 1;
    x.beginPath(); x.moveTo(pl, 0); x.quadraticCurveTo((pl + len) / 2, 1.2, len * 0.97, 0); x.stroke();
    // liseré
    leafPath(x, len, wid, pl, asym);
    x.strokeStyle = 'hsla(' + hue + ',' + sat + '%,' + (lig - 16) + '%,.55)'; x.lineWidth = 0.7; x.stroke();

    // ombre portée, floutée, peinte une fois
    var o = mk(w, h), y = o.x;
    y.translate(pad - 3000, h / 2);
    y.shadowColor = 'rgba(28,38,18,.38)'; y.shadowBlur = 5 * DPR; y.shadowOffsetX = 3000 * DPR;
    leafPath(y, len, wid, pl, asym); y.fillStyle = '#000'; y.fill();
    return { img: s.c, shadow: o.c, ox: pad, oy: h / 2, w: w, h: h, len: len };
  }

  function appleSprite(r, blush) {
    var pad = 10, d = r * 2 + pad * 2;
    var s = mk(d, d), x = s.x;
    x.translate(d / 2, d / 2);
    function body() {
      x.beginPath();
      x.moveTo(0, -r * 0.78);
      x.bezierCurveTo(r * 0.45, -r * 1.08, r * 1.12, -r * 0.82, r * 1.06, -r * 0.05);
      x.bezierCurveTo(r * 1.0, r * 0.72, r * 0.5, r * 1.02, 0, r * 0.94);
      x.bezierCurveTo(-r * 0.5, r * 1.02, -r * 1.0, r * 0.72, -r * 1.06, -r * 0.05);
      x.bezierCurveTo(-r * 1.12, -r * 0.82, -r * 0.45, -r * 1.08, 0, -r * 0.78);
      x.closePath();
    }
    body();
    var g = x.createRadialGradient(-r * 0.38, -r * 0.42, r * 0.05, 0, 0, r * 1.25);
    g.addColorStop(0, '#f6ecb0');
    g.addColorStop(0.28, blush > 0.5 ? '#d9a443' : '#c7c25a');
    g.addColorStop(0.62, blush > 0.5 ? '#b23b26' : '#9aa83c');
    g.addColorStop(1, blush > 0.5 ? '#5d1a12' : '#4d5a1c');
    x.fillStyle = g; x.fill();
    x.save(); x.clip();
    // stries de la peau
    x.strokeStyle = blush > 0.5 ? 'rgba(120,20,10,.28)' : 'rgba(150,60,20,.22)'; x.lineWidth = 0.8;
    for (var i = -4; i <= 4; i++) {
      x.beginPath(); x.moveTo(i * r * 0.2, -r * 0.8); x.quadraticCurveTo(i * r * 0.3, 0, i * r * 0.16, r * 0.95); x.stroke();
    }
    // ombre propre en bas à droite
    var sh = x.createRadialGradient(r * 0.5, r * 0.55, 0, r * 0.5, r * 0.55, r * 1.1);
    sh.addColorStop(0, 'rgba(30,8,4,.35)'); sh.addColorStop(1, 'rgba(30,8,4,0)');
    x.fillStyle = sh; x.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 2.4);
    x.restore();
    // cuvette du pédoncule et reflet
    x.fillStyle = 'rgba(60,30,10,.45)';
    x.beginPath(); x.ellipse(0, -r * 0.72, r * 0.22, r * 0.08, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,255,245,.55)';
    x.beginPath(); x.ellipse(-r * 0.42, -r * 0.4, r * 0.18, r * 0.11, -0.6, 0, Math.PI * 2); x.fill();

    var o = mk(d, d), y = o.x;
    y.translate(d / 2 - 3000, d / 2);
    y.shadowColor = 'rgba(25,30,15,.35)'; y.shadowBlur = 6 * DPR; y.shadowOffsetX = 3000 * DPR;
    y.beginPath(); y.ellipse(0, 0, r * 1.02, r * 0.95, 0, 0, Math.PI * 2); y.fill();
    return { img: s.c, shadow: o.c, ox: d / 2, oy: d / 2, w: d, h: d };
  }

  function flowerSprite(r) {
    var pad = 6, d = r * 2 + pad * 2, s = mk(d, d), x = s.x;
    x.translate(d / 2, d / 2);
    for (var i = 0; i < 5; i++) {
      var a = i * Math.PI * 2 / 5 - Math.PI / 2 + rr(-0.1, 0.1);
      x.save(); x.rotate(a); x.translate(r * 0.52, 0);
      var g = x.createRadialGradient(-r * 0.3, 0, 0, 0, 0, r * 0.6);
      g.addColorStop(0, '#fff8f4'); g.addColorStop(0.7, '#fbe6ea'); g.addColorStop(1, '#eab3c0');
      x.fillStyle = g;
      x.beginPath(); x.ellipse(0, 0, r * 0.55, r * 0.45, 0, 0, Math.PI * 2); x.fill();
      x.strokeStyle = 'rgba(190,120,135,.35)'; x.lineWidth = 0.5; x.stroke();
      x.restore();
    }
    x.fillStyle = '#c9c46a'; x.beginPath(); x.arc(0, 0, r * 0.2, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#e2b94a';
    for (var k = 0; k < 9; k++) {
      var b = k * 0.7; x.beginPath(); x.arc(Math.cos(b) * r * 0.24, Math.sin(b) * r * 0.24, 0.9, 0, Math.PI * 2); x.fill();
    }
    return { img: s.c, ox: d / 2, oy: d / 2, w: d, h: d };
  }

  /* ---------- géométrie ---------- */
  function marginRight() {
    var content = Math.min(W, 1200);
    var gutter = clamp(W * 0.04, 16, 56);
    return (W - content) / 2 + gutter;
  }

  function build() {
    R = rng(1975);
    W = document.documentElement.clientWidth;
    DOC_H = Math.max(document.documentElement.scrollHeight, VH);
    var m = marginRight();
    var mobile = W < 760;
    var S = mobile ? 0.5 : clamp(m / 176, 0.62, 1.35);     // échelle générale
    var edge = mobile ? W - 9 : W - Math.max(26, m * 0.42);
    var reach = mobile ? 14 : Math.max(30, m * 0.6);       // avancée vers le texte
    twigs = []; leaves = []; apples = []; flowers = []; falling = [];

    // tronc : du haut de la page jusqu'au pied, ondulant dans la marge
    var top = 64, bot = DOC_H - 24, pts = [];
    var amp1 = mobile ? 4 : m * 0.14, amp2 = mobile ? 3 : m * 0.08, ph = rr(0, 6);
    for (var y = top; y <= bot; y += 6) {
      var t = (y - top) / (bot - top);
      var x = edge + Math.sin(y / 330 + ph) * amp1 + Math.sin(y / 910 + 2) * amp2;
      if (y < top + 220) { var e = (y - top) / 220; x = lerp(W + 40, x, 1 - Math.pow(1 - e, 2.2)); } // il entre par le bord, en courbe douce
      pts.push({ x: x, y: y, w: lerp(mobile ? 8 : 16 * S, mobile ? 3 : 6 * S, Math.pow(t, 0.8)), t: t });
    }
    trunk = { pts: pts, marks: barkMarks(pts) };

    // grosse branche dans l'illustration d'accueil
    limb = null;
    var art = document.querySelector('.hero-art');
    if (art) {
      var b = art.getBoundingClientRect(), bt = b.top + scrollY;
      var p0 = pointAtY(bt + b.height * (mobile ? 0.25 : 0.42));
      var p2 = { x: b.left + b.width * (mobile ? 0.12 : 0.1), y: bt + b.height * (mobile ? 0.2 : 0.18) };
      var p1 = { x: b.left + b.width * 0.62, y: bt + b.height * 0.86 };
      var lp = [];
      for (var i = 0; i <= 60; i++) {
        var u = i / 60, a1 = (1 - u) * (1 - u), a2 = 2 * u * (1 - u), a3 = u * u;
        lp.push({ x: a1 * p0.x + a2 * p1.x + a3 * p2.x, y: a1 * p0.y + a2 * p1.y + a3 * p2.y,
                  w: lerp(p0.w * 0.75, 2.2, Math.pow(u, 0.8)), t: u });
      }
      limb = { pts: lp, marks: barkMarks(lp) };
      var LS = mobile ? 0.8 : 1.15;
      for (var k = 0; k < 9; k++) {
        var u2 = 0.14 + k * 0.1;
        var q = lp[Math.round(u2 * 60)], nq = lp[Math.min(60, Math.round(u2 * 60) + 2)];
        var dir = Math.atan2(nq.y - q.y, nq.x - q.x);
        var side = k % 2 ? -1 : 1;
        addTwig(q.x, q.y, dir + side * rr(0.55, 1.0), rr(60, 105) * LS, 2.2, LS, 0.15, { leaves: rr(4, 7) | 0, apple: k === 2 || k === 5 || k === 7, flower: k === 8 || k === 6 });
      }
      addTwig(p2.x, p2.y, Math.atan2(p2.y - lp[57].y, p2.x - lp[57].x), 50 * LS, 1.8, LS, 0.15, { leaves: 4, flower: true });
    }

    // rameaux le long du tronc
    var y2 = top + 160;
    while (y2 < bot - 60) {
      var p = pointAtY(y2), prog = (y2 - top) / (bot - top);
      var inward = R() < (mobile ? 0.5 : 0.68);
      var base = inward ? Math.PI + rr(0.35, 0.9) : -rr(0.35, 0.9);  // vers le haut, d'un côté ou de l'autre
      if (!inward && R() < 0.4) base = rr(0.2, 0.6);                      // parfois retombant vers l'extérieur
      var L = inward ? Math.min(reach * rr(0.55, 0.95), 120 * S) : rr(40, 90) * S;
      if (mobile && !inward) L = rr(18, 30);
      addTwig(p.x, p.y, base, L, Math.max(1.2, p.w * 0.45), S, prog, {
        leaves: (inward ? rr(4, 7) : rr(3, 5)) | 0,
        apple: prog > 0.35 && prog < 0.9 && R() < 0.3,
        flower: prog < 0.28 && R() < 0.5
      });
      y2 += rr(mobile ? 100 : 95, mobile ? 190 : 175);
    }
    // bouquet terminal
    var end = pts[pts.length - 1];
    addTwig(end.x, end.y, -Math.PI / 2 - 0.4, 40 * S, 1.6, S, 1, { leaves: 4 });
  }

  function pointAtY(y) {
    var p = trunk.pts, i = clamp(Math.round((y - p[0].y) / 6), 0, p.length - 1);
    return p[i];
  }

  function barkMarks(pts) {
    var out = [];
    for (var i = 2; i < pts.length - 2; i += 2) {
      var p = pts[i];
      if (R() < 0.55) out.push({ i: i, off: rr(-0.35, 0.35), len: rr(2, 6), lent: R() < 0.35 });
    }
    return out;
  }

  // Couleur d'une feuille selon la hauteur dans la page (les saisons défilent).
  function leafTone(prog) {
    var h = rr(80, 100), s = rr(28, 40), l = rr(26, 36);
    if (prog < 0.2) { h += 6; l += 6; }                      // printemps : vert tendre
    if (prog > 0.84 && R() < (prog - 0.84) * 4) {           // automne : quelques jaunes
      h = rr(38, 58); s = rr(50, 62); l = rr(40, 50);
    }
    return [h, s, l];
  }

  function addTwig(bx, by, ang, L, w0, S, prog, opt) {
    var bend = rr(-0.25, 0.25) * L;
    var tw = {
      bx: bx, by: by, ang: ang, L: L, w0: w0, bend: bend,
      a: 0, v: 0, k: 0.03, d: 0.93, phase: rr(0, 6.3), leaves: [], apples: [], flowers: []
    };
    // point local (non tourné) à l'abscisse u ∈ [0,1]
    tw.at = function (u) {
      var ca = Math.cos(tw.ang), sa = Math.sin(tw.ang);
      var x = u * tw.L, y = 4 * u * (1 - u) * tw.bend;
      return { x: x * ca - y * sa, y: x * sa + y * ca };
    };
    var n = Math.max(1, opt.leaves || 3);
    for (var i = 0; i < n; i++) {
      var u = n === 1 ? 1 : lerp(0.3, 1, i / (n - 1));
      var side = i % 2 ? 1 : -1, tip = i === n - 1;
      var len = rr(36, 58) * S * (tip ? 1.1 : 1), wid = len * rr(0.27, 0.33);
      var tone = leafTone(prog);
      tw.leaves.push({
        u: u, rel: tip ? rr(-0.15, 0.15) : side * rr(0.5, 1.0),
        sp: leafSprite(len, wid, tone[0], tone[1], tone[2]),
        a: 0, v: 0, k: rr(0.04, 0.06), d: 0.9, phase: rr(0, 6.3),
        gone: 0, grow: 1, tw: tw
      });
    }
    if (opt.apple) {
      var cnt = R() < 0.5 ? 2 : 1;
      for (var j = 0; j < cnt; j++) {
        var r = rr(10, 14) * S;
        tw.apples.push({ u: rr(0.3, 0.6), r: r, stalk: r * rr(1.2, 1.6), sp: appleSprite(r, R()), p: rr(-0.1, 0.1) + j * 0.35, v: 0, tw: tw });
      }
    }
    if (opt.flower) {
      for (var f = 0; f < (R() < 0.5 ? 2 : 1); f++)
        tw.flowers.push({ u: rr(0.55, 1), off: rr(-8, 8) * S, sp: flowerSprite(rr(7, 10) * S), rot: rr(0, 6) });
    }
    // boîte englobante verticale pour ne dessiner que le visible
    tw.y0 = by - L - 70 * S; tw.y1 = by + L + 70 * S;
    twigs.push(tw);
  }

  /* ---------- dessin ---------- */
  // Trace une couche du bois par tronçons de quelques points : un seul chemin
  // par tronçon évite les points plus sombres aux jointures des segments.
  // Couches translucides (ombre, reflet) : un seul chemin, sinon les
  // recouvrements font des points sombres.
  function strokeChunks(pts, i0, i1, widthK, offK, dx, dy, whole) {
    var size = whole ? i1 - i0 : 5;
    for (var a = i0; a < i1; a += size) {
      var b = Math.min(a + size, i1), w = (pts[a].w + pts[b].w) / 2;
      var off = w * offK;
      ctx.lineWidth = Math.max(0.6, w * widthK + (widthK === 1 && dx ? 3 : 0));
      ctx.beginPath();
      ctx.moveTo(pts[a].x + off + dx, pts[a].y + off * 0.4 + dy);
      for (var i = a + 1; i <= b; i++) ctx.lineTo(pts[i].x + off + dx, pts[i].y + off * 0.4 + dy);
      ctx.stroke();
    }
  }

  function drawWood(pts, i0, i1, marks, young) {
    var p, q;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // ombre portée sur le papier
    ctx.strokeStyle = 'rgba(35,40,25,.14)';
    strokeChunks(pts, i0, i1, 1, 0, 5, 7, true);
    // écorce : base sombre, flanc éclairé, filet de lumière
    var layers = [
      [young ? '#5b4a32' : '#3e3024', 1, 0],
      [young ? '#7a6744' : '#5e4936', 0.62, -0.17],
      [young ? '#9c8a5c' : '#83694f', 0.3, -0.27],
      ['rgba(214,196,160,.45)', 0.1, -0.33]
    ];
    for (var L = 0; L < layers.length; L++) {
      ctx.strokeStyle = layers[L][0];
      strokeChunks(pts, i0, i1, layers[L][1], layers[L][2], 0, 0, L === 3);
    }
    // gerçures et lenticelles
    if (marks) {
      for (var k = 0; k < marks.length; k++) {
        var mk_ = marks[k];
        if (mk_.i < i0 || mk_.i > i1) continue;
        p = pts[mk_.i]; q = pts[mk_.i + 1] || p;
        var dx = q.x - p.x, dy = q.y - p.y, dl = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = -dy / dl, ny = dx / dl, cx = p.x + nx * p.w * mk_.off, cy = p.y + ny * p.w * mk_.off;
        if (mk_.lent) {
          ctx.fillStyle = 'rgba(200,180,140,.5)';
          ctx.beginPath(); ctx.ellipse(cx, cy, 1.4, 0.7, Math.atan2(ny, nx), 0, Math.PI * 2); ctx.fill();
        } else if (p.w > 5) {
          ctx.strokeStyle = 'rgba(28,20,14,.45)'; ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + dx / dl * mk_.len, cy + dy / dl * mk_.len); ctx.stroke();
        }
      }
    }
  }

  function visibleRange(pts, y0, y1) {
    var a = -1, b = -1;
    for (var i = 0; i < pts.length - 1; i++) {
      if (pts[i].y > y0 - 30 && pts[i].y < y1 + 30) { if (a < 0) a = i; b = i; }
    }
    return a < 0 ? null : [a, Math.min(b + 1, pts.length - 1)];
  }

  function twigWorld(tw, u) {
    var l = tw.at(u), c = Math.cos(tw.a), s = Math.sin(tw.a);
    return { x: tw.bx + l.x * c - l.y * s, y: tw.by + l.x * s + l.y * c };
  }

  function drawSprite(sp, x, y, ang, scaleY, alpha, withShadow) {
    if (withShadow && sp.shadow) {
      ctx.save(); ctx.translate(x + 5, y + 8); ctx.rotate(ang); ctx.scale(1, scaleY);
      ctx.globalAlpha = alpha * 0.9;
      ctx.drawImage(sp.shadow, -sp.ox, -sp.oy, sp.w, sp.h); ctx.restore();
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(1, scaleY);
    ctx.globalAlpha = alpha;
    ctx.drawImage(sp.img, -sp.ox, -sp.oy, sp.w, sp.h); ctx.restore();
  }

  function render() {
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, VW, VH);
    ctx.translate(0, -scrollY);
    var y0 = scrollY, y1 = scrollY + VH;
    var r = visibleRange(trunk.pts, y0, y1);
    if (r) drawWood(trunk.pts, r[0], r[1], trunk.marks, false);
    if (limb) { r = visibleRange(limb.pts, y0, y1); if (r) drawWood(limb.pts, r[0], r[1], limb.marks, false); }

    var vis = twigs.filter(function (t) { return t.y1 > y0 && t.y0 < y1; });
    vis.forEach(function (tw) {
      var pts = [];
      for (var i = 0; i <= 8; i++) { var p = twigWorld(tw, i / 8); p.w = lerp(tw.w0, 0.9, i / 8); pts.push(p); }
      drawWood(pts, 0, 8, null, true);
      tw.apples.forEach(function (ap) {
        var at = twigWorld(tw, ap.u), ex = at.x + Math.sin(ap.p) * ap.stalk, ey = at.y + Math.cos(ap.p) * ap.stalk;
        ctx.strokeStyle = '#4b3a22'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(at.x, at.y); ctx.quadraticCurveTo((at.x + ex) / 2 + 2, (at.y + ey) / 2, ex, ey); ctx.stroke();
        var cx = ex + Math.sin(ap.p) * ap.r * 0.8, cy = ey + Math.cos(ap.p) * ap.r * 0.8;
        drawSprite(ap.sp, cx, cy, -ap.p * 0.6, 1, 1, true);
      });
    });
    vis.forEach(function (tw) {
      tw.leaves.forEach(function (lf) {
        if (lf.gone) return;
        var at = twigWorld(tw, lf.u);
        var ang = tw.ang + tw.a + lf.rel + lf.a * Math.PI / 180;
        drawSprite(lf.sp, at.x, at.y, ang, lf.grow, Math.min(1, lf.grow * 1.4), true);
      });
      tw.flowers.forEach(function (fl) {
        var at = twigWorld(tw, fl.u);
        drawSprite(fl.sp, at.x + fl.off, at.y - fl.off * 0.5, fl.rot + tw.a, 1, 1, false);
      });
    });
    falling.forEach(function (f) {
      drawSprite(f.sp, f.x, f.y, f.rot, Math.cos(f.flip) * 0.9 + 0.1 * Math.sign(Math.cos(f.flip) || 1), f.alpha, true);
    });
  }

  /* ---------- physique ---------- */
  var REACH = 80;

  function step(dt, time) {
    var wind = Math.sin(time * 0.7) * 0.6 + Math.sin(time * 1.9 + 1) * 0.3 + Math.sin(time * 0.23) * 0.4;
    var speed = Math.abs(mouse.vx) + Math.abs(mouse.vy);
    var y0 = scrollY - 200, y1 = scrollY + VH + 200;
    twigs.forEach(function (tw) {
      if (tw.y1 < y0 || tw.y0 > y1) return;
      // rameau : ressort + vent + poussée du curseur à mi-longueur
      var mid = twigWorld(tw, 0.6);
      if (mouse.on) {
        var dx = mouse.x - mid.x, dy = mouse.y - mid.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REACH + tw.L * 0.5) {
          var rx = mouse.x - tw.bx, ry = mouse.y - tw.by, r2 = Math.max(rx * rx + ry * ry, 900);
          tw.v += (rx * mouse.vy - ry * mouse.vx) / r2 * 0.35 * (1 - dist / (REACH + tw.L * 0.5));
        }
      }
      var restT = Math.sin(time * 1.1 + tw.phase) * 0.012 * (1 + wind);
      tw.v += (restT - tw.a) * tw.k * dt; tw.v *= Math.pow(tw.d, dt); tw.a += tw.v * dt;
      tw.a = clamp(tw.a, -0.35, 0.35);

      tw.leaves.forEach(function (lf) {
        if (lf.gone) {
          lf.gone -= dt * 16.7;
          if (lf.gone <= 0) { lf.gone = 0; lf.grow = 0.15; lf.a = -30; }
          return;
        }
        if (lf.grow < 1) lf.grow = Math.min(1, lf.grow + 0.012 * dt);
        var base = twigWorld(tw, lf.u);
        var ang = tw.ang + tw.a + lf.rel + lf.a * Math.PI / 180;
        var cx = base.x + Math.cos(ang) * lf.sp.len * 0.55, cy = base.y + Math.sin(ang) * lf.sp.len * 0.55;
        if (mouse.on) {
          var dx2 = mouse.x - cx, dy2 = mouse.y - cy, d2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (d2 < REACH) {
            var rx2 = mouse.x - base.x, ry2 = mouse.y - base.y, rr2 = Math.max(rx2 * rx2 + ry2 * ry2, 300);
            var f = 1 - d2 / REACH;
            lf.v += (rx2 * mouse.vy - ry2 * mouse.vx) / rr2 * 57.3 * 0.7 * f * f;
            if (speed > 30 && d2 < 34 && falling.length < 6 && Math.random() < 0.25) drop(lf, base, ang);
          }
        }
        var rest = Math.sin(time * 1.6 + lf.phase) * 2.2 * (0.5 + 0.5 * wind) - tw.v * 120;
        lf.v += (rest - lf.a) * lf.k * dt; lf.v *= Math.pow(lf.d, dt);
        lf.v = clamp(lf.v, -16, 16); lf.a = clamp(lf.a + lf.v * dt, -70, 70);
      });

      tw.apples.forEach(function (ap) {
        var at = twigWorld(tw, ap.u);
        var cx = at.x + Math.sin(ap.p) * (ap.stalk + ap.r), cy = at.y + Math.cos(ap.p) * (ap.stalk + ap.r);
        if (mouse.on) {
          var dx3 = mouse.x - cx, dy3 = mouse.y - cy, d3 = Math.sqrt(dx3 * dx3 + dy3 * dy3);
          if (d3 < ap.r * 3) ap.v -= mouse.vx * 0.0025 * (1 - d3 / (ap.r * 3));
        }
        // pendule : la gravité ramène à la verticale, le rameau entraîne
        ap.v += (-Math.sin(ap.p) * 0.012 + Math.sin(time * 0.9 + ap.r) * 0.0004 - tw.v * 0.08) * dt;
        ap.v *= Math.pow(0.985, dt); ap.p = clamp(ap.p + ap.v * dt, -1.1, 1.1);
      });
    });

    for (var i = falling.length - 1; i >= 0; i--) {
      var f = falling[i];
      f.t += dt;
      f.vy = Math.min(f.vy + 0.05 * dt, 1.5);
      f.vx = f.vx * Math.pow(0.97, dt) + Math.sin(f.t / 22 + f.ph) * 0.09 * dt;
      f.x += f.vx * dt; f.y += f.vy * dt;
      f.rot += (Math.sin(f.t / 30 + f.ph) * 0.03 + f.spin) * dt;
      f.flip += 0.06 * dt;
      f.alpha = clamp(1 - (f.t - 220) / 90, 0, 1);
      if (f.alpha <= 0) falling.splice(i, 1);
    }
    mouse.vx *= Math.pow(0.82, dt); mouse.vy *= Math.pow(0.82, dt);
  }

  function drop(lf, base, ang) {
    lf.gone = 7000;
    falling.push({
      sp: lf.sp, x: base.x, y: base.y, rot: ang, vx: mouse.vx * 0.15 + (Math.random() - 0.5), vy: -0.6,
      spin: (Math.random() - 0.5) * 0.04, flip: 0, ph: Math.random() * 6, t: 0, alpha: 1
    });
  }

  /* ---------- boucle, événements ---------- */
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    VW = window.innerWidth; VH = window.innerHeight;
    canvas.width = Math.round(VW * DPR); canvas.height = Math.round(VH * DPR);
    canvas.style.width = VW + 'px'; canvas.style.height = VH + 'px';
    scrollY = window.scrollY;
    build();
    render();
  }

  var last = 0, running = false;
  function frame(t) {
    if (document.hidden) { running = false; return; }
    var dt = last ? clamp((t - last) / 16.7, 0.2, 3) : 1;
    last = t;
    step(dt, t / 1000);
    render();
    requestAnimationFrame(frame);
  }
  function start() { if (!running && !reduce) { running = true; last = 0; requestAnimationFrame(frame); } }

  window.addEventListener('pointermove', function (e) {
    var now = performance.now(), dt = Math.max(8, now - (mouse.t || now - 16));
    var x = e.clientX, y = e.clientY + scrollY;
    if (mouse.on) {
      mouse.vx = mouse.vx * 0.4 + ((x - mouse.x) / dt * 16.7) * 0.6;
      mouse.vy = mouse.vy * 0.4 + ((y - mouse.y) / dt * 16.7) * 0.6;
    }
    mouse.x = x; mouse.y = y; mouse.cy = e.clientY; mouse.t = now; mouse.on = true;
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.on = false; });
  window.addEventListener('blur', function () { mouse.on = false; });

  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
    // le défilement fait frémir le feuillage visible
    var dv = clamp(scrollY - lastScroll, -60, 60);
    lastScroll = scrollY;
    if (mouse.on) mouse.y = mouse.cy + scrollY;
    twigs.forEach(function (tw) {
      if (tw.y1 < scrollY || tw.y0 > scrollY + VH) return;
      tw.v += dv * 0.00012 * (tw.phase > 3 ? 1 : -1);
      tw.leaves.forEach(function (lf) { lf.v += dv * 0.02 * (lf.phase > 3 ? 1 : -1); });
    });
    if (reduce) render();
  }, { passive: true });

  document.addEventListener('visibilitychange', function () { if (!document.hidden) start(); });

  var rt;
  function scheduleResize() { clearTimeout(rt); rt = setTimeout(resize, 150); }
  window.addEventListener('resize', scheduleResize);
  if ('ResizeObserver' in window) {
    var lastH = 0;
    new ResizeObserver(function () {
      var h = document.documentElement.scrollHeight;
      if (Math.abs(h - lastH) > 40) { lastH = h; scheduleResize(); }
    }).observe(document.body);
  }

  function init() {
    resize(); start();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleResize);
  }
  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
